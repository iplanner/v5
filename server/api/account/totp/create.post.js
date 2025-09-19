import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'node:crypto'

export default defineEventHandler(async (event) => {
  let { name, provider = ""} = (await readBody(event)) || {}
  name = String(name || '').trim()
  if (!name) {
    name = `Authenticator-${crypto.randomBytes(2).toString('hex')}`
  }

  try {
    const session = await useAuthSession(event)
    if (!session?.uid) throw new Error('UNAUTHORIZED')

    const db = usePostgres()
    const [user] = await db`
      SELECT id, username
      FROM users
      WHERE id = ${session.uid}
      LIMIT 1
    `
    if (!user) throw new Error('USER_NOT_FOUND')

    const issuer = 'i-planner.app'
    const accountLabel = `${user.username}`
    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(accountLabel, issuer, secret)
    const qrSvg = await QRCode.toString(otpauth, { type: 'svg', width: 200 })

    const redis = useRedis()
    await redis.set(
      `account:totp-setup:${user.id}`,
      JSON.stringify({ secret, provider, name, createdAt: Date.now() }),
      { EX: 15 * 60 }
    )

    return {
      mode: 'enroll',
      issuer,
      account: accountLabel,
      otpauth,          
      secret,           // für manuelle Eingabe
      qrSvg             // direkt per v-html rendern
    }

  } catch (error) {
    
    console.error(error)
    const response = getLoginErrorHandler(error.message, error.cause)
    throw createError({
      statusCode: error.statusCode || 400,
      message: response.title,
      data: response
    })

  }
})