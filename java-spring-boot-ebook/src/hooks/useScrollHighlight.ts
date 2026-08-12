import { useEffect, useState } from 'react'
let oldActiveSection = ""
// Lưu trạng thái section hiện đang active trong viewport
export function useScrollHighlight() {
  const [activeSection, setActiveSection] = useState<string>('')
  useEffect(() => {
    // =============== BƯỚC 1: Tìm content container ===============
    // Tìm .markdown-content (chứa tất cả headings của chương)
    const markdownContent = document.querySelector('.markdown-content')
    if (!markdownContent) {
      console.log('❌ Markdown content not found!')
      return
    }

    // Từ .markdown-content, tìm parent element có class .content-container (chính là ContentViewer)
    // Container này là thằng quản lý scroll của nội dung
    let container = markdownContent.closest('.content-container') as HTMLElement | null
    if (!container) {
      console.log('❌ Container with content-container not found!')
      return
    }

    // =============== BƯỚC 2: Xử lý scroll event ===============
    const handleScroll = () => {
      // Lấy tất cả h2, h3 headings (các section trong markdown)
      const headings = document.querySelectorAll('h2, h3')

      let activeId = '' // ID của heading sẽ được active
      let highestPosition = -Infinity // Tracking vị trí "cao nhất" (gần top viewport nhất)

      // ========== VÒNG LẶP 1: Tìm heading nào visible trong viewport ==========
      headings.forEach((heading) => {
        // Lấy vị trí heading so với viewport (top, bottom, left, right)
        const rect = heading.getBoundingClientRect()

        // Kiểm tra nếu heading nằm trong viewport của container
        // rect.top < container.clientHeight: top của heading nằm trên bottom của viewport
        // rect.bottom > 0: bottom của heading nằm dưới top của viewport
        const isVisible = rect.top < container.clientHeight && rect.bottom > 0

        if (isVisible) {
          // Nếu heading này có top position cao hơn (gần top viewport hơn) thì chọn nó
          // Logic: tìm heading "trên cùng nhất" trong viewport để làm active
          if (rect.top > highestPosition) {
            highestPosition = rect.top
            activeId = heading.id
          }
        }
      })
      // ========== CẬP NHẬT STATE ==========
      // Nếu tìm được heading nào, cập nhật activeSection state
      // SectionList component sẽ so sánh activeSection với sectionSlug để highlight
      if (activeId) {
        setActiveSection(activeId)
        oldActiveSection = activeId
      } else {
        setActiveSection(oldActiveSection)
      }

    }

    // =============== BƯỚC 3: Attach scroll listener và gọi lần đầu ===============
    // Lắng nghe scroll event trên container (không phải window, vì nội dung scroll trong div)
    container.addEventListener('scroll', handleScroll, { passive: true })

    // Gọi handleScroll() ngay khi mount để active section đầu tiên visible
    handleScroll()

    // =============== BƯỚC 4: Cleanup ===============
    // Khi component unmount, remove event listener để tránh memory leak
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])
  // console.log(activeSection, 'activeSection')
  // Return activeSection (section ID), SectionList sẽ dùng nó để highlight
  return activeSection
}
