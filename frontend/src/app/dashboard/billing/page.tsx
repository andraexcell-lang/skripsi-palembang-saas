'use client';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type Pkg = { id: string; group: string; name: string; price: number; credits: number; desc: string; popular?: boolean };

export default function BillingPage() {
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [trx, setTrx] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState('');
  const [midtrans, setMidtrans] = useState(false);

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
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto pb-20">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Billing</h1>
          <p className="text-text-secondary text-sm">
            {midtrans ? 'Pembayaran real via Midtrans (QRIS/e-wallet/transfer bank).' : 'Midtrans belum dikonfigurasi — mode mock aktif.'}
          </p>
        </div>
        {msg && <p className="text-sm text-text-primary bg-bg-surface border border-border-subtle rounded-lg p-3">{msg}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pkgs.map((p) => (
            <div key={p.id} className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col">
              <div className="text-[10px] font-bold text-text-muted uppercase">{p.group} — {p.name}</div>
              <div className="text-xl font-bold text-text-primary">Rp {p.price.toLocaleString('id-ID')}</div>
              <div className="text-sm text-text-secondary mb-4">{p.desc}</div>
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
          ))}
          {pkgs.length === 0 && <p className="text-sm text-text-muted">Login dulu lalu pastikan backend jalan untuk memuat paket.</p>}
        </div>
        <div>
          <h3 className="font-bold text-text-primary mb-3">Riwayat Transaksi</h3>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 space-y-2">
            {trx.length === 0 && <p className="text-sm text-text-muted">Belum ada transaksi.</p>}
            {trx.map((t: any) => (
              <div key={t.id} className="text-xs text-text-secondary flex justify-between border-b border-border-subtle py-2">
                <span>{t.package_id}</span><span>{t.status} · +{t.credits} kredit</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
