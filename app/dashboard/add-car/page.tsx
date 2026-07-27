'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/supabaseClient';

export default function AddCarPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) window.location.href = '/login';
      else setUserId(user.id);
    }
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!userId) {
      setMessage({ type: 'error', text: 'حدث خطأ في الصلاحيات.' });
      setLoading(false);
      return;
    }

    let imageUrl = '';

    // 1. رفع الصورة إلى Supabase Storage أولاً إن وجدت
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`; // اسم عشوائي فريد للصورة
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        setMessage({ type: 'error', text: 'فشل رفع الصورة: ' + uploadError.message });
        setLoading(false);
        return;
      }

      // جلب الرابط العام للصورة المرفوعة
      const { data } = supabase.storage.from('car-images').getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    // 2. إرسال بيانات السيارة إلى الجدول مع رابط الصورة
    const { error } = await supabase.from('cars').insert([
      {
        title: title,
        price: Number(price),
        image_url: imageUrl, // تأكد من وجود هذا العمود في جدولك أو سيتم تجاهله
        user_id: userId,
      },
    ]);

    if (error) {
      setMessage({ type: 'error', text: 'فشلت عملية الإضافة: ' + error.message });
    } else {
      setMessage({ type: 'success', text: '🎉 تم إضافة السيارة مع الصورة بنجاح!' });
      setTitle('');
      setPrice('');
      setImageFile(null);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-xl mx-auto text-right" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">إضافة سيارة جديدة مع صورة 📸</h1>

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
              placeholder="مثال: نيسان باترول 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded focus:outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">السعر (بالريال)</label>
            <input
              type="number"
              placeholder="مثال: 180000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-2 rounded focus:outline-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">صورة السيارة</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'جاري رفع البيانات والصورة...' : 'نشر السيارة الآن ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}

