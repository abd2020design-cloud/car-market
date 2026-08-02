'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'

export default function AuctionDetailPage({ params }: { params: { id: string } }) {
  const [auction, setAuction] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [userBid, setUserBid] = useState('')
  const [timeLeft, setTimeLeft] = useState('جاري حساب الوقت...')

  useEffect(() => {
    // 1. جلب تفاصيل المزاد والسيرة وترتيب السومات علناً
    const fetchAuctionData = async () => {
      const { data } = await supabase
        .from('auctions')
        .select('*, cars(*)')
        .eq('id', params.id)
        .single()
      
      if (data) {
        setAuction(data)
        
        const { data: bidData } = await supabase
          .from('bid_history')
          .select('*')
          .eq('auction_id', data.id)
          .order('bid_amount', { ascending: false })
        setBids(bidData || [])
        
        // تشغيل العداد التنازلي للوقت المتبقي بناءً على تاريخ الانتهاء
        startCountdown(data.end_time)
      }
    }

    fetchAuctionData()

    // 2. تفعيل الوقت الفعلي (Realtime) لتحديث السومات حياً أمام الزوار
    const channel = supabase
      .channel('live-bids')
      .on('postgres_changes', { event: 'INSERT', table: 'bid_history', filter: `auction_id=eq.${params.id}` }, 
      (payload) => {
        setBids((prev) => [payload.new, ...prev])
        setAuction((prev: any) => ({ ...prev, current_highest_bid: payload.new.bid_amount }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  // دالة تشغيل العداد التنازلي الحي بالثواني والدقائق
  const startCountdown = (endTimeStr: string) => {
    const timer = setInterval(() => {
      const difference = +new Date(endTimeStr) - +new Date()
      if (difference <= 0) {
        setTimeLeft('🚨 المزاد مغلق ومنتهي!')
        clearInterval(timer)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft(`⏳ متبقي: ${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`)
    }, 1000)
  }

  // دالة إرسال السومة الجديدة علناً للجميع
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    const bidNumber = parseFloat(userBid)

    if (bidNumber <= (auction?.current_highest_bid || auction?.start_price)) {
      alert("يجب أن تكون سومتك أعلى من السوم الحالي للمزاد!")
      return
    }

    const { error } = await supabase
      .from('bid_history')
      .insert([{ auction_id: auction.id, bid_amount: bidNumber }])

    if (!error) {
      alert("✓ تم تسجيل سومتك بنجاح وظهرت علناً للجميع!")
      setUserBid('')
    }
  }

  if (!auction) return <p className="text-center py-12">جاري تحميل بيانات المزاد الفوري...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* تفاصيل المزاد والسيارة */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <img src={auction.cars?.image_url} alt={auction.cars?.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
          
          {/* عداد الوقت الحي المتحرك بالثواني */}
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl py-2 px-4 inline-block font-bold text-sm mb-4">
            {timeLeft}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{auction.cars?.title}</h1>
          <p className="text-gray-500 mb-6">{auction.cars?.description}</p>
          
          {/* شاشة السعر الحالي العلني */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-gray-400 block mb-1">السعر الافتتاحي</span>
              <span className="text-xl font-bold text-gray-700">{auction.start_price} ريال</span>
            </div>
            <div className="border-r border-blue-200">
              <span className="text-xs text-blue-600 font-bold block mb-1">🔥 أعلى سومة علنية الآن</span>
              <span className="text-3xl font-black text-blue-700">{auction.current_highest_bid || auction.start_price} ريال</span>
            </div>
          </div>

          {/* نموذج السوم العلني */}
          <form onSubmit={handlePlaceBid} className="mt-8 flex gap-4">
            <input 
              type="number" 
              required 
              placeholder="اكتب سومتك الجديدة هنا..." 
              value={userBid}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-left font-bold text-lg" 
              dir="ltr"
              onChange={(e) => setUserBid(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition">
              زايد الآن 🔨
            </button>
          </form>
        </div>

        {/* لوحة سجل السومات الحية للزوار */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">📋 سجل المزايدة الحي</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {bids.map((bid, index) => (
                <div key={bid.id} className={`flex justify-between items-center p-3 rounded-xl text-sm ${index === 0 ? 'bg-green-50 border border-green-100 font-bold text-green-800' : 'bg-gray-50 text-gray-600'}`}>
                  <span>{index === 0 ? '👑 الأعلى' : `#${bids.length - index}`}</span>
                  <span className="font-mono">{bid.bid_amount} ريال</span>
                </div>
              ))}
              {bids.length === 0 && <p className="text-gray-400 text-xs text-center py-6">لا توجد سومات بعد. كن أول المزايدين!</p>}
            </div>
          </div>

          <div className="bg-gray-900 text-white p-4 rounded-xl text-center text-xs mt-6">
            🔒 تضمن منصتنا الشفافية التامة للجميع. بعد انتهاء الوقت، يتواصل فريقنا تلقائياً مع الفائز لتسليم السيارة وتحصيل الرسوم.
          </div>
        </div>

      </div>
    </main>
  )
}
