import { useEffect } from 'react'
import type { Chapter } from '../types'

export const useKeyboard = (
  _chapters: Chapter[],
  onNext: () => void,
  onPrevious: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'Enter') {
        event.preventDefault()
        onNext()
      } else if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
        event.preventDefault()
        onPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onPrevious])
}
