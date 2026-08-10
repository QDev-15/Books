import { useSwipeable } from 'react-swipeable'

interface UseSwipeProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  enabled?: boolean
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, enabled = true }: UseSwipeProps) => {
  return useSwipeable({
    onSwipedLeft: () => enabled && onSwipeLeft(),
    onSwipedRight: () => enabled && onSwipeRight(),
    trackMouse: false,
    trackTouch: true,
  })
}
