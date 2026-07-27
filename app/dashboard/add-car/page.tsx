'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AddCarPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. التأكد من هوية البائع وجلب الـ user_id الخاص به فور تحميل الصفحة
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // توجيه للـ Login إذا لم يكن مسجلاً
      } else {
        setUserId(user.id);
      }
    }
    checkUser();
  }, []);

  // 2. دالة إرسال البيانات وحفظها في قاعدة البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!userId) {
      setMessage({ type: 'error', text: 'حدث خطأ في الصلاحيات، يرجى إعادة تسجيل الدخول.' });
      setLoading(false);
      return;
    }

    // إرسال البيانات إلى جدول cars مع ربطها بـ user_id البائع الحالي
    const { error } = await supabase.from('cars').insert([
      {
        title: title,       // اسم السيارة أو عنوان الإعلان
        price: Number(price), // السعر (تحويله لرقم ليتطابق مع قاعدة البيانات)
        user_id: userId,     // معرّف البائع الحالي لإتمام شرط الأمان RLS
      },
    ]);

    if (error) {
      setMessage({ type: 'error', text: 'فشلت عملية الإضافة: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '🎉 تم إضافة السيارة بنجاح ونشرها في السوق!' });
      setTitle('');
      setPrice('');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-right" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">إضافة سيارة جديدة للسوق 🚗</h1>

        {message.text && (
          <p className={`p-3 rounded mb-4 text-sm font-semibold text-center ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">اسم السيارة / الموديل</label>
            <input
              type="text"
              placeholder="مثال: تويوتا كامري 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">السعر (بالريال السعودي)</label>
            <input
              type="number"
              placeholder="مثال: 95000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2 rounded focus:outline-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {loading ? 'جاري الحفظ والنشر...' : 'نشر السيارة في السوق ✨'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← العودة للوحة التحكم</a>
        </div>
      </div>
    </div>
  );
}
