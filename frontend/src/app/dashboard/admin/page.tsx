'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { DAFTAR_FITUR, perbaruiFlags } from '@/lib/fitur';

/* ————— tipe ————— */
type Provider = 'gemini' | 'openai';
type Entri = {
  id: string;
  provider: Provider;
  baseUrl?: string;
  apiKey?: string;   // nilai asli; '••••' bila key tersimpan & tidak diubah
  punyaKey?: boolean;
  hapusKey?: boolean; // minta server menghapus key tersimpan
  aktif: boolean;
};
type HasilTes = { ok: boolean; pesan: string; ms?: number };
type Status = { urutanAktif: number; entri: any[] } | null;

/* ————— bantuan ————— */
const inputCls =
  'w-full rounded-md border border-border-strong bg-bg-base px-2.5 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none';
const btnPrimer =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 px-4 py-2';
const btnOutline =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors border border-border-strong text-text-primary hover:bg-bg-surface-hover disabled:opacity-50 px-3 py-1.5';
const btnKecil = 'rounded-md border border-border-strong px-2 py-1 text-xs font-medium text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors disabled:opacity-50';

function Saklar({ nyala, onChange, label }: { nyala: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={nyala}
      aria-label={label}
      onClick={() => onChange(!nyala)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${nyala ? 'bg-brand-primary' : 'bg-border-strong'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${nyala ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function DashboardAdmin() {
  const [memeriksa, setMemeriksa] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [tab, setTab] = useState<'model' | 'fitur'>('model');

  const [models, setModels] = useState<Entri[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [tes, setTes] = useState<Record<number, HasilTes>>({});
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<{ teks: string; jenis: 'ok' | 'err' } | null>(null);

  const beri = useCallback((teks: string, jenis: 'ok' | 'err' = 'ok') => {
    setPesan({ teks, jenis });
    setTimeout(() => setPesan(null), 5000);
  }, []);

  const muatStatus = useCallback(() => {
    apiGet('/api/admin/status').then(setStatus).catch(() => {});
  }, []);

  /* ————— muat awal ————— */
  useEffect(() => {
    apiGet('/api/credits/balance')
      .then(async (b: any) => {
        const ok = b?.plan === 'admin';
        setAdmin(ok);
        if (!ok) return;
        const [m, f] = await Promise.all([
          apiGet('/api/admin/models').catch(() => null),
          apiGet('/api/admin/flags').catch(() => null),
        ]);
        if (m?.models) setModels(m.models.map((x: any) => ({ ...x, apiKey: x.punyaKey ? '••••' : '' })));
        if (f?.flags) setFlags(f.flags);
        muatStatus();
      })
      .catch(() => {})
      .finally(() => setMemeriksa(false));
  }, [muatStatus]);

  /* ————— aksi model ————— */
  const ubah = (i: number, patch: Partial<Entri>) =>
    setModels((ls) => ls.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  const tambah = () =>
    setModels((ls) => [...ls, { id: '', provider: 'gemini', aktif: true, apiKey: '' }]);

  const hapus = (i: number) => setModels((ls) => ls.filter((_, n) => n !== i));

  const geser = (i: number, arah: -1 | 1) =>
    setModels((ls) => {
      const j = i + arah;
      if (j < 0 || j >= ls.length) return ls;
      const cp = [...ls];
      [cp[i], cp[j]] = [cp[j], cp[i]];
      return cp;
    });

  const simpanModels = async () => {
    setSibuk(true);
    try {
      const r = await apiPut('/api/admin/models', { models });
      beri(`Model tersimpan — ${r.aktif}/${r.total} entri aktif. Rotasi langsung dipakai.`);
      muatStatus();
    } catch (e: any) {
      beri(e.message || 'Gagal menyimpan', 'err');
    } finally {
      setSibuk(false);
    }
  };

  const resetModels = async () => {
    if (!confirm('Kembalikan daftar model ke bawaan sistem?')) return;
    setSibuk(true);
    try {
      await apiPost('/api/admin/models/reset', {});
      const m = await apiGet('/api/admin/models');
      setModels((m.models || []).map((x: any) => ({ ...x, apiKey: x.punyaKey ? '••••' : '' })));
      beri('Daftar model dikembalikan ke bawaan.');
      muatStatus();
    } catch (e: any) {
      beri(e.message || 'Gagal reset', 'err');
    } finally {
      setSibuk(false);
    }
  };

  const uji = async (i: number) => {
    const e = models[i];
    setTes((t) => ({ ...t, [i]: { ok: true, pesan: 'Menguji…' } }));
    try {
      const r = await apiPost('/api/admin/models/test', { model: e });
      setTes((t) => ({ ...t, [i]: r }));
    } catch (err: any) {
      setTes((t) => ({ ...t, [i]: { ok: false, pesan: err.message || 'Gagal' } }));
    }
  };

  /* ————— aksi fitur ————— */
  const ubahFlag = async (slug: string, v: boolean) => {
    const baru = { ...flags, [slug]: v };
    setFlags(baru);
    try {
      await apiPut('/api/admin/flags', { flags: baru });
      perbaruiFlags(baru); // sidebar & kartu langsung ikut (tanpa reload)
      beri(`Fitur "${slug}" ${v ? 'DINYALAKAN' : 'DIMATIKAN'}.`);
    } catch (e: any) {
      beri(e.message || 'Gagal menyimpan flag', 'err');
    }
  };

  /* ————— guard ————— */
  if (memeriksa) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-sm text-text-secondary">Memeriksa akses…</div>
    );
  }
  if (!admin) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="max-w-md rounded-xl border border-border-subtle bg-bg-surface p-6 text-center">
          <h1 className="text-lg font-bold text-text-primary">403 — Hanya untuk admin</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Halaman ini butuh akun dengan plan <b>admin</b>. Proteksi utama ada di server (middleware
            <code className="mx-1 rounded bg-bg-base px-1">requireAdmin</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 lg:p-5">
      <div className="mx-auto max-w-5xl space-y-4 pb-12">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Dashboard Admin</h1>
            <p className="text-sm text-text-secondary">Kelola model AI (router/provider) &amp; saklar fitur aplikasi.</p>
          </div>
          {pesan && (
            <div
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pesan.jenis === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {pesan.teks}
            </div>
          )}
        </div>

        {/* Tab */}
        <div className="flex items-center gap-1 rounded-lg bg-bg-base p-1">
          {(['model', 'fitur'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t ? 'bg-bg-surface text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t === 'model' ? 'Model AI' : 'Fitur'}
            </button>
          ))}
        </div>

        {/* ————— TAB MODEL ————— */}
        {tab === 'model' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-sm text-text-secondary">
              Setiap baris = <b>satu model pada satu router</b> (provider + endpoint + API key). Saat satu entri kena
              kuota/429 sistem otomatis pindah ke entri berikutnya sesuai urutan. Provider <b>openai</b> = gateway
              OpenAI-compatible (OpenRouter, LiteLLM, OneAPI/NewAPI, relay 9router, dsb) — isi base URL seperti
              <code className="mx-1 rounded bg-bg-base px-1">https://…/api/v1</code>.
              {status && (
                <span className="ml-1">
                  · Urutan berjalan saat ini: entri #{status.urutanAktif + 1}.
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-surface">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-xs uppercase text-text-muted">
                    <th className="px-3 py-2.5 font-bold">Urut</th>
                    <th className="px-3 py-2.5 font-bold">Nama model (id)</th>
                    <th className="px-3 py-2.5 font-bold">Provider</th>
                    <th className="px-3 py-2.5 font-bold">Base URL</th>
                    <th className="px-3 py-2.5 font-bold">API key</th>
                    <th className="px-3 py-2.5 text-center font-bold">Aktif</th>
                    <th className="px-3 py-2.5 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((e, i) => {
                    const st = status?.entri?.[i];
                    return (
                      <tr key={i} className={`border-b border-border-subtle/60 last:border-0 ${e.aktif ? '' : 'opacity-55'}`}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <span className={`w-5 text-center text-xs font-bold ${st && st.blokMenit > 0 ? 'text-red-500' : 'text-text-muted'}`}>
                              {i + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => geser(i, -1)} disabled={i === 0} className="text-[10px] leading-none text-text-muted hover:text-brand-primary disabled:opacity-30" aria-label="Naikkan">▲</button>
                              <button onClick={() => geser(i, 1)} disabled={i === models.length - 1} className="text-[10px] leading-none text-text-muted hover:text-brand-primary disabled:opacity-30" aria-label="Turunkan">▼</button>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input className={inputCls} value={e.id} placeholder="mis. gemini-3.5-flash / gpt-4o-mini" onChange={(ev) => ubah(i, { id: ev.target.value })} />
                          {st && (
                            <p className="mt-1 text-[11px] text-text-muted">
                              {st.blokMenit > 0 ? <span className="text-red-500 font-semibold">kuota blok {st.blokMenit} mnt lagi</span> : `rpm: ${st.rpm}/4`}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <select className={inputCls} value={e.provider} onChange={(ev) => ubah(i, { provider: ev.target.value as Provider })}>
                            <option value="gemini">Gemini</option>
                            <option value="openai">OpenAI-compat</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className={inputCls}
                            value={e.baseUrl || ''}
                            placeholder={e.provider === 'openai' ? 'https://…/api/v1' : 'opsional (relay Gemini)'}
                            onChange={(ev) => ubah(i, { baseUrl: ev.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              className={inputCls}
                              type="password"
                              value={e.apiKey || ''}
                              placeholder={e.punyaKey ? '•••••••• (tersimpan)' : e.provider === 'gemini' ? 'kosong = GEMINI_API_KEY' : 'key gateway'}
                              onChange={(ev) => ubah(i, { apiKey: ev.target.value })}
                            />
                            {e.punyaKey && e.apiKey === '••••' && (
                              <button className={btnKecil} title="Hapus key tersimpan" onClick={() => ubah(i, { apiKey: '', punyaKey: false, hapusKey: true })}>✕</button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center">
                            <Saklar nyala={e.aktif} label={`Aktifkan ${e.id}`} onChange={(v) => ubah(i, { aktif: v })} />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className={btnKecil} onClick={() => uji(i)} disabled={sibuk}>Tes</button>
                            <button className={btnKecil} onClick={() => hapus(i)} disabled={sibuk}>Hapus</button>
                          </div>
                          {tes[i] && (
                            <p className={`mt-1 max-w-[180px] text-[11px] leading-snug ${tes[i].ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                              {tes[i].pesan}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!models.length && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-sm text-text-muted">Belum ada model dimuat.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className={btnOutline} onClick={tambah} disabled={sibuk}>+ Tambah baris</button>
              <button className={btnPrimer} onClick={simpanModels} disabled={sibuk}>
                {sibuk ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
              <button className={btnOutline} onClick={resetModels} disabled={sibuk}>Reset ke bawaan</button>
              <button className={btnOutline} onClick={muatStatus} disabled={sibuk}>Segarkan status</button>
            </div>
          </div>
        )}

        {/* ————— TAB FITUR ————— */}
        {tab === 'fitur' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border-subtle bg-bg-surface p-4 text-sm text-text-secondary">
              Saklar ini mengontrol <b>tampil/tidaknya menu &amp; kartu</b> di sidebar dan dashboard untuk SEMUA
              pengguna (perubahan langsung tersimpan). Halaman tetap bisa dibuka lewat URL langsung — matikan fitur
              untuk menyembunyikannya dari tampilan.
            </div>
            {DAFTAR_FITUR.map((g) => (
              <div key={g.grup} className="overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
                <div className="border-b border-border-subtle bg-bg-base px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  {g.grup}
                </div>
                {g.items.map((f) => {
                  const nyala = flags[f.slug] !== false;
                  return (
                    <div key={f.slug} className="flex items-center justify-between gap-3 border-b border-border-subtle/60 px-4 py-3 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{f.label}</p>
                        <p className="text-xs text-text-muted">
                          {f.ket || <code>/dashboard/{f.slug}</code>}
                        </p>
                      </div>
                      <Saklar nyala={nyala} label={`Fitur ${f.label}`} onChange={(v) => ubahFlag(f.slug, v)} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
