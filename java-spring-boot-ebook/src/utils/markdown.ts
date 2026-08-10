import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    // Simple code block rendering without Prism
    // This prevents dependency issues while still providing good formatting
    const escaped = escapeHtml(str)
    const langClass = lang ? ` class="language-${lang}"` : ''
    return `<pre class="code-block"><code${langClass}>${escaped}</code></pre>`
  },
})

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
