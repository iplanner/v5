import crypto from "crypto";

export function signCookie(value) {
  const config = useRuntimeConfig();

  if (!config.IP_COOKIE_SECRET) {
    throw new Error("Missing IP_COOKIE_SECRET for cookie signing");
  }

  const strValue = String(value);

  const signature = crypto
    .createHmac("sha256", config.IP_COOKIE_SECRET)
    .update(strValue)
    .digest("hex");

  return `${strValue}|${signature}`;
}