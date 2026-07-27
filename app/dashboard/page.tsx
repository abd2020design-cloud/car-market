'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function Dashboard() {
  const [cars, setCars] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('seller');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      // 1. التحقق من وجود مستخدم مسجل
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login'; // إذا لم يسجل دخول، يتم توجيهه لصفحة الـ Login
        return;
      }

      // 2. جلب رتبة المستخدم من جدول profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profile?.role || 'seller';
      setUserRole(role);

      // 3. جلب السيارات بناءً على الرتبة (الأدمن يرى الكل، البائع يرى سياراته فقط)
      let query = supabase.from('cars').select('*');
      if (role !== 'admin') {
        query = query.eq('user_id', user.id);
      }

      const { data: carsData } = await query;
      setCars(carsData || []);
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  // دالة الحذف الآمنة المربوطة بالـ RLS
  const handleDelete = async (carId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه السيارة؟')) {
      const { error } = await supabase.from('cars').delete().eq('id', carId);
      if (!error) {
        setCars(cars.filter(car => car.id !== carId));
        alert('تم الحذف بنجاح');
      } else {
        alert('خطأ في الحذف أو لا تملك صلاحية: ' + error.message);
      }
    }
  };

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل لوحة التحكم المحمية...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">
        {userRole === 'admin' ? '🛠️ لوحة تحكم الأدمن العام' : '🚗 لوحة تحكم البائع'}
      </h1>
      <p className="mb-6 text-gray-600">عدد السيارات المتاحة لإدارتها وتعديلها: {cars.length}</p>

      <div className="grid gap-4">
        {cars.map((car) => (
          <div key={car.id} className="border p-4 rounded flex justify-between items-center bg-white shadow-sm">
            <div>
              <h3 className="font-semibold text-lg">{car.title || car.name}</h3>
              <p className="text-sm text-gray-500">السعر: {car.price} ريال</p>
            </div>
            <button 
              onClick={() => handleDelete(car.id)} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              حذف
            </button>
          </div>
        ))}
        {cars.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد سيارات مضافة حالياً.</p>}
      </div>
    </div>
  );
}
