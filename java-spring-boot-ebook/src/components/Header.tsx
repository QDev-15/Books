import { Menu, Moon, Sun } from 'lucide-react'
import { useEbookStore } from '../store/useEbookStore'

interface HeaderProps {
  onToggleSidebar: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isDarkMode, toggleDarkMode } = useEbookStore()

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden transition-colors"
            aria-label="Toggle sidebar navigation"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Java Spring Boot
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Cơ Bản Đến Nâng Cao
            </p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
