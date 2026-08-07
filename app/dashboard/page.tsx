'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // دالة جلب كافة البيانات الحية من قاعدة بيانات سوبابيز المرقاة Pro
  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // 1. جلب كل السيارات (المدفوعة والمعلقة) لكي يتمكن الأدمن من رؤيتها وحذفها
      const { data: carsData } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })
      setCars(carsData || [])

      // 2. جلب السومات والمزادات الجارية للرقابة الأمنية
      const { data: auctionsData } = await supabase
        .from('auctions')
        .select('*, cars(title)')
        .order('id', { ascending: false })
      setAuctions(auctionsData || [])

    } catch (err) {
      console.error("🚨 خطأ أثناء جلب بيانات الأدمن:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // 🌟 دالة الحذف الفتاكة والقاطعة لحذف أي إعلان مخالف فوراً من السيرفر
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه أمني للأدمن: هل أنت متأكد من حذف هذا الإعلان نهائياً من قاعدة البيانات؟")
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)

      if (!error) {
        alert("✓ نجاح: تم سحق وحذف إعلان السيارة بنجاح كلي من المنصة!")
        fetchAdminData() // إعادة إنعاش الجداول لتحديث الشاشة فوراً
      } else {
        alert("فشل الحذف من السيرفر: " + error.message)
      }
    } catch (err: any) {
      alert("خطأ في الشبكة: " + err.message)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500 animate-pulse font-bold">جاري فتح لوحة السيطرة المركزية للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* رأس لوحة التحكم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">صلاحيات الإدارة</span>
              <span className="bg-gray-950 text-white font-black text-xs px-2 py-0.5 rounded">Master Control</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم المشرف العام ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك عبدالرحمن (الأدمن)، يمكنك مراقبة السوق، وسحق وحذف الإعلانات المخالفة حياً.</p>
          </div>
          {/* زر سريع للأدمن للانتقال وإضافة سيارة */}
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm">
            + إضافة سيارة جديدة للمنصة
          </Link>
        </header>

        {/* القسم الأول: مستودع التحكم وإلغاء الإعلانات */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
          <div className="mb-6 border-r-4 border-gray-950 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🚗 كشاف جرد وحذف إعلانات السيارات</h2>
            <p className="text-gray-400 text-xs mt-0.5">اضغط على زر الحذف لإلغاء وطرد أي مركبة مخالفة لشروط المنصة فوراً.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                  <th className="p-4">معرّف الإعلان</th>
                  <th className="p-4">اسم المركبة</th>
                  <th className="p-4">السعر والموديل</th>
                  <th className="p-4">حالة الدفع</th>
                  <th className="p-4 text-center">الإجراء الحاسم</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {cars.map((car) => (
                  <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 font-mono text-gray-400">#{car.id}</td>
                    <td className="p-4 font-bold text-gray-900">{car.title}</td>
                    <td className="p-4 font-medium">
                      <span>{car.price} {car.currency || 'ريال'}</span>
                      <span className="text-gray-400 text-xs block">الموديل: {car.model}</span>
                    </td>
                    <td className="p-4">
                      {car.is_paid ? (
                        <span className="bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded text-xs">✓ نشط (مدفوع)</span>
                      ) : (
                        <span className="bg-yellow-50 text-yellow-700 font-bold px-2 py-0.5 rounded text-xs">⏳ معلق (لم يدفع)</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {/* زر الحذف الفوري تحت سيطرتك */}
                      <button 
                        type="button"
                        onClick={() => handleDeleteCar(car.id)} 
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white font-bold transition text-xs shadow-sm border border-red-100"
                      >
                        حذف الإعلان نهائياً 🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400 text-xs font-medium">📥 لا توجد إعلانات سيارات مسجلة في قاعدة البيانات حالياً.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* القسم الثاني: رادار مراقبة المزايدات الجارية */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-50">
          <div className="mb-4 border-r-4 border-red-500 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🔨 رادار السوم والمزادات الجارية</h2>
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-red-100 text-xs font-bold text-red-700">
                  <th className="p-3">سيارة المزاد</th>
                  <th className="p-3">السعر الافتتاحي</th>
                  <th className="p-3">أعلى سومة جارية</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700">
                {auctions.map((auc) => (
                  <tr key={auc.id} className="border-b border-gray-50">
                    <td className="p-3 font-bold text-gray-900">{auc.cars?.title || 'مركبة نشطة'}</td>
                    <td className="p-3 font-mono text-gray-500">{auc.start_price} ريال</td>
                    <td className="p-3 font-mono font-black text-blue-600 text-sm">{auc.current_highest_bid} ريال</td>
                  </tr>
                ))}
                {auctions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400 text-xs">📥 لا توجد غرف مزادات نشطة حالياً بالسيرفر.</td>
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
