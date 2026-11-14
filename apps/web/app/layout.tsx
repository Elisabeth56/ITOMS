import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "ITOMS", template: "%s · ITOMS" },
  description: "One place for IT requests, devices and their repair history.",
  icons: { apple: "/icons/apple-touch-icon.png" },
}

// the browser bar and the installed app's title bar take the page's ground colour
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f1ee" },
    { media: "(prefers-color-scheme: dark)", color: "#161717" },
  ],
}

// applies the theme chosen on the profile page before the first paint, so there is no flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // the theme attribute is set before paint from the saved choice, so React must not fight it
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
