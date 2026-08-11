import { Bookmark } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useEbookStore } from '../../store/useEbookStore'
import { useKeyboard, useSwipe, useHashScroll } from '../../hooks'
import { renderMarkdown } from '../../utils'
import { Pagination } from './Pagination'
import type { Chapter } from '../../types'

interface ContentViewerProps {
  chapters: Chapter[]
  currentChapter: Chapter | null
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ chapters, currentChapter }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { goToNextChapter, goToPreviousChapter, isBookmarked, toggleBookmark, markChapterAsRead } =
    useEbookStore()

  // Setup keyboard navigation
  useKeyboard(chapters, () => goToNextChapter(chapters), () => goToPreviousChapter(chapters))

  // Setup swipe gestures
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => goToNextChapter(chapters),
    onSwipeRight: () => goToPreviousChapter(chapters),
  })

  // Setup hash-based anchor scrolling
  useHashScroll(containerRef)

  // Scroll to top when chapter changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentChapter?.id])

  // Mark chapter as read when viewed
  useEffect(() => {
    if (currentChapter) {
      markChapterAsRead(currentChapter.id)
    }
  }, [currentChapter, markChapterAsRead])

  // Memoize sanitized HTML to prevent unnecessary re-renders (before early return)
  const sanitizedHtml = useMemo(() => {
    if (!currentChapter) return ''
    const html = renderMarkdown(currentChapter.content)
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span'],
      ALLOWED_ATTR: ['class', 'href', 'title', 'id'],  // Allow 'id' for anchor links
    })

    // Debug: log headings with IDs
    if (typeof window !== 'undefined') {
      const headings = sanitized.match(/<h[1-6][^>]*id="[^"]*"[^>]*>/g)
      if (headings?.length) {
        console.log(`[Chapter ${currentChapter.number}] Found ${headings.length} headings with IDs:`)
        headings.slice(0, 5).forEach(h => console.log(`  ${h}`))
      }
    }

    return sanitized
  }, [currentChapter])

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Select a chapter to start reading</p>
      </div>
    )
  }

  const bookmarked = isBookmarked(currentChapter.id)

  return (
    <div {...swipeHandlers} ref={containerRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
        {/* Chapter Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                Chapter {currentChapter.number} • Tier {currentChapter.tier}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {currentChapter.title}
              </h1>
            </div>
            <button
              onClick={() => toggleBookmark(currentChapter.id)}
              className={`flex-shrink-0 p-3 rounded-lg transition-colors ${
                bookmarked
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className="w-6 h-6" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Keywords */}
          {currentChapter.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentChapter.keywords.map(keyword => (
                <span
                  key={keyword}
                  className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="markdown-content prose-lg"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {/* Pagination */}
        <Pagination chapters={chapters} currentChapter={currentChapter} />
      </article>
    </div>
  )
}

export default ContentViewer
