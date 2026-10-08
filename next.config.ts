import type { NextConfig } from "next";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";
const basePath = isGitHubPages ? "/linerealestate" : "";

const config: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  distDir: isGitHubPages ? ".next-pages" : ".next",
  basePath,
  trailingSlash: isGitHubPages,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
