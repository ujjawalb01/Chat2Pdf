# Chat2PDF Project Internals

## 1. High-Level Architecture

Chat2PDF is a full-stack application with two main parts:

- `client/`: React + Vite frontend.
- `server/`: Node.js + Express backend.

The app accepts a publicly shared AI conversation URL, extracts the conversation content in a browser context, converts it to sanitized HTML, and renders it into a polished A4 PDF.

## 2. Main Workflow

### 2.1 Frontend user flow

1. User pastes a shared conversation URL into the UI.
2. The client sends a POST request to `POST /api/pdf/generate`.
3. The server processes the URL, extracts the conversation, generates a PDF, and returns metadata.
4. The frontend displays success state and offers preview / download links.

Key frontend files:
- `client/src/pages/Home.jsx`
- `client/src/services/api.js`
- `client/src/components/URLInput.jsx`

### 2.2 Server request lifecycle

The main server flow is handled by:
- `server/routes/pdfRoutes.js`
- `server/controllers/pdfController.js`

When a request reaches `/api/pdf/generate`, the server executes these steps:

1. `validateUrl(url)`
   - Ensures the URL uses `http` or `https`.
   - Confirms the hostname is one of the supported AI platforms.
   - Resolves DNS and blocks private / localhost IP ranges.
   - Prevents SSRF and unsafe internal access.

2. `detectPlatform(url)`
   - Maps hostnames to platform identifiers:
     - `chatgpt.com` / `chat.openai.com` → `chatgpt`
     - `claude.ai` → `claude`
     - `gemini.google.com` → `gemini`
     - `chat.deepseek.com` → `deepseek`
   - Returns `unknown` for unsupported domains.

3. `extractConversation(url, platform)`
   - Uses Playwright Chromium for browser-based extraction.
   - Loads the public share page and waits for content.
   - Scrolls through the page to load lazy / virtualized chat messages.
   - Parses messages using an extractor adapter.
   - Deduplicates overlapping message windows.
   - Returns an object with `title`, `platform`, `sourceUrl`, `extractedAt`, and `messages`.

4. `renderMessages(conversation.messages)`
   - Converts raw message text to markdown-rendered HTML via `marked`.
   - Highlights code blocks using `highlight.js`.
   - Sanitizes all HTML with `isomorphic-dompurify`.
   - Produces a safe list of rendered message HTML.

5. `generateHtmlTemplate(conversation, renderedMessages)`
   - Creates an A4-ready HTML document.
   - Builds a cover page, document header, and per-message cards.
   - Applies typography, spacing, and print-friendly styles.

6. `createPdfFromHtml(html)`
   - Launches a headless Chromium instance.
   - Sets viewport and waits for fonts/images.
   - Renders the HTML with `page.pdf()`.
   - Writes the PDF file to `server/temp`.
   - Returns a unique PDF ID.

7. Response payload

The server returns:

- `success`: true
- `message`: status text
- `data`: includes `id`, `title`, `platform`, and `messageCount`

## 3. PDF Storage and Delivery

### Routes

- `POST /api/pdf/generate` → generate PDF
- `GET /api/pdf/download/:id` → download by ID
- `GET /api/pdf/preview/:id` → preview PDF inline

### Temporary storage

- PDF files are saved in `server/temp`.
- `server/utils/cleanup.js` removes expired PDFs.
- A cron job in `server/server.js` runs every 15 minutes.

### File validation

Download/preview routes validate the PDF ID pattern:
- Accepts only alphanumeric characters and hyphens.
- Prevents path traversal and unauthorized file access.

## 4. Extraction and Virtualized Content Handling

The conversation extraction engine is designed for modern AI share pages that use virtualization:

- Scrolls the page in small increments.
- Collects messages from each rendered viewport.
- Uses stable turn IDs when available.
- Appends only non-duplicate content.

Important extraction files:
- `server/services/conversationExtractor.js`
- `server/extractors/chatgpt.js`

## 5. Rendering and Sanitization

The HTML rendering pipeline ensures the output is safe and readable:

- `marked` converts markdown-style text into HTML.
- `highlight.js` adds syntax highlighting for code blocks.
- `isomorphic-dompurify` sanitizes the final HTML.
- The template supports rich content and safe tags.

Important rendering files:
- `server/services/markdownRenderer.js`
- `server/templates/conversationTemplate.js`

## 6. Security and Safety Controls

The application is built with several security layers:

- `helmet()` secures HTTP headers.
- `cors()` restricts frontend origins using `CLIENT_URL`.
- URL validation blocks unsupported domains and SSRF.
- Private IP addresses are rejected.
- Temporary PDFs are never stored permanently.
- Sanitization prevents unsafe HTML from reaching the PDF renderer.

## 7. Important Files and Responsibilities

### Server

- `server/server.js`
  - Application entry point
  - Middleware, routes, and cron cleanup

- `server/routes/pdfRoutes.js`
  - Defines PDF-related API endpoints

- `server/controllers/pdfController.js`
  - Handles request orchestration and response logic

- `server/services/conversationExtractor.js`
  - Manages Playwright extraction and virtualization

- `server/extractors/chatgpt.js`
  - Extracts conversation messages from AI share pages

- `server/services/markdownRenderer.js`
  - Converts conversation text into safe HTML

- `server/templates/conversationTemplate.js`
  - Builds the final HTML document for PDF rendering

- `server/services/pdfGenerator.js`
  - Uses Playwright to convert HTML to PDF

- `server/utils/urlValidator.js`
  - Validates URLs and protects against SSRF

### Client

- `client/src/services/api.js`
  - Sends generate requests and builds preview/download URLs

- `client/src/pages/Home.jsx`
  - User interaction, status management, and result display

- `client/src/components/URLInput.jsx`
  - Accepts URLs and submits them to the backend

## 8. Run and Development Notes

To run the full stack locally:

1. Install dependencies in `client` and `server`.
2. Install Playwright browsers in `server`.
3. Start the React app and the backend.

The backend is the critical engine: it securely extracts public chat URLs, converts the conversation into a printable HTML layout, and generates the final PDF.

---

This document is intended to explain the internal execution path of Chat2PDF and highlight the most important modules and safeguards used in the project.