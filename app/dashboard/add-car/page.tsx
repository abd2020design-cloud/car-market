'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function AddCarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [carData, setCarData] = useState({
    title: '',
    price: '',
    model: '',
    description: '',
    image_url: '',
    country: 'SA', 
    currency: 'ريال' 
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    setLoading(true)
    
    const { error: uploadError } = await supabase.storage
      .from('cars-bucket')
      .upload(filePath, file)

    if (uploadError) {
      setLoading(false)
      alert('فشل رفع الصورة: ' + uploadError.message)
      return
    }

    const { data } = supabase.storage.from('cars-bucket').getPublicUrl(filePath)
    setCarData({ ...carData, image_url: data.publicUrl })
    setLoading(false)
    alert('✓ تم رفع الصورة بنجاح وتوليد الرابط السحابي!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carData.image_url) {
      alert('يرجى رفع صورة السيارة أولاً قبل الحفظ!')
      return
    }

    setLoading(true)

    try {
      // 🌟 تم إجبار جميع الحسابات (أفراد ومعارض) على رسوم الـ 10 ريال (is_paid = false تلقائياً) لجمع الكاش
      const { data, error } = await supabase
        .from('cars')
        .insert([
          {
            title: carData.title,
            price: parseFloat(carData.price),
            model: carData.model,
            description: carData.description,
            image_url: carData.image_url,
            country: carData.country,
            currency: carData.currency,
            is_paid: false 
          }
        ])
        .select()

      setLoading(false)

      if (!error) {
        alert('✓ نجاح: تم تسجيل السيارة معلقاً بنجاح! جاري توجيهك لبوابة الدفع الآمنة لتفعيل النشر.')
        // التوجيه التلقائي الموحد لصفحة الدفع لحصد رسوم المنصة
        router.push('/payment?carId=' + (data?.[0]?.id || ''))
      } else {
        alert('تنبيه السيرفر: ' + error.message)
      }

    } catch (err: any) {
      setLoading(false)
      alert('حدث خطأ في السيرفر أثناء المعالجة: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        <header className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">إضافة سيارة - منصة عبدالرحمن للسيارات 🏎️</h1>
          <p className="text-gray-500 text-sm mt-1">جميع الإعلانات خاضعة لرسوم النشر الموحدة (10 ريال سعودي) لضمان جدية التعامل.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم وماركة السيارة *</label>
            <input type="text" required placeholder="مثال: تويوتا كامري فل كامل" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السعر (بالريال السعودي) *</label>
              <input type="number" required placeholder="اكتب السعر الإجمالي" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e) => setCarData({ ...carData, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سنة الصنع (الموديل) *</label>
              <input type="text" required placeholder="مثال: 2026" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-center" onChange={(e) => setCarData({ ...carData, model: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف ومواصفات حالة السيارة بالكامل *</label>
            <textarea rows={4} required placeholder="اكتب حالة البدي، الممشى، المواصفات الداخلية لتسهيل فحص الإدارة والقبول..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, description: e.target.value })}></textarea>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة السيارة الرئيسية *</label>
            <input type="file" accept="image/*" className="mx-auto block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={handleImageUpload} disabled={loading} />
            {carData.image_url && (
              <p className="text-green-600 text-xs mt-3 font-medium">✓ تم رفع وتجهيز الصورة بنجاح في السيرفر السحابي!</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 text-sm shadow-md">
            {loading ? 'جاري معالجة البيانات والرفع المباشر...' : 'الانتقال لسداد الرسوم ونشر الإعلان حياً ←'}
          </button>
        </form>

      </div>
    </main>
  )
}
