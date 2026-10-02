import { generateContent } from './ai.service';

const AI_QUEUE_NAME = 'ai-generation-queue';

// export const aiQueue = new Queue(AI_QUEUE_NAME, { connection });
export const aiQueue = {} as any;

// In-memory store for demo purposes (use DB like Supabase/MongoDB in production)
export const jobResults = new Map<string, any>();

/* 
const worker = new Worker(AI_QUEUE_NAME, async (job: Job) => {
  const { prompt } = job.data;
  console.log(`Processing job ${job.id} with prompt: ${prompt.substring(0, 50)}...`);
  
  try {
    const result = await generateContent(prompt);
    jobResults.set(job.id!, { status: 'completed', result });
    return result;
  } catch (error: any) {
    jobResults.set(job.id!, { status: 'failed', error: error.message });
    throw error;
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
}); 
*/
