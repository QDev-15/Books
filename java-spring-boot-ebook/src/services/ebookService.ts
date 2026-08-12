import type { Chapter, EbookData, TableOfContentsItem } from '../types'
import ebookDataJson from '../data/chapters.json'
import { dataLoader, type TierMetadata } from '../utils/dataLoader'

class EbookService {
  private static instance: EbookService
  private ebookData: EbookData
  private loadedChapters: Map<string, Chapter> = new Map()

  private constructor() {
    this.ebookData = ebookDataJson as unknown as EbookData
  }

  static getInstance(): EbookService {
    if (!EbookService.instance) {
      EbookService.instance = new EbookService()
    }
    return EbookService.instance
  }

  /**
   * Get all chapters (flattened from tiers in navigation index)
   */
  getAllChapters(): Chapter[] {
    // Handle both old (chapters array) and new (tiers array) formats
    if ('chapters' in this.ebookData && Array.isArray((this.ebookData as any).chapters)) {
      return (this.ebookData as any).chapters
    }

    // New format: flatten tiers into chapters
    if ('tiers' in this.ebookData && Array.isArray((this.ebookData as any).tiers)) {
      const allChapters: any[] = []
      ;(this.ebookData as any).tiers.forEach((tier: any) => {
        if (tier.chapters && Array.isArray(tier.chapters)) {
          allChapters.push(
            ...tier.chapters.map((ch: any) => ({
              id: ch.id,
              number: ch.number,
              title: ch.title,
              tier: tier.number,
              slug: ch.slug,
              content: '', // Nội dung sẽ được tải theo yêu cầu
              sections: ch.sections || [], // Lấy sections từ navigation index
              keywords: [],
            }))
          )
        }
      })
      return allChapters
    }

    return []
  }

  /**
   * Get chapter by ID from navigation index (metadata only, no full content)
   */
  getChapterById(id: string): Chapter | undefined {
    const chapters = this.getAllChapters()
    return chapters.find(ch => ch.id === id)
  }

  /**
   * Get chapters by tier
   */
  getChaptersByTier(tier: number): Chapter[] {
    const chapters = this.getAllChapters()
    return chapters.filter(ch => ch.tier === tier)
  }

  /**
   * Get all unique tiers
   */
  getAllTiers(): number[] {
    const chapters = this.getAllChapters()
    const tiers = new Set(chapters.map(ch => ch.tier))
    return Array.from(tiers).sort((a, b) => a - b)
  }

  /**
   * Get tier title by tier number
   */
  getTierTitle(tier: number): string {
    const tierTitles: Record<number, string> = {
      1: 'Tầng 1: Java Fundamentals',
      2: 'Tầng 2: Spring Boot Basics',
      3: 'Tầng 3: REST & Data Access',
      4: 'Tầng 4: Security & Authentication',
      5: 'Tầng 5: Performance & Caching',
      6: 'Tầng 6: Testing & Quality',
      7: 'Tầng 7: APIs & Integration',
      8: 'Tầng 8: Microservices',
      9: 'Tầng 9: DevOps & Infrastructure',
      10: 'Tầng 10: Advanced Patterns',
    }
    return tierTitles[tier] || `Tầng ${tier}`
  }

  /**
   * Get total chapters count
   */
  getTotalChapters(): number {
    return this.getAllChapters().length
  }

  /**
   * Get next chapter
   */
  getNextChapter(currentId: string): Chapter | undefined {
    const chapters = this.getAllChapters()
    const currentIndex = chapters.findIndex(ch => ch.id === currentId)
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1]
    }
    return undefined
  }

  /**
   * Get previous chapter
   */
  getPreviousChapter(currentId: string): Chapter | undefined {
    const chapters = this.getAllChapters()
    const currentIndex = chapters.findIndex(ch => ch.id === currentId)
    if (currentIndex > 0) {
      return chapters[currentIndex - 1]
    }
    return undefined
  }

  /**
   * Get chapter index
   */
  getChapterIndex(id: string): number {
    return this.getAllChapters().findIndex(ch => ch.id === id)
  }

  /**
   * Search chapters by keyword
   */
  searchChapters(keyword: string): Chapter[] {
    const lowerKeyword = keyword.toLowerCase()
    const chapters = this.getAllChapters()
    return chapters.filter(ch =>
      ch.title.toLowerCase().includes(lowerKeyword) ||
      ch.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      ch.content.toLowerCase().includes(lowerKeyword)
    )
  }

  /**
   * Load full chapter content from modular JSON file (async)
   * Uses caching to avoid refetching the same chapter
   */
  async loadFullChapter(id: string): Promise<Chapter> {
    // Check in-memory cache first
    if (this.loadedChapters.has(id)) {
      return this.loadedChapters.get(id)!
    }

    // Get chapter metadata from index
    const chapter = this.getChapterById(id)
    if (!chapter) {
      throw new Error(`Chapter not found: ${id}`)
    }

    // Load full content from modular file
    const fullChapter = await dataLoader.loadChapter(chapter.tier, id, chapter.slug)

    // Cache loaded chapter
    this.loadedChapters.set(id, fullChapter)

    return fullChapter
  }

  /**
   * Load tier metadata (async)
   */
  async loadTierMetadata(tier: number): Promise<TierMetadata> {
    return dataLoader.loadTierMetadata(tier)
  }

  /**
   * Preload next chapter for better UX
   */
  async preloadNextChapter(currentId: string): Promise<void> {
    const next = this.getNextChapter(currentId)
    if (next) {
      await dataLoader.preloadChapter(next.tier, next.id, next.slug)
    }
  }

  /**
   * Clear chapter cache (useful on app reload)
   */
  clearChapterCache(): void {
    this.loadedChapters.clear()
    dataLoader.clearCache()
  }

  /**
   * Get table of contents
   */
  getTableOfContents(): TableOfContentsItem[] {
    const tiers = this.getAllTiers()
    return tiers.map(tier => ({
      tier,
      tierTitle: this.getTierTitle(tier),
      chapters: this.getChaptersByTier(tier),
    }))
  }
}

export const ebookService = EbookService.getInstance()
