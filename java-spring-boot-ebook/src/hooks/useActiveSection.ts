import { useEffect, useState } from 'react'

export const useActiveSection = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    if (!containerRef.current) return

    const handleScroll = () => {
      const headings = containerRef.current?.querySelectorAll('h2[id]')
      if (!headings) return

      let currentHeading = ''

      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect()
        const containerRect = containerRef.current?.getBoundingClientRect()

        if (containerRect && rect.top - containerRect.top <= 100) {
          currentHeading = heading.id
        }
      })

      setActiveSection(currentHeading)
    }

    const container = containerRef.current
    container?.addEventListener('scroll', handleScroll)

    // Initial check
    handleScroll()

    return () => container?.removeEventListener('scroll', handleScroll)
  }, [containerRef])

  return activeSection
}
