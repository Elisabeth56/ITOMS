import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@itoms/shared"], // shared schemas ship as TypeScript source
}

export default config
