import { useEffect } from 'react'

export const useHashScroll = (containerRef: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) // Remove # prefix
      if (!hash || !containerRef.current) return

      // Decode URI component (e.g., %E1%BA%A7n -> ần)
      const decodedHash = decodeURIComponent(hash)

      // Find element by id (id is slugified heading)
      const element = containerRef.current.querySelector(`[id="${decodedHash}"]`)

      if (element) {
        // Scroll to element with smooth behavior
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
