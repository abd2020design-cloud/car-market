'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // متغيرات خاصة بنموذج إطلاق المزاد السريع
  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_days: '3' })

  // جلب البيانات حياً من السيرفر
  const fetchData = async () => {
    setLoading(true)
    
    // جلب السيارات
    const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
    setCars(carsData || [])

    // جلب المزادات النشطة
    const { data: auctionsData } = await supabase.from('auctions').select('*, cars(*)').order('id', { ascending: false })
    setAuctions(auctionsData || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🌟 دالة سحرية لإطلاق المزاد بضغطة زر واحدة دون دخول سوبابيز
  const handleLaunchAuction = async (e: React.FormEvent, carId: number) => {
    e.preventDefault()
    if (!auctionData.start_price) return alert("يرجى كتابة السعر الافتتاحي أولاً!")

    const startPriceNum = parseFloat(auctionData.start_price)
    const daysNum = parseInt(auctionData.end_days, 10)

    // حساب تاريخ الانتهاء تلقائياً بالثواني بناءً على الأيام المختارة
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + daysNum)

    const { error } = await supabase
      .from('auctions')
      .insert([
        {
          car_id: carId,
          start_price: startPriceNum,
          current_highest_bid: startPriceNum,
          end_time: endTime.toISOString(),
          status: 'active'
        }
      ])

    if (!error) {
      alert("🚀 نجاح! تم إطلاق وتفعيل المزاد العلني حياً لهذه السيارة وبدأ العداد التنازلي!")
      setActiveCarForAuction(null) // إغلاق النموذج
      setAuctionData({ start_price: '', end_days: '3' })
      fetchData() // تحديث القوائم
    } else {
      alert("حدث خطأ أثناء إطلاق المزاد: " + error.message)
    }
  }

  // زر الطوارئ لحذف السيارة أو إلغاء المزاد لوجود تلاعب
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه أمني: هل أنت متأكد من حذف هذا الإعلان؟ سيقوم النظام بتصفير السومات وإلغاء المزاد المرتبط بالسيارة فوراً!")
    if (!confirmDelete) return

    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (!error) {
      alert("✓ تم تنظيف النظام وحذف المركبة بنجاح!")
      fetchData()
    } else {
      alert("حدث خطأ أثناء الحذف: " + error.message)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل لوحة التحكم الذكية للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم سوق الألف مليون ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك المالك والمشرف العام، يمكنك إدارة الإعلانات وإطلاق المزادات ومنع التلاعب بضغطة زر.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
            + إضافة سيارة جديدة
          </Link>
        </header>

        {/* قسم مراقبة المزادات الحركية النشطة */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">🔨 المزادات الحية والمراقبة الفورية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map((auc) => (
              <div key={auc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between">
                <div className="flex gap-4">
                  <img src={auc.cars?.image_url || '/placeholder-news.jpg'} className="w-20 h-20 object-cover rounded-xl border" alt="" />
                  <div>
                    <h3 className="font-bold text-gray-900">{auc.cars?.title || 'سيارة المزاد'}</h3>
                    <p className="text-xs text-gray-400 mt-1">رقم المزاد: #{auc.id} | الدولة: {auc.cars?.country === 'EG' ? '🇪🇬 مصر' : '🇸🇦 السعودية'}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">البداية: {auc.start_price}</span>
                      <span className="text-xs bg-blue-50 px-2.5 py-1 rounded-full text-blue-700 font-bold">🔥 أعلى سوم: {auc.current_highest_bid}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-gray-100 pt-4 mt-4">
                  <Link href={`/auctions/${auc.id}`} target="_blank" className="flex-1 text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 transition">👁️ معاينة المزاد</Link>
                  <button onClick={() => handleDeleteCar(auc.car_id)} className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-600 hover:text-white transition">🛑 إلغاء للتلاعب</button>
                </div>
              </div>
            ))}
            {auctions.length === 0 && <p className="text-gray-400 text-sm py-2">لا توجد مزادات نشطة حالياً.</p>}
          </div>
        </section>

        {/* قسم إدارة كل السيارات وإطلاق المزادات الفورية */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚗 مستودع السيارات وإطلاق المزادات بضغطة زر</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                    <th className="p-4">السيارة</th>
                    <th className="p-4">السعر الأساسي</th>
                    <th className="p-4">الموقع</th>
                    <th className="p-4 text-center">الإجراء الفوري وتحويلها لمزاد</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold">{car.title}</td>
                      <td className="p-4 font-mono">{car.price} {car.currency || 'ريال'}</td>
                      <td className="p-4 font-semibold">{car.country === 'EG' ? '🇪🇬 مصر' : car.country === 'AE' ? '🇦🇪 الإمارات' : '🇸🇦 السعودية'}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          
                          {/* زر ذكي يحول السيارة العادية لمزاد في ثانية */}
                          <button 
                            onClick={() => setActiveCarForAuction(activeCarForAuction === car.id ? null : car.id)}
                            className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-xs"
                          >
                            🚀 تحويل لمزاد علني
                          </button>

                          <button onClick={() => handleDeleteCar(car.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition text-xs font-medium">
                            حذف الإعلان 🗑️
                          </button>
                        </div>

                        {/* الوجّه البرمجي للنموذج السريع لإدخال تفاصيل المزاد تحت السطر مباشرة */}
                        {activeCarForAuction === car.id && (
                          <form onSubmit={(e) => handleLaunchAuction(e, car.id)} className="mt-4 bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4 max-w-md mx-auto text-right">
                            <h4 className="font-bold text-blue-900 text-xs">⚙️ إعدادات المزاد الفوري للمركبة:</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-gray-600 mb-1">السعر الافتتاحي (ريال)</label>
                                <input type="number" required placeholder="مثال: 45000" value={auctionData.start_price} className="w-full border rounded-lg px-2.5 py-1.5 text-left font-bold text-xs" dir="ltr" onChange={(e) => setAuctionData({ ...auctionData, start_price: e.target.value })} />
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-600 mb-1">مدة المزاد (أيام)</label>
                                <select className="w-full border rounded-lg px-2.5 py-1.5 text-right font-medium text-xs bg-white" value={auctionData.end_days} onChange={(e) => setAuctionData({ ...auctionData, end_days: e.target.value })}>
                                  <option value="1">يوم واحد (مزاد سريع)</option>
                                  <option value="3">3 أيام (متوسط)</option>
                                  <option value="5">5 أيام (موصى به)</option>
                                  <option value="7">أسبوع كامل</option>
                                </select>
                              </div>
                            </div>


