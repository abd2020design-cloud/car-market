'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(false)
      try {
        const { data, error } = await supabase.from('cars').select('*').order('id', { ascending: false }).limit(20)
        if (!error && data) setCars(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchCars()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="mb-6 border-b border-gray-200 pb-6 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">سوق الألف مليون للسيارات 🏎️</h1>
            <p className="text-gray-600 text-sm">أكبر منصة إقليمية لتصفح وشراء السيارات والمزادات العلنية الفورية بالسوم الحي.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm">
            + أضف سيارتك الآن
          </Link>
        </header>

        {loading ? (
          <p className="text-center py-12 text-gray-500">جاري جلب وفحص السيارات حياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: any) => (
              <article key={car.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{car.title}</h2>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">{car.description}</p>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl font-bold text-xs">
                    <span className="text-gray-500">الموديل: {car.model}</span>
                    <span className="text-blue-600 font-black text-base">{car.price} {car.currency || 'ريال'}</span>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <a href={`https://wa.me{car.whatsapp_number}`} target="_blank" rel="noreferrer" className="block text-center w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-green-600 transition text-sm">
                    تواصل مع البائع عبر الواتساب 💬
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {cars.length === 0 && !loading && (
          <div className="bg-yellow-50 text-yellow-800 p-8 rounded-2xl text-center max-w-md mx-auto border border-yellow-100 text-sm font-medium">
            📥 لا توجد سيارات معروضة حالياً. كن أول من يرفع سيارته الآن!
          </div>
        )}

      </div>
    </main>
  )
}
