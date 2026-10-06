import { supabase } from './supabase';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function authHeaders(): Promise<Record<string, string>> {
  let token: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || undefined;
  } catch { /* abaikan, fallback ke localStorage */ }
  if (!token && typeof window !== 'undefined') {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i) || '';
        if (k.endsWith('-auth-token')) {
          const raw = window.localStorage.getItem(k) || '';
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.access_token) { token = parsed.access_token; break; }
          } catch { /* bukan JSON */ }
        }
      }
    } catch { /* SSR */ }
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function isInsufficientCredits(e: any) {
  return e instanceof ApiError ? e.status === 402 : /kredit kurang/i.test(String(e?.message || ''));
}

export async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, { headers: await authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new ApiError((await res.json().catch(() => ({}))).error || `GET ${path} gagal`, res.status);
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || `POST ${path} gagal (${res.status})`, res.status, json);
  return json;
}

export async function apiPatch(path: string, body: any) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || `PATCH ${path} gagal (${res.status})`, res.status, json);
  return json;
}

export async function apiPostStream(path: string, body: any, onText: (t: string) => void): Promise<{ cost: number; cached?: boolean }> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const json = await res.json().catch(() => ({}));
    throw new ApiError(json.error || `POST ${path} gagal`, res.status);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '', cost = 0, cached = false;
  for (;;) {
    const rd = await reader.read();
    if (rd.done) break;
    buf += dec.decode(rd.value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of block.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        let d: any = {};
        try { d = JSON.parse(line.slice(6)); } catch { continue; }
        if (typeof d.t === 'string') { full += d.t; onText(full); }
        else if (d.error) throw new ApiError(d.error, 500);
        else if (typeof d.cost === 'number') cost = d.cost;
        else if (d.cached) cached = true;
      }
    }
  }
  return { cost, cached };
}

export async function aiGenerate(prompt: string, feature = 'bab', ref = '') {
  return apiPost('/api/ai/generate', { prompt, feature, ref });
}

async function authToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch { /* fallback */ }
  if (typeof window !== 'undefined') {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i) || '';
      if (k.endsWith('-auth-token')) {
        try {
          const p = JSON.parse(window.localStorage.getItem(k) || '');
          if (p?.access_token) return p.access_token;
        } catch { /* abaikan */ }
      }
    }
  }
  return '';
}

export async function apiUpload(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const token = await authToken();
  const res = await fetch(`${API}${path}`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || `Upload gagal`, res.status);
  return json;
}

export async function apiDownloadPptx(jenis: string, materi: string, judul: string) {
  const token = await authToken();
  const res = await fetch(`${API}/api/files/pptx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ jenis, materi, judul }),
  });
  if (!res.ok) throw new ApiError((await res.json().catch(() => ({}))).error || 'Generate PPTX gagal', res.status);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `presentasi-${jenis}.pptx`;
  a.click();
  URL.revokeObjectURL(a.href);
}
