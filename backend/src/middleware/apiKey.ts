import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';
import { AuthRequest } from './auth';

/** Auth untuk plugin Word: header X-API-Key berisi kunci mentah (skp_...). */
export const requireApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const raw = String(req.headers['x-api-key'] || '');
  if (!raw) return res.status(401).json({ error: 'X-API-Key hilang. Buat di Pengaturan > Kunci API.' });
  try {
    const hash = createHash('sha256').update(raw).digest('hex');
    const db = supabaseAdmin || supabaseAnon;
    const { data, error } = await db.from('api_keys').select('user_id').eq('key_hash', hash).single();
    if (error || !data) return res.status(401).json({ error: 'API key tidak valid' });
    req.userId = data.user_id;
    next();
  } catch (e: any) {
    return res.status(401).json({ error: e.message || 'Unauthorized' });
  }
};

/** Terima Bearer (web) ATAU X-API-Key (plugin). */
export const requireAuthOrKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.headers['x-api-key']) return requireApiKey(req, res, next);
  const { requireAuth } = await import('./auth');
  return requireAuth(req, res, next);
};
