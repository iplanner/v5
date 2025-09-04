import { UAParser } from 'ua-parser-js'

export function useUserAgent(event) {
  
  const headers = getRequestHeaders(event)
  const { browser, os, device } = UAParser(headers['user-agent'] || '')

  // Normalisiertes device.type (nur mobile & wearable, Rest = desktop)
  const deviceType = ['wearable', 'mobile'].includes(device.type)
    ? device.type
    : 'desktop'

  return {
    osvendor: device.vendor ?? null,
    osmodel: device.model ?? null,
    os: os.name ?? null,
    osversion: os.version ?? null,
    device: deviceType ?? null,
    browser: browser.name ?? null,
    browserversion: browser.version ?? null,
    // Für Debugging / Snapshot speichern
    snapshot: {
      ...device,
      os,
      browser,
    },
  }
}