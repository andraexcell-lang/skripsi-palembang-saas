import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// Koneksi Redis (bisa diganti dengan Upstash Redis URI jika sudah ke production)
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

// Membuat antrean (Queue) khusus untuk generasi bab AI
export const aiQueue = new Queue('ai-generation', { connection });

export async function addJobToQueue(userId, projectId, taskType, data) {
    // Memasukkan pekerjaan ke dalam antrean
    const job = await aiQueue.add(taskType, { userId, projectId, ...data });
    return job;
}
