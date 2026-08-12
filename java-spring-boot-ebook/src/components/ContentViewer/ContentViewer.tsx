import { Bookmark } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { useEbookStore } from '../../store/useEbookStore'
import { useKeyboard, useSwipe, useHashScroll } from '../../hooks'
import { renderMarkdown } from '../../utils'
import { Pagination } from './Pagination'
import { ebookService } from '../../services/ebookService'
import type { Chapter } from '../../types'

interface ContentViewerProps {
  chapters: Chapter[]
  currentChapter: Chapter | null
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ chapters, currentChapter }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { goToNextChapter, goToPreviousChapter, isBookmarked, toggleBookmark, markChapterAsRead } =
    useEbookStore()

  // Track full chapter content loading
  const [loadedChapter, setLoadedChapter] = useState<Chapter | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Setup keyboard navigation
  useKeyboard(chapters, () => goToNextChapter(chapters), () => goToPreviousChapter(chapters))

  // Setup swipe gestures
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => goToNextChapter(chapters),
    onSwipeRight: () => goToPreviousChapter(chapters),
  })

  // Setup hash-based anchor scrolling
  useHashScroll(containerRef)

  // Load full chapter content when chapter changes
  useEffect(() => {
    if (!currentChapter) {
      setLoadedChapter(null)
      setLoadError(null)
      return
    }

    // If content is already loaded (from old monolithic structure), use it
    if (currentChapter.content && currentChapter.content.length > 100) {
      setLoadedChapter(currentChapter)
      setLoadError(null)
      return
    }

    // Otherwise, load from modular JSON file
    setIsLoadingContent(true)
    setLoadError(null)

    ebookService.loadFullChapter(currentChapter.id)
      .then(fullChapter => {
        setLoadedChapter(fullChapter)
        setLoadError(null)
      })
      .catch(error => {
        console.error('Failed to load chapter:', error)
        setLoadError(`Failed to load chapter: ${error instanceof Error ? error.message : 'Unknown error'}`)
        // Fallback to chapter from index if loading fails
        setLoadedChapter(currentChapter)
      })
      .finally(() => {
        setIsLoadingContent(false)
      })
  }, [currentChapter?.id])

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
    if (!loadedChapter) return ''
    const html = renderMarkdown(loadedChapter.content)
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span'],
      ALLOWED_ATTR: ['class', 'href', 'title', 'id'],  // Allow 'id' for anchor links
    })
  }, [loadedChapter])

  if (!currentChapter) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500 dark:text-gray-400">Select a chapter to start reading</p>
      </div>
    )
  }

  if (isLoadingContent) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading chapter content...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 mb-2">⚠️ Error loading chapter</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{loadError}</p>
        </div>
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
          {currentChapter.keywords && currentChapter.keywords.length > 0 && (
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
