import { createClient } from '@supabase/supabase-js';

// قراءة مباشرة وصافية للمفاتيح المفتوحة والمثبتة في لوحة Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cMA8NJHNC0pSVRsjGS6vpw_wdsOUbm';

// إنشاء العميل وضمان عدم وجود قيم فارغة تسبب تعليق الصفحة
export const supabase = createClient(supabaseUrl, supabaseAnonKey);



