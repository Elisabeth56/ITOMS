// Creates sign-in accounts in Supabase Auth. Needs the service-role key, which must
// never leave the server.
import { createClient } from "@supabase/supabase-js"
import { env } from "./env"
import { AppError } from "./errors"

/** Emails an invite and returns the new account's id. */
export async function inviteAuthUser(email: string): Promise<string> {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      503,
      "invites_unavailable",
      "Inviting people is not set up on this server yet.",
    )
  }
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)
  if (error || !data.user) {
    throw new AppError(422, "invite_failed", error?.message ?? "The invite could not be sent.")
  }
  return data.user.id
}
