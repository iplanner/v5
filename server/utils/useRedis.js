// server/utils/useRedis.js
import { createClient } from 'redis'

let client = null

export default function useRedis(options = {}) {
  const { reset, ...overrides } = options
  if (!client || reset) {
    const { REDIS_URL } = useRuntimeConfig()

    if (!REDIS_URL) {
      throw new Error("REDIS_URL missing in runtime config")
    }

    // Redis URL von Render sieht so aus:
    // rediss://user:password@host:6379
    client = createClient({
      url: REDIS_URL,
      ...overrides,
    })

    client.on('error', (err) => {
      console.error('Redis Client Error', err)
    })

    // Verbindung öffnen (nur einmal, Promise wird gecached)
    if (!client.isOpen) {
      client.connect().catch((err) => {
        console.error("Redis connect failed:", err)
      })
    }
  }

  return client
}