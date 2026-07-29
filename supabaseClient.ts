import { createClient } from '@supabase/supabase-js';

// روابط ومفاتيح مباشرة وصافية مستقرة 100% للتشغيل أونلاين
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_cMA8NJHNC0pSVRsjGS6vpw_wdsOUbm-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);





