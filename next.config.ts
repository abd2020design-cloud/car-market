import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // عندما يزور المستخدم مسار المدونة في موقعك
        source: '/blog',
        // يقوم سيرفر Next.js بجلب المحتوى سراً من سيرفر الووردبريس المستقل
        destination: 'https://car-market.com', 
      },
      {
        // لتوجيه كافة المقالات والصفحات الداخلية للمدونة تلقائياً
        source: '/blog/:path*',
        destination: 'https://car-market.com/:path*',
      },
    ];
  },
};

export default nextConfig;

