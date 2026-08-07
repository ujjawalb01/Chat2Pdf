import { validateUrl } from '../utils/urlValidator.js';
import { detectPlatform } from '../services/platformDetector.js';
import { extractConversation } from '../services/conversationExtractor.js';
import { renderMessages } from '../services/markdownRenderer.js';
import { generateHtmlTemplate } from '../templates/conversationTemplate.js';
import { createPdfFromHtml } from '../services/pdfGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '..', 'temp');

export const generatePDF = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      throw new Error('URL is required.');
    }

    // 1. Validate URL
    await validateUrl(url);

    // 2. Detect platform
    const platform = detectPlatform(url);
    if (platform === 'unknown') {
      throw new Error('Platform adapter currently unavailable');
    }

    // 3. Extract conversation
    const conversation = await extractConversation(url, platform);
    
    // 4. Render markdown messages
    const renderedMessages = renderMessages(conversation.messages);

    // 5. Generate HTML
    const html = generateHtmlTemplate(conversation, renderedMessages);

    // 6. Generate PDF
    const pdf = await createPdfFromHtml(html);

    res.json({
      success: true,
      message: 'PDF generated successfully',
      data: {
        id: pdf.id,
        title: conversation.title,
        platform: conversation.platform,
        messageCount: conversation.messages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Basic sanitization of ID to prevent path traversal
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid PDF ID' } });
    }

    const filePath = path.join(tempDir, `${id}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: { message: 'PDF not found or has expired' } });
    }

    // Attempt to parse title from query params or use a generic one
    const filename = req.query.title 
      ? `${req.query.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf` 
      : 'conversation.pdf';

    res.download(filePath, filename);
  } catch (error) {
    next(error);
  }
};

export const previewPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      return res.status(400).send('Invalid PDF ID');
    }

    const filePath = path.join(tempDir, `${id}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF not found or has expired');
    }

    res.contentType('application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};
