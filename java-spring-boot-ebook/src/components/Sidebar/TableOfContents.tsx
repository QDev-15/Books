import { ChevronDown, Bookmark } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useEbookStore } from '../../store/useEbookStore'
import { ebookService } from '../../services/ebookService'
import { SectionList } from './SectionList'
import type { Chapter } from '../../types'

interface TableOfContentsProps {
  chapters: Chapter[]
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ chapters: _chapters }) => {
  // Get tiers from service (centralized)
  const tiers = useMemo(() => ebookService.getAllTiers(), [])

  // Initialize all tiers as expanded
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set(tiers))
  const { currentChapterId, setCurrentChapter, isBookmarked, getBookmarkCount } = useEbookStore()

  const toggleTier = (tier: number) => {
    const newTiers = new Set(expandedTiers)
    if (newTiers.has(tier)) {
      newTiers.delete(tier)
    } else {
      newTiers.add(tier)
    }
    setExpandedTiers(newTiers)
  }

  const getTierChapters = (tier: number) => {
    // Use service method (centralized)
    return ebookService.getChaptersByTier(tier)
  }

  const getTierTitle = (tier: number) => {
    // Use service method (centralized)
    return ebookService.getTierTitle(tier)
  }

  return (
    <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {tiers.map(tier => {
        const tierChapters = getTierChapters(tier)
        const isExpanded = expandedTiers.has(tier)
        const tierTitle = getTierTitle(tier)
        // Create slug from tier title for anchor link (e.g. "Tầng 1: Java Fundamentals" -> "tầng-1-java-fundamentals")
        const tierSlug = tierTitle.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

        return (
          <div key={tier} className="space-y-1">
            <a
              href={`#${tierSlug}`}
              onClick={() => toggleTier(tier)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors no-underline hover:no-underline"
              title={tierTitle}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
              />
              {tierTitle}
              {/* <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                {tierChapters.length}
              </span> */}
            </a>

            {isExpanded && (
              <div className="pl-2 space-y-1">
                {tierChapters.map(chapter => {
                  const isActive = chapter.id === currentChapterId
                  const chapterBookmarked = isBookmarked(chapter.id)

                  return (
                    <div key={chapter.id}>
                      <button
                        onClick={() => setCurrentChapter(chapter.id)}
                        className={`w-full flex items-start gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                          isActive
                            ? 'active-chapter'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-500 mt-0.5">
                          {chapter.number}
                        </span>
                        <span className="flex-1 truncate">{chapter.title}</span>
                        {chapterBookmarked && (
                          <Bookmark className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" />
                        )}
                      </button>
                      {isActive && <SectionList sections={chapter.sections} chapterId={chapter.id} />}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Bookmark Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 px-3">
          📌 Bookmarks: {getBookmarkCount()} chapters
        </p>
      </div>
    </nav>
  )
}

export default TableOfContents
