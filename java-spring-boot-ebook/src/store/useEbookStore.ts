import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Chapter } from '../types'

interface EbookState {
  // Navigation
  currentChapterId: string | null
  setCurrentChapter: (id: string) => void
  goToNextChapter: (chapters: Chapter[]) => void
  goToPreviousChapter: (chapters: Chapter[]) => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // UI
  isDarkMode: boolean
  sidebarOpen: boolean
  toggleDarkMode: () => void
  toggleSidebar: () => void

  // Bookmarks
  bookmarks: Set<string>
  toggleBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean
  getBookmarkCount: () => number

  // Progress tracking
  readChapters: Set<string>
  markChapterAsRead: (id: string) => void
  getReadProgress: (totalChapters: number) => number

  // Initialize with chapters
  setInitialChapter: (chapters: Chapter[]) => void
}

export const useEbookStore = create<EbookState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentChapterId: null,
      setCurrentChapter: (id: string) => set({ currentChapterId: id }),

      goToNextChapter: (chapters: Chapter[]) => {
        const currentId = get().currentChapterId
        if (!currentId) return

        const currentIndex = chapters.findIndex(c => c.id === currentId)
        if (currentIndex < chapters.length - 1) {
          set({ currentChapterId: chapters[currentIndex + 1].id })
        }
      },

      goToPreviousChapter: (chapters: Chapter[]) => {
        const currentId = get().currentChapterId
        if (!currentId) return

        const currentIndex = chapters.findIndex(c => c.id === currentId)
        if (currentIndex > 0) {
          set({ currentChapterId: chapters[currentIndex - 1].id })
        }
      },

      // Search
      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query }),

      // UI
      isDarkMode: false,
      sidebarOpen: true,
      toggleDarkMode: () => {
        set(state => {
          const newIsDark = !state.isDarkMode
          if (typeof document !== 'undefined') {
            if (newIsDark) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
          return { isDarkMode: newIsDark }
        })
      },
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

      // Bookmarks
      bookmarks: new Set(),
      toggleBookmark: (id: string) => {
        set(state => {
          const newBookmarks = new Set(state.bookmarks)
          if (newBookmarks.has(id)) {
            newBookmarks.delete(id)
          } else {
            newBookmarks.add(id)
          }
          return { bookmarks: newBookmarks }
        })
      },
      isBookmarked: (id: string) => get().bookmarks.has(id),
      getBookmarkCount: () => get().bookmarks.size,

      // Progress tracking
      readChapters: new Set(),
      markChapterAsRead: (id: string) => {
        set(state => {
          const newReadChapters = new Set(state.readChapters)
          newReadChapters.add(id)
          return { readChapters: newReadChapters }
        })
      },
      getReadProgress: (totalChapters: number) => {
        const readCount = get().readChapters.size
        return Math.round((readCount / totalChapters) * 100)
      },

      // Initialize
      setInitialChapter: (chapters: Chapter[]) => {
        if (chapters.length > 0 && !get().currentChapterId) {
          set({ currentChapterId: chapters[0].id })
        }
      },
    }),
    {
      name: 'ebook-store',
      partialize: (state) => ({
        currentChapterId: state.currentChapterId,
        isDarkMode: state.isDarkMode,
        sidebarOpen: state.sidebarOpen,
        bookmarks: Array.from(state.bookmarks), // Convert Set to Array for storage
        readChapters: Array.from(state.readChapters),
      }),
      merge: (persistedState: unknown, currentState: EbookState): EbookState => {
        const state = persistedState as Partial<EbookState> & { bookmarks?: unknown[]; readChapters?: unknown[] }
        return {
          ...currentState,
          ...state,
          bookmarks: new Set((state?.bookmarks || []) as string[]),
          readChapters: new Set((state?.readChapters || []) as string[]),
        }
      },
    }
  )
)
