import { Request, Response, NextFunction } from 'express';
import { supabaseAnon } from '../config/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  accessToken?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized: token hilang' });
  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Unauthorized: token tidak valid' });
    req.userId = data.user.id;
    req.userEmail = data.user.email || '';
    req.accessToken = token;
    next();
  } catch (e: any) {
    return res.status(401).json({ error: e.message || 'Unauthorized' });
  }
};
