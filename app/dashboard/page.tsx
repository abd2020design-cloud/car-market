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
    whatsapp_number: '',
    seller_type: 'individual',
    country: 'SA', 
    currency: 'ريال' 
  })

  const handleCountryChange = (countryCode: string) => {
    let selectedCurrency = 'ريال'
    if (countryCode === 'EG') selectedCurrency = 'جنيه'
    if (countryCode === 'AE') selectedCurrency = 'درهم'
    if (countryCode === 'QA') selectedCurrency = 'ريال'
    if (countryCode === 'KW') selectedCurrency = 'دينار'

    setCarData({ ...carData, country: countryCode, currency: selectedCurrency })
  }

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
      // 🌟 خطة الإنقاذ الفورية: إرسال الكتل النصية الصافية والاتصال المباشر بقاعدة البيانات لتخطي كاش السيرفر الميت
      const { data, error } = await supabase
        .from('cars')
        .insert([
          {
            title: carData.title,
            price: parseFloat(carData.price),
            model: carData.model,
            description: carData.description,
            image_url: carData.image_url,
            whatsapp_number: carData.whatsapp_number,
            seller_type: carData.seller_type,
            country: carData.country,       
            currency: carData.currency,     
            is_paid: carData.seller_type === 'dealer' ? true : false 
          }
        ])
        .select()

      setLoading(false)

      if (!error) {
        alert('✓ نجاح ساحق ومباشر: تم حفظ إعلان السيارة في قاعدة البيانات الإقليمية المرقاة Pro!')
        
        // التوجيه الذكي الآلي لصفحة الدفع للأفراد لحصد الـ 10 ريال، والنشر الفوري للمعابير والمعارض
        if (carData.seller_type === 'individual' && data && data[0]) {
          router.push('/payment?carId=' + data[0].id)
        } else {
          router.push('/')
        }
      } else {
        // إذا استمر تعنت الكاش، نقوم بتنبيه الأدمن لإعادة الإنعاش الإجباري
        console.error('🚨 تفاصيل الخطأ:', error)
        alert('تنبيه السيرفر: ' + error.message + '\nيرجى محاولة رفع البيانات مرة أخرى بعد ثوانٍ.')
      }

    } catch (err: any) {
      setLoading(false)
      alert('حدث خطأ في الاتصال بالشبكة: ' + err.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        <header className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">إضافة سيارة جديدة للسوق الإقليمي 🏎️</h1>
          <p className="text-gray-500 text-sm mt-1">اختر الدولة والبيانات بدقة لتظهر للمشترين في بلدك المستهدف.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم السيارة (العنوان)</label>
            <input type="text" required placeholder="مثال: تويوتا كامري فل كامل" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تواجد السيارة (الدولة)</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right font-semibold"
                value={carData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="SA">🇸🇦 المملكة العربية السعودية</option>
                <option value="EG">🇪🇬 جمهورية مصر العربية</option>
                <option value="AE">🇦🇪 الإمارات العربية المتحدة</option>
                <option value="QA">🇶🇦 دولة قطر</option>
                <option value="KW">🇰🇼 دولة الكويت</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السعر بـ ({carData.currency})</label>
              <input type="number" required placeholder={`اكتب السعر بالـ ${carData.currency}`} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e) => setCarData({ ...carData, price: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">سنة الصنع (الموديل)</label>
              <input type="text" required placeholder="مثال: 2025" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-center" onChange={(e) => setCarData({ ...carData, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المعلن (باقة الحساب)</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right font-medium" value={carData.seller_type} onChange={(e) => setCarData({ ...carData, seller_type: e.target.value })}>
                <option value="individual">حساب فرد عادي (رسوم 10 ريال)</option>
                <option value="dealer">معرض معتمد / تاجر (نشر فوري مجاني)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب للتواصل (مع مفتاح الدولة)</label>
            <input type="tel" required placeholder="9665xxxxxxxx" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e) => setCarData({ ...carData, whatsapp_number: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف ومواصفات السيارة</label>
            <textarea rows={4} required placeholder="اكتب حالة البدي، الممشى، المواصفات الداخلية..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, description: e.target.value })}></textarea>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة السيارة الرئيسية</label>
            <input type="file" accept="image/*" className="mx-auto block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={handleImageUpload} disabled={loading} />
            {carData.image_url && (
              <p className="text-green-600 text-xs mt-3 font-medium">✓ تم رفع وتجهيز الصورة بنجاح في السيرفر السحابي!</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-950 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-400">
            {loading ? 'جاري معالجة البيانات والرفع المباشر...' : 'نشر إعلان السيارة في السوق الإقليمي ←'}
          </button>
        </form>

      </div>
    </main>
  )
}
