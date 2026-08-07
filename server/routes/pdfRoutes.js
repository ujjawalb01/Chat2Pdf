import express from 'express';
import { generatePDF, downloadPDF, previewPDF } from '../controllers/pdfController.js';

const router = express.Router();

router.post('/generate', generatePDF);
router.get('/download/:id', downloadPDF);
router.get('/preview/:id', previewPDF);

export default router;
