'use client';
export const dynamic = 'force-dynamic'; // 🌟 السطر السحري لتخطي خطأ الـ Build أونلاين

import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';

export default function InboxPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchMessages() {
      // 1. جلب بيانات المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setCurrentUserId(user.id);

      // 2. جلب رتبة المستخدم
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase.from('messages').select('*, cars(name)');
      
      if (profile?.role !== 'admin') {
        query = query.or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`);
      }

      const { data: messagesData, error } = await query.order('created_at', { ascending: false });
      if (!error) {
        setMessages(messagesData || []);
      }
      setLoading(false);
    }

    fetchMessages();
  }, []);

  const handleSendReply = async (originalMessage: any) => {
    const text = replyText[originalMessage.id];
    if (!text || !text.trim()) return;

    const receiverId = originalMessage.sender_id === currentUserId 
      ? originalMessage.receiver_id 
      : originalMessage.sender_id;

    const { error } = await supabase.from('messages').insert([
      {
        car_id: originalMessage.car_id,
        sender_id: currentUserId,
        receiver_id: receiverId,
        text: text,
      },
    ]);

    if (error) {
      alert('فشل إرسال الرد: ' + error.message);
    } else {
      alert('🎉 تم إرسال ردك بنجاح داخل النظام!');
      setReplyText({ ...replyText, [originalMessage.id]: '' });
      window.location.reload();
    }
  };

  if (loading) return <p className="text-center p-10 font-bold">جاري تحميل صندوق الرسائل الواردة...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 text-right" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">📬 صندوق الرسائل الواردة</h1>
            <p className="text-xs text-gray-500 mt-1">إدارة المحادثات والعروض السعرية المشفرة والآمنة</p>
          </div>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← العودة للوحة التحكم</a>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => {
            const isMySentMessage = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between transition-all ${
                isMySentMessage ? 'border-blue-100 bg-blue-50/10' : 'border-gray-100'
              }`}>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600">
                      🚗 بخصوص: {msg.cars?.name || 'مركبة محذوفة'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${isMySentMessage ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                    <span className="text-xs font-black text-gray-700">
                      {isMySentMessage ? 'رسالتك المرسلة:' : 'رسالة واردة من مهتم:'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100/50 leading-relaxed">
                    {msg.text}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ردك السريع هنا للطرف الآخر..."
                    value={replyText[msg.id] || ''}
                    onChange={(e) => setReplyText({ ...replyText, [msg.id]: e.target.value })}
                    className="flex-1 border border-gray-200 px-3 py-2 rounded-xl text-sm focus:outline-blue-500 bg-gray-50"
                  />
                  <button
                    onClick={() => handleSendReply(msg)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                  >
                    رد فوري ⚡
                  </button>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border text-gray-400">
              <span className="text-4xl block mb-2">📥</span>
              <p className="text-sm font-semibold">صندوق الوارد فارغ تماماً حالياً.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

