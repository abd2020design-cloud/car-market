'use client';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/supabaseClient';

type PageParams = {
  id: string;
};

export default function CarDetailPage({ params }: { params: Promise<PageParams> }) {
  // حل مشكلة الـ 404 عبر فك تشفير المعرف بشكل متوافق مع كافة الإصدارات
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function initPage() {
      // 1. جلب بيانات المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // 2. جلب تفاصيل السيارة من قاعدة البيانات
      const { data: carData, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) setCar(carData);
      setLoading(false);
    }
    initPage();
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!currentUserId) {
      setStatusMessage({ type: 'error', text: 'يرجى تسجيل الدخول أولاً لتتمكن من مراسلة البائع.' });
      return;
    }

    if (currentUserId === car.user_id) {
      setStatusMessage({ type: 'error', text: 'لا يمكنك إرسال رسالة لنفسك، أنت مالك هذه السيارة.' });
      return;
    }

    const { error } = await supabase.from('messages').insert([
      {
        car_id: car.id,
        sender_id: currentUserId,
        receiver_id: car.user_id,
        text: messageText,
      },
    ]);

    if (error) {
      setStatusMessage({ type: 'error', text: 'فشل إرسال الرسالة: ' + error.message });
    } else {
      setStatusMessage({ type: 'success', text: '🎉 تم إرسال رسالتك للبائع بنجاح داخل الموقع!' });
      setMessageText('');
    }
  };

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل تفاصيل السيارة...</p>;
  if (!car) return <p className="text-center p-10 text-red-500 font-bold">عذراً، السيارة غير موجودة أو تم حذفها.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-6 md:p-8">
        
        <a href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">← العودة للمعرض الرئيسي</a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b pb-8 mb-8">
          <div className="h-64 md:h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
            {car.image_url ? (
              <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">📸 لا توجد صورة متوفرة</div>
            )}
          </div>

          <div className="flex flex-col justify-between h-full space-y-4">
            <div>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">تفاصيل المركبة</span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{car.name}</h1>
              <p className="text-sm text-gray-400 mt-1">تاريخ العرض: {new Date(car.created_at).toLocaleDateString('ar-SA')}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-400 block">السعر النهائي</span>
              <span className="text-3xl font-black text-green-600">{Number(car.price).toLocaleString('ar-SA')}</span>
              <span className="text-sm font-bold text-gray-500 mr-1">ريال سعودي</span>
            </div>
          </div>
        </div>

        <div className="max-w-xl bg-gray-50 rounded-2xl border p-6 shadow-inner">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            💬 تواصل مع البائع داخل الموقع
          </h2>
          <p className="text-xs text-gray-400 mb-4">حافظ على خصوصيتك، تواصلك وتفاوضك يتم بأمان كامل داخل منصتنا دون كشف رقم جوالك.</p>

          {statusMessage.text && (
            <p className={`p-3 rounded mb-4 text-xs font-semibold text-center ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {statusMessage.text}
            </p>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              rows={4}
              placeholder="اكتب استفسارك أو عرضك السعري للبائع هنا..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border p-3 rounded-xl focus:outline-blue-500 text-sm bg-white"
              required
            ></textarea>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              إرسال الرسالة المشفرة للوصول الفوري 🚀
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
