"use client"; 

import { useState, useEffect } from "react";
// استيراد جسر الاتصال السحابي
import { supabase } from "../supabaseClient";

export const dynamic = 'force-dynamic';


interface Car {
  id: number;
  name: string;
  model: string;
  mileage: string;
  color: string;
  price: string;
  badge: string;
  badgeColor: string;
  image?: string;
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // الـ States الخاصة ببيانات النموذج الجديد
  const [newCarName, setNewCarName] = useState("");
  const [newCarPrice, setNewCarPrice] = useState("");
  const [newCarModel, setNewCarModel] = useState("");
  const [newCarColor, setNewCarColor] = useState("");
  const [newCarImage, setNewCarImage] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");

  // 1. دالة جلب السيارات من قاعدة البيانات السحابية
  const fetchCars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cars") 
      .select("*")   
      .order("id", { ascending: true });

    if (error) {
      console.error("خطأ في جلب البيانات:", error.message);
    } else if (data) {
      setCars(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // 2. دالة إرسال وحفظ السيارة الجديدة في السحاب
  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCarName || !newCarPrice) {
      alert("الرجاء إدخال اسم السيارة والسعر على الأقل!");
      return;
    }

    const newCarData = {
      name: newCarName,
      model: newCarModel || "2024",
      mileage: "0 كم",
      color: newCarColor || "غير محدد",
      price: `${parseInt(newCarPrice).toLocaleString()} ر.س`,
      badge: "جديد مضاف",
      badgeColor: "bg-purple-100 text-purple-800",
      image: newCarImage || ""
    };

    const { error } = await supabase
      .from("cars")
      .insert([newCarData]);

    if (error) {
      alert(`عذراً حدث خطأ أثناء الحفظ: ${error.message}`);
    } else {
      fetchCars();
      setNewCarName("");
      setNewCarPrice("");
      setNewCarModel("");
      setNewCarColor("");
      setNewCarImage("");
    }
  };

  // 3. دالة حذف السيارة من قاعدة البيانات السحابية (مكتوبة في مكانها الصحيح تماماً خارج الـ return)
  const handleDeleteCar = async (carId: number) => {
    const confirmDelete = window.confirm("هل أنت متأكد من رغبتك في حذف هذه السيارة نهائياً من المعرض السحابي؟");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("cars")
      .delete()
      .eq("id", carId);

    if (error) {
      alert(`عذراً حدث خطأ أثناء الحذف: ${error.message}`);
    } else {
      fetchCars();
    }
  };

  const filteredCars = cars.filter((car) =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8" dir="rtl">
      {/* عنوان الموقع */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600">منصة سياراتي السحابية ☁️🚗</h1>
        <p className="text-gray-600 mt-2">قاعدة بيانات حقيقية مرتبطة بالكامل</p>
      </header>

      {/* لوحة تحكم مصغرة */}
      <section className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-md mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">➕ إدراج سيارة جديدة في قاعدة البيانات السحابية</h2>
        <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="اسم السيارة"
            className="p-3 border border-gray-300 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
            value={newCarName}
            onChange={(e) => setNewCarName(e.target.value)}
          />
          <input
            type="number"
            placeholder="السعر (بالريال)"
            className="p-3 border border-gray-300 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
            value={newCarPrice}
            onChange={(e) => setNewCarPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="الموديل"
            className="p-3 border border-gray-300 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
            value={newCarModel}
            onChange={(e) => setNewCarModel(e.target.value)}
          />
          <input
            type="text"
            placeholder="اللون"
            className="p-3 border border-gray-300 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
            value={newCarColor}
            onChange={(e) => setNewCarColor(e.target.value)}
          />
          <input
            type="text"
            placeholder="رابط صورة السيارة من الإنترنت"
            className="p-3 border border-gray-300 rounded-xl outline-none text-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
            value={newCarImage}
            onChange={(e) => setNewCarImage(e.target.value)}
          />
          <button
            type="submit"
            className="md:col-span-5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            حفظ وإرسال إلى السحاب فوراً ✨
          </button>
        </form>
      </section>

      {/* شريط البحث */}
      <div className="max-w-md mx-auto mb-12">
        <input
          type="text"
          placeholder="ابحث في السحاب عن سيارتك..."
          className="w-full p-4 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* شبكة عرض السيارات */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-blue-600 font-bold animate-pulse">جاري الاتصال بقاعدة البيانات وجلب السيارات... ☁️</p>
          </div>
        ) : filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <div className="h-48 bg-gray-200 relative overflow-hidden flex items-center justify-center">
                  {car.image ? (
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-gray-400 text-lg font-bold">🚗 لا توجد صورة</span>
                  )}
                </div>

                <div className="p-5">
                  <span className={`${car.badgeColor || 'bg-blue-100 text-blue-800'} text-xs font-semibold px-2.5 py-0.5 rounded`}>
                    {car.badge} - {car.model}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 mt-2">{car.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">الممشى: {car.mileage} | اللون: {car.color}</p>
                </div>
              </div>
              
              <div className="p-5 pt-0 flex items-center justify-between mt-4 gap-2">
                <span className="text-xl font-bold text-green-600">{car.price}</span>
                <div className="flex gap-2">
                  <a 
                    href={`/car/${car.id}`} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center block"
                  >
                    التفاصيل
                  </a>
                  <button 
                    onClick={() => handleDeleteCar(car.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors text-center cursor-pointer"
                  >
                    حذف 🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-gray-500">المعرض فارغ حالياً! أضف سيارتك الأولى بالأعلى 🔍</p>
          </div>
        )}
      </section>
    </main>
  );
}







