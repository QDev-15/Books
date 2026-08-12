import { useEbookStore } from '../../store/useEbookStore'
import type { Section } from '../../types'

interface SectionListProps {
  sections: Section[]
  chapterId: string
  activeSection?: string
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

export const SectionList: React.FC<SectionListProps> = ({ sections, chapterId, activeSection = '' }) => {
  const { currentChapterId, setCurrentChapter } = useEbookStore()

  if (sections.length === 0) return null

  const handleSectionClick = (sectionSlug: string) => {
    // If viewing different chapter, switch to this chapter first
    if (currentChapterId !== chapterId) {
      setCurrentChapter(chapterId)
    }
    // Set hash will trigger scroll via useHashScroll
    window.location.hash = sectionSlug
  }

  return (
    <div className="pl-4 space-y-0 mt-1 border-l border-gray-300 dark:border-gray-700">
      {sections.map((section, idx) => {
        // Sinh slug từ tiêu đề sử dụng logic giống markdown.ts
        const sectionSlug = slugify(section.title)
        const isActive = activeSection === sectionSlug
        const isLast = idx === sections.length - 1
        const treeChar = isLast ? '└' : '├' // Dấu cuối hay giữa

        return (
          <a
            key={section.id}
            href={`#${sectionSlug}`}
            onClick={(e) => {
              e.preventDefault()
              handleSectionClick(sectionSlug)
            }}
            className={`flex items-center text-xs px-3 py-1.5 rounded transition-colors truncate relative ml-1 before:absolute before:left-0 before:text-gray-400 dark:before:text-gray-600 before:content-['${treeChar}'] ${
              isActive
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium before:text-blue-500 dark:before:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={section.title}
          >
            <span className="ml-2 truncate">{section.title}</span>
          </a>
        )
      })}
    </div>
  )
}
