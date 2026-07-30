import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 🌟 إجبار السيرفر على تخطي أخطاء التايب سكريبت أثناء الـ Build
    ignoreBuildErrors: true,
  },
  
};

export default nextConfig;

