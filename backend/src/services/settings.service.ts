import fs from 'fs';
import path from 'path';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

/**
 * Penyimpanan pengaturan global (Dashboard Admin): daftar model AI & flags fitur.
 *
 * Urutan baca:
 *   1) tabel Supabase `app_settings` (setelah migration_admin.sql dijalankan)
 *   2) file lokal data/app-settings.json  ← dipakai SELAMA migrasi belum dijalankan
 *   3) auto-import file → tabel begitu tabel tersedia (perpindahan mulus)
 *
 * Selalu tulis file juga (mirror) supaya pengaturan tidak hilang saat pindah backend.
 * File berisi API key → WAJIB masuk .gitignore (lihat backend/.gitignore: data/).
 */

const FILE = path.join(process.cwd(), 'data', 'app-settings.json');

function bacaFile(): Record<string, any> {
  try {
    const v = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

function tulisFile(map: Record<string, any>) {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(map, null, 2));
  } catch (e: any) {
    console.warn('[settings] gagal tulis file:', e?.message || e);
  }
}

function tabelTidakAda(err: any): boolean {
  return /Could not find the table|does not exist|42P01/i.test(String(err?.message || err || ''));
}

export async function bacaSetting(key: string): Promise<any | null> {
  try {
    const db = supabaseAdmin || supabaseAnon;
    if (db) {
      const { data, error } = await db.from('app_settings').select('value').eq('key', key).single();
      if (!error && data && data.value !== undefined && data.value !== null) return data.value;
      if (error && !tabelTidakAda(error)) console.warn('[settings] baca gagal:', error.message);
      // Tabel ada tapi baris kosong → auto-import dari file (sekali jalan)
      if (!error || !tabelTidakAda(error)) {
        const f = bacaFile();
        if (f[key] !== undefined) {
          const { error: up } = await db
            .from('app_settings')
            .upsert({ key, value: f[key], updated_at: new Date().toISOString() }, { onConflict: 'key' });
          if (!up) return f[key];
        }
        return null;
      }
    }
  } catch (e: any) {
    console.warn('[settings] baca error:', e?.message || e);
  }
  // Tabel belum ada (migrasi belum dijalankan) → file
  const f = bacaFile();
  return f[key] !== undefined ? f[key] : null;
}

export async function tulisSetting(key: string, value: any): Promise<void> {
  // 1) mirror file selalu dulu (jaminan tersimpan walau tabel belum ada)
  const f = bacaFile();
  f[key] = value;
  tulisFile(f);
  // 2) tabel (source of truth setelah migrasi)
  try {
    const db = supabaseAdmin || supabaseAnon;
    if (!db) return;
    const { error } = await db
      .from('app_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      if (tabelTidakAda(error)) {
        console.warn('[settings] tabel app_settings belum ada — pakai file. Jalankan backend/supabase/migration_admin.sql di Supabase SQL Editor.');
      } else throw new Error(error.message);
    }
  } catch (e: any) {
    throw new Error(e?.message || e);
  }
}

export async function hapusSetting(key: string): Promise<void> {
  const f = bacaFile();
  delete f[key];
  tulisFile(f);
  try {
    const db = supabaseAdmin || supabaseAnon;
    if (!db) return;
    const { error } = await db.from('app_settings').delete().eq('key', key);
    if (error && !tabelTidakAda(error)) throw new Error(error.message);
  } catch (e: any) {
    throw new Error(e?.message || e);
  }
}
