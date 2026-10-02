import { Router } from 'express';
import { requestGeneration, checkJobStatus } from '../controllers/ai.controller';

const router = Router();

router.post('/generate', requestGeneration);
router.get('/job/:jobId', checkJobStatus);

export default router;
