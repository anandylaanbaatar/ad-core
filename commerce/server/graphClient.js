import { createGraphQLClient } from "@shopify/graphql-client"

const keys = {
  shopify: {
    store_domain: process.env.NUXT_SHOPIFY_STORE_DOMAIN,
    api_version: process.env.NUXT_SHOPIFY_API_VERSION,
    storefront_access_token: process.env.NUXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    graph_admin_access_token: process.env.NUXT_SHOPIFY_GRAPH_ADMIN_ACCESS_TOKEN,
  },
}

const client = createGraphQLClient({
  url: `https://${keys.shopify.store_domain}/api/${keys.shopify.api_version}/graphql.json`,
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": keys.shopify.storefront_access_token,
  },
  retries: 1,
})

export { client }
