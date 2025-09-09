export function getVerifiedCookie(event, name) {
    const cookie = getCookie(event, name);
    try {
      return cookie ? verifyCookie(cookie) : "";
    } catch {
      return "";
    }
  }