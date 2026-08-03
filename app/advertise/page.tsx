'use client'

import { useState } from 'react'
import { supabase } from '@/supabaseClient'

export default function AdvertisePage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', package_type: 'not_specified' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // حفظ البيانات مباشرة في الجدول الجديد الذي أنشأناه في سوبابيز منذ قليل
    const { error } = await supabase
      .from('advertising_leads')
      .insert([
        { 
          name: formData.name, 
          phone: formData.phone, 
          email: formData.email, 
          message: formData.message,
          package_type: formData.package_type
        }
      ])

    setLoading(false)

    if (!error) {
      setSubmitted(true)
    } else {
      console.error("🚨 خطأ في السيرفر:", error.message)
      alert("حدث خطأ أثناء إرسال طلبك، يرجى المحاولة مجدداً.")
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4 md:px-8 text-right" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <header className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">أعلن معنا في ون بي سوق الألف مليون سياره 🚀</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            وصل إعلانات سياراتك ومعرضك لآلاف المشترين الجادين يومياً في أكبر منصة للسيارات(يجب ان تكون مخولا نظاميا بالاعلان).
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* باقة الأفراد */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">باقة الأفراد العاديه</h3>
              <p className="text-gray-500 text-sm mb-6">مخصصة لبيع سيارة شخصية واحدة بسرعة.</p>
              <div className="text-3xl font-extrabold text-gray-950 mb-6">100 ريال <span className="text-sm font-normal text-gray-500">/ للإعلان</span></div>
              <ul className="text-gray-600 text-sm space-y-3 mb-8">
                <li>✓ ظهور الإعلان لمدة 30 يوم</li>
                <li>✓ تواصل مباشر عبر الواتساب</li>
                <li>✓ رفع حتى 5 صور للسيارة</li>
              </ul>
            </div>
            <a href="#request-form" onClick={() => setFormData({...formData, package_type: 'individual'})} className="block text-center w-full bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-200 transition">طلب الباقة</a>
          </div>

          {/* باقة المعارض */}
          <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-blue-600 flex flex-col justify-between relative transform scale-105">
            <span className="absolute -top-4 right-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">الأكثر طلباً</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">باقة المعارض والتجار</h3>
              <p className="text-gray-500 text-sm mb-6">حساب معتمد مخصص للمحترفين لتسريع المبيعات.</p>
              <div className="text-3xl font-extrabold text-gray-950 mb-6">اشتراك شهري <span className="text-sm font-normal text-gray-500">/ مخصص</span></div>
              <ul className="text-gray-600 text-sm space-y-3 mb-8">
                <li>✓ رفع عدد غير محدود من السيارات</li>
                <li>✓ شعار "معرض معتمد" موثق للزوار</li>
                <li>✓ لوحة تحكم خاصة لإحصائيات المشاهدات</li>
              </ul>
            </div>
            <a href="#request-form" onClick={() => setFormData({...formData, package_type: 'dealer'})} className="block text-center w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition">طلب الباقة</a>
          </div>

          {/* البانرات الإعلانية */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">إعلانات البانر المساحية</h3>
              <p className="text-gray-500 text-sm mb-6">تثبيت لوحة إعلانية لشركتك في أعلى الصفحة الرئيسية.</p>
              <div className="text-3xl font-extrabold text-gray-950 mb-6">حسب المساحة <span className="text-sm font-normal text-gray-500">/ أسبوعياً</span></div>
              <ul className="text-gray-600 text-sm space-y-3 mb-8">
                <li>✓ ظهور في أعلى الصفحة الرئيسية لجميع الزوار</li>
                <li>✓ رابط مباشر لموقعك أو حسابك</li>
              </ul>
            </div>
            <a href="#request-form" onClick={() => setFormData({...formData, package_type: 'banner'})} className="block text-center w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition">طلب الباقة</a>
          </div>
        </section>

        {/* نموذج التواصل والطلب */}
        <section id="request-form" className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto scroll-mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">أرسل طلبك الإعلاني فوراً</h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            {formData.package_type !== 'not_specified' ? `الباقة المختارة حالياً: ${formData.package_type === 'individual' ? 'الأفراد' : formData.package_type === 'dealer' ? 'المعارض' : 'البانر المساحي'}` : 'يرجى تحديد باقة من الأعلى أو ملء النموذج'}
          </p>
          
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center font-semibold">
              ✓ تم استلام طلبك وحفظه بنجاح! وسيتواصل معك فريق "سوق الألف مليون" خلال 24 ساعة لتفعيل باقتك.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكريم</label>
                  <input type="text" required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" onChange={(e)=> setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال (واتساب)</label>
                  <input type="tel" required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" placeholder="05xxxxxxxx" onChange={(e)=> setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input type="email" required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left" dir="ltr" onChange={(e)=> setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الباقة المطلوبة</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" value={formData.package_type} onChange={(e)=> setFormData({...formData, package_type: e.target.value})}>
                    <option value="not_specified">اختر الباقة...</option>
                    <option value="individual">باقة الأفراد لمده محدوده (10ريال)</option>
                    <option value="dealer">باقة المعارض والتجار</option>
                    <option value="banner">إعلانات البانر المساحية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تفاصيل إضافية أو نوع السيارات</label>
                <textarea rows={4} required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-right" placeholder="اكتب مواصفات معرضك أو السيارات التي تود الإعلان عنها..." onChange={(e)=> setFormData({...formData, message: e.target.value})}></textarea>
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400">
                {loading ? 'جاري الحفظ في الخادم...' : 'إرسال طلب الإعلان ←'}
              </button>
            </form>
          )}
        </section>

      </div>
    </main>
  )
}

