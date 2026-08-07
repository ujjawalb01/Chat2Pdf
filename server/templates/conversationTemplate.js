export const generateHtmlTemplate = (conversation, renderedMessages) => {
  const { title, platform, extractedAt } = conversation;
  const dateStr = new Date(extractedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const timeStr = new Date(extractedAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const userMessages = renderedMessages.filter(m => m.role === 'user').length;
  const aiMessages = renderedMessages.filter(m => m.role !== 'user').length;
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  const messagesHtml = renderedMessages.map((msg, index) => {
    const isUser = msg.role === 'user';
    const roleLabel = isUser ? 'You' : platformLabel;
    const avatarLetter = isUser ? 'U' : 'AI';
    const containerClass = isUser ? 'message-user' : 'message-assistant';
    return `
      <div class="message ${containerClass}">
        <div class="message-header">
          <div class="avatar ${isUser ? 'avatar-user' : 'avatar-assistant'}">${avatarLetter}</div>
          <div class="message-role">${roleLabel}</div>
          <div class="message-turn">Turn ${Math.ceil((index + 1) / 2)}</div>
        </div>
        <div class="message-content">${msg.content}</div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13.5px;
    line-height: 1.75;
    color: #1e1e2e;
    background: #fff;
  }

  /* First page (cover) has zero margins — full bleed */
  @page { size: A4; margin: 18mm 18mm 22mm; }
  @page :first { margin: 0; }

  /* ── COVER PAGE ── */
  .cover {
    width: 210mm;    /* exact A4 width */
    height: 297mm;   /* exact A4 height — prevents blank overflow page */
    background: linear-gradient(145deg, #0f0f1a 0%, #1a1040 50%, #0d1b2a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 70px;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 80%, rgba(16,185,129,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  .cover-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 22px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cover-eyebrow::before {
    content: '';
    display: inline-block;
    width: 32px; height: 2px;
    background: #6366f1;
    border-radius: 2px;
  }
  .cover-title {
    font-size: 36px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 28px;
    max-width: 480px;
    position: relative;
  }
  .cover-divider {
    width: 60px; height: 3px;
    background: linear-gradient(90deg, #6366f1, #10b981);
    border-radius: 3px;
    margin-bottom: 32px;
    position: relative;
  }
  .cover-stats {
    display: flex;
    gap: 36px;
    margin-bottom: 50px;
    position: relative;
  }
  .cover-stat {
    text-align: left;
  }
  .cover-stat-number {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
  }
  .cover-stat-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 4px;
  }
  .cover-meta {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cover-meta-item {
    font-size: 12px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cover-meta-dot {
    width: 5px; height: 5px;
    background: #6366f1;
    border-radius: 50%;
  }
  .cover-badge {
    position: absolute;
    bottom: 60px; right: 70px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.12);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ── MAIN BODY WRAPPER ── */
  .main-body { padding: 32px 36px 0; }

  /* ── DOCUMENT HEADER (on page 2+) ── */
  .doc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    margin-bottom: 28px;
    border-bottom: 2px solid #e5e7eb;
  }
  .doc-header-title {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    max-width: 380px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .doc-header-right {
    font-size: 11px;
    color: #9ca3af;
    text-align: right;
  }

  /* ── MESSAGES ── */
  .message {
    margin-bottom: 22px;
    border-radius: 12px;
    overflow: visible;
    border: 1px solid #e5e7eb;
    break-inside: auto;
    page-break-inside: auto;
  }
  .message-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
  }
  .avatar {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800;
    letter-spacing: -0.5px;
    flex-shrink: 0;
  }
  .avatar-user { background: #eef2ff; color: #4f46e5; }
  .avatar-assistant { background: #ecfdf5; color: #059669; }
  .message-role { font-size: 12.5px; font-weight: 700; flex: 1; }
  .message-turn { font-size: 10px; color: #d1d5db; background: #f9fafb; border: 1px solid #e5e7eb; padding: 2px 7px; border-radius: 99px; font-weight: 500; }
  .message-content { padding: 14px 18px 18px; font-size: 13.5px; line-height: 1.75; color: #374151; }

  .message-user { border-color: #ddd6fe; }
  .message-user .message-header { background: #f5f3ff; border-bottom: 1px solid #ddd6fe; }
  .message-user .message-role { color: #4f46e5; }

  .message-assistant { border-color: #d1fae5; }
  .message-assistant .message-header { background: #f0fdf4; border-bottom: 1px solid #d1fae5; }
  .message-assistant .message-role { color: #059669; }

  /* ── TYPOGRAPHY ── */
  .message-content p { margin: 0 0 12px; }
  .message-content p:last-child { margin-bottom: 0; }
  .message-content h1 { font-size: 19px; font-weight: 800; color: #111827; margin: 22px 0 10px; padding-bottom: 7px; border-bottom: 2px solid #f3f4f6; break-after: avoid; }
  .message-content h2 { font-size: 16px; font-weight: 700; color: #1f2937; margin: 18px 0 8px; break-after: avoid; }
  .message-content h3 { font-size: 14.5px; font-weight: 600; color: #374151; margin: 14px 0 6px; break-after: avoid; }
  .message-content h4, .message-content h5, .message-content h6 { font-size: 13px; font-weight: 600; color: #4b5563; margin: 12px 0 5px; break-after: avoid; }
  .message-content strong { font-weight: 700; color: #111827; }
  .message-content em { font-style: italic; color: #4b5563; }
  .message-content a { color: #4f46e5; text-decoration: underline; text-underline-offset: 2px; }
  .message-content ul, .message-content ol { padding-left: 22px; margin: 6px 0 12px; }
  .message-content li { margin-bottom: 4px; break-inside: auto; }
  .message-content li > ul, .message-content li > ol { margin: 3px 0; }

  /* ── INLINE CODE ── */
  /* Strong amber pill to stand out clearly from prose text */
  .message-content :not(pre) > code {
    font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace !important;
    font-size: 11.5px !important;
    background: #fff7ed !important;
    color: #c2410c !important;
    padding: 2px 6px !important;
    border-radius: 5px !important;
    border: 1px solid #fdba74 !important;
    font-weight: 600 !important;
    letter-spacing: -0.2px !important;
    vertical-align: baseline !important;
    /* Visually distinct: slightly raised appearance */
    box-shadow: 0 1px 2px rgba(194,65,12,0.10) !important;
  }

  /* ── CODE BLOCKS (GitHub Dark — strong visual block) ── */
  .message-content pre {
    position: relative !important;
    background: #0d1117 !important;
    border-radius: 10px !important;
    /* Left accent bar to clearly mark this as a code section */
    border-left: 4px solid #58a6ff !important;
    border-top: 1px solid #21262d !important;
    border-right: 1px solid #21262d !important;
    border-bottom: 1px solid #21262d !important;
    margin: 18px 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
    box-shadow: 0 6px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04) !important;
  }
  /* Keep a normal snippet together. Snippets taller than a printable page are
     deliberately left breakable so no code is clipped or omitted. */
  .message-content pre.keep-together {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  /* macOS traffic lights header bar */
  .message-content pre::before {
    content: '' !important;
    display: block !important;
    background: #161b22 !important;
    height: 36px !important;
    border-bottom: 1px solid #21262d !important;
  }
  .message-content pre code {
    display: block !important;
    font-family: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace !important;
    font-size: 12.5px !important;
    line-height: 1.65 !important;
    color: #e6edf3 !important;
    background: transparent !important;
    border: none !important;
    padding: 16px 20px !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
    tab-size: 2 !important;
    -moz-tab-size: 2 !important;
    /* Override any ChatGPT color that might leak in */
    -webkit-text-fill-color: #e6edf3 !important;
  }

  /* Traffic light dots & lang label are injected by JS */
  .code-titlebar {
    position: absolute !important;
    top: 0; left: 0; right: 0;
    height: 36px !important;
    display: flex !important;
    align-items: center !important;
    padding: 0 14px !important;
    gap: 6px !important;
    z-index: 2 !important;
  }
  .traffic-dot {
    width: 11px; height: 11px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot-red   { background: #ff5f57; }
  .dot-yellow{ background: #febc2e; }
  .dot-green { background: #28c840; }
  .code-lang-tag {
    margin-left: auto !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    color: #7d8590 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.6px !important;
  }
  .line-numbers-wrapper {
    display: flex !important;
  }
  .line-numbers {
    background: #0d1117 !important;
    color: #3d4450 !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 12.5px !important;
    line-height: 1.65 !important;
    padding: 16px 14px 16px 10px !important;
    text-align: right !important;
    user-select: none !important;
    border-right: 1px solid #21262d !important;
    min-width: 40px !important;
    white-space: pre !important;
  }

  /* VS Code Dark+ Syntax */
  .message-content pre span { background: transparent !important; }
  .message-content pre .hljs-comment, .message-content pre [class*="comment"] { color: #8b949e !important; font-style: italic !important; }
  .message-content pre .hljs-keyword, .message-content pre [class*="keyword"], .message-content pre [class*="control-flow"] { color: #ff7b72 !important; font-weight: 600 !important; }
  .message-content pre .hljs-string, .message-content pre [class*="string"] { color: #a5d6ff !important; }
  .message-content pre .hljs-number, .message-content pre [class*="number"] { color: #79c0ff !important; }
  .message-content pre .hljs-variable, .message-content pre [class*="variable"] { color: #ffa657 !important; }
  .message-content pre .hljs-function, .message-content pre .hljs-title, .message-content pre [class*="function"] { color: #d2a8ff !important; }
  .message-content pre .hljs-type, .message-content pre [class*="class-name"] { color: #ffa657 !important; }
  .message-content pre .hljs-attr, .message-content pre .hljs-attribute { color: #79c0ff !important; }
  .message-content pre .hljs-built_in { color: #ffa657 !important; }
  .message-content pre .hljs-operator, .message-content pre [class*="operator"] { color: #ff7b72 !important; }
  .message-content pre .hljs-punctuation, .message-content pre [class*="punctuation"] { color: #e6edf3 !important; }
  .message-content pre .hljs-tag { color: #7ee787 !important; }
  .message-content pre .hljs-selector-tag { color: #7ee787 !important; }
  .message-content pre .hljs-literal { color: #79c0ff !important; }

  /* ── BLOCKQUOTE ── */
  .message-content blockquote {
    margin: 12px 0; padding: 12px 18px;
    border-left: 4px solid #6366f1;
    background: #fafaff;
    border-radius: 0 8px 8px 0;
    color: #6b7280;
    font-style: italic;
  }
  .message-content blockquote p { margin: 0; }

  /* ── CALLOUT / NOTE BOXES ── */
  .callout {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 8px;
    margin: 12px 0; break-inside: auto;
    font-size: 13px;
  }
  .callout-info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
  .callout-warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
  .callout-tip  { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
  .callout-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

  /* ── TABLES ── */
  .message-content table {
    width: 100%; border-collapse: collapse; margin: 14px 0;
    font-size: 12.5px; break-inside: auto; page-break-inside: auto;
  }
  .message-content table th {
    background: #f0f0ff; color: #1e1b4b; font-weight: 700;
    padding: 10px 14px; text-align: left;
    border-bottom: 2px solid #c7d2fe; border-right: 1px solid #e0e7ff;
  }
  .message-content table th:last-child { border-right: none; }
  .message-content table td {
    padding: 9px 14px; border-bottom: 1px solid #f3f4f6;
    border-right: 1px solid #f3f4f6; color: #374151; vertical-align: top;
  }
  .message-content table td:last-child { border-right: none; }
  .message-content table tr:last-child td { border-bottom: none; }
  .message-content table tr:nth-child(even) td { background: #f9fafb; }
  .message-content table { border: 1px solid #e5e7eb; border-radius: 8px; overflow: visible; }
  .message-content thead { display: table-header-group; }
  .message-content tr { break-inside: avoid; page-break-inside: avoid; }

  /* ── IMAGES ── */
  .message-content img {
    max-width: 100%; height: auto; display: block;
    margin: 16px auto; border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    break-inside: avoid; page-break-inside: avoid;
    max-height: 220mm; object-fit: contain;
  }

  /* ── HORIZONTAL RULE ── */
  .message-content hr { border: none; border-top: 2px solid #f3f4f6; margin: 20px 0; }
</style>
</head>
<body>

<!-- ═══════════════ COVER PAGE ═══════════════ -->
<div class="cover">
  <div class="cover-eyebrow">AI Conversation Export</div>
  <h1 class="cover-title">${title}</h1>
  <div class="cover-divider"></div>
  <div class="cover-stats">
    <div class="cover-stat">
      <div class="cover-stat-number">${conversation.messages.length}</div>
      <div class="cover-stat-label">Messages</div>
    </div>
    <div class="cover-stat">
      <div class="cover-stat-number">${userMessages}</div>
      <div class="cover-stat-label">From You</div>
    </div>
    <div class="cover-stat">
      <div class="cover-stat-number">${aiMessages}</div>
      <div class="cover-stat-label">AI Replies</div>
    </div>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-item"><div class="cover-meta-dot"></div>Platform: ${platformLabel}</div>
    <div class="cover-meta-item"><div class="cover-meta-dot"></div>Exported: ${dateStr} at ${timeStr}</div>
  </div>
  <div class="cover-badge">Chat2PDF</div>
</div>

<!-- ═══════════════ CONTENT PAGES ═══════════════ -->
<div class="main-body">
  <div class="doc-header">
    <div class="doc-header-title">📄 ${title}</div>
    <div class="doc-header-right">${platformLabel} · ${conversation.messages.length} messages</div>
  </div>
  <div class="content">${messagesHtml}</div>
</div>

<script>
(function() {
  // Language map for display names
  const langNames = {
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
    py: 'Python', python: 'Python', rb: 'Ruby', ruby: 'Ruby',
    java: 'Java', c: 'C', cpp: 'C++', cs: 'C#', go: 'Go', rs: 'Rust', rust: 'Rust',
    php: 'PHP', swift: 'Swift', kt: 'Kotlin', html: 'HTML', css: 'CSS',
    scss: 'SCSS', sql: 'SQL', sh: 'Shell', bash: 'Bash', json: 'JSON',
    yaml: 'YAML', yml: 'YAML', xml: 'XML', md: 'Markdown', jsx: 'JSX', tsx: 'TSX',
    plaintext: 'Text', text: 'Text'
  };

  document.querySelectorAll('pre').forEach(pre => {
    const codeEl = pre.querySelector('code');
    if (!codeEl) return;

    // Detect language
    const langClass = Array.from(codeEl.classList).find(c => c.startsWith('language-') || c.startsWith('hljs ') || c.startsWith('hljs-'));
    let lang = null;
    if (langClass) {
      lang = langClass.replace('language-', '').replace('hljs ', '').trim().split(' ')[0];
    }
    const displayLang = lang ? (langNames[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1)) : 'Code';

    // Inject macOS-style titlebar
    const titlebar = document.createElement('div');
    titlebar.className = 'code-titlebar';
    titlebar.innerHTML = \`
      <div class="traffic-dot dot-red"></div>
      <div class="traffic-dot dot-yellow"></div>
      <div class="traffic-dot dot-green"></div>
      <div class="code-lang-tag">\${displayLang}</div>
    \`;
    pre.appendChild(titlebar);

    // Inject line numbers
    const rawText = codeEl.textContent || '';
    const lineCount = rawText.split('\\n').length;
    const nums = Array.from({length: lineCount}, (_, i) => i + 1).join('\\n');

    const wrapper = document.createElement('div');
    wrapper.className = 'line-numbers-wrapper';
    const numDiv = document.createElement('div');
    numDiv.className = 'line-numbers';
    numDiv.textContent = nums;

    // Clone code and place in wrapper
    const codeClone = codeEl.cloneNode(true);
    wrapper.appendChild(numDiv);
    wrapper.appendChild(codeClone);

    // Clear pre and re-add
    pre.innerHTML = '';
    pre.appendChild(titlebar);
    pre.appendChild(wrapper);

    // Keep a complete code snippet on one page when it fits. A larger snippet
    // must be allowed to continue, otherwise Chromium clips the overflow.
    if (pre.getBoundingClientRect().height <= 880) {
      pre.classList.add('keep-together');
    }
  });
})();
</script>
</body>
</html>`;
};
