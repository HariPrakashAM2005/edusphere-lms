import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker production builds
  output: "standalone",

  compress: true,

  images: {
    domains: [
      "edusphere.com",
      "cdn.edusphere.com",
      "edusphere-uploads.s3.ap-south-1.amazonaws.com",
      "lh3.googleusercontent.com",
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
