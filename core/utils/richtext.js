/**
 * Rich Text Utilities
 *
 * Helper functions for rendering rich text content from different CMS providers
 */

/**
 * Render rich text content (supports both Prismic and Directus formats)
 *
 * @param {string|array|object} content - Rich text content (HTML string, Prismic StructuredText, or Directus rich text)
 * @returns {string} HTML string ready for rendering with v-html
 */
export const renderRichText = (content) => {
  if (!content) return ''

  // If it's already an HTML string, return as is
  if (typeof content === 'string') {
    return content
  }

  // If it's Prismic StructuredText (array format)
  if (Array.isArray(content)) {
    try {
      const prismic = require('@prismicio/client')
      return prismic.asHTML(content)
    } catch (error) {
      console.error('[renderRichText] Error rendering Prismic content:', error)
      return ''
    }
  }

  // If it's an object, try to extract HTML
  if (typeof content === 'object') {
    // Directus rich text field (TinyMCE/WYSIWYG)
    if (content.html) {
      return content.html
    }

    // ProseMirror JSON format (Directus alternative)
    if (content.type === 'doc' && content.content) {
      return convertProseMirrorToHTML(content)
    }
  }

  // Fallback: try to stringify
  return String(content)
}

/**
 * Convert ProseMirror JSON to HTML
 * (Used by some Directus rich text configurations)
 *
 * @param {object} doc - ProseMirror document object
 * @returns {string} HTML string
 */
const convertProseMirrorToHTML = (doc) => {
  if (!doc || !doc.content) return ''

  const renderNode = (node) => {
    if (!node) return ''

    switch (node.type) {
      case 'paragraph':
        return `<p>${renderContent(node.content)}</p>`

      case 'heading':
        const level = node.attrs?.level || 1
        return `<h${level}>${renderContent(node.content)}</h${level}>`

      case 'text':
        let text = node.text || ''

        // Apply marks (bold, italic, etc.)
        if (node.marks) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`
                break
              case 'italic':
                text = `<em>${text}</em>`
                break
              case 'underline':
                text = `<u>${text}</u>`
                break
              case 'strike':
                text = `<s>${text}</s>`
                break
              case 'code':
                text = `<code>${text}</code>`
                break
              case 'link':
                const href = mark.attrs?.href || '#'
                const target = mark.attrs?.target || '_self'
                text = `<a href="${href}" target="${target}">${text}</a>`
                break
            }
          })
        }

        return text

      case 'bulletList':
        return `<ul>${renderContent(node.content)}</ul>`

      case 'orderedList':
        return `<ol>${renderContent(node.content)}</ol>`

      case 'listItem':
        return `<li>${renderContent(node.content)}</li>`

      case 'blockquote':
        return `<blockquote>${renderContent(node.content)}</blockquote>`

      case 'codeBlock':
        return `<pre><code>${renderContent(node.content)}</code></pre>`

      case 'hardBreak':
        return '<br>'

      case 'horizontalRule':
        return '<hr>'

      case 'image':
        const src = node.attrs?.src || ''
        const alt = node.attrs?.alt || ''
        const title = node.attrs?.title || ''
        return `<img src="${src}" alt="${alt}" title="${title}">`

      default:
        return renderContent(node.content)
    }
  }

  const renderContent = (content) => {
    if (!content || !Array.isArray(content)) return ''
    return content.map(renderNode).join('')
  }

  return renderContent(doc.content)
}

/**
 * Strip HTML tags from rich text
 *
 * @param {string|array|object} content - Rich text content
 * @returns {string} Plain text
 */
export const stripRichText = (content) => {
  const html = renderRichText(content)
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Truncate rich text to a specific length (plain text)
 *
 * @param {string|array|object} content - Rich text content
 * @param {number} maxLength - Maximum character length
 * @param {string} suffix - Suffix to add if truncated (default: '...')
 * @returns {string} Truncated plain text
 */
export const truncateRichText = (content, maxLength = 150, suffix = '...') => {
  const plainText = stripRichText(content)

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.substring(0, maxLength).trim() + suffix
}

/**
 * Check if rich text content is empty
 *
 * @param {string|array|object} content - Rich text content
 * @returns {boolean} True if empty
 */
export const isRichTextEmpty = (content) => {
  if (!content) return true

  const plainText = stripRichText(content)
  return plainText.trim().length === 0
}

/**
 * Get the first paragraph from rich text
 *
 * @param {string|array|object} content - Rich text content
 * @returns {string} First paragraph HTML
 */
export const getFirstParagraph = (content) => {
  const html = renderRichText(content)
  const match = html.match(/<p[^>]*>(.*?)<\/p>/)
  return match ? match[0] : html
}
