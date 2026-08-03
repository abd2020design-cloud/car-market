'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [allBids, setAllBids] = useState<any[]>([]) // سجل السومات الشامل لمكافحة الاحتيال
  const [loading, setLoading] = useState(true)

  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_days: '3' })

  // جلب كافة البيانات حياً من السيرفر السحابي المطور Pro
  const fetchData = async () => {
    setLoading(true)
    
    // 1. جلب السيارات
    const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
    setCars(carsData || [])

    // 2. جلب المزادات
    const { data: auctionsData } = await supabase.from('auctions').select('*, cars(*)').order('id', { ascending: false })
    setAuctions(auctionsData || [])

    // 3. جلب آخر السومات المرفوعة في الموقع لمراقبتها وحظر التلاعب
    const { data: bidsData } = await supabase
      .from('bid_history')
      .select('*, auctions(id, car_id, cars(title))')
      .order('id', { ascending: false })
      .limit(20) // عرض آخر 20 سومة جارية بالموقع
    setAllBids(bidsData || [])

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🌟 دالة إطلاق المزاد السريع بضغطة زر
  const handleLaunchAuction = async (e: React.FormEvent, carId: number) => {
    e.preventDefault()
    if (!auctionData.start_price) return alert("يرجى كتابة السعر الافتتاحي!")

    const startPriceNum = parseFloat(auctionData.start_price)
    const daysNum = parseInt(auctionData.end_days, 10)

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
      setActiveCarForAuction(null)
      setAuctionData({ start_price: '', end_days: '3' })
      fetchData()
    } else {
      alert("حدث خطأ أثناء إطلاق المزاد: " + error.message)
    }
  }

  // 🚨 زر الأمان القاتل: حذف السومة الوهمية فوراً وتحديث العدادات حياً
  const handleDeleteFraudBid = async (bidId: number, auctionId: number, bidAmount: number) => {
    const confirmBidDelete = window.confirm(`⚠️ كشف تلاعب: هل أنت متأكد من حذف هذه السومة البالغة (${bidAmount} ريال)؟ سيقوم النظام بتصفير الشاشات للزوار فوراً!`)
    if (!confirmBidDelete) return

    // 1. حذف السومة الوهمية من سجل السومات
    const { error: deleteError } = await supabase.from('bid_history').delete().eq('id', bidId)

    if (deleteError) return alert("فشل حذف السومة: " + deleteError.message)

    // 2. إعادة احتساب وجلب أعلى سومة حقيقية متبقية في المزاد لتصحيح السعر للجمهور
    const { data: remainingBids } = await supabase
      .from('bid_history')
      .select('bid_amount')
      .eq('auction_id', auctionId)
      .order('bid_amount', { ascending: false })
      .limit(1)

    // إذا كانت هناك سومات سابقة حقيقية نرجع لها، وإلا نرجع للسعر الافتتاحي للمزاد
    let newHighestBid = 0
    if (remainingBids && remainingBids.length > 0) {
      newHighestBid = remainingBids[0].bid_amount
    } else {
      const { data: aucData } = await supabase.from('auctions').select('start_price').eq('id', auctionId).single()
      newHighestBid = aucData?.start_price || 0
    }

    // 3. تحديث شاشة المزاد بالسعر الحقيقي النظيف بعد طرد المتلاعب
    await supabase.from('auctions').update({ current_highest_bid: newHighestBid }).eq('id', auctionId)

    alert("🔥 تم سحق السومة الوهمية بنجاح وإعادة المزاد لوضعه الحقيقي العادل!")
    fetchData() // تحديث قوائم لوحة الأدمن
  }

  // زر الطوارئ لحذف سيارة أو إعلان بالكامل
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

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل لوحة التحكم الذكية الخارقة للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* رأس الصفحة */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم سوق الألف مليون ⚙️ <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-bold uppercase">Pro Node</span></h1>
            <p className="text-gray-500 text-sm mt-1">أنت المالك العام؛ يمكنك إدارة الإعلانات، إطلاق المزادات بضغطة زر، وسحق السومات الوهمية حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
            + إضافة سيارة جديدة
          </Link>
        </header>

        {/* 🚨 قسم الرادار الأمني: مراقبة وتصفية السومات الوهمية جارية حالياً (Anti-Fraud Board) */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100">
          <div className="mb-4 border-r-4 border-red-500 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🚨 رادار مكافحة الاحتيال والتلاعب بالسوم</h2>
            <p className="text-gray-500 text-xs mt-0.5">تابع آخر المزايدات المرفوعة بالموقع حالياً، واحذف السومة المشبوهة فوراً لتحديث شاشات الجمهور.</p>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-red-100 text-xs font-bold text-red-700">
                  <th className="p-3">سيارة المزاد</th>
                  <th className="p-3">قيمة السومة المعروضة</th>
                  <th className="p-3">تاريخ ووقت السوم</th>
                  <th className="p-3 text-center">حظر وسحق السومة</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700">
                {allBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-gray-50 hover:bg-red-50/10 transition">
                    <td className="p-3 font-bold text-gray-900">{bid.auctions?.cars?.title || 'تويوتا كامري متاح للمزاد'}</td>
                    <td className="p-3 font-mono font-black text-blue-600 text-sm">{bid.bid_amount} ريال</td>
                    <td className="p-3 text-gray-400">{new Date(bid.created_at).toLocaleString('ar-SA')}</td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleDeleteFraudBid(bid.id, bid.auction_id, bid.bid_amount)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 font-bold transition text-[11px] shadow-sm"
                      >
                        حذف السومة الوهمية ❌
                      </button>
                    </td>
                  </tr>
                ))}
                {allBids.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-gray-400">لا توجد عمليات مزايدة جارية حالياً لفرزها أمنياً.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* قسم مراقبة المزادات الحركية النشطة */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">🔨 المزادات الحية والمراقبة الإقليمية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map((auc) => (
              <div key={auc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between">
                <div className="flex gap-4">
                  <img src={auc.cars?.image_url || '/placeholder-news.jpg'} className="w-20 h-20 object-cover rounded-xl border" alt="" />
                  <div>
                    <h3 className="font-bold text-gray-900">{auc.cars?.title || 'سيارة المزاد'}</h3>
                    <p className="text-xs text-gray-400 mt-1">رقم المزاد: #{auc.id} | الدولة: {auc.cars?.country === 'EG' ? '🇪🇬 مصر' : '🇸🇦 السعودية'}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-gray-600">الافتتاحي: {auc.start_price}</span>
                      <span className="text-xs bg-blue-50 px-2.5 py-1 rounded-full text-blue-700 font-bold">🔥 أعلى سوم: {auc.current_highest_bid}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-gray-100 pt-4 mt-4">
                  <Link href={`/auctions/${auc.id}`} target="_blank" className="flex-1 text-center bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl text-sm hover:bg-gray-200 transition">👁️ معاينة المزاد</Link>
                  <button onClick={() => handleDeleteCar(auc.car_id)} className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-600 hover:text-white transition">🛑 حذف السيارة بالكامل</button>
                </div>
              </div>
            ))}
          </div>
        </section>



