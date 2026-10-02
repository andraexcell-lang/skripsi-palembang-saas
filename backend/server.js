import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { addJobToQueue, aiQueue } from './queue.js';
// Import worker supaya aktif berjalan bersamaan dengan server
import './worker.js'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Endpoint untuk memulai generasi (Menambahkan job ke antrean)
app.post('/api/generate', async (req, res) => {
    try {
        const { userId, projectId, judul, promptType } = req.body;
        
        // Memasukkan job ke dalam antrean BullMQ
        const job = await addJobToQueue(userId, projectId, promptType, { judul });
        
        res.json({
            success: true,
            message: "Tugas berhasil dimasukkan ke antrean",
            jobId: job.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Endpoint untuk mengecek status dan progress antrean (Long-polling atau Polling biasa)
// Dalam produksi skala besar, lebih baik menggunakan WebSockets (Socket.io)
app.get('/api/status/:jobId', async (req, res) => {
    try {
        const job = await aiQueue.getJob(req.params.jobId);
        
        if (!job) {
            return res.status(404).json({ error: "Job tidak ditemukan" });
        }

        const state = await job.getState(); // 'waiting', 'active', 'completed', 'failed'
        const progress = job.progress;

        if (state === 'completed') {
            return res.json({ status: state, progress, result: job.returnvalue.result });
        }

        if (state === 'failed') {
            return res.json({ status: state, error: job.failedReason });
        }

        // Jika masih 'waiting' atau 'active', kita bisa mengetahui urutannya di antrean
        const waitingJobs = await aiQueue.getWaiting();
        const indexInQueue = waitingJobs.findIndex(j => j.id === job.id);
        
        res.json({
            status: state,
            progress,
            positionInQueue: indexInQueue !== -1 ? indexInQueue + 1 : 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(\`Backend API berjalan di http://localhost:\${PORT}\`);
    console.log(\`Sistem antrean (BullMQ) & Worker siap menerima tugas.\`);
});
