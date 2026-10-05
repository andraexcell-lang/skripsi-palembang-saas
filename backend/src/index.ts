import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai.routes';
import creditsRoutes from './routes/credits.routes';
import billingRoutes from './routes/billing.routes';
import projectsRoutes from './routes/projects.routes';
import filesRoutes from './routes/files.routes';
import apikeysRoutes from './routes/apikeys.routes';
import affiliateRoutes from './routes/affiliate.routes';
import wordRoutes from './routes/word.routes';
import docsRoutes from './routes/docs.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Header ringkasan wajib di-expose agar bisa dibaca frontend (CORS default menyembunyikan)
app.use(cors({ exposedHeaders: ['X-Rapih-Ringkasan', 'X-Rapi-Stat', 'Content-Disposition'] }));
app.use(express.json({ limit: '5mb' }));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/keys', apikeysRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/docs', docsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MantraRiset Backend is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
