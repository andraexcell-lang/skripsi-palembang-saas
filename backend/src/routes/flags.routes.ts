import { Router } from 'express';
import { bacaSetting } from '../services/settings.service';

// Endpoint PUBLIK (tanpa auth): hanya berisi boolean on/off per fitur —
// dipakai sidebar & halaman dashboard untuk menyembunyikan menu yang dimatikan admin.
const router = Router();

router.get('/', async (_req, res) => {
  try {
    const v = await bacaSetting('feature_flags');
    res.json({ flags: v && typeof v === 'object' ? v : {} });
  } catch {
    res.json({ flags: {} }); // gagal baca → tampilkan semua fitur (fail-open)
  }
});

export default router;
