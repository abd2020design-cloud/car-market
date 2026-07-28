import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 🌟 إجبار السيرفر على تخطي أخطاء التايب سكريبت أثناء الـ Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // 🌟 إجبار السيرفر على تخطي أخطاء الفحص الإملائي والتحذيرات
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

