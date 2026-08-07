import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, '..', 'temp');

export const createPdfFromHtml = async (html) => {
  let browser = null;
  try {
    const pdfId = uuidv4();
    const pdfFilename = `${pdfId}.pdf`;
    const pdfPath = path.join(tempDir, pdfFilename);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();

    // Set viewport to A4 width for accurate rendering
    await page.setViewportSize({ width: 794, height: 1123 });

    // Set the HTML content, waiting for network resources (fonts, etc.) to load
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // The template imports web fonts, so wait for their final metrics before
    // pagination. This avoids printing while text is still being reflowed.
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    // Wait for fonts and any dynamic rendering to settle
    await page.waitForTimeout(1500);

    // Ensure all images are loaded before printing
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const images = Array.from(document.images);
        if (images.length === 0) return resolve();
        let loaded = 0;
        images.forEach(img => {
          if (img.complete) {
            loaded++;
            if (loaded === images.length) resolve();
          } else {
            img.addEventListener('load', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
            img.addEventListener('error', () => {
              loaded++;
              if (loaded === images.length) resolve();
            });
          }
        });
      });
    });

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '22mm',
        bottom: '25mm',
        left: '18mm',
        right: '18mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="
          width: 100%;
          font-family: -apple-system, 'Inter', sans-serif;
          font-size: 9px;
          color: #aaa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 18mm;
          box-sizing: border-box;
        ">
          <span style="color: #bbb;">Chat2PDF &mdash; AI Conversation Export</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `
    });

    return {
      id: pdfId,
      path: pdfPath,
      filename: pdfFilename
    };
  } catch (error) {
    console.error('[PDF Generator Error]', error.message);
    throw new Error('Failed to generate PDF document.');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
