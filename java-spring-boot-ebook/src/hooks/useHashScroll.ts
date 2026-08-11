import { useEffect } from 'react'

export const useHashScroll = (containerRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove # prefix
      console.log('[useHashScroll] Hash changed:', hash || '(empty)')

      if (!hash || !containerRef.current) {
        console.log('[useHashScroll] Skipped: hash empty or no container ref')
        return
      }

      // Decode URI component (e.g., %E1%BA%A7n -> ần)
      const decodedHash = decodeURIComponent(hash)
      console.log('[useHashScroll] Looking for element with id:', decodedHash)

      // Find element by id (id is slugified heading)
      const element = containerRef.current.querySelector(`[id="${decodedHash}"]`)

      if (element) {
        console.log('[useHashScroll] ✓ Found element, scrolling...')
        // Scroll to element with smooth behavior
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // Debug: log all available IDs
        const allElements = containerRef.current.querySelectorAll('[id]')
        console.warn(`[useHashScroll] ✗ Hash "${decodedHash}" not found. Available IDs (first 10):`,
          Array.from(allElements).map(el => el.id).slice(0, 10)
        )
      }
    }

    // Listen to hash change
    window.addEventListener('hashchange', handleHashChange)

    // Also handle initial hash on mount
    handleHashChange()

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [containerRef])
}
