import { useEbookStore } from '../store/useEbookStore'
import { Sidebar } from './Sidebar'
import { ContentViewer } from './ContentViewer'
import Header from './Header'
import type { Chapter } from '../types'

interface LayoutProps {
  chapters: Chapter[]
}

export const Layout: React.FC<LayoutProps> = ({ chapters }) => {
  const { currentChapterId, sidebarOpen: storeSidebarOpen, toggleSidebar } = useEbookStore()

  const currentChapter = chapters.find(ch => ch.id === currentChapterId) || null

  const handleToggleSidebar = () => {
    toggleSidebar()
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <Header onToggleSidebar={handleToggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          chapters={chapters}
          isOpen={storeSidebarOpen}
          onClose={() => toggleSidebar()}
        />

        {/* Content */}
        <ContentViewer chapters={chapters} currentChapter={currentChapter} />
      </div>
    </div>
  )
}

export default Layout
