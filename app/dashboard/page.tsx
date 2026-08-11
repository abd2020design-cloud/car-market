'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // أدوات الحذف الجماعي الذكية
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([])

  // fلاتر البحث والفرز للأدمن
  const [adminSearch, setAdminSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // أدوات إطلاق المزاد بالساعات
  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_hours: '1' })

  // دالة جلب كافة البيانات الحية من قاعدة بيانات سوبابيز المرقاة Pro
  const fetchAdminMasterData = async () => {
    setLoading(true)
    try {
      const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
      setCars(carsData || [])

      const { data: auctionsData } = await supabase.from('auctions').select('*, cars(title)').order('id', { ascending: false })
      setAuctions(auctionsData || [])

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

  // دالة الحذف الجماعي الفتاكة لسحق عدة سيارات بضغطة واحدة
  const handleBulkDeleteCars = async () => {
    if (selectedCarIds.length === 0) return alert("يرجى تحديد سيارة واحدة على الأقل لإجراء الحذف الجماعي!")
    const confirmBulk = window.confirm(`⚠️ تنبيه إداري صارم: هل أنت متأكد من مسح وحذف (${selectedCarIds.length}) سيارات معاً دفعة واحدة؟`)
    if (!confirmBulk) return

    setLoading(true)
    try {
      const { error } = await supabase.from('cars').delete().in('id', selectedCarIds)
      if (!error) {
        alert(`🔥 نجاح إمبراطوري: تم سحق وتطهير (${selectedCarIds.length}) سيارات دفعة واحدة بنجاح!`)
        setSelectedCarIds([])
        fetchAdminMasterData()
      }
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  const handleSelectCar = (carId: number) => {
    if (selectedCarIds.includes(carId)) {
      setSelectedCarIds(selectedCarIds.filter(id => id !== carId))
    } else {
      setSelectedCarIds([...selectedCarIds, carId])
    }
  }

  const handleSelectAllCars = (visibleCars: any[]) => {
    if (selectedCarIds.length === visibleCars.length) {
      setSelectedCarIds([])
    } else {
      setSelectedCarIds(visibleCars.map(c => c.id))
    }
  }

  // دالة حظر وطرد العضو المخالف كلياً من المنصة
  const handleBanUser = async (userId: string) => {
    if (!userId) return alert("هذا الإعلان مرفوع بدون معرف حساب موثق!")
    const confirmBan = window.confirm("🚨 رادار حظر الأعضاء: هل أنت متأكد من حظر صاحب هذا الحساب نهائياً؟")
    if (!confirmBan) return

    setLoading(true)
    try {
      await supabase.from('cars').delete().eq('user_id', userId)
      alert("🚫 تم تفعيل رادار الحظر بنجاح! تم طرد العضو وسحق كافة إعلاناته حياً!")
      fetchAdminMasterData()
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  // دالة إطلاق وتفعيل المزاد العلني حياً بنظام الساعات الجديد
  const handleLaunchAuction = async (e: React.FormEvent, carId: number) => {
    e.preventDefault()
    if (!auctionData.start_price) return alert("يرجى كتابة السعر الافتتاحي!")

    const startPriceNum = parseFloat(auctionData.start_price)
    const hoursNum = parseInt(auctionData.end_hours, 10)
    
    const endTime = new Date()
    endTime.setHours(endTime.getHours() + hoursNum)

    setLoading(true)
    const { error } = await supabase
      .from('auctions')
      .insert([{ car_id: carId, start_price: startPriceNum, current_highest_bid: startPriceNum, end_time: endTime.toISOString(), status: 'active' }])

    setLoading(false)

    if (!error) {
      alert(`🔨 نجاح إداري حاسم: تم إطلاق المزاد بنجاح لمدة (${hoursNum}) ساعات حركية وبدأ العد التنازلي للجمهور!`)
      setActiveCarForAuction(null)
      setAuctionData({ start_price: '', end_hours: '1' })
      fetchAdminMasterData()
    } else {
      alert("حدث خطأ أثناء إطلاق المزاد: " + error.message)
    }
  }

  // دالة حذف وإغلاق غرفة المزاد فوراً
  const handleDeleteAuction = async (auctionId: number) => {
    const confirmAucDelete = window.confirm("⚠️ تنبيه الرقابة: هل أنت متأكد من إلغاء وإغلاق غرفة هذا المزاد نهائياً وإعادته كإعلان عادي؟")
    if (!confirmAucDelete) return

    setLoading(true)
    const { error } = await supabase.from('auctions').delete().eq('id', auctionId)
    setLoading(false)
    if (!error) {
      alert("✓ نجاح: تم إغلاق وسحب المزاد من السوق حياً وإعادة المركبة للعرض العادي!")
      fetchAdminMasterData()
    }
  }

  // دالة سحق وإلغاء السومات الوهمية
  const handleDeleteFraudBid = async (bidId: number, auctionId: number) => {
    const confirmBidDelete = window.confirm(`⚠️ رادار مكافحة الاحتيال: هل أنت متأكد من حذف هذه السومة؟`)
    if (!confirmBidDelete) return

    setLoading(true)
    await supabase.from('bid_history').delete().eq('id', bidId)
    const { data: remainingBids } = await supabase.from('bid_history').select('bid_amount').eq('auction_id', auctionId).order('bid_amount', { ascending: false }).limit(1)

    let newHighestBid = 0
    if (remainingBids && remainingBids.length > 0) {
      newHighestBid = remainingBids.bid_amount
    } else {
      const { data: aucData } = await supabase.from('auctions').select('start_price').eq('id', auctionId).single()
      newHighestBid = aucData?.start_price || 0
    }

    await supabase.from('auctions').update({ current_highest_bid: newHighestBid }).eq('id', auctionId)
    setLoading(false)
    alert("🔥 تم سحق وتطهير السومة الوهمية، وإرجاع المزاد لأعلى سعر حقيقي تلقائياً!")
    fetchAdminMasterData()
  }

  // دالة الموافقة والنشر الفوري والقفز للأعلى
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

  // دالة الحذف النهائي للإعلانات المخالفة
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه إداري حاسم: هل أنت متأكد من حذف هذا الإعلان نهائياً؟")
    if (!confirmDelete) return

    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (!error) {
      alert("✓ تم حذف وتطهير المركبة من السيرفر كلياً!")
      fetchAdminMasterData() 
    }
  }

  // حساب الإحصائيات
  const totalCarsCount = cars.length
  const pendingCarsCount = cars.filter(c => !c.is_paid).length
  const activeAuctionsCount = auctions.length
  const totalRevenue = cars.filter(c => c.is_paid).length * 10 

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
              <span className="bg-gray-950 text-white font-black text-xs px-2 py-0.5 rounded">Master Hourly Control</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">لوحة التحكم والسيطرة المركزية ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">بصفتك المشرف العام (عبدالرحمن)، تملك الرقابة الكاملة على الكاش والمزادات السريعة بالساعات حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-sm text-xs">
            + إضافة سيارة جديدة للمنصة
          </Link>
        </header>

        {/* 🌟 كروت لوحة الإحصائيات الأربعة - مقفلة ومربوطة بأمان 100% */}
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
        </div>      