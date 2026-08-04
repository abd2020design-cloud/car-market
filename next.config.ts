import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 🌟 فتح الصلاحية الأمنية المطلقة لظهور كافة الصور القادمة من سيرفرك السحابي Pro ومن المواقع العالمية
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pgfuijzgkigrriibahef.supabase.co', // رابط سيرفرك في سوبابيز Pro لظهور السيارات المرفوعة
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '://unsplash.com', // لظهور الصور الافتراضية وصور الخلفيات الفاخرة
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com', // لظهور صور أعلام الدول الملونة الفاخرة
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;


