// Simple markdown to HTML renderer (no dependencies)
export function renderMarkdown(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => 
      `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<div class="checkbox checked">✅ $1</div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="checkbox">⬜ $1</div>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines within content
    .replace(/\n/g, '<br />');

  // Wrap lists
  html = html.replace(/((?:<li>.*?<\/li><br \/>?)+)/g, '<ul>$1</ul>');
  html = html.replace(/<ul>([\s\S]*?)<\/ul>/g, (_m, inner) =>
    '<ul>' + inner.replace(/<br \/>/g, '') + '</ul>');

  return `<div class="markdown-body"><p>${html}</p></div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Extract a plain-text snippet with search term highlighted
export function extractSnippet(content: string, query: string, maxLen = 200): string {
  const lower = content.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? "…" : "");

  const start = Math.max(0, idx - 80);
  const end = Math.min(content.length, idx + query.length + 80);
  let snippet = (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
  return snippet;
}
