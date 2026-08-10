import { Search, X } from 'lucide-react'
import { useEbookStore } from '../../store/useEbookStore'

export const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useEbookStore()

  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
