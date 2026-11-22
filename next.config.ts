import type { NextConfig } from "next";

const config: NextConfig = {
  // Self-hosted on the AWS server (node .next/standalone/server.js). Vercel ignores this.
  output: "standalone",
  async redirects() {
    return [{ source: "/sale", destination: "/listings?type=sale", permanent: true }];
  },
};

export default config;
