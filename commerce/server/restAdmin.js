import { createAdminRestApiClient } from "@shopify/admin-api-client"

const keys = {
  shopify: {
    store_domain: process.env.NUXT_SHOPIFY_STORE_DOMAIN,
    api_version: process.env.NUXT_SHOPIFY_API_VERSION,
    storefront_access_token: process.env.NUXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    graph_admin_access_token: process.env.NUXT_SHOPIFY_GRAPH_ADMIN_ACCESS_TOKEN,
  },
}

// https://github.com/Shopify/shopify-app-js/tree/565d1142edbfabba8ad516214f597778f7cfb521/packages/api-clients/admin-api-client#rest-client

const restClient = createAdminRestApiClient({
  storeDomain: keys.shopify.store_domain,
  apiVersion: keys.shopify.api_version,
  accessToken: keys.shopify.graph_admin_access_token,
})

export { restClient }
