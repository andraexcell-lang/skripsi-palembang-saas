'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Pkg = { id: string; group: string; name: string; price: number; credits: number; desc: string; popular?: boolean };

// Checklist fitur paritas mantrariset §3.20: dasar 9 item untuk Mahasiswa,
// Profesor menambah 5 item (Tesis/Disertasi, cek referensi, ubah skripsi+artikel,
// AI Writer, Artikel Scopus/SINTA).
const FITUR_MAHASISWA = [
  'Skripsi lengkap',
  'Unduh Word & PPT',
  'Parafrase',
  'Sitasi',
  'Lab Revisi',
  'Generate pertanyaan sidang',
  'Simulasi Sidang',
  'Cek Turnitin',
  'Grup WA',
];
const FITUR_PROFESOR = [...FITUR_MAHASISWA, 'Tesis / Disertasi', 'Cek referensi', 'Ubah skripsi + artikel', 'AI Writer', 'Artikel Scopus / SINTA'];

export default function BillingPage() {
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [trx, setTrx] = useState<any[]>([]);
  const [bal, setBal] = useState<{ credits: number; plan: string } | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState('');
  const [midtrans, setMidtrans] = useState(false);
  // True setelah load() pertama selesai — cegah flash klaim palsu
  // ("mode mock", "Login dulu…", "Belum ada transaksi") sebelum data datang.
  const [ready, setReady] = useState(false);

  async function load() {
    try {
      const p = await apiGet('/api/billing/packages');
      setPkgs(p.items);
      setMidtrans(!!p.midtrans);
    } catch { /* backend belum jalan / belum login */ }
    try {
      const t = await apiGet('/api/billing/transactions');
      setTrx(t.items);
    } catch { /* abaikan */ }
    try {
      setBal(await apiGet('/api/credits/balance'));
    } catch { /* belum login / backend belum jalan */ }
    setReady(true);
  }
  useEffect(() => { load(); }, []);

  async function payMidtrans(packageId: string) {
    setMsg(''); setLoading(packageId);
    try {
      const r = await apiPost('/api/billing/midtrans/charge', { packageId });
      window.location.href = r.redirect_url;
    } catch (e: any) {
      setMsg(e.message);
    }
    setLoading('');
  }

  async function checkoutMock(packageId: string) {
    setMsg(''); setLoading(packageId);
    try {
      const r = await apiPost('/api/billing/checkout', { packageId });
      setMsg(`Checkout OK: ${r.qrisPayload}. Klik konfirmasi untuk simulasi lunas.`);
      const c = await apiPost('/api/billing/confirm', { transactionId: r.transaction.id });
      setMsg(`Pembayaran lunas (mock). Sisa kredit: ${c.remaining}`);
      load();
    } catch (e: any) {
      setMsg(e.message);
    }
    setLoading('');
  }

  return (
    <div className="flex flex-col h-full bg-bg-base">
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto pb-20">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
          <p className="text-text-secondary text-sm">
            {!ready ? 'Memuat info pembayaran…' : midtrans ? 'Pembayaran real via Midtrans (QRIS/e-wallet/transfer bank).' : 'Midtrans belum dikonfigurasi — mode mock aktif.'}
          </p>
        </div>
        {msg && <p className="text-sm text-text-primary bg-bg-surface border border-border-subtle rounded-lg p-3">{msg}</p>}

        {/* Paritas §3.20: kartu paket aktif */}
        {bal && (
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-text-primary">
                Paket {(bal.plan || 'free').replace(/^\w/, (c) => c.toUpperCase())} aktif
              </h2>
              <p className="text-sm text-text-secondary mt-1">{bal.credits} kredit tersisa</p>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-bold text-text-primary mb-3">Pilih Paket</h3>
          {['Mahasiswa', 'Profesor'].map((g) => (
            <div key={g} className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Paket {g}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {pkgs.filter((p) => p.group === g).map((p) => (
                  <div key={p.id} className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col hover:border-brand-primary transition-colors">
                    <div className="flex items-center justify-end mb-2 min-h-[18px]">
                      {p.popular && (
                        <span className="text-[10px] font-bold uppercase bg-brand-primary text-white px-2 py-0.5 rounded-full">Populer</span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">{p.name}</div>
                    <div className="text-xl font-bold text-text-primary">Rp {p.price.toLocaleString('id-ID')}</div>
                    <div className="text-sm text-text-secondary mb-3">{p.desc} • {p.credits} kredit</div>
                    {/* Checklist fitur paritas: Mahasiswa 9 item, Profesor +5 */}
                    <ul className="space-y-1.5 mb-4 text-xs text-text-secondary">
                      {(g === 'Profesor' ? FITUR_PROFESOR : FITUR_MAHASISWA).map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <svg className="shrink-0 mt-0.5 text-success" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto space-y-2">
                      {midtrans ? (
                        <button onClick={() => payMidtrans(p.id)} disabled={!!loading} className="w-full bg-brand-primary text-white font-bold text-xs py-3 rounded-lg disabled:opacity-50">
                          {loading === p.id ? 'Membuat pembayaran...' : `Bayar ${p.name}`}
                        </button>
                      ) : (
                        <button onClick={() => checkoutMock(p.id)} disabled={!!loading} className="w-full bg-bg-surface-hover border border-border-strong text-text-primary font-bold text-xs py-3 rounded-lg disabled:opacity-50">
                          {loading === p.id ? 'Memproses...' : `Pilih ${p.name} (mock)`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!ready ? (
            <p className="text-sm text-text-muted">Memuat paket…</p>
          ) : pkgs.length === 0 && (
            <p className="text-sm text-text-muted">Paket gagal dimuat. Muat ulang halaman untuk mencoba lagi.</p>
          )}
          <p className="text-xs text-text-muted text-center mt-3">Pembayaran via QRIS + scan, paket langsung aktif otomatis.</p>
        </div>

        <div>
          <h3 className="font-bold text-text-primary mb-3">Riwayat Transaksi</h3>
          {!ready ? (
            <p className="text-sm text-text-muted">Memuat riwayat…</p>
          ) : trx.length === 0 ? (
            <p className="text-sm text-text-muted">Belum ada transaksi.</p>
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-left text-text-muted">
                    <th className="p-4 font-bold">Tanggal</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {trx.map((t: any) => (
                    <tr key={t.id} className="border-b border-border-subtle last:border-0">
                      <td className="p-4 text-text-secondary">{new Date(t.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${t.status === 'paid' ? 'bg-success/10 text-success' : 'bg-brand-primary/10 text-brand-primary'}`}>
                          {t.status === 'paid' ? 'Lunas' : 'Menunggu'}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary">Rp {Number(t.amount).toLocaleString('id-ID')} · +{t.credits} kredit</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
