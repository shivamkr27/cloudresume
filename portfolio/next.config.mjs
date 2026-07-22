const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages only serves static files — no Node server, no image
  // optimization endpoint — so this ships as a static export instead.
  output: isGithubPages ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: isGithubPages,
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
