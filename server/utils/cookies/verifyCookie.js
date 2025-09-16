import crypto from "crypto";

export function verifyCookie(signedValue) {
  const config = useRuntimeConfig();
  if (!config.IP_COOKIE_SECRET) {
    throw new Error("Missing IP_COOKIE_SECRET for cookie verification");
  }

  const [value, signature] = String(signedValue || "").split("|");
  if (!value || !signature) throw new Error("Invalid signed cookie format");

  const expected = crypto
    .createHmac("sha256", config.IP_COOKIE_SECRET)
    .update(value)
    .digest("hex");

  if (signature !== expected) {
    throw new Error("Invalid cookie signature");
  }

  return value;
}