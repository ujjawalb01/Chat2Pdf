import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);

/**
 * Validates a URL to prevent SSRF and ensure it's a supported platform.
 * @param {string} urlString 
 * @returns {Promise<boolean>}
 */
export const validateUrl = async (urlString) => {
  try {
    const url = new URL(urlString);

    // 1. Check Protocol
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error('Unsupported protocol. Only HTTP and HTTPS are allowed.');
    }

    // 2. Check Hostname Allowlist (for now just general checks, can be restrictive)
    const allowedDomains = [
      'chatgpt.com',
      'chat.openai.com',
      'claude.ai',
      'gemini.google.com',
      'chat.deepseek.com'
    ];

    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      throw new Error(`Unsupported domain. Allowed domains: ${allowedDomains.join(', ')}`);
    }

    // 3. Prevent SSRF (Private IPs, Localhost, Link-local)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1' || url.hostname === '0.0.0.0') {
      throw new Error('Localhost/Loopback addresses are not allowed.');
    }

    // Resolve DNS
    const { address } = await lookup(url.hostname);

    // Check for private ranges
    const isPrivate = isPrivateIP(address);
    if (isPrivate) {
      throw new Error('URL resolves to a private IP address, which is not allowed.');
    }

    return true;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      throw new Error('Domain not found.');
    }
    throw error;
  }
};

const isPrivateIP = (ip) => {
  // Check IPv4 private and reserved ranges
  const parts = ip.split('.');
  if (parts.length === 4) {
    const [p1, p2] = parts.map(Number);
    if (
      p1 === 10 || // 10.0.0.0/8
      (p1 === 172 && p2 >= 16 && p2 <= 31) || // 172.16.0.0/12
      (p1 === 192 && p2 === 168) || // 192.168.0.0/16
      p1 === 127 || // Loopback
      p1 === 169 && p2 === 254 // Link-local
    ) {
      return true;
    }
  }
  // Simplified IPv6 check for localhost/private (fe80::/10, fc00::/7, ::1)
  if (ip === '::1' || ip.toLowerCase().startsWith('fe8') || ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) {
    return true;
  }
  return false;
};
