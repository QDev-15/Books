import { X, BookOpen } from 'lucide-react'
import { useEbookStore } from '../../store/useEbookStore'
import { ebookService } from '../../services/ebookService'
import { SearchBar } from './SearchBar'
import { TableOfContents } from './TableOfContents'
import type { Chapter } from '../../types'

interface SidebarProps {
  chapters: Chapter[]
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ chapters, isOpen, onClose }) => {
  const { getReadProgress } = useEbookStore()
  const totalChapters = ebookService.getTotalChapters()
  const progress = getReadProgress(totalChapters)

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 z-40 md:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-gray-900 dark:text-white flex-1">Mục Lục</h2>
          </div>

          {/* Book Info */}
          <div className="hidden md:flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Java Spring Boot</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cơ Bản → Nâng Cao</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Table of Contents */}
        <TableOfContents chapters={chapters} />

        {/* Footer Stats */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">Chapters</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{totalChapters}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">Tiers</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{ebookService.getAllTiers().length}</p>
            </div>
          </div>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            💡 Use arrow keys or swipe to navigate
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
