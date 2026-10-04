// Runs before every page: keeps the session fresh and sends signed-out visitors to sign in.
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { env } from "./lib/env"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value)
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const { data } = await supabase.auth.getUser()
  const onSignIn = request.nextUrl.pathname.startsWith("/sign-in")
  if (!data.user && !onSignIn) return NextResponse.redirect(new URL("/sign-in", request.url))
  if (data.user && onSignIn) return NextResponse.redirect(new URL("/", request.url))
  return response
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] }
