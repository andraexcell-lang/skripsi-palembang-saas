import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Worker akan memproses job yang masuk ke antrean "ai-generation"
const aiWorker = new Worker('ai-generation', async job => {
    const { userId, projectId, judul, promptType } = job.data;
    
    // Memberitahu UI bahwa proses sudah dimulai (Progress 10%)
    await job.updateProgress(10);
    console.log(`[Worker] Memulai job ${job.id} untuk user ${userId}`);

    try {
        let systemPrompt = "";
        if (promptType === 'lampiran') {
            systemPrompt = `Buat Kisi-Kisi Instrumen Penelitian untuk skripsi berjudul: "${judul}". 
            Berikan Tabel Variabel dan 5 Butir Kuesioner Skala Likert.`;
        } else {
            systemPrompt = `Tuliskan draft bagian ${promptType} untuk skripsi dengan judul: "${judul}"`;
        }

        // Simulasi progres (karena API call bisa memakan waktu lama, kita update progress)
        await job.updateProgress(35);
        
        // Memanggil Gemini API
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();
        
        await job.updateProgress(90);
        
        // Dalam aplikasi nyata, kita simpan hasil ini ke Database (misal: Supabase/MongoDB)
        // db.projects.update({ id: projectId }, { lampiran: text });
        
        console.log(`[Worker] Selesai job ${job.id}`);
        await job.updateProgress(100);
        
        return { success: true, result: text };

    } catch (error) {
        console.error(`[Worker] Error pada job ${job.id}:`, error);
        throw error;
    }
}, { connection });

// Handle Event Logging
aiWorker.on('completed', job => {
    console.log(`Job ${job.id} telah selesai!`);
});

aiWorker.on('failed', (job, err) => {
    console.log(`Job ${job.id} gagal dengan error: ${err.message}`);
});
