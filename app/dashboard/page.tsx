'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);

      // جلب رتبة المستخدم من جدول الـ profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) setRole(profile.role);
      setLoading(false);
    }
    getProfile();
  }, []);

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل لوحة التحكم...</p>;

  const isAdmin = role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border">
        
        {/* هيدر لوحة التحكم الديناميكي */}
        <header className="border-b pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {isAdmin ? '🛠️ لوحة تحكم الأدمن العام' : '🚗 لوحة تحكم البائع'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">مرحباً بك: {user?.email}</p>
          </div>
          <a href="/" className="text-sm text-blue-600 hover:underline">← العودة للمعرض الرئيسي</a>
        </header>

        {/* أزرار الانتقال والتحكم السريع */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          
          {/* زر إضافة سيارة جديدة */}
          <a href="/dashboard/add-car" className="p-5 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition text-right block group">
            <span className="text-2xl block mb-2">➕</span>
            <span className="font-bold text-blue-900 block group-hover:text-blue-700">إضافة سيارة جديدة</span>
            <span className="text-xs text-blue-600 mt-1 block">عرض سيارة جديدة في السوق فورا</span>
          </a>

          {/* زر صندوق الرسائل المحمي الجديد 📬 */}
          <a href="/dashboard/inbox" className="p-5 bg-purple-50 border border-purple-100 rounded-2xl hover:bg-purple-100 transition text-right block group">
            <span className="text-2xl block mb-2">📬</span>
            <span className="font-bold text-purple-900 block group-hover:text-purple-700">صندوق الرسائل الداخلي</span>
            <span className="text-xs text-purple-600 mt-1 block">استقبل رسائل وعروض المشترين ورد عليها</span>
          </a>

          {/* زر تسجيل الخروج الآمن */}
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="p-5 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 transition text-right block group w-full"
          >
            <span className="text-2xl block mb-2">🚪</span>
            <span className="font-bold text-red-900 block group-hover:text-red-700">تسجيل الخروج</span>
            <span className="text-xs text-red-600 mt-1 block">إنهاء الجلسة الحالية وتأمين الحساب</span>
          </button>

        </div>

        {/* تذكير الأدمن بمهامه */}
        {isAdmin && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm font-semibold">
            📢 بصفتك الأدمن العام، يمكنك إدارة كافة المركبات المعروضة، ومراقبة الرسائل المتبادلة لمنع المخالفات بأمان كامل.
          </div>
        )}

      </div>
    </div>
  );
}
