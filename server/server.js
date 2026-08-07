import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cron from 'node-cron';
import { cleanupOldPdfs } from './utils/cleanup.js';

// Import Routes and Middleware
import pdfRoutes from './routes/pdfRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Routes
app.use('/api/pdf', pdfRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Chat2PDF API is running' });
});

// Error Handler
app.use(errorHandler);

// Setup Cron Job for cleanup
cron.schedule('*/15 * * * *', () => {
  cleanupOldPdfs();
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Triggering restart for node --watch
