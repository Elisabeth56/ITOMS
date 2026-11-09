// Verifies Supabase access tokens. Hosted projects sign with asymmetric keys published as
// JWKS (ADR 003). A local Supabase stack (CI end-to-end tests) signs with a shared secret,
// so SUPABASE_JWT_SECRET switches to that; it is never set in production.
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from "jose"
import { env } from "./env"

const issuer = `${env.SUPABASE_URL}/auth/v1`
const keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))
const secret = env.SUPABASE_JWT_SECRET ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET) : null

/** Returns the user id inside a valid token, or null if the token is bad or expired. */
export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const options = { issuer, audience: "authenticated" }
    // a shared-secret token is only accepted when a secret is configured
    const { payload } =
      secret && decodeProtectedHeader(token).alg === "HS256"
        ? await jwtVerify(token, secret, { ...options, algorithms: ["HS256"] })
        : await jwtVerify(token, keys, options)
    return payload.sub ?? null
  } catch {
    return null
  }
}
