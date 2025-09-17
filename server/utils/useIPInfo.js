
export async function useIPInfo(event) {
  
  const config  = useRuntimeConfig(event)
  const headers = getRequestHeaders(event)

  // Standardwerte
  const defaultProvider = {
    ip: null,
    city: null,
    region: null,
    country: null,
    loc: null,         // "lat,lon"
    org: null,         
    postal: null,
    timezone: null,
  }

  // IP ermitteln
  const rawIp = process.env.NODE_ENV === 'production'
    ? headers['x-forwarded-for']?.split(',')[0]?.trim()
      || headers['x-real-ip']
      || headers['cf-connecting-ip']
      || event.node?.req?.connection?.remoteAddress
      || '127.0.0.1'
    : config.IP_INFO_DEFAULT_IP

  const ip = (rawIp || '').startsWith('::ffff:') ? rawIp.substring(7) : rawIp

  // Private/ungültige IP → direkt Defaults
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') {
    console.warn('[useIPInfo] keine gültige IP, nutze Defaults')
    return { ...defaultProvider, ip }
  }

  // --- 1) Primär: ipinfo.io -------------------------------------------------
  if (config.IP_INFO_API_TOKEN) {
    try {
      const response = await $fetch(`https://ipinfo.io/${encodeURIComponent(ip)}`, {
        query: { token: config.IP_INFO_API_TOKEN },
        timeout: 5000,
      })
      // ipinfo antwortet u. a. mit: city, region, country, loc, org, postal, timezone
      const { asn, ...ipData } = response || {}
      return {
        ...defaultProvider,
        ...ipData,
        ip, // sicherstellen
      }
    } catch (err) {
      console.error('[useIPInfo] ipinfo failed:', {
        ip, msg: err?.message, status: err?.status || 'unknown'
      })
      // → Fallback versuchen
    }
  } else {
    console.warn('[useIPInfo] IP_INFO_API_TOKEN fehlt – überspringe ipinfo')
  }

  // --- 2) Fallback: ip-api.com (Pro) ----------------------------------------
  // Beispiel-Response:
  // { query, status, country, countryCode, region, regionName, city, zip, lat, lon, timezone, isp, org, as }
  try {
    const key = config.IP_API_COM_API_KEY
    const base = key
      ? `https://pro.ip-api.com/json/${encodeURIComponent(ip)}`
      : `https://ip-api.com/json/${encodeURIComponent(ip)}`
    const query = key ? { key } : { fields: 'status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query' }

    const resp = await $fetch(base, {
      query,
      timeout: 5000,
    })

    if (!resp || resp.status !== 'success') {
      console.error('[useIPInfo] ip-api response not success:', resp?.message || resp)
      return { ...defaultProvider, ip }
    }

    // Mapping auf ipinfo-Schema
    const loc = (resp.lat != null && resp.lon != null) ? `${resp.lat},${resp.lon}` : null
    const org = resp.as ? `${resp.as}${resp.org ? ' ' + resp.org : ''}` : (resp.org || resp.isp || null)

    return {
      ...defaultProvider,
      ip: resp.query || ip,
      city: resp.city || null,
      region: resp.regionName || resp.region || null, // ipinfo 'region' ≈ Klarname
      country: resp.country || null,
      loc,
      org,
      postal: resp.zip || null,
      timezone: resp.timezone || null,
    }
  } catch (err) {
    console.error('[useIPInfo] ip-api fallback failed:', {
      ip, msg: err?.message, status: err?.status || 'unknown'
    })
    return { ...defaultProvider, ip }
  }
}