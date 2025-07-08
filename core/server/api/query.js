import { createAdminRestApiClient } from "@shopify/admin-api-client"
import { createGraphQLClient } from "@shopify/graphql-client"
import { createAdminApiClient } from "@shopify/admin-api-client"
import { defineEventHandler, readBody } from "h3"

// https://github.com/Shopify/shopify-app-js/tree/565d1142edbfabba8ad516214f597778f7cfb521/packages/api-clients/admin-api-client#rest-client
// https://shopify.dev/docs/api/storefront/2024-07/queries/collection

const getProductsQuery = (type, options) => {
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
  if (typeof options.limit === "undefined") {
    options.limit = 5
  }
  if (typeof options.category === "undefined") {
    options.category = "all"
  }
  if (typeof options.sort === "undefined") {
    options.sort = "CREATED_AT"
  }

  if (options.query) {
    queryFilter = `, query:*${options.query}*`
  }
  if (options.ids) {
    let queryList = ""

    for (let i = 0; i < options.ids.length; i++) {
      if (queryList !== "") queryList += ` OR `
      queryList += `(id:${options.ids[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }
  if (options.handles) {
    let queryList = ""

    for (let i = 0; i < options.handles.length; i++) {
      if (queryList !== "") queryList += " OR "
      queryList += `(handle:${options.handles[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }

  let pagination = ``
  if (options.cursor) {
    pagination = `, after: "${options.cursor}"`
  }

  let reverseKey = `, reverse: true`
  let sortKey = `, sortKey: ${options.sort}`

  if (options.direction) {
    if (options.direction === "asc") {
      reverseKey = `, reverse: false`
    }
  }
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
const getCollectionsQuery = (type, options) => {
  let query = ""

  let collectionNode = `
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
      description
    }
  `
  let collectionEdges = `
    edges {
      cursor
      node {
        ${collectionNode}
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

  // Filters
  let queryFilter = ``
  if (typeof options.limit === "undefined") {
    options.limit = 150
  }
  if (typeof options.sort === "undefined") {
    options.sort = "TITLE"
  }

  if (options.query) {
    queryFilter = `, query:*${options.query}*`
  }
  if (options.ids) {
    let queryList = ""

    for (let i = 0; i < options.ids.length; i++) {
      if (queryList !== "") queryList += ` OR `
      queryList += `(id:${options.ids[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }
  if (options.handles) {
    let queryList = ""

    for (let i = 0; i < options.handles.length; i++) {
      if (queryList !== "") queryList += " OR "
      queryList += `(handle:${options.handles[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }

  let pagination = ``
  if (options.cursor) {
    pagination = `, after: "${options.cursor}"`
  }

  let reverseKey = `, reverse: true`
  let sortKey = `, sortKey: ${options.sort}`

  if (options.direction) {
    if (options.direction === "asc") {
      reverseKey = `, reverse: false`
    }
  }
  if (options.sort === "UPDATED_AT") {
    sortKey = `, sortKey: UPDATED_AT`
  }

  query = `
    query {
      collections(first: ${options.limit}${queryFilter}${sortKey}${reverseKey}${pagination}) {
        ${collectionEdges}
        ${pageInfo}
      }
    }
  `

  return query
}
const getOrdersQuery = (type, options) => {
  let query = ""

  let node = `
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
  `
  let edges = `
    edges {
      cursor
      node {
        ${node}
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

  // Filters
  let queryFilter = ``
  if (typeof options.limit === "undefined") {
    options.limit = 150
  }
  if (typeof options.sort === "undefined") {
    options.sort = "CREATED_AT"
  }

  if (options.query) {
    queryFilter = `, query:*${options.query}*`
  }
  if (options.ids) {
    let queryList = ""

    for (let i = 0; i < options.ids.length; i++) {
      if (queryList !== "") queryList += ` OR `
      queryList += `(id:${options.ids[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }
  if (options.handles) {
    let queryList = ""

    for (let i = 0; i < options.handles.length; i++) {
      if (queryList !== "") queryList += " OR "
      queryList += `(handle:${options.handles[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }

  let pagination = ``
  if (options.cursor) {
    pagination = `, after: "${options.cursor}"`
  }

  let reverseKey = `, reverse: true`
  let sortKey = `, sortKey: ${options.sort}`

  if (options.direction) {
    if (options.direction === "asc") {
      reverseKey = `, reverse: false`
    }
  }
  if (options.sort) {
    sortKey = `, sortKey: ${options.sort}`
  }

  query = `
    query {
      orders(first: ${options.limit}${queryFilter}${sortKey}${reverseKey}${pagination}) {
        ${edges}
        ${pageInfo}
      }
    }
  `

  return query
}
const getCustomersQuery = (type, options) => {
  let query = ""

  let node = `
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
  `
  let edges = `
    edges {
      cursor
      node {
        ${node}
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

  // Filters
  let queryFilter = ``
  if (typeof options.limit === "undefined") {
    options.limit = 150
  }
  if (typeof options.sort === "undefined") {
    options.sort = "CREATED_AT"
  }

  if (options.query) {
    queryFilter = `, query:*${options.query}*`
  }
  if (options.ids) {
    let queryList = ""

    for (let i = 0; i < options.ids.length; i++) {
      if (queryList !== "") queryList += ` OR `
      queryList += `(id:${options.ids[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }
  if (options.handles) {
    let queryList = ""

    for (let i = 0; i < options.handles.length; i++) {
      if (queryList !== "") queryList += " OR "
      queryList += `(handle:${options.handles[i]})`
    }

    queryFilter = `, query: "${queryList}"`
  }

  let pagination = ``
  if (options.cursor) {
    pagination = `, after: "${options.cursor}"`
  }

  let reverseKey = `, reverse: true`
  let sortKey = `, sortKey: ${options.sort}`

  if (options.direction) {
    if (options.direction === "asc") {
      reverseKey = `, reverse: false`
    }
  }
  if (options.sort) {
    sortKey = `, sortKey: ${options.sort}`
  }

  query = `
    query {
      customers(first: ${options.limit}${queryFilter}${sortKey}${reverseKey}${pagination}) {
        ${edges}
        ${pageInfo}
      }
    }
  `

  return query
}

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
  if (type === "orders") {
    query = getOrdersQuery(type, body)
  } else if (type === "draftOrders") {
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
  } else if (type === "ordersCount") {
    query = `
      query OrdersCount {
        ordersCount(limit: 10000) {
          count
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
  } else if (type === "customers") {
    query = getCustomersQuery(type, body)
  } else if (type === "customersCount") {
    query = `
      query CustomerCount {
        customersCount {
          count
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
  if (type === "products") {
    query = getProductsQuery(type, body)
  } else if (type === "product") {
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
    query = getCollectionsQuery(type, body)
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
  } else if (type === "collectionById") {
    query = `
      query {
        collection(id: "gid://shopify/Collection/${body.id}") {
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

  // Locations
  if (type === "locations") {
    const limit = body && body.limit ? body.limit : 50

    query = `
      query {
        locations(first: ${limit}) {
          edges {
            node {
              id
              name
              isActive
              address {
                address1
                address2
                city
                country
                countryCode
                formatted
                latitude
                longitude
                phone
                province
                provinceCode
                zip
              }
              hasActiveInventory
              hasUnfulfilledOrders
              shipsInventory
              deletable
              createdAt
              updatedAt
            }
          }
        }
      }
    `
  } else if (type === "location") {
    query = `
      query {
        location(id: "gid://shopify/Location/${body.locationId}") {
          id
          name
          isActive
          address {
            address1
            address2
            city
            country
            countryCode
            formatted
            latitude
            longitude
            phone
            province
            provinceCode
            zip
          }
          hasActiveInventory
          hasUnfulfilledOrders
          shipsInventory
          deletable
          createdAt
          updatedAt
        }
      }
    `
  }

  return query
}

export default defineEventHandler(async (event) => {
  const bodyData = await readBody(event)
  const config = useRuntimeConfig(event)
  let keys = config.private.shopify
  let body = bodyData

  // Override Keys
  if (body.customKeys) {
    keys = body.customKeys
    delete body.customKeys
  }
  if (body.params) {
    if (body.params.customKeys) {
      keys = body.params.customKeys
      delete body.params.customKeys
    }
  }
  if (!keys) return

  const adminClient = createAdminApiClient({
    storeDomain: keys.store_domain,
    apiVersion: keys.api_version,
    accessToken: keys.graph_admin_access_token,
  })
  const storeClient = createGraphQLClient({
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
    let input = {}

    if (body.rawInput) {
      input = body.rawInput
    } else if (body.dataInput) {
      if (body.type === "createProductVariant") {
        input = body.dataInput
      } else {
        input = {
          input: body.dataInput,
        }
      }
    }

    try {
      const { data, errors } = await adminClient.request(query, {
        variables: input,
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
    let input = {}

    if (body.rawInput) {
      input = body.rawInput
    } else if (body.dataInput) {
      input = {
        input: body.dataInput,
      }
    }

    try {
      const { data, errors } = await storeClient.request(query, {
        variables: input,
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
      apiVersion: keys.api_version,
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
