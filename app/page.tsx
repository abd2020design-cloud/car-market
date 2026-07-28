'use client';
export const dynamic = 'force-dynamic'; // 🌟 السطر السحري لكسر كاش السيرفر وجلب البيانات فوراً

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
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCars(data);
          setFilteredCars(data);
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
  }, []);

  // 2. دالة تشغيل الفلترة والتصفية تلقائياً
  useEffect(() => {
    let result = cars;

    if (searchTerm) {
      result = result.filter((car) =>
        (car.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minPrice) {
      result = result.filter((car) => car.price >= Number(minPrice));
    }

    if (maxPrice) {
      result = result.filter((car) => car.price <= Number(maxPrice));
    }

    setFilteredCars(result);
  }, [searchTerm, minPrice, maxPrice, cars]);

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل سوق الألف مليون للسيارات...</p>;

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      
      {/* 🌐 شريط التنقل العلوي المحترف (Navbar) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          
          {/* الشعار المطور مع شارة الألف مليون 1B */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-3 group">
              <div className="bg-blue-600 text-white font-black text-sm px-2.5 py-1.5 rounded-xl shadow-md shadow-blue-200 group-hover:bg-blue-700 transition-colors">
                1B
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xl font-black text-gray-950 tracking-tight group-hover:text-blue-600 transition-colors">
                  سوق الألف مليون للسيارات
                </span>
                <span className="text-[10px] text-gray-400 font-medium -mt-1">منصة البيع والشراء الأولى</span>
              </div>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
              <a href="/" className="text-blue-600 hover:text-blue-700 transition">الرئيسية</a>
              <a href="/blog" className="hover:text-blue-600 transition">المدونة والأخبار</a>
            </nav>
          </div>

          {/* أزرار لوحة التحكم والإضافة السريعة للبائعين */}
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm font-bold text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl transition">
              حسابي / دخول 👤
            </a>
            <a href="/dashboard/add-car" className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 shadow-sm hover:shadow transition-all">
              أضف سيارتك مجاناً ➕
            </a>
          </div>

        </div>
      </header>

      {/* المحتوى الرئيسي للموقع */}
      <main className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        
        {/* 🎯 قسم الرؤية والهدف الملهم */}
        <section className="text-center mb-10 max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            مرحباً بك في <span className="text-blue-600">سوق الألف مليون للسيارات</span>
          </h2>
          <p className="text-gray-600 font-bold text-base md:text-lg bg-blue-50/50 border border-blue-100/50 py-3 px-6 rounded-2xl inline-block shadow-sm">
            ✨ "ليس مجرد اسم، بل هو هدف سنحققه بإذن الله"
          </p>
        </section>

        {/* شريط أدوات البحث والفلاتر */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ابحث عن سيارة محددة</label>
            <input
              type="text"
              placeholder="مثال: كامري، لاندكروزر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-blue-500 text-sm bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأدنى للسعر (ريال)</label>
            <input
              type="number"
              placeholder="من"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-blue-500 text-sm bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحد الأعلى للسعر (ريال)</label>
            <input
              type="number"
              placeholder="إلى"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-blue-500 text-sm bg-gray-50"
            />
          </div>
        </section>

        {/* شبكة عرض السيارات بتصميم مطور ومحسّن */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              
              {/* منطقة الصورة وشارة حالة السيارة */}
              <div className="h-52 bg-gray-100 relative group overflow-hidden">
                {car.image_url ? (
                  <img 
                    src={car.image_url} 
                    alt={car.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <span className="text-3xl">📸</span>
                    <span className="text-xs font-medium">لا توجد صور متوفرة</span>
                  </div>
                )}
                <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  متاحة للبيع
                </span>
              </div>

              {/* تفاصيل السيارة الأساسية */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                    {car.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    تاريخ النشر: {new Date(car.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>

                {/* عرض السعر المنسق مع العملة المحلية */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">السعر المطلوب</span>
                    <span className="text-2xl font-extrabold text-green-600">
                      {Number(car.price).toLocaleString('ar-SA')}
                    </span>
                    <span className="text-sm font-bold text-gray-500 mr-1">ريال</span>
                  </div>
                  
                  <button 
                    onClick={() => window.location.href = `/cars/${car.id}`}
                    className="bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    التفاصيل
                  </button>
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








