'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب السيارات المضافة من قاعدة البيانات فور تحميل الصفحة
  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false }); // ترتيب الأحدث أولاً

      if (!error) {
        setCars(data || []);
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل سوق السيارات...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-right" dir="rtl">
      {/* الهيدر العلوي */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">سوق السيارات الحديث 🚗</h1>
        <div className="flex gap-4">
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            لوحة التحكم / دخول
          </a>
        </div>
      </header>

      {/* شبكة عرض السيارات */}
      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition">
              {/* عرض الصورة أو صورة افتراضية إن لم تكن متوفرة */}
              <div className="h-48 bg-gray-200 relative">
                {car.image_url ? (
                  <img 
                    src={car.image_url} 
                    alt={car.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📸 لا توجد صورة متوفرة
                  </div>
                )}
              </div>

              {/* تفاصيل السيارة */}
              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-800 mb-2">{car.title || car.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-600 font-extrabold text-lg">{car.price?.toLocaleString()} ريال</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">متاحة</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <p className="text-center text-gray-500 py-12">لا توجد سيارات معروضة في السوق حالياً.</p>
        )}
      </main>
    </div>
  );
}







