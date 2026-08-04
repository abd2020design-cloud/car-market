'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [allBids, setAllBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activeCarForAuction, setActiveCarForAuction] = useState<number | null>(null)
  const [auctionData, setAuctionData] = useState({ start_price: '', end_days: '3' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
      setCars(carsData || [])

      const { data: auctionsData } = await supabase.from('auctions').select('*, cars(*)').order('id', { ascending: false })
      setAuctions(auctionsData || [])

      const { data: bidsData } = await supabase
        .from('bid_history')
        .select('*, auctions(id, car_id, cars(title))')
        .order('id', { ascending: false })
        .limit(20)
      setAllBids(bidsData || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  const handleDeleteFraudBid = async (bidId: number, auctionId: number, bidAmount: number) => {
    const confirmBidDelete = window.confirm(`⚠️ كشف تلاعب: هل أنت متأكد من حذف هذه السومة؟`)
    if (!confirmBidDelete) return

    const { error: deleteError } = await supabase.from('bid_history').delete().eq('id', bidId)
    if (deleteError) return alert("فشل حذف السومة: " + deleteError.message)

    const { data: remainingBids } = await supabase
      .from('bid_history')
      .select('bid_amount')
      .eq('auction_id', auctionId)
      .order('bid_amount', { ascending: false })
      .limit(1)

    let newHighestBid = 0
    if (remainingBids && remainingBids.length > 0) {
      newHighestBid = remainingBids.bid_amount
    } else {
      const { data: aucData } = await supabase.from('auctions').select('start_price').eq('id', auctionId).single()
      newHighestBid = aucData?.start_price || 0
    }

    await supabase.from('auctions').update({ current_highest_bid: newHighestBid }).eq('id', auctionId)
    alert("🔥 تم سحق السومة الوهمية بنجاح!")
    fetchData()
  }

  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ تنبيه أمني: هل أنت متأكد من حذف هذا الإعلان؟")
    if (!confirmDelete) return

    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (!error) {
      alert("✓ تم حذف المركبة بنجاح!")
      fetchData()
    } else {
      alert("حدث خطأ: " + error.message)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل لوحة التحكم الذكية الخارقة للأدمن...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم سوق الألف مليون ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">إدارة الإعلانات، إطلاق المزادات بضغطة زر، وسحق السومات الوهمية حياً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
            + إضافة سيارة جديدة
          </Link>
        </header>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100">
          <div className="mb-4 border-r-4 border-red-500 pr-3">
            <h2 className="text-xl font-bold text-gray-900">🚨 رادار مكافحة الاحتيال والتلاعب بالسوم</h2>
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-red-100 text-xs font-bold text-red-700">
                  <th className="p-3">سيارة المزاد</th>
                  <th className="p-3">قيمة السومة</th>
                  <th className="p-3 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700">
                {allBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-gray-50 hover:bg-red-50/10 transition">
                    <td className="p-3 font-bold text-gray-900">{bid.auctions?.cars?.title || 'تويوتا كامري متاح للمزاد'}</td>
                    <td className="p-3 font-mono font-black text-blue-600 text-sm">{bid.bid_amount} ريال</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteFraudBid(bid.id, bid.auction_id, bid.bid_amount)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900 font-bold transition text-[11px] shadow-sm">
                        حذف السومة الوهمية ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚗 مستودع السيارات وإطلاق المزادات</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-600">
                    <th className="p-4">السيارة</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold">{car.title}</td>
                      <td className="p-4 font-mono">{car.price} {car.currency || 'ريال'}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => setActiveCarForAuction(activeCarForAuction === car.id ? null : car.id)} className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition text-xs">
                            🚀 تحويل لمزاد علني
                          </button>
                          <button onClick={() => handleDeleteCar(car.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition text-xs font-medium">
                            حذف الإعلان 🗑️
                          </button>
                        </div>
                        {activeCarForAuction === car.id && (
                          <form onSubmit={(e) => handleLaunchAuction(e, car.id)} className="mt-4 bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-4 max-w-md mx-auto">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-gray-600 mb-1">السعر الافتتاحي</label>
                                <input type="number" required placeholder="السعر" value={auctionData.start_price} className="w-full border rounded-lg px-2.5 py-1.5 text-left font-bold text-xs" onChange={(e) => setAuctionData({ ...auctionData, start_price: e.target.value })} />
                              </div>
                              <div>
                                <label className="block text-[11px] text-gray-600 mb-1">مدة المزاد</label>
                                <select className="w-full border rounded-lg px-2.5 py-1.5 text-right font-medium text-xs bg-white" value={auctionData.end_days} onChange={(e) => setAuctionData({ ...auctionData, end_days: e.target.value })}>
                                  <option value="1">يوم واحد</option>
                                  <option value="3">3 أيام</option>
                                  <option value="5">5 أيام</option>
                                </select>
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-blue-700 transition">
                              إطلاق المزاد حياً الآن 🔨
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>




