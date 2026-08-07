/**
 * Detects the AI platform from a given public share URL.
 * @param {string} urlString 
 * @returns {string} - 'chatgpt', 'claude', 'gemini', 'deepseek', or 'unknown'
 */
export const detectPlatform = (urlString) => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') {
      return 'chatgpt';
    }
    
    if (hostname === 'claude.ai') {
      return 'claude';
    }

    if (hostname === 'gemini.google.com') {
      return 'gemini';
    }

    if (hostname === 'chat.deepseek.com') {
      return 'deepseek';
    }

    return 'unknown';
  } catch (err) {
    return 'unknown';
  }
};
