/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Cloudflare Pages
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Functions directory is excluded via tsconfig.json
  // Cloudflare Functions are handled separately, not by Next.js
}

export default nextConfig
