'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false) // أداة التحكم بالقائمة المنسدلة للـ Navbar

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true)
      try {
        // جلب السيارات المفعلة والمدفوعة الرسوم فقط للعامة
        const { data, error } = await supabase.from('cars').select('*').eq('is_paid', true).order('id', { ascending: false }).limit(25)
        if (!error && data) setCars(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchCars()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 text-right flex flex-col justify-between" dir="rtl">
      
      {/* 🌟 شريط القائمة والملاحة العلوية الفاخر (Navbar Menu) لصفحات المنصة */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          {/* براند المنصة الفخم */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-950 text-white font-black text-xl w-10 h-10 rounded-xl flex items-center justify-center border border-gray-800 shadow-sm">
              1B
            </div>
            <span className="text-lg font-black text-gray-950 tracking-tight">منصة عبدالرحمن للسيارات</span>
          </div>

          {/* أزرار صفحات المنصة للكمبيوتر */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-500">
            <Link href="/" className="text-blue-600">🏠 السوق الرئيسي</Link>
            <Link href="/auctions" className="hover:text-blue-600 transition">🔨 غرف المزادات</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition">⚙️ إدارة الإعلانات</Link>
            <button onClick={() => alert('💬 قريباً: سيتم إطلاق شات غرف تذاكر الدعم الفني والوساطة تحت رقابة الإدارة 100%')} className="hover:text-blue-600 transition">📞 تواصل مع الإدارة</button>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs">
              + أضف إعلانك
            </Link>
            {/* زر القائمة المنسدلة للجوال */}
            <button type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden bg-gray-100 p-2 rounded-xl text-gray-700 text-xs font-bold">
              ☰ القائمة
            </button>
          </div>
        </div>

        {/* لوحة القائمة المنسدلة عند فتحها بالجوال */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-50 mt-3 p-4 flex flex-col gap-4 text-sm font-bold text-gray-700 animate-fade-in">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>🏠 السوق الرئيسي</Link>
            <Link href="/auctions" onClick={() => setIsMenuOpen(false)}>🔨 غرف المزادات</Link>
            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>⚙️ لوحة التحكم</Link>
            <button type="button" onClick={() => { setIsMenuOpen(false); alert('💬 قريباً: غرف الشات والوساطة الآمنة.'); }} className="text-right">📞 تواصل مع الإدارة</button>
          </div>
        )}
      </nav>

      {/* جسد سوق السيارات المطور */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-12 space-y-8 flex-1">
        
        {/* بانر الهدف السامي لمنصتك العبقرية */}
        <div className="bg-gradient-to-r from-gray-900 to-blue-950 text-white rounded-3xl p-8 md:p-12 shadow-md relative overflow-hidden text-center md:text-right flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 z-10">
            <h2 className="text-2xl md:text-3xl font-black">منصة عبدالرحمن للسيارات والمزادات حياً 🏎️</h2>
            <p className="text-blue-200 text-xs md:text-sm max-w-xl leading-relaxed">تصفح، زايد، وتحكم بصفقاتك بأعلى مستويات النزاهة والشفافية الرقمية الإقليمية.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-6 py-4 rounded-2xl text-center z-10 min-w-[200px]">
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block mb-1">🏁 رؤية المنصة المستهدفة</span>
            <span className="text-lg font-black text-white animate-pulse">عرض +1,000,000 سيارة 🚀</span>
          </div>
        </div>

        {/* شبكة عرض السيارات الجوجلية الحية المدفوعة الرسوم */}
        {loading ? (
          <p className="text-center py-12 text-gray-500 animate-pulse">جاري فحص وجلب عروض السيارات الفاخرة حياً...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: any) => (
              <article key={car.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition duration-300">
                <div>
                  <div className="w-full h-48 bg-gray-100 relative">
                    <img src={car.image_url || 'https://unsplash.com'} alt="" className="w-full h-48 object-cover" />
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{car.title}</h2>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">{car.description}</p>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl font-bold text-xs">
                      <span className="text-gray-500">الموديل: {car.model}</span>
                      <span className="text-blue-600 font-black text-base">{car.price} {car.currency || 'ريال'}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  {/* 🌟 إلغاء الواتساب وتوجيه العميل لزر المفاوضة الآمنة تحت رقابتك لحظر تسريب الكاش والتلاعب */}
                  <button type="button" onClick={() => alert('🔒 حماية أمنية: تواصل مع البائع عبر نظام التذاكر والوساطة الآمنة للمنصة (قريباً عند إتمام ربط بوابة ميسر الحقيقية)')} className="w-full text-center bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-blue-600 transition text-sm">
                    طلب شراء ومفاوضة آمنة عبر المنصة 💬
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {cars.length === 0 && !loading && (
          <div className="bg-blue-50 text-blue-800 p-8 rounded-2xl text-center max-w-md mx-auto border border-blue-100 text-sm font-medium">
            📥 ننتظر أولى إعلانات السيارات المدفوعة والموثقة لتظهر حية هنا في منصة عبدالرحمن!
          </div>
        )}

      </div>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-xs border-t border-gray-800 space-y-2">
        <div className="font-bold text-white">🔒 جميع حقوق الأنظمة والملكية الفكرية محفوظة لـ منصة عبدالرحمن للسيارات © 2026</div>
        <div className="text-[10px] text-gray-500">مؤسسة رسمية معتمدة لتقنية المعلومات والحلول البرمجية الفائقة</div>
      </footer>

    </main>
  )
}
