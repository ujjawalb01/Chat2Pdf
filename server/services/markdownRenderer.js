import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true
});

/**
 * Renders normalized conversation messages into sanitized HTML.
 * @param {Array} messages - { role, content }
 * @returns {Array} - messages with content as HTML
 */
export const renderMessages = (messages) => {
  return messages.map(msg => {
    // Some extractors might already return HTML depending on the platform structure
    // If it's pure markdown, we parse it. If it's already HTML (like ChatGPT sometimes), 
    // we should still sanitize it. If we want to be safe and the extractor returns raw HTML that represents markdown,
    // we should sanitize it directly or convert to markdown first.
    // For this architecture, we assume 'content' might be raw text or HTML that needs to be sanitized.
    
    // Convert to markdown if it's plain text (if extractor returns pure markdown text).
    // Note: If ChatGPT extractor grabs raw HTML, marked might not do anything to HTML tags,
    // but DOMPurify will sanitize them.
    let rawHtml = msg.content;
    
    // A heuristic: if it doesn't look like HTML at all, run marked. 
    // If it does, maybe it's already rendered by the platform. We'll run marked anyway, 
    // it passes HTML through.
    rawHtml = marked.parse(msg.content);

    // Sanitize
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true, svg: true },
      ADD_TAGS: ['iframe', 'img', 'svg', 'path', 'rect', 'circle', 'line', 'polygon', 'polyline', 'text', 'g'],
      ADD_ATTR: ['target', 'src', 'alt', 'width', 'height', 'srcset', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'class']
    });

    return {
      role: msg.role,
      content: cleanHtml
    };
  });
};
