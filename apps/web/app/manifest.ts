import type { MetadataRoute } from "next"

// Lets Chrome and Edge install ITOMS as an app. The window colours match the page ground,
// so the installed app has no white frame around it.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ITOMS",
    short_name: "ITOMS",
    description: "IT requests, devices and their repair history for a small office.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#f2f1ee",
    theme_color: "#f2f1ee",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
