'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // دالة جلب كافة جرد المركبات من السيرفر السحابي المرقّى Pro
  const fetchAdminCars = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })

      if (!error && data) {
        setCars(data)
      } else {
        console.error("🚨 خطأ سوبابيز:", error)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminCars()
  }, [])

  // 🌟 دالة الموافقة والنشر الفوري المحدثة - تجعل السيارة تقفز للأعلى فوراً
  const handleApproveCar = async (carId: number) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ 
          is_paid: true, 
          created_at: new Date().toISOString() // 🌟 السر هنا: تحديث وقت الإعلان للحظة الحالية لتتربع السيارة في أعلى الصفحة الرئيسية!
        }) 
        .eq('id', carId)

      if (!error) {
        alert("🚀 نجاح إداري: تم تفعيل الإعلان بنجاح وقفزت السيارة إلى أعلى القائمة بالصفحة الرئيسية فوراً!")
        fetchAdminCars() // إنعاش تلقائي للجدول لتحديث الحالة أمام عينك
      } else {
        alert("فشل السيرفر في التفعيل: " + error.message)
      }
    } catch (err: any) {
      alert("خطأ في معالجة الطلب: " + err.message)
    }
  }

  // دالة السحق والحذف الفتاكة للأدمن لحذف الإعلانات المخالفة فوراً
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه إداري حاسم: هل أنت متأكد من سحق وحذف هذا الإعلان نهائياً من المنصة؟")
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)

      if (!error) {
        alert("✓ نجاح: تم سحق وتطهير الإعلان من قاعدة البيانات بنجاح باهر!")
        fetchAdminCars() 
      } else {
        alert("فشل السيرفر في الحذف: " + error.message)
      }
    } catch (err: any) {
      alert("خطأ في الاتصال: " + err.message)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500 animate-pulse font-bold">جاري فتح غرف السيطرة والتحكم للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* رأس لوحة التحكم الفخم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">صلاحيات الإدارة المطلقة</span>
              <span className="bg-gray-950 text-white font-black text-xs px-2 py-0.5 rounded">Master Control 1B</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم المشرف العام ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك عبدالرحمن (الأدمن)، يمكنك مراقبة السوق، الموافقة ونشر المعلق ليرتفع للأعلى، وحذف المخالفات حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs">
            + إضافة سيارة جديدة للمنصة
          </Link>
        </header>

        {/* جدول الجرد والتحكم والسيطرة الخارق */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
          <div className="mb-6 border-r-4 border-gray-950 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🚗 كشاف جرد وتدقيق وتفعيل الإعلانات</h2>
            <p className="text-gray-400 text-xs mt-0.5">راقب العروض، واضغط على نشر لتفعيل المعلق، أو حذف لطرد المخالف فوراً.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600">
                  <th className="p-4">رقم الإعلان</th>
                  <th className="p-4">ماركة السيارة</th>
                  <th className="p-4">السعر والموديل</th>
                  <th className="p-4">حالة النشر والاشتراك</th>
                  <th className="p-4 text-center">الإجراءات الإدارية الحاسمة</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 font-mono text-gray-400 text-xs">#{car.id}</td>
                    <td className="p-4 font-bold text-gray-900">{car.title}</td>
                    <td className="p-4 font-medium">
                      <span className="text-blue-600 font-black">{car.price} {car.currency || 'ريال'}</span>
                      <span className="text-gray-400 text-[11px] block mt-0.5">الموديل: {car.model}</span>
                    </td>
                    <td className="p-4">
                      {car.is_paid ? (
                        <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-green-100">✓ نشط (منشور علناً)</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-amber-100">⏳ معلق (بانتظار السداد)</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        {/* زر الموافقة والتفعيل المطور والقفز الفوري للأعلى */}
                        {!car.is_paid && (
                          <button 
                            type="button"
                            onClick={() => handleApproveCar(car.id)} 
                            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 font-bold transition text-xs shadow-sm"
                          >
                            🚀 موافقة ونشر فوري للأعلى
                          </button>
                        )}
                        
                        {/* زر السحق والحذف المطلق */}
                        <button 
                          type="button"
                          onClick={() => handleDeleteCar(car.id)} 
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white font-bold transition text-xs shadow-sm border border-red-100"
                        >
                          حذف الإعلان 🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-xs font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">📥 لا توجد إعلانات سيارات مسجلة حالياً.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  )
}
