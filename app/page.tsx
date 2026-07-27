'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function HomePage() {
  const [cars, setCars] = useState<any[]>([]);
  const [filteredCars, setFilteredCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // متغيرات الفلاتر والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // 1. جلب السيارات من قاعدة البيانات عند فتح الصفحة
  useEffect(() => {
    async function fetchCars() {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setCars(data || []);
        setFilteredCars(data || []); // ضبط البيانات الأولية المعروضة
      }
      setLoading(false);
    }
    fetchCars();
  }, []);

  // 2. دالة تشغيل الفلترة والتصفية تلقائياً عند تغيير أي مدخل
  useEffect(() => {
    let result = cars;

    // الفلترة بحسب نص البحث (الاسم)
    if (searchTerm) {
      result = result.filter((car) =>
        (car.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // الفلترة بحسب الحد الأدنى للسعر
    if (minPrice) {
      result = result.filter((car) => car.price >= Number(minPrice));
    }

    // Fleترة بحسب الحد الأعلى للسعر
    if (maxPrice) {
      result = result.filter((car) => car.price <= Number(maxPrice));
    }

    setFilteredCars(result);
  }, [searchTerm, minPrice, maxPrice, cars]);

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل سوق السيارات...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-right" dir="rtl">
      {/* الهيدر العلوي */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900">سوق السيارات الحديث 🚗</h1>
        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          لوحة التحكم / دخول البائعين
        </a>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* شريط أدوات البحث والفلاتر */}
        <section className="bg-white p-6 rounded-xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">ابحث عن سيارة محددة</label>
            <input
              type="text"
              placeholder="مثال: كامري، لاندكروزر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border p-2 rounded-lg focus:outline-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأدنى للسعر (ريال)</label>
            <input
              type="number"
              placeholder="من"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border p-2 rounded-lg focus:outline-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الحد الأعلى للسعر (ريال)</label>
            <input
              type="number"
              placeholder="إلى"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border p-2 rounded-lg focus:outline-blue-500 text-sm"
            />
          </div>
        </section>

        {/* نتائج عرض السيارات المفلترة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 relative">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">📸 لا توجد صورة</div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-xl text-gray-800 mb-2">{car.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-600 font-extrabold text-lg">{car.price?.toLocaleString()} ريال</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">متاحة</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && (
          <p className="text-center text-gray-500 py-12 bg-white rounded-xl border">لا توجد نتائج تطابق خيارات البحث الحالية.</p>
        )}
      </main>
    </div>
  );
}








