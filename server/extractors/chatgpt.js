/**
 * Extracts conversation from a ChatGPT public share link.
 * @param {import('playwright').Page} page
 * @returns {Promise<Array>} Array of message objects { role: 'user' | 'assistant', content: string }
 */
export const extractChatGPT = async (page, waitForRender = true, platform = 'chatgpt') => {
  // Wait for the conversation to load. Share links usually load inside <main>.
  await page.waitForSelector('main', { timeout: 15000 }).catch(() => {});
  
  // Wait a little extra for the initial client-side render. During scrolling the
  // caller already waits after every movement, so repeating this delay would make
  // large conversations unnecessarily slow.
  if (waitForRender) {
    await page.waitForTimeout(3000);
  }
  
  const messages = await page.evaluate((currentPlatform) => {
    const result = [];
    const getMessageId = (element) => {
      // Do not use a generic ancestor id (for example, the application's root
      // element): that value is shared by every turn and would discard valid
      // messages as duplicates while a virtualized conversation is scrolling.
      const messageContainer = element.closest('[data-message-id]');
      if (messageContainer) {
        return messageContainer.getAttribute('data-message-id');
      }

      const turnContainer = element.closest('[data-testid^="conversation-turn-"]');
      return turnContainer ? turnContainer.getAttribute('data-testid') : null;
    };
    
    // Strategy 1: data-message-author-role (Standard ChatGPT UI)
    let nodes = document.querySelectorAll('[data-message-author-role]');
    if (nodes.length > 0) {
      nodes.forEach((el) => {
        const role = el.getAttribute('data-message-author-role');
        const contentEl = el.querySelector('.markdown') || el.querySelector('.whitespace-pre-wrap') || el;
        result.push({ role: role === 'user' ? 'user' : 'assistant', content: contentEl.innerHTML, id: getMessageId(el) });
      });
      return result;
    }

    // Strategy 2: data-testid="conversation-turn-..." (Alternative UI)
    nodes = document.querySelectorAll('[data-testid^="conversation-turn-"]');
    if (nodes.length > 0) {
      nodes.forEach((el) => {
        const testId = el.getAttribute('data-testid');
        const role = testId.includes('user') ? 'user' : 'assistant';
        const contentEl = el.querySelector('.markdown') || el.querySelector('.whitespace-pre-wrap') || el;
        result.push({ role, content: contentEl.innerHTML, id: getMessageId(el) });
      });
      return result;
    }

    // Strategy 3: article tags (Classic ChatGPT Share pages)
    nodes = document.querySelectorAll('article');
    if (nodes.length > 0) {
      nodes.forEach((el) => {
        // Assistant messages usually contain .markdown or .prose classes
        const isAssistant = el.querySelector('.markdown, .prose') !== null;
        const role = isAssistant ? 'assistant' : 'user';
        const contentEl = el.querySelector('.markdown, .prose') || el.querySelector('.whitespace-pre-wrap') || el.querySelector('.text-base') || el;
        
        // Exclude empty articles or purely structural articles
        if (contentEl && contentEl.textContent.trim().length > 0) {
          result.push({ role, content: contentEl.innerHTML, id: getMessageId(el) });
        }
      });
      
      if (result.length > 0) return result;
    }

    // Strategy 4: Fallback based on markdown elements. This is ChatGPT-specific:
    // on other platforms it would incorrectly label every markdown node as AI.
    const markdownNodes = document.querySelectorAll('.markdown, .prose');
    if (currentPlatform === 'chatgpt' && markdownNodes.length > 0) {
      // Just extract assistant responses as a last resort
      markdownNodes.forEach((node) => {
        result.push({ role: 'assistant', content: node.innerHTML, id: getMessageId(node) });
      });
      return result;
    }

    // Strategy 5: Shared-chat fallbacks used by Claude, Gemini, and DeepSeek.
    // These platforms expose different container names, but preserve a role in
    // test IDs, data attributes, or class names on each rendered turn.
    const platformSelectors = {
      claude: '[data-testid*="message"], [data-testid*="chat"], [class*="message"]',
      gemini: '[data-message-id], [data-testid*="message"], [class*="conversation-turn"], [class*="message"]',
      deepseek: '[data-message-id], [data-testid*="message"], [class*="message"]'
    };
    const selector = platformSelectors[currentPlatform];
    if (selector) {
      const seen = new Set();
      document.querySelectorAll(selector).forEach((el) => {
        const contentEl = el.querySelector('.markdown, .prose, [class*="markdown"], [class*="message-content"], .whitespace-pre-wrap') || el;
        const text = contentEl.textContent.trim();
        const roleSource = [
          el.getAttribute('data-message-author-role'),
          el.getAttribute('data-testid'),
          el.getAttribute('class'),
          el.getAttribute('aria-label')
        ].filter(Boolean).join(' ').toLowerCase();

        if (!text || !/(user|human|assistant|model|bot|ai)/.test(roleSource)) return;

        const role = /(user|human)/.test(roleSource) ? 'user' : 'assistant';
        const signature = `${role}\u0000${contentEl.innerHTML}`;
        if (!seen.has(signature)) {
          seen.add(signature);
          result.push({ role, content: contentEl.innerHTML, id: getMessageId(el) });
        }
      });

      if (result.length > 0) return result;
    }

    return result;
  }, platform);

  if (messages.length === 0) {
    throw new Error('EMPTY_CONVERSATION');
  }

  return messages;
};
