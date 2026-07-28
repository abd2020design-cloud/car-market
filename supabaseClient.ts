import { createClient } from '@supabase/supabase-js';

// جلب المفاتيح البيئية مع حماية تفادي الانهيار أونلاين
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// إنشاء اتصال سوبابيس الآمن والمستقر
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


