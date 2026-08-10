import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEbookStore } from '../../store/useEbookStore'
import type { Chapter } from '../../types'

interface PaginationProps {
  chapters: Chapter[]
  currentChapter: Chapter | null
}

export const Pagination: React.FC<PaginationProps> = ({ chapters, currentChapter }) => {
  const { goToNextChapter, goToPreviousChapter, getReadProgress } = useEbookStore()

  if (!currentChapter) return null

  const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === chapters.length - 1
  const progress = getReadProgress(chapters.length)

  const handlePrevious = () => {
    if (!isFirst) goToPreviousChapter(chapters)
  }

  const handleNext = () => {
    if (!isLast) goToNextChapter(chapters)
  }

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6 mt-12">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} of {chapters.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 justify-between">
        <button
          onClick={handlePrevious}
          disabled={isFirst}
          aria-label={`Go to previous chapter: ${currentIndex > 0 ? chapters[currentIndex - 1].title : 'N/A'}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="text-center flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chapter {currentIndex + 1}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">
            Tier {currentChapter.tier}
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={isLast}
          aria-label={`Go to next chapter: ${currentIndex < chapters.length - 1 ? chapters[currentIndex + 1].title : 'N/A'}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Hint */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Use arrow keys (← →) or swipe to navigate
      </p>
    </div>
  )
}

export default Pagination
