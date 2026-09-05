import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Wikimedia Commons only, used for real, freely-licensed photos of
    // actual named institutions (see types/index.ts Place.imageUrl).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
