import { defineEventHandler, readBody } from "h3"

// Dynamic import for Shopify - only loaded when integration is enabled
let createGraphQLClient

const getIds = (id) => {
  let ids = id.split("/")
  return {
    uid: id,
    id: ids[ids.length - 1],
  }
}
const mapProduct = (product) => {
  let item = product.node

  // Product Id
  if (item.id) {
    let ids = getIds(item.id)
    item.uid = ids.uid
    item.id = ids.id
  }

  // Collections && Categories
  if (item.collections && item.collections.edges) {
    if (item.collections.edges.length > 0) {
      let categoryIds = getIds(item.collections.edges[0].node.id)

      item.category = item.collections.edges[0].node
      item.category.id = categoryIds.id
      item.category.uid = categoryIds.uid

      // delete item.collections
    }
  }

  // Images
  if (item.featuredImage && item.featuredImage.url) {
    let featuredImageIds = getIds(item.featuredImage.id)
    item.featuredImage.id = featuredImageIds.id
    item.featuredImage.uid = featuredImageIds.uid
    item.image = item.featuredImage.url
  }
  if (item.images) {
    item.images = product.node.images.edges.map((j) => {
      let itemImage = j.node
      let imageIds = getIds(j.node.id)
      itemImage.id = imageIds.id
      itemImage.uid = imageIds.uid
      return itemImage
    })
  }

  // Variants
  if (item.variants) {
    item.variants = product.node.variants.edges.map((k) => {
      let itemVariant = k.node
      let itemVariantIds = getIds(k.node.id)
      itemVariant.id = itemVariantIds.id
      itemVariant.uid = itemVariantIds.uid
      return itemVariant
    })

    // Price
    item.price = item.variants[0].price.amount
  }

  return item
}
const getQuery = (type, options) => {
  let query = ``

  let productNode = `
    id
    images(first: 50) {
      edges {
        node {
          id
          url
          width
          height
          altText
        }
      }
    }
    featuredImage {
      id
      url
      width
      height
      altText
    }
    productType
    description
    createdAt
    handle
    tags
    title
    totalInventory
    updatedAt
    vendor
    publishedAt
    variants (first: 50) {
      edges {
        node {
          id
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            id
            altText
            height
            url
            width
          }
          sku
          title
        }
      }
    }
    collections(first: 50) {
      edges {
        node {
          id
          handle
          title
        }
        cursor
      }
      totalCount
    }
  `
  let productEdges = `
    edges {
      cursor
      node {
        ${productNode}
      }
    }
  `
  let pageInfo = `
    pageInfo {
      endCursor
      hasNextPage
      hasPreviousPage
      startCursor
    }
  `

  /**
   * Sort & Filters
   */

  // https://shopify.dev/docs/api/usage/search-syntax
  let queryFilter = ""
  if (options.query) {
    queryFilter = `, query: "${options.query}"`
  }
  if (options.ids) {
    let queryList = ""

    for (let i = 0; i < options.ids.length; i++) {
      if (queryList !== "") queryList += ` OR `
      queryList += `(id:${options.ids[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }

  let pagination = ``
  if (options.cursor) {
    pagination = `, after: "${options.cursor}"`
  }

  let reverseKey = `, reverse: true`
  let sortKey = `, sortKey: ${options.sort}`

  if (options.category !== "all") {
    if (options.sort === "CREATED_AT") {
      sortKey = `, sortKey: CREATED`
    }
  }
  if (options.sort === "PRICE_HIGH_TO_LOW") {
    sortKey = `, sortKey: PRICE`
  } else if (options.sort === "PRICE_LOW_TO_HIGH") {
    sortKey = `, sortKey: PRICE`
    reverseKey = `, reverse: false`
  }

  // Products Query
  let productsNode = `
    products(first: ${options.limit}${queryFilter}${sortKey}${reverseKey}${pagination}) {
      ${productEdges}
      ${pageInfo}
    }
  `

  // All Products
  if (type === "products") {
    // Products by Collection
    if (options.category !== "all") {
      query = `{
        collection(handle: "${options.category}") {
          id
          handle
          title
          description
          image {
            id
            url
          }
          ${productsNode}
        }
      }`
      // All Products
    } else {
      query = `{
        ${productsNode}    
      }`
      return query
    }
    // Single Product
  } else if (type === "product") {
    query = `{
      product(id: "gid://shopify/Product/${options.productId}") {
        ${productNode}
      }
    }`
    return query
  }

  return query
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Dynamically import Shopify packages (layer is only loaded when integration is enabled)
  if (!createGraphQLClient) {
    const graphqlModule = await import("@shopify/graphql-client")
    createGraphQLClient = graphqlModule.createGraphQLClient
  }

  const body = await readBody(event)
  let keys = config.private.shopify

  // Override Keys
  if (body.customKeys) {
    keys = body.customKeys
  }

  if (!keys) return

  const client = createGraphQLClient({
    url: `https://${keys.store_domain}/api/${keys.api_version}/graphql.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": keys.storefront_access_token,
    },
    retries: 1,
  })

  let filters = body

  if (body) {
    if (typeof body.type === "undefined") {
      filters.type = "products"
    }
    if (typeof body.limit === "undefined") {
      filters.limit = 5
    }
    if (typeof body.category === "undefined") {
      filters.category = "all"
    }
    if (typeof body.sort === "undefined") {
      filters.sort = "CREATED_AT"
    }
  }

  const query = getQuery(filters.type, filters)

  try {
    const { data, errors, extensions } = await client.request(query)

    if (errors) {
      return errors
    }
    if (data) {
      let returnData = {}

      // Products With Category
      if (filters.category !== "all") {
        returnData = data
        returnData.items = data.collection.products.edges.map((i) =>
          mapProduct(i)
        )
        // returnData.cursor = data.collection.products.cursor
        returnData.pageInfo = data.collection.products.pageInfo
        delete returnData.collection.products

        // All Products
      } else {
        if (filters.type === "product") {
          // console.log("Single Product ::: ", data)
          returnData.item = mapProduct(data.product)
        } else {
          returnData.items = data[filters.type].edges.map((i) => mapProduct(i))
          returnData.cursor = data[filters.type].cursor
          returnData.pageInfo = data[filters.type].pageInfo
        }
      }

      return returnData
    }
  } catch (error) {
    return error
  }
})
