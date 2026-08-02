'use client' // تفعيل التفاعلية لإدخال البيانات والرفع

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
    seller_type: 'individual' // القيمة الافتراضية حساب فرد
  })

  // دالة معالجة ورفع الصورة أولاً إلى حوض التخزين cars-bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    setLoading(true)
    
    // رفع الملف لحوض cars-bucket الذي أصلحنا صلاحياته سابقاً
    const { error: uploadError } = await supabase.storage
      .from('cars-bucket')
      .upload(filePath, file)

    if (uploadError) {
      setLoading(false)
      alert('فشل رفع الصورة: ' + uploadError.message)
      return
    }

    // جلب الرابط السحابي العام الحي للصورة المرفوعة
    const { data } = supabase.storage.from('cars-bucket').getPublicUrl(filePath)
    
    setCarData({ ...carData, image_url: data.publicUrl })
    setLoading(false)
    alert('تم رفع الصورة بنجاح وتوليد الرابط السحابي!')
  }

  // دالة حفظ السيارة بالكامل داخل جدول قاعدة البيانات cars
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!carData.image_url) {
      alert('يرجى رفع صورة السيارة أولاً قبل الحفظ!')
      return
    }

    setLoading(true)

    // حفظ البيانات مع الحقول التجارية الجديدة
    const { error } = await supabase
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
          // المعرض يفعل إعلانه فوراً، أما الفرد فينتظر تأكيد دفع الـ 1 دولار
          is_paid: carData.seller_type === 'dealer' ? true : false 
        }
      ])

    setLoading(false)

    if (!error) {
      alert('تم حفظ إعلان السيارة بنجاح في قاعدة البيانات!')
      // إعادة التوجيه للوحة التحكم الرئيسية لمشاهدة القائمة
      router.push('/dashboard')
    } else {
      console.error('🚨 خطأ أثناء الحفظ:', error.message)
      alert('حدث خطأ في السيرفر أثناء الحفظ: ' + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        
        <header className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">إضافة سيارة جديدة للسوق 🏎️</h1>
          <p className="text-gray-500 text-sm mt-1">امقأ تفاصيل السيارة بدقة لتظهر للزوار والمشترين.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* عنوان الإعلان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم السيارة (العنوان)</label>
            <input type="text" required placeholder="مثال: تويوتا كامري فل كامل" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* السعر */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السعر (ريال سعودي)</label>
              <input type="number" required placeholder="مثال: 95000" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e) => setCarData({ ...carData, price: e.target.value })} />
            </div>
            {/* الموديل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الموديل (سنة الصنع)</label>
              <input type="text" required placeholder="مثال: 2026" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, model: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* رقم الواتساب الجديد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب للتواصل</label>
              <input type="tel" required placeholder="05xxxxxxxx" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e) => setCarData({ ...carData, whatsapp_number: e.target.value })} />
            </div>
            {/* نوع الحساب المعلن الجديد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المعلن (باقة الحساب)</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right font-medium" value={carData.seller_type} onChange={(e) => setCarData({ ...carData, seller_type: e.target.value })}>
                <option value="individual">حساب فرد عادي (رسوم 1$)</option>
                <option value="dealer">معرض معتمد / تاجر (نشر فوري مجاني)</option>
              </select>
            </div>
          </div>

          {/* تفاصيل ومواصفات السيارة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف ومواصفات السيارة</label>
            <textarea rows={4} required placeholder="اكتب حالة البدي، الممشى، المواصفات الداخلية..." className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e) => setCarData({ ...carData, description: e.target.value })}></textarea>
          </div>

          {/* خانة رفع الصورة السحابية */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
            <label className="block text-sm font-medium text-gray-700 mb-2">صورة السيارة الرئيسية</label>
            <input type="file" accept="image/*" className="mx-auto block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={handleImageUpload} disabled={loading} />
            {carData.image_url && (
              <p className="text-green-600 text-xs mt-3 font-medium">✓ تم رفع وتجهيز الصورة بنجاح في السيرفر السحابي!</p>
            )}
          </div>

          {/* زر الحفظ النهائي */}
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-400">
            {loading ? 'جاري معالجة البيانات والرفع...' : 'نشر إعلان السيارة في السوق ←'}
          </button>
        </form>

      </div>
    </main>
  )
}


