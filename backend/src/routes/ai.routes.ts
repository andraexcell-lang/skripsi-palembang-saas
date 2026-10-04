import { Router } from 'express';
import { requestGeneration, checkJobStatus } from '../controllers/ai.controller';
import { requireAuthOrKey } from '../middleware/apiKey';

const router = Router();

router.post('/generate', requireAuthOrKey, requestGeneration);
router.get('/job/:jobId', checkJobStatus);

export default router;
