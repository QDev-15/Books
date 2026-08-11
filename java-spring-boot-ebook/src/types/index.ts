export interface Chapter {
  id: string
  number: number
  title: string
  tier: number
  content: string
  slug: string
  sections: Section[]
  keywords: string[]
}

export interface Section {
  id: string
  title: string
  slug: string
  level?: number
}

export interface TableOfContentsItem {
  tier: number
  tierTitle: string
  chapters: Chapter[]
}

export interface EbookData {
  chapters: Chapter[]
  tableOfContents: TableOfContentsItem[]
  lastUpdated?: string
}

export interface SearchResult {
  chapterId: string
  chapterTitle: string
  sectionTitle?: string
  snippet: string
  matchedText: string
}

export interface BookmarkData {
  chapterId: string
  title: string
  addedAt: number
}

export interface ProgressData {
  lastReadChapterId: string | null
  readChapters: Set<string>
  totalProgress: number
  lastReadAt: number
}
