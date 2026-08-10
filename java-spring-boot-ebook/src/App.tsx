import { useEffect, useState } from 'react'
import { useEbookStore } from './store/useEbookStore'
import type { Chapter } from './types'
import Layout from './components/Layout'
import { ebookService } from './services/ebookService'

function App() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isDarkMode, setInitialChapter } = useEbookStore()

  useEffect(() => {
    // Load chapters from centralized service
    const allChapters = ebookService.getAllChapters()
    setChapters(allChapters)
    setInitialChapter(allChapters)
    setIsLoading(false)
  }, [setInitialChapter])

  useEffect(() => {
    // Apply dark mode to document on mount and when isDarkMode changes
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  // Initialize dark mode from localStorage on first mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ebook-store')
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme)
        if (parsed.state?.isDarkMode) {
          document.documentElement.classList.add('dark')
        }
      } catch (e) {
        console.error('Failed to parse theme from localStorage', e)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ebook...</p>
        </div>
      </div>
    )
  }

  return (
    <Layout chapters={chapters} />
  )
}

export default App
