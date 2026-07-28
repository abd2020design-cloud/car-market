import { createClient } from '@supabase/supabase-js';

// قيم افتراضية آمنة لمنع Turbopack من إيقاف البناء أثناء الـ Build أونلاين
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cMA8NJHNC0pSVRsjGS6vpw_wdsOUbm';

// دالة أمان لمنع التجميع الصارم من الانهيار
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // في بيئة السيرفر أثناء البناء، نمرر القيم الافتراضية الصافية فوراً لحماية الملف
    return createClient('https://supabase.co', 'sb_publishable_cMA8NJHNC0pSVRsjGS6vpw_wdsOUbm');
  }
  // في المتصفح أونلاين عند الزائر، يقرأ القيم الحية والمثبتة
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabaseClient();



