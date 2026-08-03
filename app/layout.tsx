import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سوق الألف مليون للسيارات 🏎️",
  description: "أكبر منصة إقليمية لتصفح وشراء السيارات والمزادات العلنية الفورية بالسوم الحي والمباشر.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} dir="rtl">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        
        {/* القائمة العلوية العالمية الموحدة لشاشات الموقع بأكمله */}
        <nav className="bg-white border-b border-gray-150 sticky top-0 z-50 text-right shadow-sm">
          <div className="max-w-6xl mx-auto px-4 md:px-8 flex justify-between items-center h-20">
            
            {/* 🌟 مكان الشعار والأيقونة المعاد تثبيته وحمايته */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-black text-gray-900 flex items-center gap-2 hover:text-blue-600 transition">
                {/* إذا كان لديك ملف لوجو حقيقي، يمكنك تفعيل السطر أدناه بمسح علامات التعليق */}
                {/* <img src="/logo.png" alt="اللوجو" className="h-10 w-auto object-contain" /> */}
                
                {/* الأيقونة والنص البرمجي الثابت لحين رغبتك بوضع الصورة */}
                <span className="text-2xl">🏎️</span> 
                <span>سوق الألف مليون</span>
                <span className="text-blue-600">للسيارات</span>
              </Link>
            </div>

            {/* روابط التنقل الرئيسية الموحدة شاملة قسم المزادات الحية */}
            <div className="hidden md:flex items-center gap-6 font-semibold text-sm">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition">🏠 الرئيسية</Link>
              <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition">📰 أخبار السيارات</Link>
              <Link href="/auctions" className="text-gray-600 hover:text-blue-600 transition">🔨 المزادات الحية</Link>
              <Link href="/advertise" className="text-gray-600 hover:text-blue-600 transition">🚀 أعلن معنا</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition">⚙️ لوحة التحكم</Link>
            </div>

            {/* زر إضافة إعلان سريع */}
            <div className="flex items-center">
              <Link href="/dashboard/add-car" className="bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition duration-200">
                اضف سيارتك ➕
              </Link>
            </div>

          </div>
        </nav>

        {/* محتوى الصفحات الديناميكي المتغير */}
        <div className="flex-1">
          {children}
        </div>

      </body>
    </html>
  );
}


