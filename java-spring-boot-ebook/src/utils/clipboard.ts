export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') {
      return false
    }

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        console.warn('Clipboard API failed, trying fallback:', err)
        // Fall through to fallback method
      }
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}
