'use client';
export const dynamic = 'force-dynamic'; // 🌟 السطر السحري لحل مشكلة الـ Build Failed أونلاين

import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AddCarPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // التحقق من تسجيل دخول المستخدم وجلب معرفه الخاص
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // توجيه لصفحة الدخول إذا لم يكن مسجلاً
        return;
      }
      setUserId(user.id);
    }
    checkUser();
  }, []);

  // دالة معالجة رفع السيارة وقاعدة البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    if (!userId) {
      setStatusMessage({ type: 'error', text: 'خطأ: لم يتم التعرف على حسابك الشخصي.' });
      setLoading(false);
      return;
    }

    let imageUrl = '';

    // 1. رفع الصورة إلى الـ Storage في حال اختيارها
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `car-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cars-bucket')
        .upload(filePath, imageFile);

      if (uploadError) {
        setStatusMessage({ type: 'error', text: 'فشل رفع الصورة: ' + uploadError.message });
        setLoading(false);
        return;
      }

      // جلب الرابط العام المباشر للصورة المرفوعة
      const { data } = supabase.storage.from('cars-bucket').getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    // 2. إدخال بيانات السيارة الجديدة في جدول cars بالـ Supabase
    const { error: insertError } = await supabase.from('cars').insert([
      {
        name: name,
        price: Number(price),
        image_url: imageUrl,
        user_id: userId, // ربط السيارة بالمالك الحالي
      },
    ]);

    if (insertError) {
      setStatusMessage({ type: 'error', text: 'فشل حفظ البيانات: ' + insertError.message });
    } else {
      setStatusMessage({ type: 'success', text: '🎉 تم إدراج سيارتك بنجاح وعرضها في المعرض الرئيسي!' });
      setName('');
      setPrice('');
      setImageFile(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 text-right" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
        
        {/* الهيدر العلوي */}
        <header className="border-b pb-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">➕ إضافة سيارة جديدة للبيع</h1>
            <p className="text-xs text-gray-400 mt-1">امْلأ البيانات لرفع مركبتك في سوق الألف مليون</p>
          </div>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← العودة للوحة التحكم</a>
        </header>

        {/* رسائل الحالة الإشعارية */}
        {statusMessage.text && (
          <p className={`p-4 rounded-xl text-sm font-bold text-center mb-6 ${
            statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {statusMessage.text}
          </p>
        )}

        {/* نموذج الإدخال (Form) */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">اسم ونوع السيارة</label>
            <input
              type="text"
              placeholder="مثال: تويوتا كامري 2025 فل كامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-blue-500 text-sm bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">السعر المطلوب (ريال سعودي)</label>
            <input
              type="number"
              placeholder="مثال: 95000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:outline-blue-500 text-sm bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">صورة المركبة الأساسية</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm bg-gray-50 file:ml-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300 shadow-md shadow-blue-100"
          >
            {loading ? 'جاري رفع وحفظ البيانات الآن...' : '🚀 انشر السيارة في المعرض فوراً'}
          </button>
        </form>

      </div>
    </div>
  );
}
