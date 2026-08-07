'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/supabaseClient'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState(1) // الخطوة 1: إدخال الإيميل، الخطوة 2: إدخال رمز التحقق
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 1. دالة طلب إرسال رمز التحقق السري إلى بريد العميل آلياً
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // إنشاء حساب تلقائي ومجاني إذا كان مستخدماً جديداً أول مرة
        },
      })

      if (!error) {
        setStep(2) // الانتقال لخطوة تأكيد الرمز
        setMessage('📬 أرسلنا رمز التحقق السري إلى بريدك الإلكتروني، يرجى فحص صندوق الوارد أو البريد المهمل (Spam).')
      } else {
        alert('🚨 خطأ من السيرفر: ' + error.message)
      }
    } catch (err: any) {
      alert('خطأ في الاتصال: ' + err.message)
    }
    setLoading(false)
  }

  // 2. دالة التحقق من الرمز وفتح الحساب حياً وتوجيه العميل
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: 'email',
      })

      if (!error) {
        alert('🎉 مرحباً بك في منصة عبدالرحمن! تم تفعيل وتوثيق حسابك بنجاح.')
        router.push('/dashboard/add-car') // توجيهه فوراً لاستمارة الرفع لفحص باقته
        router.refresh()
      } else {
        alert('❌ الرمز الذي كتبته غير صحيح أو انتهت صلاحيته، يرجى المحاولة مجدداً.')
      }
    } catch (err: any) {
      alert('خطأ أثناء التوثيق: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 text-right" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        
        {/* براند المنصة الفخم */}
        <div className="text-center space-y-2">
          <div className="bg-gray-950 text-white font-black text-2xl w-12 h-12 rounded-2xl flex items-center justify-center border border-gray-800 shadow-sm mx-auto">
            1B
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">منصة عبدالرحمن للسيارات</h1>
          <p className="text-gray-400 text-xs font-medium">نظام تسجيل الدخول الموحد والآمن لتوثيق باقات العضوية</p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-4 rounded-xl leading-relaxed">
            {message}
          </div>
        )}

        {step === 1 ? (
          /* الخطوة الأولى: كتابة البريد */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">البريد الإلكتروني الخاص بك *</label>
              <input 
                type="email" 
                required 
                placeholder="name@example.com" 
                value={email}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-left font-mono text-sm" 
                dir="ltr"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 text-sm shadow-sm"
            >
              {loading ? 'جاري إرسال الرمز السري لخوادم البريد...' : 'أرسل لي رمز التحقق السريع ←'}
            </button>
          </form>
        ) : (
          /* الخطوة الثانية: تأكيد رمز الـ OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">أدخل رمز التحقق المكون من 6 أرقام *</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                placeholder="######" 
                value={token}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-center font-mono font-black text-lg tracking-widest text-blue-600" 
                dir="ltr"
                onChange={(e) => setToken(e.target.value)}
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gray-950 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-400 text-sm shadow-sm"
            >
              {loading ? 'جاري فحص وتأكيد الرمز بالسيرفر...' : 'تأكيد الرمز وتفعيل الحساب حياً 🔓'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition pt-2"
            >
              تغيير البريد الإلكتروني المكتوب
            </button>
          </form>
        )}

        <footer className="pt-4 border-t border-gray-100 flex justify-center gap-4 text-[10px] text-gray-400">
          <Link href="/terms" className="hover:underline">شروط الخدمة</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">سياسة الخصوصية</Link>
        </footer>

      </div>
    </main>
  )
}
