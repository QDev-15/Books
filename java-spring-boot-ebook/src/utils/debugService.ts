/**
 * Debug service para verificar que los datos se cargan correctamente
 */

import { ebookService } from '../services/ebookService'

export function debugEbookService() {
  const chapters = ebookService.getAllChapters()
  const tiers = ebookService.getAllTiers()
  const totalChapters = ebookService.getTotalChapters()

  console.log('=== DEBUG: EbookService ===')
  console.log(`Total chapters: ${totalChapters}`)
  console.log(`Chapters array:`, chapters)
  console.log(`Tiers:`, tiers)

  // Log first 3 chapters
  console.log('First 3 chapters:')
  chapters.slice(0, 3).forEach((ch, idx) => {
    console.log(`  [${idx}] ${ch.id} - ${ch.title} (Tier ${ch.tier}, slug: ${ch.slug})`)
  })

  // Log chapters by tier
  console.log('Chapters by tier:')
  tiers.forEach(tier => {
    const tierChapters = ebookService.getChaptersByTier(tier)
    const tierTitle = ebookService.getTierTitle(tier)
    console.log(`  Tier ${tier} (${tierTitle}): ${tierChapters.length} chapters`)
  })
}

// Auto-run on load
if (typeof window !== 'undefined') {
  ;(window as any).debugEbookService = debugEbookService
}
