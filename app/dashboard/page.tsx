'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // أدوات التحكم بفتح استمارة المزاد لكل سيارة
  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_days: '3' })

  // دالة جلب كافة جرد المركبات والمزادات من السيرفر السحابي المرقّى Pro
  const fetchAdminData = async () => {
    setLoading(true)
    try {
      // 1. جلب كل السيارات
      const { data: carsData, error: carsErr } = await supabase
        .from('cars')
        .select('*')
        .order('id', { ascending: false })
      if (!carsErr) setCars(carsData || [])

      // 2. جلب كل غرف المزادات النشطة مع أسماء السيارات المربوطة بها
      const { data: auctionsData, error: aucErr } = await supabase
        .from('auctions')
        .select('*, cars(title)')
        .order('id', { ascending: false })
      if (!aucErr) setAuctions(auctionsData || [])

    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminData()
  }, [])

  // 🌟 دالة إطلاق وتفعيل المزاد العلني فوراً وحياً لأي سيارة في الموقع
  const handleLaunchAuction = async (e: React.FormEvent, carId: number) => {
    e.preventDefault()
    if (!auctionData.start_price) return alert("يرجى كتابة السعر الافتتاحي أولاً!")

    const startPriceNum = parseFloat(auctionData.start_price)
    const daysNum = parseInt(auctionData.end_days, 10)

    // حساب تاريخ نهاية المزاد بناءً على الأيام المحددة
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + daysNum)

    setLoading(true)
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

    setLoading(false)

    if (!error) {
      alert("🔨 نجاح إداري: تم إطلاق المزاد العلني حياً لهذه السيارة وبدأ العداد التنازلي للجمهور!")
      setActiveCarForAuction(null)
      setAuctionData({ start_price: '', end_days: '3' })
      fetchAdminData()
    } else {
      alert("حدث خطأ أثناء إطلاق المزاد: " + error.message)
    }
  }

  // دالة الموافقة والنشر الفوري وتحديث الوقت لتقفز السيارة للأعلى
  const handleApproveCar = async (carId: number) => {
    try {
      const { error } = await supabase
        .from('cars')
        .update({ is_paid: true, created_at: new Date().toISOString() }) 
        .eq('id', carId)

      if (!error) {
        alert("🚀 تم تفعيل ونشر الإعلان حياً وقفزت السيارة لأعلى القائمة الرئيسية!")
        fetchAdminData()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // دالة السحق والحذف الفتاكة للأدمن لحذف الإعلانات المخالفة
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه إداري حاسم: هل أنت متأكد من حذف هذا الإعلان نهائياً؟")
    if (!confirmDelete) return

    try {
      const { error } = await supabase.from('cars').delete().eq('id', carId)
      if (!error) {
        alert("✓ تم حذف وتطهير المركبة من السيرفر!")
        fetchAdminData() 
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500 animate-pulse font-bold">جاري فتح غرف السيطرة وإدارة المزادات...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* رأس لوحة التحكم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">صلاحيات الإدارة المطلقة</span>
              <span className="bg-gray-950 text-white font-black text-xs px-2 py-0.5 rounded">Master Auction Control</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">لوحة إدارة السيارات والمزادات حياً ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك المشرف العام، يمكنك جرد السوق، إطلاق غرف المزادات الفورية، وسحق المخالفات.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs">
            + إضافة سيارة جديدة للمنصة
          </Link>
        </header>

        {/* القسم الأول: مستودع السيارات وإطلاق المزادات الحية */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 overflow-hidden">
          <div className="mb-6 border-r-4 border-gray-950 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🚗 كشاف جرد المركبات وإطلاق المزادات</h2>
            <p className="text-gray-400 text-xs mt-0.5">اضغط على زر المزاد لتوليد عداد تنازلي وسومة حية للمركبة أمام الزوار.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600">
                  <th className="p-4">رقم الإعلان</th>
                  <th className="p-4">ماركة السيارة</th>
                  <th className="p-4">السعر والموديل</th>
                  <th className="p-4">حالة النشر</th>
                  <th className="p-4 text-center">الإجراءات والسيطرة</th>
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
                        <span className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-green-100">✓ نشط (منشور)</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-amber-100">⏳ معلق (لم يدفع)</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex justify-center gap-3">
                          {/* 🌟 زر فتح وإغلاق استمارة تحويل المركبة لمزاد حي */}
                          <button 
                            type="button"
                            onClick={() => setActiveCarForAuction(activeCarForAuction === car.id ? null : car.id)}
                            className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-blue-700 transition text-xs shadow-sm"
                          >
                            🔨 تحويل لمزاد حي
                          </button>

                          {!car.is_paid && (
                            <button type="button" onClick={() => handleApproveCar(car.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700 font-bold transition text-xs shadow-sm">🚀 موافقة ونشر للأعلى</button>
                          )}
                          
                          <button type="button" onClick={() => handleDeleteCar(car.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-600 hover:text-white font-bold transition text-xs border border-red-100">حذف الإعلان 🗑️</button>
                        </div>

                        {/* 🌟 استمارة إطلاق المزاد الذكية تفتح تحت السيارة المحددة بالثانية */}
                        {activeCarForAuction === car.id && (
                          <form onSubmit={(e) => handleLaunchAuction(e, car.id)} className="w-full max-w-sm mt-3 bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-3 text-right">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">السعر الافتتاحي (ريال)</label>
                                <input type="number" required placeholder="مثال: 50000" value={auctionData.start_price} className="w-full border rounded-xl px-3 py-2 text-left font-black text-blue-600 text-xs bg-white" onChange={(e) => setAuctionData({ ...auctionData, start_price: e.target.value })} />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">مدة المزاد</label>
                                <select className="w-full border rounded-xl px-3 py-2 text-right font-bold text-xs bg-white text-gray-700" value={auctionData.end_days} onChange={(e) => setAuctionData({ ...auctionData, end_days: e.target.value })}>
                                  <option value="1">يوم واحد</option>
                                  <option value="3">3 أيام</option>
                                  <option value="5">5 أيام</option>
                                </select>
                              </div>
