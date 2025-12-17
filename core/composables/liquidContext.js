/**
 * Liquid Template Context Builder
 *
 * Provides Shopify-like context objects for Liquid templates:
 * - shop: Store information
 * - customer: Current user
 * - cart: Shopping cart state
 * - product: Product data
 * - collection: Collection data
 * - page: Current page data
 */

/**
 * Build complete Liquid template context
 */
export const useLiquidContext = () => {
  const { $fire, $algolia, $directusStorefront, $currency, $utils } = useNuxtApp()
  const config = useRuntimeConfig()
  const route = useRoute()

  // Get stores
  const authStore = useAuthStore()
  const commerceStore = useCommerceStore()
  const coreStore = useCoreStore()

  /**
   * Shop object (global store information)
   */
  const shop = {
    name: config.public.siteName || 'Store',
    currency: config.public.currency || 'MNT',
    locale: coreStore.language || config.public.language || 'mn',
    country: config.public.country || 'MN',
    url: config.public.siteUrl || '',
    description: config.public.siteDescription || '',
    domain: config.public.siteDomain || ''
  }

  /**
   * Customer object (current authenticated user)
   */
  const customer = authStore.user
    ? {
        id: authStore.user.uid,
        email: authStore.user.email,
        first_name: authStore.user.firstName || '',
        last_name: authStore.user.lastName || '',
        name: authStore.user.displayName || '',
        accepts_marketing: authStore.user.is_email_subscribed || false,
        phone: authStore.user.phone || null,
        tags: authStore.user.tags || [],
        has_account: true
      }
    : null

  /**
   * Cart object (shopping cart state)
   */
  const cart = {
    item_count: commerceStore.cart?.length || 0,
    items: commerceStore.cartItems?.map(mapCartItem) || [],
    total_price: commerceStore.cartTotals?.totalAmount || 0,
    subtotal_price: commerceStore.cartTotals?.subtotalAmount || 0,
    total_discount: commerceStore.cartTotals?.discountAmount || 0,
    taxes_included: false,
    tax_price: commerceStore.cartTotals?.taxAmount || 0,
    requires_shipping: true,
    currency: shop.currency
  }

  /**
   * Request object (current page context)
   */
  const request = {
    path: route.path,
    page_type: getPageType(route),
    locale: shop.locale,
    host: config.public.siteDomain || '',
    design_mode: false // Set to true in theme editor
  }

  /**
   * Settings object (theme settings)
   */
  const settings = {
    // Populated from theme_settings in theme editor
    // Will be merged at render time
  }

  /**
   * Helper functions available in context
   */
  const helpers = {
    // Get snippet template
    getSnippet: async (handle) => {
      try {
        const snippet = await $directusStorefront.getSnippet(handle)
        return snippet
      } catch (error) {
        console.error(`[LiquidContext] Error fetching snippet ${handle}:`, error)
        return null
      }
    },

    // Get section template
    getSection: async (handle) => {
      try {
        const section = await $directusStorefront.getSection(handle)
        return section
      } catch (error) {
        console.error(`[LiquidContext] Error fetching section ${handle}:`, error)
        return null
      }
    },

    // Get product by ID or handle
    getProduct: async (identifier) => {
      try {
        const product = await $algolia.getSingle(identifier)
        return mapProduct(product)
      } catch (error) {
        console.error(`[LiquidContext] Error fetching product ${identifier}:`, error)
        return null
      }
    },

    // Get collection by handle
    getCollection: async (handle) => {
      try {
        const collection = await $directusStorefront.getCollection(handle)
        return mapCollection(collection)
      } catch (error) {
        console.error(`[LiquidContext] Error fetching collection ${handle}:`, error)
        return null
      }
    },

    // Get products from collection
    getCollectionProducts: async (collectionId, options = {}) => {
      try {
        const products = await $algolia.search({
          filters: `collections.id:${collectionId}`,
          hitsPerPage: options.limit || 20,
          page: options.page || 0
        })
        return products.map(mapProduct)
      } catch (error) {
        console.error(`[LiquidContext] Error fetching collection products:`, error)
        return []
      }
    }
  }

  // Return complete context
  return {
    shop,
    customer,
    cart,
    request,
    settings,
    ...helpers
  }
}

/**
 * Map cart item to Shopify-like structure
 */
function mapCartItem(item) {
  return {
    id: item.id,
    key: item.key,
    variant_id: item.variantSku,
    product_id: item.product?.id,
    title: item.product?.title || '',
    variant_title: item.variantSku || '',
    quantity: item.qty || 1,
    price: item.variant?.price || item.product?.price || 0,
    line_price: (item.variant?.price || item.product?.price || 0) * (item.qty || 1),
    image: item.variant?.image?.url || item.product?.featured_image?.url || '',
    url: `/products/${item.product?.handle}`,
    product: item.product ? mapProduct(item.product) : null,
    variant: item.variant ? mapVariant(item.variant) : null,
    properties: {},
    inventory_quantity: item.variant?.inventory_available || 0
  }
}

