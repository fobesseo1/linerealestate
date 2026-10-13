import type { NextConfig } from "next";

const config: NextConfig = {
  async redirects() {
    return [{ source: "/sale", destination: "/listings?type=sale", permanent: true }];
  },
};

export default config;
