import { createClient } from '@supabase/supabase-js';

// قراءة حية ومباشرة بدون تعقيد أو شروط تسبب انهيار المتصفح
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cMA8NJHNC0pSVRsjGS6vpw_wdsOUbm-';

// إنشاء عميل الاتصال الثابت بنسبة 100%
export const supabase = createClient(supabaseUrl, supabaseAnonKey);




