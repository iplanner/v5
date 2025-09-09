import crypto from 'crypto';

export function verifyCookie(signedValue) {
  const config = useRuntimeConfig();
  const [value, signature] = signedValue.split("|");

  if (!value || !signature) {
    throw new Error("Ungültiger signierter Cookie");
  }

  const expectedSignature = crypto
    .createHmac("sha256", config.IP_COOKIE_SECRET)
    .update(value)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error("Signatur ungültig oder Cookie wurde manipuliert");
  }

  return value;
}