/**
 * Map product to Shopify-like structure
 */
export function mapProduct(product) {
  if (!product) return null

  return {
    id: product.id,
    handle: product.handle || product.uid || '',
    title: product.title || '',
    description: product.description || '',
    vendor: product.vendor || '',
    type: product.type || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    price: product.price || 0,
    price_min: product.price_min || product.price || 0,
    price_max: product.price_max || product.price || 0,
    compare_at_price: product.compare_price || null,
    compare_at_price_min: product.compare_price || null,
    compare_at_price_max: product.compare_price || null,
    available: product.variants?.some((v) => v.inventory_available > 0) || false,
    images: product.images?.map((img) => ({
      src: img.files_id?.url || img.url || '',
      alt: img.alt_text || product.title,
      width: img.width || null,
      height: img.height || null
    })) || [],
    featured_image: product.featured_image?.url || product.images?.[0]?.files_id?.url || '',
    variants: product.variants?.map(mapVariant) || [],
    options: extractProductOptions(product.variants),
    collections: product.collections?.map((c) => ({
      id: c.collections_id?.id || c.id,
      handle: c.collections_id?.handle || c.handle,
      title: c.collections_id?.title || c.title
    })) || [],
    url: `/products/${product.handle || product.uid}`,
    metafields: product.metafields || {},
    first_available_variant: product.variants?.find((v) => v.inventory_available > 0) || product.variants?.[0] || null,
    selected_or_first_available_variant: null // Set at render time based on query params
  }
}

/**
 * Map variant to Shopify-like structure
 */
export function mapVariant(variant) {
  if (!variant) return null

  return {
    id: variant.id,
    sku: variant.sku || '',
    barcode: variant.barcode || '',
    title: variant.sku || 'Default',
    option1: variant.option1 || null,
    option2: variant.option2 || null,
    option3: variant.option3 || null,
    price: variant.price || 0,
    compare_at_price: variant.compare_price || null,
    available: variant.inventory_available > 0,
    inventory_quantity: variant.inventory_available || 0,
    inventory_management: 'shopify',
    inventory_policy: 'deny',
    weight: variant.weight || 0,
    weight_unit: 'kg',
    image: variant.image?.url || null,
    featured_image: variant.image
      ? {
          src: variant.image.url,
          alt: variant.sku
        }
      : null,
    requires_shipping: true,
    taxable: true
  }
}

/**
 * Map collection to Shopify-like structure
 */
export function mapCollection(collection) {
  if (!collection) return null

  return {
    id: collection.id,
    handle: collection.handle || '',
    title: collection.title || '',
    description: collection.description || '',
    image: collection.image?.url || null,
    products_count: collection.products_count || 0,
    url: `/collections/${collection.handle}`,
    all_tags: collection.tags || [],
    all_types: [],
    all_vendors: []
  }
}

/**
 * Extract product options from variants
 */
function extractProductOptions(variants) {
  if (!variants || !variants.length) return []

  const options = []
  const optionValues = {
    option1: new Set(),
    option2: new Set(),
    option3: new Set()
  }

  // Collect unique values for each option
  variants.forEach((variant) => {
    if (variant.option1) optionValues.option1.add(variant.option1)
    if (variant.option2) optionValues.option2.add(variant.option2)
    if (variant.option3) optionValues.option3.add(variant.option3)
  })

  // Build options array
  if (optionValues.option1.size > 0) {
    options.push({
      name: 'Option 1',
      position: 1,
      values: Array.from(optionValues.option1)
    })
  }

  if (optionValues.option2.size > 0) {
    options.push({
      name: 'Option 2',
      position: 2,
      values: Array.from(optionValues.option2)
    })
  }

  if (optionValues.option3.size > 0) {
    options.push({
      name: 'Option 3',
      position: 3,
      values: Array.from(optionValues.option3)
    })
  }

  return options
}

/**
 * Determine page type from route
 */
function getPageType(route) {
  if (route.path === '/') return 'index'
  if (route.path.startsWith('/products/')) return 'product'
  if (route.path.startsWith('/collections/')) return 'collection'
  if (route.path === '/cart') return 'cart'
  if (route.path === '/search') return 'search'
  if (route.path.startsWith('/pages/')) return 'page'
  if (route.path.startsWith('/account')) return 'customers'
  return 'page'
}
