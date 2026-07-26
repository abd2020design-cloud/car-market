import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // السماح بجميع الروابط الخارجية بدون قيود أمان مؤقتاً
      },
    ],
  },
};

export default nextConfig;
