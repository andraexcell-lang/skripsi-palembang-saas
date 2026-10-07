import { Response, NextFunction } from 'express';
import { AuthRequest, requireAuth } from './auth';
import { supabaseAdmin, supabaseAnon } from '../config/supabase';

/** Hanya akun dengan plan 'admin' yang lolos (403 untuk lainnya).
 *  Dipakai sebagai array: router.get(path, requireAdmin, handler) */
export const requireAdmin = [
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const db = supabaseAdmin || supabaseAnon;
      const { data, error } = await db.from('profiles').select('plan').eq('id', req.userId!).single();
      if (error || data?.plan !== 'admin') {
        return res.status(403).json({ error: 'Hanya untuk akun admin' });
      }
      next();
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  },
];
