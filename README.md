# Chat2PDF

Chat2PDF is a modern full-stack web application that allows users to seamlessly convert publicly shared AI conversations (from platforms like ChatGPT, Claude, Gemini, and DeepSeek) into beautifully formatted, readable A4 PDFs. 

## Features
- **URL Validation & SSRF Protection:** Safe link processing with strict protocol and domain checks.
- **Dynamic Extraction:** Built-in Playwright extraction pipeline handling modern AI web apps.
- **Beautiful Markdown:** Syntax highlighting, code block parsing, and proper table formatting using `marked` and `highlight.js`.
- **A4 PDF Generation:** Clean, readable typography engineered for print or digital reading.
- **Privacy-First:** Automatically deletes temporary PDFs after generation and never stores conversations persistently.

## Project Structure
This is a monorepo setup:
- \`client/\`: Vite + React + Tailwind CSS frontend.
- \`server/\`: Node.js + Express backend utilizing Playwright for browser automation.

## Environment Variables
Create a \`.env\` file in the \`server\` directory:
\`\`\`env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PDF_EXPIRATION_MINUTES=30
\`\`\`

## Installation & Setup

1. **Install dependencies:**
   From the root folder, run:
   \`\`\`bash
   npm run install:all
   \`\`\`

2. **Install Playwright Browsers:**
   Playwright requires Chromium to extract content and generate PDFs. Run:
   \`\`\`bash
   cd server
   npx playwright install chromium
   \`\`\`

## Development
Run the development server (starts both client and server concurrently):
\`\`\`bash
npm run dev
\`\`\`

- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:5000`

## Known Limitations
- The system only supports *publicly accessible* share links. 
- If AI platforms change their DOM structure significantly, extraction logic in \`server/extractors\` may need updates.
- DeepSeek, Claude, and Gemini extractor templates are planned for future implementation; currently, the extraction engine provides a robust architecture using ChatGPT as the MVP.

## Architecture & Security
- **SSRF Prevention:** The backend explicitly blocks `localhost`, `127.0.0.1`, and private IP ranges to ensure no internal cloud metadata or local servers are probed.
- **Sanitization:** All extracted HTML is sanitized using `isomorphic-dompurify` before being templated and sent to the PDF engine.
