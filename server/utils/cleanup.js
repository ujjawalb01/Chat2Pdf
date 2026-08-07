import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '..', 'temp');

export const cleanupOldPdfs = async () => {
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    // 30 minutes expiration
    const expirationMs = parseInt(process.env.PDF_EXPIRATION_MINUTES || '30') * 60 * 1000;

    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > expirationMs) {
          await fs.unlink(filePath);
          console.log(`[Cleanup] Deleted expired PDF: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('[Cleanup Error]', error.message);
  }
};
