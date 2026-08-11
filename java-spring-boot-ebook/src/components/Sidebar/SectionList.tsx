import type { Section } from '../../types'

interface SectionListProps {
  sections: Section[]
  chapterId: string
}

// Convert text to slug (same as markdown.ts)
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

export const SectionList: React.FC<SectionListProps> = ({ sections, chapterId: _chapterId }) => {
  if (sections.length === 0) return null

  return (
    <div className="pl-6 space-y-1 mt-1">
      {sections.map(section => {
        const sectionId = slugify(section.title)
        const href = `#${sectionId}`

        return (
          <a
            key={section.id}
            href={href}
            className="block text-xs px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors truncate"
          >
            └ {section.title}
          </a>
        )
      })}
    </div>
  )
}
