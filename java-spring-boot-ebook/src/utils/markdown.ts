import MarkdownIt from 'markdown-it'

// Slugify helper - convert "Phần 0 — Tại Sao" to "phần-0--tại-sao" (keep vietnamese diacritics)
// Em-dash (—) becomes 2 dashes (--) to match HTML format
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, '--') // Em-dash/en-dash → 2 dashes (-- format)
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      // Keep ASCII alphanumeric, unicode letters (Vietnamese), spaces, dashes
      if ((code >= 48 && code <= 57) || // 0-9
          (code >= 97 && code <= 122) || // a-z
          (code >= 65 && code <= 90) || // A-Z (already lowercased)
          code >= 192 || // Unicode chars (Vietnamese diacritics)
          char === ' ' || char === '-') {
        return char
      }
      return '-' // Convert special chars to dash
    })
    .join('')
    .replace(/\s+/g, '-') // Replace spaces with dash
    .replace(/-{3,}/g, '--') // Multiple dashes → 2 dashes max
    .replace(/^-+|-+$/g, '') // Trim dashes from start/end
}

const md = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    // Simple code block rendering without Prism
    // This prevents dependency issues while still providing good formatting
    const escaped = escapeHtml(str)
    const langClass = lang ? ` class="language-${lang}"` : ''
    return `<pre class="code-block"><code${langClass}>${escaped}</code></pre>`
  },
})

// Add anchor IDs to headers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
md.renderer.rules.heading_open = function (tokens: any[], idx: number) {
  const token = tokens[idx]
  const headingToken = tokens[idx + 1]

  if (headingToken && headingToken.type === 'inline' && headingToken.content) {
    const id = slugify(headingToken.content)
    return `<${token.tag} id="${id}">`
  }

  return md.renderer.renderToken(tokens, idx, {})
}

function escapeHtml(text: string): string {
  if (typeof document === 'undefined') {
    // Server-side fallback
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const renderMarkdown = (content: string): string => {
  return md.render(content)
}

export const extractTextContent = (html: string): string => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}
