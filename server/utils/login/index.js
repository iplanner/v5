/**
 * Lies Kontext aus dem Request (UserAgent + IP-Provider).
 * @param {H3Event} event
 * @returns {Promise<{ userAgent: any, provider: any, majorBrowserVersion: string }>}
 */
export async function getRequestContext(event) {

  let userAgent = {}
  let provider = {}
  let majorBrowserVersion = 'unknown'

  try {
    userAgent = useUserAgent(event);
    provider = await useIPInfo(event)

    if (userAgent && userAgent.browserversion) {
      majorBrowserVersion = String(userAgent.browserversion).split('.')[0] || 'unknown'
    }
  } catch (err) {
    console.error('getRequestContext Fehler:', err)
  }




  return { userAgent, provider, majorBrowserVersion }
}

/**
 * Prüft, ob das aktuelle Gerät für den Nutzer bereits bekannt ist
 * und wie viele Geräte insgesamt eingetragen sind.
 * Gibt isKnownDevice, deviceCount und optional die gefundenen Geräte zurück.
 */
export async function checkUserDevice(db, user, userAgent, majorBrowserVersion) {
  
  let knownDevices = []
  let isKnownDevice = false
  let deviceCount = 0

  try {
    // Gerät suchen
    knownDevices = await db`
      SELECT *
      FROM users_devices
      WHERE kid = ${user.kid}
        AND osvendor = ${userAgent.osvendor}
        AND osmodel  = ${userAgent.osmodel}
        AND os       = ${userAgent.os}
        AND device   = ${userAgent.device}
        AND browser  = ${userAgent.browser}
        AND split_part(browserversion, '.', 1) = ${majorBrowserVersion}
    `
    isKnownDevice = knownDevices.length > 0

    // Geräteanzahl holen
    const [{ count }] = await db`
      SELECT COUNT(*)::int AS count
      FROM users_devices
      WHERE kid = ${user.kid}
    `
    deviceCount = Number(count);
  } catch (err) {
    console.error('checkUserDevice Fehler:', err)
  }

  return { knownDevices, isKnownDevice, deviceCount }
}


/**
 * Erstellt eine neue Session (nach bestandenem Login),
 * upsertet das aktuelle Gerät und trimmt die Geräteliste auf max N Einträge.
 * Alles in einer DB-Transaktion.
 *
 * @param {Function} db 
 * @param {Object}   params
 * @param {Object}   params.user
 * @param {Object}   params.userAgent
 * @param {Object}   params.provider
 * @param {number}   [params.maxDevices=3]
 * @param {boolean}  [params.singleSessionPerUser=true]  // alte Sessions löschen
 */
export async function finalizeUserSession(db, {
  user,
  userAgent,
  provider,
  maxDevices = 3,
  singleSessionPerUser = true
}) {
  const ua = userAgent || {}
  const ip = provider || {}

  return await db.begin(async (tx) => {
    // 1) alte Sessions optional löschen
    if (singleSessionPerUser) {
      await tx`
        DELETE FROM users_session
        WHERE uid = ${user.id}
      `
    }

    // 2) neue Session
    const insertedSession = await tx`
      INSERT INTO users_session (
        uid, kid, guid,
        osvendor, osmodel, os, osversion,
        device, browser, browserversion,
        ip, ipcity, ipregion, ipcountry, iploc, ipprovider, ippostal, iptimezone,
        inserted_at
      ) VALUES (
        ${user.id}, ${user.kid}, ${user.guid},
        ${ua.osvendor || null}, ${ua.osmodel || null}, ${ua.os || null}, ${ua.osversion || null},
        ${ua.device || null}, ${ua.browser || null}, ${ua.browserversion || null},
        ${ip.ip || null}, ${ip.city || null}, ${ip.region || null}, ${ip.country || null},
        ${ip.loc || null}, ${ip.org || null}, ${ip.postal || null}, ${ip.timezone || null},
        NOW()
      )
      RETURNING id
    `
    if (insertedSession.length === 0) throw new Error('INSERT_USER_SESSION_FAILED')

    // 3) Device upsert
    await tx`
    INSERT INTO users_devices (
      kid, guid,
      osvendor, osmodel, os, osversion,
      device, browser, browserversion,
      inserted_at, updated_at
    ) VALUES (
      ${user.kid}, ${user.guid},
      ${ua.osvendor || null}, ${ua.osmodel || null}, ${ua.os || null}, ${ua.osversion || null},
      ${ua.device || null}, ${ua.browser || null}, ${ua.browserversion || null},
      NOW(), NOW()
    )
    ON CONFLICT ON CONSTRAINT users_devices_fpr_uniq
    DO UPDATE SET
      osversion  = EXCLUDED.osversion,
      updated_at = NOW()
    `

    // 4) zählen
    const [{ count: deviceCount }] = await tx`
      SELECT COUNT(*)::int AS count
      FROM users_devices
      WHERE kid = ${user.kid}
    `

    // 5) auf maxDevices trimmen (älteste raus)
    if (deviceCount > maxDevices) {
      await tx`
        WITH ranked AS (
          SELECT
            ctid,
            ROW_NUMBER() OVER (
              PARTITION BY kid
              ORDER BY last_login_at DESC NULLS LAST, inserted_at DESC NULLS LAST
            ) AS rn
          FROM users_devices
          WHERE kid = ${user.kid}
        )
        DELETE FROM users_devices d
        USING ranked r
        WHERE d.ctid = r.ctid
          AND r.rn > ${maxDevices}
      `
    }

    return {
      sessionId: insertedSession[0].id,
      deviceCount: Math.min(deviceCount, maxDevices),
    }
  })
}

export async function getStartUrl(db, user, subdomain) {
  
  const organizations = await db`
    SELECT
      o.oid,
      o.uid,
      o.role,
      o.start_url,
      org.cid,
      org.subdomain,
      org.name,
      org.updated_at
    FROM organization_users AS o
    INNER JOIN organizations AS org ON org.id = o.oid
    WHERE o.uid = ${user.id}
  `
  if (!organizations || organizations.length === 0) {
    return { path: '/login/error?reason=organization-not-found' }
  }

  const current = (subdomain || '').trim().toLowerCase()

  // 1) Subdomain angegeben → validieren & routen
  if (current && current !== 'www') {
    // Existiert Subdomain überhaupt?
    const [subExists] = await db`
      SELECT id
      FROM organizations
      WHERE LOWER(subdomain) = ${current}
      LIMIT 1
    `
    if (!subExists) {
      return { path: '/login/error?reason=subdomain-not-found' }
    }

    // Gehört der User zu dieser Subdomain?
    const target = organizations.find((o) => String(o.subdomain || '').toLowerCase() === current)
    if (!target) {
      return { path: '/login/error?reason=subdomain-forbidden' }
    }

    const { oid, role, start_url = '' } = target
    if (start_url) return { path: start_url }
    if (role === 'admin' && oid) return { path: `/organizations/${oid}` }
    return { path: `/organizations` }
  }

  // 2) Kein current (oder 'www') → Fallback: zuletzt geupdatete Org
  const latest = organizations
    .filter((o) => o && o.oid)
    .sort((a, b) => {
      const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return tb - ta
    })[0]

  if (latest) {
    const { oid, role, start_url = '' } = latest
    if (start_url) return { path: start_url }
    if (role === 'admin' && oid) return { path: `/organizations/${oid}` }
    return { path: `/organizations` }
  }

  return { path: '/login/error?reason=organization-not-found' }
}