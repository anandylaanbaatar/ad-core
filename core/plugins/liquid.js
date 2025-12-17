/**
 * Liquid Template Engine Plugin
 *
 * Integrates LiquidJS with Nuxt for Shopify-like theme templating
 * Registers custom tags, filters, and provides template rendering
 */

import { Liquid } from 'liquidjs'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // Check if theme engine is enabled
  if (!config.public.features?.themes) {
    console.log('[Plugins] ::: [Liquid] ::: Not Initialized! (themes feature disabled)')
    return
  }

  console.log('[Plugins] ::: [Liquid] ::: Initializing...')

  // Initialize Liquid engine
  const engine = new Liquid({
    cache: process.env.NODE_ENV === 'production',
    strictFilters: false, // Allow missing filters
    strictVariables: false, // Allow missing variables
    trimTagRight: true,
    trimTagLeft: true,
    greedy: false,
    extname: '.liquid'
  })

  // Register custom tags
  registerSchemaTags(engine)
  registerRenderTags(engine)
  registerSectionTags(engine)
  registerLayoutTags(engine)

  // Register custom filters
  registerCommerceFilters(engine, nuxtApp)
  registerCurrencyFilters(engine, nuxtApp)
  registerImageFilters(engine, config)
  registerUtilityFilters(engine, nuxtApp)

  // Expose engine to app
  nuxtApp.provide('liquid', {
    engine,
    render: async (template, context = {}) => {
      try {
        return await engine.parseAndRender(template, context)
      } catch (error) {
        console.error('[Liquid] Render error:', error)
        throw error
      }
    },
    parse: (template) => {
      try {
        return engine.parse(template)
      } catch (error) {
        console.error('[Liquid] Parse error:', error)
        throw error
      }
    }
  })

  console.log('[Plugins] ::: [Liquid] ::: ✅ Initialized')
})

/**
 * Register {% schema %} tag for section settings
 */
function registerSchemaTags(engine) {
  engine.registerTag('schema', {
    parse(tagToken, remainTokens) {
      this.tokens = []
      const stream = this.liquid.parser.parseStream(remainTokens)
      stream.on('tag:endschema', () => stream.stop())
      stream.on('template', (tpl) => this.tokens.push(tpl))
      stream.start()
    },
    render(ctx) {
      // Extract schema JSON for editor (not rendered in output)
      const schemaContent = this.tokens.map(t => t.getText()).join('')
      try {
        ctx.scope.schema = JSON.parse(schemaContent)
      } catch (error) {
        console.error('[Liquid] Invalid schema JSON:', error)
      }
      return '' // Schema doesn't render in HTML
    }
  })
}

/**
 * Register {% render 'snippet', params %} tag
 */
function registerRenderTags(engine) {
  engine.registerTag('render', {
    parse(tagToken) {
      // Parse: {% render 'snippet-name', var1: value1, var2: value2 %}
      const args = tagToken.args
      const match = args.match(/^['"]([^'"]+)['"](?:,\s*(.+))?$/)

      if (!match) {
        throw new Error(`Invalid render syntax: ${args}`)
      }

      this.snippetName = match[1]
      this.paramsStr = match[2] || ''
    },
    async render(ctx, emitter) {
      try {
        // Get snippet from context helper
        const snippet = await ctx.getSnippet?.(this.snippetName)

        if (!snippet) {
          console.warn(`[Liquid] Snippet not found: ${this.snippetName}`)
          return
        }

        // Parse parameters
        const params = {}
        if (this.paramsStr) {
          // Simple key:value parsing (enhance for complex expressions)
          const pairs = this.paramsStr.split(',')
          for (const pair of pairs) {
            const [key, value] = pair.split(':').map(s => s.trim())
            // Evaluate value in current context
            params[key] = await this.liquid.evalValue(value, ctx)
          }
        }

        // Render snippet with merged context
        const html = await this.liquid.parseAndRender(snippet.template, {
          ...ctx.getAll(),
          ...params
        })

        emitter.write(html)
      } catch (error) {
        console.error(`[Liquid] Error rendering snippet ${this.snippetName}:`, error)
        emitter.write(`<!-- Snippet render error: ${this.snippetName} -->`)
      }
    }
  })
}

/**
 * Register {% section 'section-name' %} tag
 */
function registerSectionTags(engine) {
  engine.registerTag('section', {
    parse(tagToken) {
      const match = tagToken.args.match(/^['"]([^'"]+)['"]$/)
      if (!match) {
        throw new Error(`Invalid section syntax: ${tagToken.args}`)
      }
      this.sectionName = match[1]
    },
    async render(ctx, emitter) {
      try {
        const section = await ctx.getSection?.(this.sectionName)

        if (!section) {
          console.warn(`[Liquid] Section not found: ${this.sectionName}`)
          return
        }

        const html = await this.liquid.parseAndRender(section.template, ctx.getAll())
        emitter.write(html)
      } catch (error) {
        console.error(`[Liquid] Error rendering section ${this.sectionName}:`, error)
        emitter.write(`<!-- Section render error: ${this.sectionName} -->`)
      }
    }
  })
}

