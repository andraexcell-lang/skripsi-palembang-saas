import { supabaseAdmin, supabaseAnon } from '../config/supabase';

const db = () => supabaseAdmin || supabaseAnon;

export const FEATURE_COSTS: Record<string, number> = {
  brainstorming: 0,
  kelayakan: 0,
  novelty: 0,
  cari_artikel: 0,
  bab: 10,
  parafrase: 1,
  ppt: 8,
  plagiasi: 15,
  artikel: 15,
  sidang_15: 15,
  sidang_30: 25,
  spss: 3,
  smartpls: 5,
  transkripsi: 1,
  kualitatif: 1,
  dokumen: 1,
};

export async function getBalance(userId: string) {
  const { data, error } = await db().from('profiles').select('credits, plan').eq('id', userId).single();
  if (error) throw new Error('Profil tidak ditemukan. Jalankan supabase/schema.sql dulu.');
  return { credits: data.credits as number, plan: data.plan as string };
}

export async function addCredits(userId: string, amount: number, ref: string, meta: any = {}) {
  const bal = await getBalance(userId);
  const next = bal.credits + amount;
  const { error } = await db().from('profiles').update({ credits: next }).eq('id', userId);
  if (error) throw new Error(error.message);
  await db().from('credit_ledger').insert({ user_id: userId, amount, ref, meta });
  return next;
}

export async function consumeCredits(userId: string, feature: string, ref = '') {
  const cost = FEATURE_COSTS[feature] ?? 1;
  const bal = await getBalance(userId);
  // Admin: semua fitur gratis tanpa potong kredit
  if (bal.plan === 'admin') return { cost: 0, remaining: bal.credits };
  if (cost === 0) return { cost, remaining: bal.credits };
  if (bal.credits < cost) {
    const err: any = new Error(`Kredit kurang. Butuh ${cost}, sisa ${bal.credits}.`);
    err.code = 'INSUFFICIENT_CREDITS';
    err.cost = cost;
    err.remaining = bal.credits;
    throw err;
  }
  const next = bal.credits - cost;
  const { error } = await db().from('profiles').update({ credits: next }).eq('id', userId);
  if (error) throw new Error(error.message);
  await db().from('credit_ledger').insert({ user_id: userId, amount: -cost, ref: ref || `fitur:${feature}`, meta: { feature } });
  return { cost, remaining: next };
}
