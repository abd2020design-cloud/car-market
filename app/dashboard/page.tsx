'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // فلاتر البحث والفرز للأدمن
  const [adminSearch, setAdminSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // أدوات إطلاق المزاد
  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_days: '3' })

  // دالة جلب كافة البيانات الحية من قاعدة بيانات سوبابيز المرقاة Pro
  const fetchAdminMasterData = async () => {
    setLoading(true)
    try {
      // 1. جلب كل السيارات
      const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
      setCars(carsData || [])

      // 2. جلب كل غرف المزادات
      const { data: auctionsData } = await supabase.from('auctions').select('*, cars(title)').order('id', { ascending: false })
      setAuctions(auctionsData || [])

      // 3. جلب آخر 30 سومة ومزايدة جارية حية للرقابة الأمنية ومكافحة الاحتيال
      const { data: bidsData } = await supabase
        .from('bid_history')
        .select('*, auctions(id, car_id, cars(title))')
        .order('id', { ascending: false })
        .limit(30)
      setBids(bidsData || [])

    } catch (err) {
      console.error("🚨 خطأ نظام الأدمن المركزي:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAdminMasterData()
  }, [])

  // 🌟 [ميزة 1]: دالة إطلاق وتفعيل المزاد العلني حياً
  const handleLaunchAuction = async (e: React.FormEvent, carId: number) => {
    e.preventDefault()
    if (!auctionData.start_price) return alert("يرجى كتابة السعر الافتتاحي!")

    const startPriceNum = parseFloat(auctionData.start_price)
    const daysNum = parseInt(auctionData.end_days, 10)
    const endTime = new Date()
    endTime.setDate(endTime.getDate() + daysNum)

    setLoading(true)
    const { error } = await supabase
      .from('auctions')
      .insert([{ car_id: carId, start_price: startPriceNum, current_highest_bid: startPriceNum, end_time: endTime.toISOString(), status: 'active' }])

    setLoading(false)

    if (!error) {
      alert("🔨 نجاح إداري: تم تحويل السيارة لمزاد علني فوري وبدأ العداد التنازلي للجمهور!")
      setActiveCarForAuction(null)
      setAuctionData({ start_price: '', end_days: '3' })
      fetchAdminMasterData()
    } else {
      alert("حدث خطأ أثناء إطلاق المزاد: " + error.message)
    }
  }

  // 🌟 [ميزة 2]: دالة سحق وإلغاء السومات الوهمية وإعادة المزاد تلقائياً لأعلى سعر حقيقي سابق
  const handleDeleteFraudBid = async (bidId: number, auctionId: number) => {
    const confirmBidDelete = window.confirm(`⚠️ رادار مكافحة الاحتيال: هل أنت متأكد من حذف هذه السومة وسحق التلاعب؟`)
    if (!confirmBidDelete) return

    setLoading(true)
    // 1. حذف السومة المخالفة من السجل
    const { error: deleteError } = await supabase.from('bid_history').delete().eq('id', bidId)
    if (deleteError) {
      setLoading(false)
      return alert("فشل حذف السومة: " + deleteError.message)
    }

    // 2. جلب أعلى سومة متبقية حقيقية لهذا المزاد
    const { data: remainingBids } = await supabase
      .from('bid_history')
      .select('bid_amount')
      .eq('auction_id', auctionId)
      .order('bid_amount', { ascending: false })
      .limit(1)

    let newHighestBid = 0
    if (remainingBids && remainingBids.length > 0) {
      newHighestBid = remainingBids[0].bid_amount
    } else {
      // إذا لم يتبق أي سومات، نرجع السعر للسعر الافتتاحي للمزاد
      const { data: aucData } = await supabase.from('auctions').select('start_price').eq('id', auctionId).single()
      newHighestBid = aucData?.start_price || 0
    }

    // 3. تحديث المزاد بالسعر الحقيقي النظيف الجديد بالسيرفر
    await supabase.from('auctions').update({ current_highest_bid: newHighestBid }).eq('id', auctionId)
    setLoading(false)
    alert("🔥 تم سحق وتطهير السومة الوهمية، وإرجاع المزاد لأعلى سعر حقيقي تلقائياً!")
    fetchAdminMasterData()
  }

  // 🌟 [ميزة 3]: دالة الموافقة والنشر الفوري والقفز للأعلى
  const handleApproveCar = async (carId: number) => {
    try {
      const { error } = await supabase.from('cars').update({ is_paid: true, created_at: new Date().toISOString() }).eq('id', carId)
      if (!error) {
        alert("🚀 تم تفعيل الإعلان بنجاح وقفزت السيارة لأعلى القائمة بالرئيسية!")
        fetchAdminMasterData()
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // 🌟 [ميزة 4]: دالة الحذف النهائي للإعلانات المخالفة من السيرفر كلياً
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه إداري حاسم: هل أنت متأكد من حذف هذا الإعلان نهائياً من قاعدة البيانات؟")
    if (!confirmDelete) return

    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (!error) {
      alert("✓ تم حذف وتطهير المركبة من السيرفر كلياً!")
      fetchAdminMasterData() 
    }
  }

  // حساب العدادات الحية حركياً للأدمن (الإحصائيات الأربعة)
  const totalCarsCount = cars.length
  const pendingCarsCount = cars.filter(c => !c.is_paid).length
  const activeAuctionsCount = auctions.length
  const totalRevenue = cars.filter(c => c.is_paid).length * 10 // إجمالي أرباح الـ 10 ريال المفعلة

  // تفعيل محرك الفلترة والبحث السريع للأدمن بالجداول
  const filteredCarsForAdmin = cars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(adminSearch.toLowerCase()) || car.id.toString() === adminSearch.trim()
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'PAID' && car.is_paid) || (statusFilter === 'PENDING' && !car.is_paid)
    return matchesSearch && matchesStatus
  })

  if (loading && cars.length === 0) return <p className="text-center py-12 text-gray-500 animate-pulse font-bold">جاري تشغيل جدران السيطرة والإحصائيات للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* رأس لوحة التحكم */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-50 text-red-600 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">صلاحيات الإدارة المطلقة</span>
              <span className="bg-gray-950 text-white font-black text-xs px-2 py-0.5 rounded">Master ERP Control 1B</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">لوحة التحكم والسيطرة المركزية ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك المشرف العام (عبدالرحمن)، تملك الرقابة الكاملة على الكاش والمزادات وسحق التلاعب حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs">
            + إضافة سيارة جديدة للمنصة
          </Link>
        </header>

        {/* 🌟 كروت لوحة الإحصائيات الذكية والعدادات الرقمية للأرباح والكاش */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">🚗 إجمالي الإعلانات</span>
            <span className="text-2xl font-black text-gray-950 font-mono">{totalCarsCount}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <span className="text-[10px] font-bold text-amber-600 uppercase block mb-1">⏳ إعلانات معلقة</span>
            <span className="text-2xl font-black text-amber-600 font-mono">{pendingCarsCount}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">🔨 المزادات النشطة</span>
            <span className="text-2xl font-black text-blue-600 font-mono">{activeAuctionsCount}</span>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl border border-green-200 shadow-sm">
            <span className="text-[10px] font-bold text-green-700 uppercase block mb-1">💰 الكاش والأرباح المحققة</span>
            <span className="text-2xl font-black text-green-700 font-mono">{totalRevenue} ريال</span>
          </div>
        </section>

        {/* شريط البحث والفلترة السريع للأدمن */}
        <section className="bg-white p-4 rounded-2xl border border-gray-150 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md">
            <input 
              type="text" 
              placeholder="ابحث عن إعلان برقم الـ ID أو اسم السيارة..." 
              value={adminSearch}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-right font-semibold text-xs focus:outline-none focus:border-blue-500"
              onChange={(e) => setAdminSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-500 w-full md:w-auto justify-center">
            <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>الكل</button>
            <button onClick={() => setStatusFilter('PAID')} className={`px-4 py-2 rounded-lg transition ${statusFilter === 'PAID' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>✓ النشط</button>
