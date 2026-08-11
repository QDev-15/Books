import MarkdownIt from 'markdown-it'

// Slugify helper - convert "Class và Object" to "class-và-object" (keep diacritics)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, (char) => {
      // Keep unicode word chars and dashes, convert others to dash
      return /[\w-]/.test(char) ? char : '-'
    })
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
