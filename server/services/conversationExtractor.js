import { chromium } from 'playwright';
import { extractChatGPT } from '../extractors/chatgpt.js';
// import { extractClaude } from '../extractors/claude.js';
// import { extractGemini } from '../extractors/gemini.js';
// import { extractDeepSeek } from '../extractors/deepseek.js';

const EXTRACTORS = {
  chatgpt: extractChatGPT,
  claude: extractChatGPT,
  gemini: extractChatGPT,
  deepseek: extractChatGPT,
};

/**
 * Scroll through the entire page so lazy-rendered messages all load into the DOM.
 * ChatGPT share pages use virtualized/lazy rendering — messages only appear in the
 * DOM when they are scrolled into view. Without this, extraction stops mid-conversation.
 */
async function scrollToLoadAll(page, collectMessages) {
  let bottomChecks = 0;

  while (bottomChecks < 3) {
    await page.evaluate(() => {
      const candidates = [
        document.scrollingElement,
        ...document.querySelectorAll('main, [role="main"], [class*="conversation"], [class*="chat"]')
      ].filter((element, index, all) => (
        element && all.indexOf(element) === index &&
        element.scrollHeight > element.clientHeight + 1 &&
        ['auto', 'scroll'].includes(getComputedStyle(element).overflowY)
      ));

      const target = candidates.reduce((largest, element) => (
        !largest || element.scrollHeight - element.clientHeight > largest.scrollHeight - largest.clientHeight
          ? element
          : largest
      ), null) || document.scrollingElement;

      // Keep substantial overlap between rendered windows. Large jumps can skip
      // turns on virtualized conversation views even though the scroll position
      // reaches the bottom successfully.
      target.scrollBy(0, Math.min(Math.max(window.innerHeight * 0.35, 220), 320));
    });
    await page.waitForTimeout(650);

    // Capture each rendered window before virtualized pages discard it.
    await collectMessages();

    const { scrollTop, maxScrollTop } = await page.evaluate(() => {
      const candidates = [
        document.scrollingElement,
        ...document.querySelectorAll('main, [role="main"], [class*="conversation"], [class*="chat"]')
      ].filter((element, index, all) => (
        element && all.indexOf(element) === index &&
        element.scrollHeight > element.clientHeight + 1 &&
        ['auto', 'scroll'].includes(getComputedStyle(element).overflowY)
      ));
      const target = candidates.reduce((largest, element) => (
        !largest || element.scrollHeight - element.clientHeight > largest.scrollHeight - largest.clientHeight
          ? element
          : largest
      ), null) || document.scrollingElement;
      return {
        scrollTop: target.scrollTop,
        maxScrollTop: target.scrollHeight - target.clientHeight
      };
    });

    // Lazy content can extend the document after the first bottom check, so require
    // several stable checks at the actual bottom rather than relying on height changes.
    bottomChecks = scrollTop >= maxScrollTop - 1 ? bottomChecks + 1 : 0;
  }
}

const messageSignature = (message) => `${message.role}\u0000${message.content}`;

// Consecutive virtualized windows overlap. Append only the portion after their
// longest overlap so identical messages in different turns are still preserved.
const appendNewMessages = (messages, batch) => {
  const knownIds = new Set(messages.map(message => message.id).filter(Boolean));
  const identifiedMessages = batch.filter(message => message.id);

  // Current share pages expose stable message or turn IDs. Prefer those over
  // text matching so repeated user prompts and repeated AI replies are retained.
  if (identifiedMessages.length === batch.length && identifiedMessages.length > 0) {
    messages.push(...batch.filter(message => !knownIds.has(message.id)));
    return;
  }

  const maxOverlap = Math.min(messages.length, batch.length);
  let overlap = 0;

  for (let size = maxOverlap; size > 0; size--) {
    const matches = batch.slice(0, size).every((message, index) => (
      messageSignature(messages[messages.length - size + index]) === messageSignature(message)
    ));
    if (matches) {
      overlap = size;
      break;
    }
  }

  messages.push(...batch.slice(overlap));
};

export const extractConversation = async (url, platform) => {
  if (platform === 'unknown' || !EXTRACTORS[platform]) {
    throw new Error('Platform adapter currently unavailable');
  }

  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1440,900'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    const page = await context.newPage();

    // Navigate to the page, giving it time to fully load the initial render
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page. Status: ${response?.status()}`);
    }

    // Wait for main content to appear
    await page.waitForSelector('main, article, [data-message-author-role]', { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const extractor = EXTRACTORS[platform];
    const messages = [];
    const collectMessages = async (waitForRender = false) => {
      try {
        const batch = await extractor(page, waitForRender, platform);
        appendNewMessages(messages, batch);
      } catch (error) {
        // A virtualized UI can briefly have no message nodes while replacing a
        // viewport. The initial pass must succeed; later empty windows are safe.
        if (waitForRender || error.message !== 'EMPTY_CONVERSATION') {
          throw error;
        }
      }
    };

    // Capture each viewport while scrolling. Long ChatGPT pages may virtualize old
    // turns, so extracting only once after scrolling loses content.
    console.log('[Extractor] Scrolling page to load all messages...');
    await collectMessages(true);
    await scrollToLoadAll(page, collectMessages);
    console.log('[Extractor] Scroll complete. Extracting messages...');

    // Get the title
    let title = await page.title();
    title = title.replace(/ - ChatGPT/g, '').replace(/ChatGPT/g, '').replace(/ \| Claude/g, '').trim() || 'AI Conversation';

    console.log(`[Extractor] Extracted ${messages.length} messages from "${title}"`);

    return {
      title,
      platform,
      sourceUrl: url,
      extractedAt: new Date().toISOString(),
      messages
    };
  } catch (error) {
    console.error('[Extractor Error]', error.message);
    if (error.message === 'EMPTY_CONVERSATION') {
      throw new Error('Could not find conversation messages. The link might be invalid or the platform structure has changed.');
    }
    throw new Error(`Extraction failed: ${error.message}. Please check if the link is publicly accessible.`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
