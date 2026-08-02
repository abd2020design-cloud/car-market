'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // جلب كافة السيارات والمزادات الحالية للأدمن
  const fetchData = async () => {
    setLoading(true)
    
    // 1. جلب السيارات
    const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
    setCars(carsData || [])

    // 2. جلب المزادات النشطة مع تفاصيل السيارات المرتبطة بها
    const { data: auctionsData } = await supabase.from('auctions').select('*, cars(*)').order('id', { ascending: false })
    setAuctions(auctionsData || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🚨 زر الطوارئ: حذف السيارة نهائياً وإيقاف المزاد والتلاعب فوراً
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه أمني: هل أنت متأكد من حذف هذه السيارة؟ هذا الإجراء سيقوم بإلغاء المزاد وتصفير السومات المرتبطة بها فوراً ومنع التلاعب!")
    if (!confirmDelete) return

    // أمر الحذف من سوبابيز (بفضل CASCADE سيحذف المزاد والسومات تلقائياً)
    const { error } = await supabase.from('cars').delete().eq('id', carId)

    if (!error) {
      alert("✓ تم حذف السيارة وإلغاء المزاد بنجاح وتنظيف النظام!")
      fetchData() // تحديث الشاشة
    } else {
      alert("حدث خطأ أثناء الحذف: " + error.message)
    }
  }

  if (loading) return <p className="text-center py-12">جاري تحميل لوحة التحكم الفورية للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس لوحة التحكم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم سوق الألف مليون ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك المالك والمشرف العام، يمكنك إدارة الإعلانات والمزادات ومنع التلاعب حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition">
            + إضافة سيارة جديدة
          </Link>
        </header>

        {/* قسم مراقبة المزادات الحية (لوحة الأمان) */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔨 المزادات النشطة حالياً ومراقبة السوم
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map((auc) => (
              <div key={auc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                <div className="flex gap-4 mb-4">
                  <img src={auc.cars?.image_url || '/placeholder-news.jpg'} className="w-20 h-20 object-cover rounded-xl border" />
                  <div>
                    <h3 className="font-bold text-gray-900">{auc.cars?.title || 'سيارة محذوفة'}</h3>
                    <p className="text-xs text-gray-400 mt-1">رقم المزاد: #{auc.id} | مرتبط بسيارة رقم: #{auc.car_id}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-650">البداية: {auc.start_price} ريال</span>
                      <span className="text-xs bg-blue-50 px-2.5 py-1 rounded-full text-blue-700 font-bold">🔥 أعلى سوم: {auc.current_highest_bid} ريال</span>
                    </div>
                  </div>
                </div>
                
                {/* أزرار التحكم للأدمن فقط */}
                <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                  <Link href={`/auctions/${auc.id}`} target="_blank" className="flex-1 text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 transition">
                    👁️ معاينة المزاد الحي
                  </Link>
                  <button 
                    onClick={() => handleDeleteCar(auc.car_id)} 
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-xl text-sm hover:bg-red-600 hover:text-white transition"
                  >
                    🛑 إلغاء وحذف لوجود تلاعب
                  </button>
                </div>
              </div>
            ))}
            {auctions.length === 0 && <p className="text-gray-400 text-sm py-4">لا توجد مزادات نشطة حالياً في الموقع.</p>}
          </div>
        </section>

        {/* قسم إدارة الإعلانات العادية والشركات */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚗 قائمة كافة السيارات المرفوعة بالموقع</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                  <th className="p-4">السيارة</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">نوع المعلن</th>
                  <th className="p-4">حالة الدفع</th>
                  <th className="p-4 text-center">الإجراءات الأمنيّة</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 space-y-2">
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 font-bold">{car.title}</td>
                    <td className="p-4 font-mono">{car.price} ريال</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${car.seller_type === 'dealer' ? 'bg-purple-50 text-purple-700' : 'bg-orange-50 text-orange-700'}`}>
                        {car.seller_type === 'dealer' ? 'معرض معتمد' : 'فرد عادي'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${car.is_paid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {car.is_paid ? '✓ مدفوع/نشط' : '⏳ معلق (10R)'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteCar(car.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition font-medium text-xs">
                        حذف الإعلان 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  )
}

