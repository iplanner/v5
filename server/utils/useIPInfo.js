export async function useIPInfo(event) {
  
    const config = useRuntimeConfig(event);
  const headers = getRequestHeaders(event);
  
  // Standardwerte für den Provider
  const defaultProvider = {
    ip: null,
    city: null,
    region: null,
    country: null,
    loc: null,
    org: null,
    postal: null,
    timezone: null,
  };

  // IP-Adresse ermitteln
  const rawIp = process.env.NODE_ENV === 'production'
    ? headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      headers['x-real-ip'] || 
      headers['cf-connecting-ip'] || 
      event.node?.req?.connection?.remoteAddress ||
      '127.0.0.1'
    : config.IP_INFO_DEFAULT_IP;

  // IPv6-zu-IPv4 Mapping entfernen
  const ip = rawIp.startsWith('::ffff:') ? rawIp.substring(7) : rawIp;

  // Validierung der IP-Adresse
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') {
    console.warn('Keine gültige IP-Adresse gefunden, verwende Standardwerte');
    return { ...defaultProvider, ip };
  }

  // API-Token validieren
  if (!config.IP_INFO_API_TOKEN) {
    console.error('IP_INFO_API_TOKEN ist nicht konfiguriert');
    return { ...defaultProvider, ip };
  }

  try {
    const response = await $fetch(`https://ipinfo.io/${ip}`, {
      query: { token: config.IP_INFO_API_TOKEN },
      timeout: 5000, // 5 Sekunden Timeout
    });

    // ASN ausschließen und Antwort mit Standardwerten mergen
    const { asn, ...ipData } = response;
    
    return {
      ...defaultProvider,
      ...ipData,
      ip, // Sicherstellen, dass die bereinigte IP gesetzt ist
    };
    
  } catch (error) {
    console.error('Fehler beim Abrufen der IP-Informationen:', {
      ip,
      error: error.message,
      status: error.status || 'unknown'
    });
    
    return {
      ...defaultProvider,
      ip,
    };
  }
}