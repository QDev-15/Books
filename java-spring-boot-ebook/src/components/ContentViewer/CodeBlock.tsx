import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '../../utils/clipboard'

interface CodeBlockProps {
  code: string
  language?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'bash' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative group bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden my-4">
      {/* Language Badge */}
      {language && (
        <div className="absolute top-2 left-2 text-xs font-mono text-gray-400">
          {language}
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors opacity-0 group-hover:opacity-100"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Code */}
      <pre className="p-4 pt-8 overflow-x-auto">
        <code className="text-sm text-gray-100 font-mono leading-relaxed">
          {code}
        </code>
      </pre>

      {/* Copy Feedback */}
      {copied && (
        <div className="absolute bottom-2 right-2 text-xs text-green-400 animate-fade-in">
          ✓ Copied!
        </div>
      )}
    </div>
  )
}

export default CodeBlock
