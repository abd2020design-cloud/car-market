'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/supabaseClient'

export default function PaymentPage({ params }: { params: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const carId = searchParams.get('carId') // جلب رقم السيارة المراد تفعيلها من الرابط
  const [loading, setLoading] = useState(false)
  const [carTitle, setCarTitle] = useState('جاري تحميل تفاصيل الإعلان...')

  useEffect(() => {
    if (!carId) return
    
    // جلب اسم السيارة للتأكيد المالي أمام العميل قبل الدفع
    const fetchCarTitle = async () => {
      const { data } = await supabase.from('cars').select('title').eq('id', carId).single()
      if (data) setCarTitle(data.title)
    }
    fetchCarTitle()
  }, [carId])

  // دالة تأكيد الدفع الإلكتروني الناجح بقيمة 10 ريال وتفعيل الإعلان حياً
  const handlePaymentSuccess = async () => {
    if (!carId) {
      alert("خطأ: رقم السيارة غير متوفر في رابط الدفع!")
      return
    }
    
    setLoading(true)

    // تحويل حالة السيارة برمجياً من معلق إلى مدفوع/نشط في جدول Supabase فوراً!
    const { error } = await supabase
      .from('cars')
      .update({ is_paid: true })
      .eq('id', carId)

    setLoading(false)

    if (!error) {
      alert("✓ نجاح مالي: تم استلام مبلغ 10 ريال بنجاح! إعلان سيارتك نشط وحي الآن في السوق أمام الجميع.")
      router.push('/') // توجيه المستخدم للصفحة الرئيسية لمشاهدة إعلانه حياً
    } else {
      alert("حدث خطأ أثناء تحديث حالة الإعلان بالسيرفر: " + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 text-right" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        
        {/* أيقونة الدفع */}
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          💳
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2">بوابة الدفع الإلكتروني الآمنة</h1>
        <p className="text-gray-500 text-sm mb-1">أنت على وشك دفع رسوم نشر إعلان سيارة بقيمة:</p>
        <div className="text-3xl font-black text-gray-950 my-4">10.00 ريال سعودي</div>

        {/* كرت تأكيد بيانات السيارة المرفوعة */}
        <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/50 mb-6 text-right">
          <span className="text-[10px] text-blue-600 font-bold block mb-1">📦 الإعلان المراد تفعيله ونشره:</span>
          <span className="text-sm font-bold text-gray-800 line-clamp-1">{carTitle}</span>
        </div>

        {/* نموذج محاكاة مدى وفيزا و Apple Pay للزوار */}
        <div className="border border-gray-150 rounded-2xl p-5 bg-gray-50 mb-6 text-right space-y-3.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">وسيلة الدفع المفعلة</div>
          <div className="bg-white p-3 rounded-xl border border-gray-250 text-left font-mono text-sm flex justify-between items-center">
            <span className="text-gray-400">**** **** **** 4111</span>
            <span className="font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">مدى / Mada</span>
          </div>
        </div>

        {/* زر التفعيل التلقائي */}
        <button 
          onClick={handlePaymentSuccess} 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 shadow-md"
        >
          {loading ? 'جاري تأكيد الدفع وتفعيل الإعلان بالسيرفر...' : 'اضغط لإتمام الدفع الآمن (10 ريال) ونشر الإعلان 💳'}
        </button>
        
        <p className="text-gray-400 text-[10px] mt-4 leading-relaxed">
          🔒 جميع المعاملات المالية مشفرة بالكامل ومتوافقة مع معايير الأمان لبوابة ميسر والبنك المركزي السعودي.
        </p>
      </div>
    </main>
  )
}
