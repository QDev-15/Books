import type { Section } from '../../types'

interface SectionListProps {
  sections: Section[]
  chapterId: string
}

// Same slugify function as markdown.ts to ensure consistency
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, '--') // Em-dash/en-dash → 2 dashes
    .split('')
    .map(char => {
      const code = char.charCodeAt(0)
      if ((code >= 48 && code <= 57) || // 0-9
          (code >= 97 && code <= 122) || // a-z
          (code >= 65 && code <= 90) || // A-Z
          code >= 192 || // Unicode (Vietnamese)
          char === ' ' || char === '-') {
        return char
      }
      return '-'
    })
    .join('')
    .replace(/\s+/g, '-') // Spaces → dashes
    .replace(/-{3,}/g, '--') // Multiple dashes → 2 max
    .replace(/^-+|-+$/g, '') // Trim edges
}

export const SectionList: React.FC<SectionListProps> = ({ sections, chapterId: _chapterId }) => {
  if (sections.length === 0) return null

  return (
    <div className="pl-6 space-y-1 mt-1">
      {sections.map(section => {
        // Generate slug from title using same logic as markdown.ts
        const sectionSlug = slugify(section.title)
        const href = `#${sectionSlug}`

        return (
          <a
            key={section.id}
            href={href}
            className="block text-xs px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors truncate"
            title={section.title}
          >
            └ {section.title}
          </a>
        )
      })}
    </div>
  )
}
