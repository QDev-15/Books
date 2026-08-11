import type { Chapter, EbookData, TableOfContentsItem } from '../types'
import ebookDataJson from '../data/chapters.json'

class EbookService {
  private static instance: EbookService
  private ebookData: EbookData

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
   * Get all chapters
   */
  getAllChapters(): Chapter[] {
    return this.ebookData.chapters
  }

  /**
   * Get chapter by ID
   */
  getChapterById(id: string): Chapter | undefined {
    return this.ebookData.chapters.find(ch => ch.id === id)
  }

  /**
   * Get chapters by tier
   */
  getChaptersByTier(tier: number): Chapter[] {
    return this.ebookData.chapters.filter(ch => ch.tier === tier)
  }

  /**
   * Get all unique tiers
   */
  getAllTiers(): number[] {
    const tiers = new Set(this.ebookData.chapters.map(ch => ch.tier))
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
    return this.ebookData.chapters.length
  }

  /**
   * Get next chapter
   */
  getNextChapter(currentId: string): Chapter | undefined {
    const currentIndex = this.ebookData.chapters.findIndex(ch => ch.id === currentId)
    if (currentIndex >= 0 && currentIndex < this.ebookData.chapters.length - 1) {
      return this.ebookData.chapters[currentIndex + 1]
    }
    return undefined
  }

  /**
   * Get previous chapter
   */
  getPreviousChapter(currentId: string): Chapter | undefined {
    const currentIndex = this.ebookData.chapters.findIndex(ch => ch.id === currentId)
    if (currentIndex > 0) {
      return this.ebookData.chapters[currentIndex - 1]
    }
    return undefined
  }

  /**
   * Get chapter index
   */
  getChapterIndex(id: string): number {
    return this.ebookData.chapters.findIndex(ch => ch.id === id)
  }

  /**
   * Search chapters by keyword
   */
  searchChapters(keyword: string): Chapter[] {
    const lowerKeyword = keyword.toLowerCase()
    return this.ebookData.chapters.filter(ch =>
      ch.title.toLowerCase().includes(lowerKeyword) ||
      ch.keywords.some(k => k.toLowerCase().includes(lowerKeyword)) ||
      ch.content.toLowerCase().includes(lowerKeyword)
    )
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
