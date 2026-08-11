import MarkdownIt from 'markdown-it'

// Slugify helper - convert "Phần 0 — Tại Sao" to "phần-0--tại-sao"
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special chars except dash
    .replace(/\s+/g, '-') // Replace spaces with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
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
