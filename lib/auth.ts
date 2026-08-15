const COOKIE_NAME = "receipt_session";
async function hmac(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function createSessionToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  return `${expires}.${await hmac(String(expires))}`;
}
export async function verifySessionToken(token?: string) {
  if (!token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return signature === await hmac(expires);
}
export { COOKIE_NAME };
