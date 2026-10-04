// Verifies Supabase access tokens against the project's public signing keys.
import { createRemoteJWKSet, jwtVerify } from "jose"
import { env } from "./env"

const issuer = `${env.SUPABASE_URL}/auth/v1`
const keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`))

/** Returns the user id inside a valid token, or null if the token is bad or expired. */
export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, keys, { issuer, audience: "authenticated" })
    return payload.sub ?? null
  } catch {
    return null
  }
}
