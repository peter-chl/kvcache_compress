import type { NextConfig } from "next";

// basePath must equal the GitHub repo name exactly, or every JS chunk 404s on Pages.
const basePath = "/kvcache_compress";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
