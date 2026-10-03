import { Request, Response } from 'express';
import { aiQueue, jobResults } from '../services/queue.service';
import { generateContent } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';
import { consumeCredits, FEATURE_COSTS } from '../services/credits.service';

export const requestGeneration = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, feature = 'bab', ref = '' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });

    // Potong kredit dulu (gratis untuk fitur 0-kredit). Gagal -> 402.
    try {
      await consumeCredits(req.userId, feature, ref || `ai:${feature}`);
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_CREDITS') {
        return res.status(402).json({ error: e.message, cost: e.cost, remaining: e.remaining, featureCosts: FEATURE_COSTS });
      }
      throw e;
    }

    console.log(`User ${req.userId} feature=${feature} prompt: ${prompt.substring(0, 50)}...`);

    // Bypass BullMQ/Redis untuk respons langsung (jalur TS port 5000)
    const result = await generateContent(prompt);

    // Return final result directly
    res.status(200).json({
      message: "Success",
      result: result
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const checkJobStatus = async (req: Request, res: Response) => {
  try {
    const jobId = String(req.params.jobId || '');

    const jobStatus = jobResults.get(jobId);
    
    if (!jobStatus) {
       // Cek apakah job ada di queue secara langsung (opsional)
       const job = await aiQueue.getJob(jobId);
       if (job) {
          const state = await job.getState();
          return res.status(200).json({ status: state });
       }
       return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json(jobStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