/**
 * Register layout tags (content_for_header, content_for_layout)
 */
function registerLayoutTags(engine) {
  // {% content_for_header %}
  engine.registerTag('content_for_header', {
    render(ctx) {
      return ctx.scope.content_for_header || ''
    }
  })

  // {% content_for_layout %}
  engine.registerTag('content_for_layout', {
    render(ctx) {
      return ctx.scope.content_for_layout || ''
    }
  })
}

/**
 * Register commerce-specific filters
 */
function registerCommerceFilters(engine, nuxtApp) {
  // {{ product.url | product_url }}
  engine.registerFilter('product_url', (handle) => {
    return `/products/${handle}`
  })

  // {{ collection.url | collection_url }}
  engine.registerFilter('collection_url', (handle) => {
    return `/collections/${handle}`
  })

  // {{ page.url | page_url }}
  engine.registerFilter('page_url', (handle) => {
    return `/pages/${handle}`
  })

  // {{ cart.url | cart_url }}
  engine.registerFilter('cart_url', () => {
    return '/cart'
  })

  // {{ variant.available | available_text }}
  engine.registerFilter('available_text', (available) => {
    return available ? 'In Stock' : 'Out of Stock'
  })
}

/**
 * Register currency filters
 */
function registerCurrencyFilters(engine, nuxtApp) {
  // {{ price | money }}
  engine.registerFilter('money', (value) => {
    if (nuxtApp.$currency) {
      return nuxtApp.$currency.format(value)
    }
    // Fallback formatting
    return `${value.toLocaleString()} ₮`
  })

  // {{ price | money_with_currency }}
  engine.registerFilter('money_with_currency', (value) => {
    if (nuxtApp.$currency) {
      return `${nuxtApp.$currency.format(value)} MNT`
    }
    return `${value.toLocaleString()} MNT`
  })

  // {{ price | money_without_currency }}
  engine.registerFilter('money_without_currency', (value) => {
    return value.toLocaleString()
  })
}

/**
 * Register image filters
 */
function registerImageFilters(engine, config) {
  // Size mapping
  const sizeMap = {
    pico: 16,
    icon: 32,
    thumb: 50,
    small: 100,
    compact: 160,
    medium: 240,
    large: 480,
    grande: 600,
    '1024x1024': 1024,
    '2048x2048': 2048
  }

  // {{ image | img_url: 'medium' }}
  engine.registerFilter('img_url', (imageUrl, size = 'medium') => {
    if (!imageUrl) return ''

    const width = sizeMap[size] || 240
    const baseUrl = config.public.cdnUrl || config.public.fileSystem?.bunny?.cdnUrl || ''

    // If it's already a full URL, return as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }

    // Construct CDN URL with width parameter
    return `${baseUrl}${imageUrl}?width=${width}&fit=cover`
  })

  // {{ image | img_tag: alt: 'Product image' }}
  engine.registerFilter('img_tag', (imageUrl, alt = '') => {
    if (!imageUrl) return ''
    return `<img src="${imageUrl}" alt="${alt}" loading="lazy" />`
  })
}

/**
 * Register utility filters
 */
function registerUtilityFilters(engine, nuxtApp) {
  // {{ 'key' | t }}
  engine.registerFilter('t', (key) => {
    if (nuxtApp.$utils?.t) {
      return nuxtApp.$utils.t(key)
    }
    return key
  })

  // {{ content | strip_html }}
  engine.registerFilter('strip_html', (html) => {
    return html?.replace(/<[^>]*>/g, '') || ''
  })

  // {{ content | truncate: 100 }}
  engine.registerFilter('truncate', (str, length = 50, ellipsis = '...') => {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + ellipsis
  })

  // {{ url | asset_url }}
  engine.registerFilter('asset_url', (path) => {
    const baseUrl = nuxtApp.$config.public.cdnUrl || ''
    return `${baseUrl}/assets/${path}`
  })

  // {{ text | handleize }}
  engine.registerFilter('handleize', (str) => {
    return str
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  })

  // {{ array | join: ', ' }}
  engine.registerFilter('join', (array, separator = ', ') => {
    return Array.isArray(array) ? array.join(separator) : array
  })

  // {{ array | first }}
  engine.registerFilter('first', (array) => {
    return Array.isArray(array) ? array[0] : array
  })

  // {{ array | last }}
  engine.registerFilter('last', (array) => {
    return Array.isArray(array) ? array[array.length - 1] : array
  })

  // {{ number | default: 0 }}
  engine.registerFilter('default', (value, defaultValue) => {
    return value !== null && value !== undefined ? value : defaultValue
  })
}
