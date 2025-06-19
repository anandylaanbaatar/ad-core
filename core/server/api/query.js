import { createAdminRestApiClient } from "@shopify/admin-api-client"
import { createGraphQLClient } from "@shopify/graphql-client"
import { createAdminApiClient } from "@shopify/admin-api-client"
import { defineEventHandler, readBody } from "h3"

// https://github.com/Shopify/shopify-app-js/tree/565d1142edbfabba8ad516214f597778f7cfb521/packages/api-clients/admin-api-client#rest-client
// https://shopify.dev/docs/api/storefront/2024-07/queries/collection

const getQuery = (type, body) => {
  let query = ``

  // Cart
  if (type === "createCart") {
    query = `
      mutation createCart {
        cartCreate {
            cart {
                id
                createdAt
                updatedAt
                lines(first: 50) {
                    edges {
                        node {
                            id
                            merchandise {
                                ... on ProductVariant {
                                    id
                                }
                            }
                        }
                    }
                }
                attributes {
                    key
                    value
                }
                estimatedCost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                    totalTaxAmount {
                        amount
                        currencyCode
                    }
                    totalDutyAmount {
                        amount
                        currencyCode
                    }
                }
            }
        }
    }
    `
  } else if (type === "addItem") {
    query = `
      mutation CartLinesAdd {
        cartLinesAdd(lines: { 
          quantity: ${body.amount}
          merchandiseId: "${body.variantId}"
        }, 
          cartId: "${body.cartId}"
        ) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 50) {
                edges {
                    node {
                        id
                        merchandise {
                            ... on ProductVariant {
                                id
                            }
                        }
                    }
                }
            }
            attributes {
                key
                value
            }
            estimatedCost {
                totalAmount {
                    amount
                    currencyCode
                }
                subtotalAmount {
                    amount
                    currencyCode
                }
                totalTaxAmount {
                    amount
                    currencyCode
                }
                totalDutyAmount {
                    amount
                    currencyCode
                }
            }
          }
        }
      }
    `
  } else if (type === "updateItem") {
    query = `
      mutation CartLinesAdd {
        cartLinesUpdate(
          lines: {
            id: "${body.itemId}"
            quantity: ${body.amount}
            merchandiseId: "${body.variantId}"
          }
            cartId: "${body.cartId}"
          ) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 50) {
                edges {
                    node {
                        id
                        merchandise {
                            ... on ProductVariant {
                                id
                            }
                        }
                    }
                }
            }
            attributes {
                key
                value
            }
            estimatedCost {
                totalAmount {
                    amount
                    currencyCode
                }
                subtotalAmount {
                    amount
                    currencyCode
                }
                totalTaxAmount {
                    amount
                    currencyCode
                }
                totalDutyAmount {
                    amount
                    currencyCode
                }
            }
          }
        }
      }
    `
  } else if (type === "cartItems") {
    query = `{
      cart(id: "${body.cartId}") {
        checkoutUrl
        createdAt
        id
        note
        totalQuantity
        updatedAt
        buyerIdentity {
          countryCode
          email
          phone
        }
        cost {
          subtotalAmountEstimated
          totalAmountEstimated
          totalDutyAmountEstimated
          totalTaxAmountEstimated
          subtotalAmount {
            amount
            currencyCode
          }
          checkoutChargeAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        discountCodes {
          applicable
          code
        }
        discountAllocations {
          discountedAmount {
            amount
            currencyCode
          }
        }
        estimatedCost {
          checkoutChargeAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalDutyAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
              node {
                  id
                  merchandise {
                      ... on ProductVariant {
                          availableForSale
                          barcode
                          currentlyNotInStock
                          id
                          quantityAvailable
                          requiresShipping
                          sku
                          taxable
                          title
                          weight
                          weightUnit
                          image {
                              altText
                              height
                              id
                              originalSrc
                              src
                              transformedSrc
                              url
                              width
                          }
                          price {
                              amount
                              currencyCode
                          }
                          product {
                              title
                          }
                      }
                  }
                  quantity
                  cost {
                      totalAmount {
                          amount
                          currencyCode
                      }
                  }
              }
          }
        }
      }
    }`
  } else if (type === "removeItem") {
    query = `
      mutation CartLinesRemove {
        cartLinesRemove(
            cartId: "${body.cartId}"
            lineIds: "${body.cartLineId}"
        ) {
            cart {
                checkoutUrl
                createdAt
                id
                note
                totalQuantity
                updatedAt
            }
        }
      }
    `
  } else if (type === "updateDiscountCodes") {
    query = `
      mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
        cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 50) {
                edges {
                    node {
                        id
                        merchandise {
                            ... on ProductVariant {
                                id
                            }
                        }
                    }
                }
            }
            attributes {
                key
                value
            }
            estimatedCost {
                totalAmount {
                    amount
                    currencyCode
                }
                subtotalAmount {
                    amount
                    currencyCode
                }
                totalTaxAmount {
                    amount
                    currencyCode
                }
                totalDutyAmount {
                    amount
                    currencyCode
                }
            }
          }
        }
      }
    `
  } else if (type === "updateGiftCardCodes") {
    query = `
      mutation CartGiftCardCodesUpdate($cartId: ID!, $giftCardCodes: [String!]) {
        cartGiftCardCodesUpdate(cartId: $cartId, giftCardCodes: $giftCardCodes) {
          cart {
            id
            createdAt
            updatedAt
            lines(first: 50) {
              edges {
                node {
                  id
                  merchandise {
                    ... on ProductVariant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
  }

  // Orders
  if (type === "draftOrders") {
    query = `
      query DraftOrders {
        draftOrders(first: 100) {
          edges {
            node {
              email
              id
            }
          }
        }
      }
    `
  } else if (type === "createDraftOrder") {
    query = `
      mutation DraftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            email
            id
            status
            totalPrice
            totalShippingPrice
            invoiceSentAt
            invoiceUrl
            createdAt
            completedAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `
  } else if (type === "completeDraftOrder") {
    query = `
      mutation DraftOrderComplete {
        draftOrderComplete(id: "gid://shopify/DraftOrder/${body.orderId}") {
            draftOrder {
                id
            }
            userErrors {
                field
                message
            }
        }
    }

    `
  } else if (type === "order") {
    query = `
      query Order {
        order(
          id: "gid://shopify/Order/${body.orderId}"
        ) {
          billingAddressMatchesShippingAddress
          canMarkAsPaid
          canNotifyCustomer
          cancelReason
          cancelledAt
          capturable
          cartDiscountAmount
          clientIp
          closed
          closedAt
          confirmationNumber
          confirmed
          createdAt
          currencyCode
          currentSubtotalLineItemsQuantity
          currentTotalWeight
          customerAcceptsMarketing
          customerLocale
          discountCode
          discountCodes
          displayFinancialStatus
          displayFulfillmentStatus
          edited
          email
          estimatedTaxes
          fulfillable
          fullyPaid
          hasTimelineComment
          id
          landingPageDisplayText
          landingPageUrl
          legacyResourceId
          merchantEditable
          merchantEditableErrors
          name
          netPayment
          note
          paymentGatewayNames
          phone
          poNumber
          presentmentCurrencyCode
          processedAt
          purchasingEntity
          referralCode
          referrerDisplayText
          referrerUrl
          refundable
          registeredSourceUrl
          requiresShipping
          restockable
          returnStatus
          riskLevel
          sourceIdentifier
          subtotalLineItemsQuantity
          subtotalPrice
          tags
          taxExempt
          taxesIncluded
          test
          totalCapturable
          totalDiscounts
          totalPrice
          totalReceived
          totalRefunded
          totalShippingPrice
          totalTax
          totalWeight
          unpaid
          updatedAt
          lineItems(first: 100) {
            nodes {
              id
              image {
                  url
                  id
              }
              name
              quantity
              title
              variantTitle
              originalTotal
              originalUnitPrice
            }
        }
        }
      }
    `
  }

  // Customer
  if (type === "login") {
    query = `
      mutation SignInWithEmailAndPassword {
        customerAccessTokenCreate(
          input: {
            email: "${body.email}"
            password: "${body.password}"
          }
        ) {
            customerAccessToken {
                accessToken
                expiresAt
            }
            customerUserErrors {
                code
                message
            }
        }
    }  
    `
  } else if (type === "resetPassword") {
    query = `
      mutation CustomerRecover {
        customerRecover(
          email: "${body.email}"
        ) {
          customerUserErrors {
            code
            field
            message
          }
          userErrors {
            field
            message
          }
        }
    }

    `
  } else if (type === "resetPasswordUrl") {
    query = `
      mutation customerResetByUrl {
        customerResetByUrl(
          password: "${body.password}"
          resetUrl: "${body.url}"
        ) {
            customer {
                acceptsMarketing
                createdAt
                displayName
                email
                firstName
                id
                lastName
                numberOfOrders
                phone
                tags
                updatedAt
            }
            customerAccessToken {
                accessToken
                expiresAt
            }
            customerUserErrors {
                code
                field
                message
            }
            userErrors {
                field
                message
            }
        }
    }

    `
  } else if (type === "signUp") {
    query = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
            customer {
                firstName
                lastName
                email
                phone
                acceptsMarketing
            }
            customerUserErrors {
                field
                message
                code
            }
        }
    }
    `
  } else if (type === "customer") {
    query = `
      query Customer {
        customer(customerAccessToken: "${body.access_token}") {
            acceptsMarketing
            createdAt
            displayName
            email
            firstName
            id
            lastName
            numberOfOrders
            phone
            tags
            updatedAt
            addresses(first: 100, reverse: true) {
                edges {
                    cursor
                    node {
                        address1
                        address2
                        city
                        company
                        country
                        countryCode
                        countryCodeV2
                        firstName
                        formatted
                        formattedArea
                        id
                        lastName
                        latitude
                        longitude
                        name
                        phone
                        province
                        provinceCode
                        zip
                    }
                }
            }
            defaultAddress {
                address1
                address2
                city
                company
                country
                countryCode
                countryCodeV2
                firstName
                formatted
                formattedArea
                id
                lastName
                latitude
                longitude
                name
                phone
                province
                provinceCode
                zip
            }
            orders(first: 100, reverse: true) {
                totalCount
                edges {
                    node {
                        cancelReason
                        canceledAt
                        currencyCode
                        customerLocale
                        customerUrl
                        edited
                        email
                        financialStatus
                        fulfillmentStatus
                        id
                        name
                        orderNumber
                        phone
                        processedAt
                        statusUrl
                        lineItems(first: 100) {
                            edges {
                                node {
                                    currentQuantity
                                    quantity
                                    title
                                    variant {
                                        availableForSale
                                        barcode
                                        currentlyNotInStock
                                        id
                                        quantityAvailable
                                        requiresShipping
                                        sku
                                        taxable
                                        title
                                        weight
                                        weightUnit
                                        image {
                                            altText
                                            height
                                            id
                                            originalSrc
                                            src
                                            transformedSrc
                                            url
                                            width
                                        }
                                    }
                                }
                            }
                        }
                        totalPrice {
                            amount
                            currencyCode
                        }
                        subtotalPrice {
                            amount
                            currencyCode
                        }
                        subtotalPriceV2 {
                            amount
                            currencyCode
                        }
                        totalShippingPrice {
                            amount
                            currencyCode
                        }
                        totalTax {
                            amount
                            currencyCode
                        }
                    }
                }
            }
        }
    }

    `
  } else if (type === "updateCustomer") {
    query = `
      mutation CustomerUpdate {
        customerUpdate(
          input: {
            email: "${body.email}"
            firstName: "${body.firstName}"
            lastName: "${body.lastName}"
            phone: "${body.phone}"
            id: "${body.id}"
            locale: "MN"
          }
        ) {
            customer {
              createdAt
              displayName
              email
              firstName
              id
              lastName
              legacyResourceId
              locale
              multipassIdentifier
              note
              numberOfOrders
              phone
              productSubscriberStatus
              state
              tags
              taxExempt
              taxExemptions
              unsubscribeUrl
              updatedAt
              validEmailAddress
              verifiedEmail
              emailMarketingConsent {
                consentUpdatedAt
                marketingOptInLevel
                marketingState
              }
              smsMarketingConsent {
                consentCollectedFrom
                consentUpdatedAt
                marketingOptInLevel
                marketingState
              }
            }
        }
    }
    `
  } else if (type === "customerByEmail") {
    query = `
      query {
        customers(first: 50, query: "email:${body.email}") {
          edges {
            node {
              id
              displayName
              firstName
              lastName
              email
              phone
              updatedAt
            }
          }
        }
      }
    `
  } else if (type === "createCustomerAddress") {
    query = `
      mutation CustomerAddressCreate($address: MailingAddressInput!, $customerAccessToken: String!) {
        customerAddressCreate(address: $address, customerAccessToken: $customerAccessToken) {
            customerAddress {
                address1
                address2
                city
                company
                country
                countryCode
                countryCodeV2
                firstName
                formatted
                formattedArea
                id
                lastName
                latitude
                longitude
                name
                phone
                province
                provinceCode
                zip
            }
            customerUserErrors {
                code
                field
                message
            }
            userErrors {
                field
                message
            }
        }
      }

    `
  } else if (type === "updateCustomerAddress") {
    query = `
      mutation CustomerAddressUpdate($address: MailingAddressInput!, $customerAccessToken: String!, $id: ID!) {
        customerAddressUpdate(address: $address, customerAccessToken: $customerAccessToken, id: $id) {
            customerAddress {
                address1
                address2
                city
                company
                country
                countryCode
                countryCodeV2
                firstName
                formatted
                formattedArea
                id
                lastName
                latitude
                longitude
                name
                phone
                province
                provinceCode
                zip
            }
            customerUserErrors {
                code
                field
                message
            }
            userErrors {
                field
                message
            }
        }
      }

    `
  } else if (type === "deleteCustomerAddress") {
    query = `
      mutation CustomerAddressDelete {
        customerAddressDelete(
          id: "${body.id}"
          customerAccessToken: "${body.access_token}"
        ) {
          deletedCustomerAddressId
        }
      }
    `
  } else if (type === "updateCustomerDefaultAddress") {
    query = `
      mutation CustomerDefaultAddressUpdate {
        customerDefaultAddressUpdate( 
          customerAccessToken: "${body.access_token}"
          addressId: "${body.id}"
        ) {
          customer {
            id
          }  
        }
      }
    `
  } else if (type === "updateCustomerSmsConsent") {
    query = `
      mutation CustomerSmsMarketingConsentUpdate {
        customerSmsMarketingConsentUpdate(
            input: {
              customerId: "${body.customerId}"
              smsMarketingConsent: {
                marketingOptInLevel: SINGLE_OPT_IN
                marketingState: SUBSCRIBED
              }
            }
        ) {
          customer {
            email
            id
          }
        }
      }
    `
  }

  // Product
  if (type === "product") {
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
            title
            sku
            barcode
            quantityAvailable
            currentlyNotInStock
            availableForSale
            storeAvailability(first: 100) {
              edges {
                  node {
                      available
                      pickUpTime
                      quantityAvailable
                      location {
                          id
                          name
                      }
                  }
              }
            }
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
    query = `{
      product(id: "gid://shopify/Product/${body.productId}") {
        ${productNode}
      }
    }`
  } else if (type === "createProduct") {
    query = `
      mutation ProductCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `
  } else if (type === "createProductVariant") {
    query = `
      mutation productVariantsBulkCreate(
        $productId: ID!
        $strategy: ProductVariantsBulkCreateStrategy
        $variants: [ProductVariantsBulkInput!]!
      ) {
          productVariantsBulkCreate(
              productId: $productId
              variants: $variants
              strategy: $strategy
          ) {
              product {
                  id
              }
              productVariants {
                  id
              }
              userErrors {
                  code
                  field
                  message
              }
          }
      }

    `
  } else if (type === "publishProduct") {
    query = `
      mutation productPublish($input: ProductPublishInput!) {
        productPublish(input: $input) {
          product {
            id
            title
          }
          productPublications {
            isPublished
            channel {
              id
              name
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `
  } else if (type === "productsCount") {
    query = `
      query ProductsCount {
        productsCount {
          count
        }
      }
    `
  }

  // Collections
  if (type === "collections") {
    let filters = {
      limit: body && body.limit ? body.limit : 150,
    }

    query = `
      query {
        collections(first: ${filters.limit}) {
          edges {
            cursor
            node {
              id
              handle
              title
              image {
                id
                url
                width
                height  
              }
              seo {
                title
              }
            }
          }
        }
      }
    `
  } else if (type === "collection") {
    query = `
      query {
        getCollectionByHandle($handle: String!) {
          collection(handle: ${body.handle}) {
            id
            handle
            title
            image {
              id
              url
              width
              height  
            }
            seo {
              title
            }
          }
        }
      }
    `
  } else if (type === "collectionsCount") {
    query = `
      query CollectionsCount {
        collectionsCount {
          count
        }
      }
    `
  }

  return query
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  if (!config.private.shopify) return

  const keys = config.private.shopify

  const gqlClient = createAdminApiClient({
    storeDomain: keys.store_domain,
    apiVersion: keys.api_version,
    accessToken: keys.graph_admin_access_token,
  })
  const client = createGraphQLClient({
    url: `https://${keys.store_domain}/api/${keys.api_version}/graphql.json`,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": keys.storefront_access_token,
    },
    retries: 1,
  })
  const restClient = createAdminRestApiClient({
    storeDomain: keys.store_domain,
    apiVersion: keys.api_version,
    accessToken: keys.graph_admin_access_token,
  })

  // GraphQL Admin
  if (body.graphqlAdmin) {
    let params = body.params
    let query = getQuery(body.type, params)
    let dataInput = {}

    if (body.dataInput) {
      if (body.type === "createProductVariant") {
        dataInput = body.dataInput
      } else {
        dataInput = {
          input: body.dataInput,
        }
      }
    }

    try {
      const { data, errors } = await gqlClient.request(query, {
        variables: dataInput,
      })

      if (errors) {
        return errors
      } else if (data) {
        return data
      }
    } catch (error) {
      return error
    }
    // GraphQL Client
  } else if (body.graphql) {
    let params = body.params
    let query = getQuery(body.type, params)
    let dataInput = {}

    if (body.rawInput) {
      dataInput = body.rawInput
    } else if (body.dataInput) {
      dataInput = {
        input: body.dataInput,
      }
    }

    try {
      const { data, errors } = await client.request(query, {
        variables: dataInput,
      })

      if (errors) {
        return errors
      } else if (data) {
        return data
      }
    } catch (error) {
      return error
    }
    // REST Admin
  } else {
    let request = {
      apiVersion: "2024-07",
    }

    if (body.method === "get") {
      if (body.params) {
        request.searchParams = body.params
      }
    } else if (
      body.method === "put" ||
      body.method === "post" ||
      body.method === "delete"
    ) {
      if (body.data) {
        request.data = body.data
      }
    }

    try {
      let response = null

      if (body.method === "get") {
        response = await restClient.get(body.type, request)
      } else if (body.method === "put") {
        response = await restClient.put(body.type, request)
      } else if (body.method === "post") {
        response = await restClient.post(body.type, request)
      } else if (body.method === "delete") {
        response = await restClient.delete(body.type, request)
      }

      if (response && response.ok) {
        let data = await response.json()
        return data
      } else {
        return
      }
    } catch (error) {
      return error
    }
  }
})
