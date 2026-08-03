'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState('ALL') // الدولة المختارة للفلترة

  // قائمة الدول المدعومة في سوق الألف مليون الإقليمي
  const countries = [
    { code: 'ALL', name: '🌍 كل الدول', currency: '' },
    { code: 'SA', name: '🇸🇦 السعودية', currency: 'ريال' },
    { code: 'EG', name: '🇪🇬 مصر', currency: 'جنيه' },
    { code: 'AE', name: '🇦🇪 الإمارات', currency: 'درهم' },
    { code: 'QA', name: '🇶🇦 قطر', currency: 'ريال' },
    { code: 'KW', name: '🇰🇼 الكويت', currency: 'دينار' },
  ]

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      let query = supabase.from('cars').select('*')

      if (selectedCountry !== 'ALL') {
        query = query.eq('country', selectedCountry)
      }

      const { data, error } = await query.order('id', { ascending: false })
      if (!error) setCars(data || [])
      setLoading(false)
    }

    fetchCars()
  }, [selectedCountry])

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس السوق الرئيسي المطور */}
        <header className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-4xl font-black text-gray-900 mb-2">سوق الألف مليون للسيارات 🏎️</h1>
          <p className="text-gray-600 text-lg">أكبر منصة إقليمية لتصفح وشراء السيارات والمزادات العلنية الفورية بالسوم الحي والمباشر.</p>
        </header>

        {/* 🌟 شريط اختيار وتصفية الدول الذكي (Country Filter) */}
        <section className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-150">
          <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">اختر الدولة لتصفح السيارات والمزادات المتاحة</h3>
          <div className="flex flex-wrap gap-3">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition duration-200 ${selectedCountry === c.code ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>

        {/* شبكة عرض كروت السيارات بالتصفية الحية */}
        {loading ? (
          <p className="text-center py-12 text-gray-500">جاري تصفية وجلب سيارات الدولة المختارة حياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: any) => {
              const carCurrency = car.currency || 'ريال'
              
              return (
                <article key={car.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
                  <div>
                    <img src={car.image_url || '/placeholder-news.jpg'} className="w-full h-48 object-cover" alt={car.title} />
                    
                    <div className="p-5">
                      <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
                        {car.country === 'EG' ? '🇪🇬 مصر' : car.country === 'AE' ? '🇦🇪 الإمارات' : car.country === 'QA' ? '🇶🇦 قطر' : '🇸🇦 السعودية'}
                      </span>
                      
                      <h2 className="text-xl font-bold text-gray-900 mt-3 mb-2">{car.title}</h2>
                      <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">{car.description}</p>
                      
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl font-bold text-sm">
                        <span className="text-gray-500">الموديل: {car.model}</span>
                        <span className="text-blue-600 font-black text-lg">{car.price} {carCurrency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link href={`/dashboard/inbox?action=buy&carId=${car.id}`} className="block text-center w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-blue-600 transition duration-200">
                      تقديم عرض شراء / معاينة للوساطة ←
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* في حال خلو الدولة من البيانات */}
        {cars.length === 0 && !loading && (
          <div className="bg-yellow-50 text-yellow-850 p-8 rounded-2xl text-center max-w-md mx-auto mt-12 border border-yellow-100">
            📥 لا توجد سيارات معروضة في هذه الدولة حالياً. كن أول من يرفع سيارة وافتح سوق بلدك الآن!
          </div>
        )}

      </div>
    </main>
  )
}









