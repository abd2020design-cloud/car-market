'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [auction, setAuction] = useState<any>(null)
  const [bids, setBids] = useState<any[]>([])
  const [bidAmount, setBidAmount] = useState('')
  const [countdown, setCountdown] = useState('جاري حساب الوقت...')
  const [loading, setLoading] = useState(true)

  const fetchAuctionDetails = async () => {
    try {
      // 🌟 استخدام single لضمان جلب كائن فريد متوافق 100% مع معايير الـ TypeScript
      const { data, error } = await supabase
        .from('auctions')
        .select('*, cars(*)')
        .eq('id', id)
        .single()

      if (!error && data) {
        setAuction(data)
        
        // تشغيل العداد التنازلي حياً للمزاد
        const end = new Date(data.end_time).getTime()
        const timer = setInterval(() => {
          const now = new Date().getTime()
          const distance = end - now

          if (distance < 0) {
            clearInterval(timer)
            setCountdown('🔨 المزاد منتهي مغلق')
          } else {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24))
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((distance % (1000 * 60)) / 1000)
            setCountdown(`${days} يوم و ${hours} ساعة و ${minutes} دقيقة و ${seconds} ثانية`)
          }
        }, 1000)

        // جلب سجل السومات الفعلي حياً
        const { data: bidData } = await supabase
          .from('bid_history')
          .select('*')
          .eq('auction_id', id)
          .order('bid_amount', { ascending: false })

        setBids(bidData || [])
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAuctionDetails()
  }, [id])

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bidAmount || !auction) return

    const newBid = parseFloat(bidAmount)
    if (newBid <= auction.current_highest_bid) {
      alert(`⚠️ يجب أن تكون السومة الجديدة أعلى من السوم الحالي الحالي: ${auction.current_highest_bid} ريال!`)
      return
    }

    setLoading(true)

    // حقن السومة الجديدة في سجل مكافحة الاحتيال الرقمي
    const { error: insertError } = await supabase
      .from('bid_history')
      .insert([{ auction_id: id, bid_amount: newBid }])

    if (!insertError) {
      // تحديث السعر الحالي للمزاد تلقائياً
      await supabase.from('auctions').update({ current_highest_bid: newBid }).eq('id', id)
      alert('🚀 نجاح! تم تسجيل سومتك الحية والمباشرة بنجاح في الرادار.')
      setBidAmount('')
      fetchAuctionDetails()
    } else {
      alert('فشل تسجيل السومة: ' + insertError.message)
      setLoading(false)
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل غرفة المزاد العلني الفوري حياً...</p>
  if (!auction) return <p className="text-center py-12 text-red-500">🚨 خطأ أمني: لم نجد هذا المزاد في السيرفر السحابي.</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ساحة تفاصيل المركبة والمزايدة */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <header>
            <span className="bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-full text-xs uppercase tracking-wider animate-pulse">🔨 مزاد علني فوري حي</span>
            <h1 className="text-2xl font-black text-gray-900 mt-3">{auction.cars?.title || 'تويوتا كامري'}</h1>
            <p className="text-gray-500 text-xs mt-1">الموديل والسنة: {auction.cars?.model || '2025'}</p>
          </header>

          <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex justify-between items-center font-bold text-sm text-red-800">
            <span>⏳ العداد التنازلي لإغلاق المزاد:</span>
            <span className="font-mono text-base tracking-tight">{countdown}</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase">وصف ومواصفات حالة المركبة</h3>
            <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150">{auction.cars?.description || 'مواصفات ممتازة.'}</p>
          </div>

          {/* استمارة السوم الحركي */}
          <form onSubmit={handlePlaceBid} className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">زايد وسوّم الآن بالريال السعودي *</label>
              <div className="relative">
                <input 
                  type="number" 
                  required 
                  placeholder={`اكتب قيمة أعلى من ${auction.current_highest_bid}`} 
                  value={bidAmount}
                  className="w-full border border-gray-200 rounded-xl pl-16 pr-4 py-3.5 text-left font-black text-blue-600 focus:outline-none focus:border-blue-500 text-base" 
                  dir="ltr"
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <span className="absolute left-4 top-4 text-xs font-bold text-gray-400">ريال سعودي</span>
              </div>
            </div>
            <button type="submit" className="w-full bg-gray-950 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition shadow-md text-sm">
              تأكيد وإرسال السومة حياً للموقع ←
            </button>
          </form>
        </div>

        {/* كشاف وسجل الشفافية ومكافحة الاحتيال */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 mb-1">📊 سجل الشفافية والنزاهة للرادار</h3>
            <p className="text-[10px] text-gray-400 mb-4">تحديث السومات جاري بالثانية لمنع التلاعب الوهمي.</p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {bids.map((b, index) => (
                <div key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-700">سومة رقم #{bids.length - index}</span>
                  <span className="font-mono font-black text-sm text-blue-600">{b.bid_amount} ريال</span>
                </div>
              ))}
              {bids.length === 0 && (
                <p className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed">📥 لا توجد سومات حالياً. كن أول من يسوّم!</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-6 text-center">
            <span className="text-xs text-gray-400 block mb-1">السوم الحالي الأعلى:</span>
            <span className="text-3xl font-black text-blue-600 font-mono tracking-tight">{auction.current_highest_bid} ريال</span>
          </div>
        </div>

      </div>
    </main>
  )
}
