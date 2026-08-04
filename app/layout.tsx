import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سوق الألف مليون للسيارات',
  description: 'المنصة الإقليمية الأولى للمزادات والسيارات حياً',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar">
      <body className="bg-gray-50 antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}



