// server/utils/useSubdomain.js
export function useSubdomain( headers, opts = {}) {
  const {
    rootDomains = ['i-planner.cloud','i-planner.app'],
    takeFirstLabel = true    // true => nur erstes Label vor Root (empfohlen)
  } = opts

  const hostHeader = headers['x-forwarded-host'] || headers.host || ''
  const bareHost = String(hostHeader).split(':')[0].toLowerCase().trim()

  // localhost oder IPs => keine Subdomain
  if (!bareHost || bareHost === 'localhost') return ''
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(bareHost)) return ''        // IPv4
  if (/^\[?([a-f0-9:]+)\]?$/i.test(bareHost) && bareHost.includes(':')) return '' // IPv6

  // Wenn Root-Domains angegeben sind, nur darauf reagieren
  if (rootDomains.length) {
    for (const root of rootDomains) {
      const r = root.toLowerCase()
      if (bareHost === r) return ''
      if (bareHost.endsWith('.' + r)) {
        const left = bareHost.slice(0, bareHost.length - (r.length + 1)) // Teil vor Root
        if (!left || left === 'www') return ''
        return takeFirstLabel ? left.split('.')[0] : left
      }
    }
    // Host gehört zu keiner bekannten Root-Domain -> keine Subdomain
    return ''
  }

  // Generischer Fallback ohne Root-Liste:
  const parts = bareHost.split('.')
  if (parts.length >= 3) {
    const sub = parts.slice(0, parts.length - 2).join('.')
    if (!sub || sub === 'www') return ''
    return takeFirstLabel ? sub.split('.')[0] : sub
  }
  return ''
}