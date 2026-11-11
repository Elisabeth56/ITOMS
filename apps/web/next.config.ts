import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@itoms/shared"], // shared schemas ship as TypeScript source
  // the few images are pre-compressed WebP; serving them as-is avoids the optimizer quota
  images: { unoptimized: true },
}

export default config
