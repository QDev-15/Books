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
  slug: string  // Used for anchor links
  level?: number
}

export interface TableOfContentsItem {
  tier: number
  tierTitle: string
  chapters: Chapter[]
}

export interface EbookData {
  chapters?: Chapter[] // Old format (monolithic)
  tiers?: Array<{ // New format (modular)
    id: string
    number: number
    name: string
    slug: string
    metadataFile: string
    chapters: Array<{
      id: string
      number: number
      title: string
      slug: string
      dataFile: string
    }>
  }>
  tableOfContents?: TableOfContentsItem[]
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
