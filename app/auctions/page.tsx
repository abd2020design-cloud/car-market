'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuctions = async () => {
      // جلب جميع المزادات النشطة مع تفاصيل السيارات المرتبطة بها من قاعدة البيانات
      const { data, error } = await supabase
        .from('auctions')
        .select('*, cars(*)')
        .eq('status', 'active')
        .order('id', { ascending: false })

      if (!error && data) {
        setAuctions(data)
      }
      setLoading(false)
    }

    fetchAuctions()
  }, [])

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل حراج المزادات الحية...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة */}
        <header className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-black text-gray-900 mb-2">🔨 حراج المزادات العلنية الفورية</h1>
          <p className="text-gray-600 text-lg">شاهد وتنافس بالسوم الحي والمباشر على أقوى عروض السيارات الحصرية.</p>
        </header>

        {/* شبكة عرض كروت المزادات النشطة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auc) => (
            <article key={auc.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
              <div>
                {/* صورة السيارة المعروضة في المزاد */}
                <img src={auc.cars?.image_url || '/placeholder-news.jpg'} alt={auc.cars?.title} className="w-full h-48 object-cover" />
                
                <div className="p-5">
                  {/* شارة مزاد نشط */}
                  <span className="text-xs text-red-650 font-bold bg-red-50 px-2.5 py-1 rounded-full animate-pulse">
                    🔥 مزاد نشط حياً
                  </span>
                  
                  {/* اسم السيارة وعنوان المزاد */}
                  <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2">{auc.cars?.title || 'سيارة المزاد'}</h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{auc.cars?.description}</p>
                  
                  {/* تفاصيل السعر والمزايدة الحالية */}
                  <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-gray-400 block">السعر الابتدائي</span>
                      <span className="font-bold text-gray-700">{auc.start_price} ريال</span>
                    </div>
                    <div className="text-left border-r border-gray-200 pr-4">
                      <span className="text-[10px] text-blue-600 font-bold block">أعلى سوم حالياً</span>
                      <span className="text-xl font-black text-blue-600">{auc.current_highest_bid || auc.start_price} ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* زر دخول المزاد والمزايدة العلنية */}
              <div className="p-5 pt-0">
                <Link href={`/auctions/${auc.id}`} className="block text-center w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition duration-200">
                  دخول المزاد والمزايدة الحية ←
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* في حال عدم وجود أي مزادات نشطة */}
        {auctions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 p-8 rounded-2xl text-center font-medium max-w-xl mx-auto mt-12">
            📥 لا توجد سيارات معروضة في المزاد حالياً. تابعنا بانتظام، أو تواصل مع الإدارة لإدراج سيارتك في المزاد القادم!
          </div>
        )}

      </div>
    </main>
  )
}
