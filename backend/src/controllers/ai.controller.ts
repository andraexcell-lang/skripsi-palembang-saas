import { Request, Response } from 'express';
import { aiQueue, jobResults } from '../services/queue.service';
import { generateContent } from '../services/ai.service';

export const requestGeneration = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log(`Received prompt: ${prompt.substring(0, 50)}...`);
    
    // Bypass BullMQ/Redis for local testing so we can get immediate responses
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
    const { jobId } = req.params;
    
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
