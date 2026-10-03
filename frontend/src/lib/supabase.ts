import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!url || !anon) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL / ANON_KEY belum diset');
}

export const supabase = createClient(url || 'http://localhost:54321', anon || 'anon-placeholder');
