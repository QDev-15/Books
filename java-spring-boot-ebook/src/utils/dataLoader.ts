/**
 * DataLoader: Handles dynamic loading of chapter and tier data from modular JSON files
 * Implements LRU caching to avoid duplicate fetches
 */

import type { Chapter } from '../types'

export interface TierMetadata {
  id: string
  number: number
  name: string
  description: string
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  chapters: number
}

export class DataLoader {
  private static instance: DataLoader
  private cache: Map<string, Chapter | TierMetadata> = new Map()
  private maxCacheSize = 20 // LRU cache size

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader()
    }
    return DataLoader.instance
  }

  /**
   * Load a single chapter from its JSON file
   */
  async loadChapter(tierId: number, chapterId: string, chapterSlug?: string): Promise<Chapter> {
    const cacheKey = `chap-${tierId}-${chapterId}`

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached && 'content' in cached) {
        return cached as Chapter
      }
    }

    try {
      // Use provided slug or default to chapterId if slug not provided
      const slug = chapterSlug || chapterId

      // Construct path to chapter JSON file
      // Files are stored as: /data/sources/tier-1/chapter-slug/chapter-slug.json
      const filePath = `/data/sources/tier-${tierId}/${slug}/${slug}.json`

      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to load chapter: ${response.status} ${response.statusText}`)
      }

      const chapterData = await response.json() as Chapter

      // Store in cache with LRU eviction
      this.setCache(cacheKey, chapterData)

      return chapterData
    } catch (error) {
      console.error(`Error loading chapter ${chapterId}:`, error)
      throw error
    }
  }

  /**
   * Load tier metadata from tier.json
   */
  async loadTierMetadata(tierId: number): Promise<TierMetadata> {
    const cacheKey = `tier-meta-${tierId}`

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (cached && 'estimatedTime' in cached) {
        return cached as TierMetadata
      }
    }

    try {
      const filePath = `/data/sources/tier-${tierId}/tier.json`

      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to load tier metadata: ${response.status}`)
      }

      const tierData = await response.json() as TierMetadata

      // Store in cache
      this.setCache(cacheKey, tierData)

      return tierData
    } catch (error) {
      console.error(`Error loading tier ${tierId} metadata:`, error)
      throw error
    }
  }

  /**
   * Load multiple chapters in parallel
   */
  async loadChapters(chapters: Array<{ tierId: number; chapterId: string }>): Promise<Chapter[]> {
    const promises = chapters.map(ch => this.loadChapter(ch.tierId, ch.chapterId))
    return Promise.all(promises)
  }

  /**
   * Preload next chapter to improve perceived performance
   */
  async preloadChapter(tierId: number, chapterId: string, chapterSlug?: string): Promise<void> {
    const cacheKey = `chap-${tierId}-${chapterId}`

    // Only preload if not already cached
    if (!this.cache.has(cacheKey)) {
      try {
        await this.loadChapter(tierId, chapterId, chapterSlug)
      } catch (error) {
        // Silently fail for preload attempts
        console.debug(`Preload failed for ${chapterId}`, error)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * LRU cache setter - evict oldest if cache is full
   */
  private setCache(key: string, value: Chapter | TierMetadata): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // Add new entry (Map maintains insertion order)
    this.cache.set(key, value)
  }
}

export const dataLoader = DataLoader.getInstance()
