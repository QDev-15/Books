import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Chapter, SearchResult } from '../types'

export const useSearch = (chapters: Chapter[], query: string): SearchResult[] => {
  return useMemo(() => {
    if (!query.trim()) return []

    const fuse = new Fuse(chapters, {
      keys: ['title', 'content', 'keywords'],
      threshold: 0.3,
      includeScore: true,
      minMatchCharLength: 2,
    })

    const searchResults = fuse.search(query)

    return searchResults.map(result => {
      const chapter = result.item
      const snippet = chapter.content.substring(0, 200) + '...'
      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        snippet,
        matchedText: query,
      }
    })
  }, [chapters, query])
}
