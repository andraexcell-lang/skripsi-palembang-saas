import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// Polyfill untuk @supabase/realtime-js bila runtime Node < 22
if (!(globalThis as any).WebSocket) {
  (globalThis as any).WebSocket = WebSocket;
}

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !anonKey) {
  console.warn('[supabase] SUPABASE_URL / SUPABASE_ANON_KEY belum diset. Isi .env dulu.');
}

export const supabaseAnon = createClient(url || 'http://localhost:54321', anonKey || 'anon-placeholder');
export const supabaseAdmin =
  serviceKey
    ? createClient(url || 'http://localhost:54321', serviceKey)
    : null;
