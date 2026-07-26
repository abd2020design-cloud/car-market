"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
// استيراد جسر الاتصال السحابي
import { supabase } from "../../../supabaseClient"; 

interface Car {
  id: number;
  name: string;
  model: string;
  mileage: string;
  color: string;
  price: string;
  badge: string;
  badgeColor: string;
  engine?: string;        // حقل المحرك السحابي ✅
  fuel?: string;          // حقل الوقود السحابي ✅
  transmission?: string;  // حقل القير السحابي ✅
  description?: string;   // حقل الوصف السحابي ✅
  image?: string;
}

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCarDetails = async () => {
    if (!id) return;
    setLoading(true);

    const carId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);

    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("id", carId) 
      .single(); 

    if (error) {
      console.error("خطأ في جلب تفاصيل السيارة:", error.message);
    } else if (data) {
      setCar(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
        <p className="text-xl text-blue-600 font-bold animate-pulse">جاري جلب تفاصيل السيارة العميقة... ☁️</p>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100" dir="rtl">
        <p className="text-2xl font-bold text-gray-700">عذراً، هذه السيارة غير موجودة في السحاب! ❌</p>
        <a href="/" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">العودة للرئيسية</a>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-12" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* واجهة عرض الصورة السحابية */}
        <div className="h-64 md:h-96 bg-gray-200 relative overflow-hidden flex items-center justify-center">
          {car.image ? (
            <img src={car.image} alt={car.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-400 text-2xl font-bold">🚗 لا توجد صورة متوفرة للسيارة</div>
          )}
        </div>

        {/* تفاصيل السيارة الأساسية */}
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
            <div>
              <span className={`${car.badgeColor || 'bg-blue-100 text-blue-800'} text-sm font-semibold px-3 py-1 rounded-full`}>
                {car.badge}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-800 mt-2">{car.name} ({car.model})</h1>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">السعر المطلوب</p>
              <p className="text-3xl font-black text-green-600 mt-1">{car.price}</p>
            </div>
          </div>

          {/* لوحة المواصفات الفنية العميقة المجلوبة من السحاب 🛠️ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-400">الممشى</p>
              <p className="font-bold text-gray-800 mt-1">{car.mileage}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-400">المحرك</p>
              {/* يعرض المحرك السحابي أو قيمة افتراضية إذا كان فارغاً */}
              <p className="font-bold text-gray-800 mt-1">{car.engine || "2.5 لتر 4 سلندر"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-400">نوع الوقود</p>
              <p className="font-bold text-gray-800 mt-1">{car.fuel || "بنزين - ممتاز"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-400">ناقل الحركة</p>
              <p className="font-bold text-gray-800 mt-1">{car.transmission || "أوتوماتيك"}</p>
            </div>
          </div>

          {/* وصف البائع التفصيلي والكامل 📝 */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">وصف البائع وتفاصيل السيارة:</h3>
            <p className="text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl">
              {car.description || "سيارة ممتازة وبحالة الوكالة، خالية من الصدمات والرش، تشتمل على كامل وسائل الأمان والراحة المتطورة مع صيانة دورية منتظمة."}
            </p>
          </div>

          {/* أزرار التحكم والتواصل عبر الواتساب الذكي ببيانات السحاب */}
          <div className="flex gap-4 border-t pt-6">
            <a href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors block text-center">
              رجوع للمعرض الرئيسي
            </a>
            <button 
              onClick={() => {
                const phoneNumber = "966500000000"; // ضع رقمك الحقيقي هنا
                const message = `السلام عليكم، أنا مهتم بشراء سيارة: ${car.name} موديل ${car.model} المعروضة في منصتكم السحابية. هل هي متوفرة؟`;
                const whatsappUrl = `https://whatsapp.com{phoneNumber}&text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-center transition-colors"
            >
              تواصل مع البائع عبر الـ واتساب 💬
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
