'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const [cars, setCars] = useState<any[]>([])
  const [auctions, setAuctions] = useState<any[]>([])
  const [allBids, setAllBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: carsData } = await supabase.from('cars').select('*').order('id', { ascending: false })
      setCars(carsData || [])

      const { data: auctionsData } = await supabase.from('auctions').select('*, cars(*)').order('id', { ascending: false })
      setAuctions(auctionsData || [])

      const { data: bidsData } = await supabase.from('bid_history').select('*, auctions(id, car_id, cars(title))').order('id', { ascending: false }).limit(20)
      setAllBids(bidsData || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("⚠️ هل أنت متأكد من حذف هذا الإعلان؟")
    if (!confirmDelete) return
    const { error } = await supabase.from('cars').delete().eq('id', carId)
    if (!error) {
      alert("✓ تم حذف المركبة بنجاح!")
      fetchData()
    }
  }

  if (loading) return <p className="text-center py-12 text-gray-500">جاري تحميل لوحة التحكم...</p>

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900">لوحة تحكم سوق الألف مليون ⚙️</h1>
            <p className="text-gray-500 text-sm mt-1">إدارة الإعلانات، وحذف المخالفات حياً ومباشراً.</p>
          </div>
          <Link href="/dashboard/add-car" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-sm">
            + إضافة سيارة جديدة
          </Link>
        </header>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-red-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 رادار مراقبة السوم الجاري بالموقع</h2>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-right border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-red-50/50 border-b border-red-100 text-xs font-bold text-red-700">
                  <th className="p-3">سيارة المزاد</th>
                  <th className="p-3">قيمة السومة</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700">
                {allBids.map((bid) => (
                  <tr key={bid.id} className="border-b border-gray-50">
                    <td className="p-3 font-bold text-gray-900">{bid.auctions?.cars?.title || 'تويوتا كامري'}</td>
                    <td className="p-3 font-mono font-black text-blue-600 text-sm">{bid.bid_amount} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">🚗 مستودع السيارات النشطة والمعلقة</h2>
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
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteCar(car.id)} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition text-xs font-medium">
                          حذف الإعلان 🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}



