import { Router } from 'express';
import { requestGeneration, checkJobStatus } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/generate', requireAuth, requestGeneration);
router.get('/job/:jobId', checkJobStatus);

export default router;
