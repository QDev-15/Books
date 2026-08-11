import type { Section } from '../../types'

interface SectionListProps {
  sections: Section[]
  chapterId: string
}

export const SectionList: React.FC<SectionListProps> = ({ sections, chapterId: _chapterId }) => {
  if (sections.length === 0) return null

  return (
    <div className="pl-6 space-y-1 mt-1">
      {sections.map(section => {
        // Use slug from section data if available, otherwise fallback to title
        const sectionSlug = section.slug || section.title
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
