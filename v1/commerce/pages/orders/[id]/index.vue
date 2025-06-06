<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else class="container small py-4">
        <div v-if="order" class="row">
          <!--Order Closed Status-->
          <Message
            v-if="order.closed"
            severity="error"
            class="c-message mx-3 mb-3 w-full"
            icon="pi pi-box"
            :closable="false"
          >
            {{ $utils.t("Order Closed") }}
          </Message>

          <!--General Info-->
          <div class="col-xs-12">
            <div class="d-block text-center p-6 mb-3">
              <i class="pi pi-box text-xl mb-2"></i>

              <h1 v-if="order.name" class="w-full mb-2">
                {{ $utils.t("Order") }}: {{ order.name }}
              </h1>

              <p v-if="order.confirmationNumber" class="font3">
                {{ $utils.t("Confirmation Number") }}:
                {{ order.confirmationNumber }}
              </p>

              <p v-if="order.processedAt" class="font3">
                {{ $utils.t("Ordered Date") }}:
                {{ $utils.formatDateTime(order.processedAt) }}
              </p>

              <p v-if="order.updatedAt" class="font3">
                {{ $utils.t("Updated Date") }}:
                {{ $utils.formatDateTime(order.updatedAt) }}
              </p>

              <p v-if="order.cancelledAt" class="font3">
                {{ $utils.t("Cancelled Date") }}:
                {{ $utils.formatDateTime(order.cancelledAt) }}
              </p>

              <p v-if="order.closedAt" class="font3">
                {{ $utils.t("Closed Date") }}:
                {{ $utils.formatDateTime(order.closedAt) }}
              </p>
            </div>
          </div>

          <!--Account Info-->
          <div class="col-xs-12 col-md-4">
            <div class="d-block fixedHeight text-center p-6 mb-3">
              <div>
                <i class="pi pi-user text-xl mb-2"></i>

                <h3 class="mb-2">{{ $utils.t("Account") }}</h3>

                <p v-if="order.email" class="font3">
                  {{ order.email }}
                </p>
                <p v-if="order.phone" class="font3">
                  {{ $utils.formatPhone(order.phone) }}
                </p>
              </div>
            </div>
          </div>

          <!--Financial Status-->
          <div class="col-xs-12 col-md-4">
            <div class="d-block fixedHeight text-center p-4 mb-3">
              <div>
                <i class="pi pi-receipt text-xl mb-2"></i>

                <h3 class="mb-3">{{ $utils.t("Payment Information") }}</h3>

                <p class="font3">
                  {{ $utils.t("Tax") }}: {{ $currency.format(order.totalTax) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Shipping") }}:
                  {{ $currency.format(order.totalShippingPrice) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Discount") }}:
                  {{ $currency.format(order.totalDiscounts) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Total") }}:
                  {{ $currency.format(order.totalPrice) }}
                </p>

                <Tag
                  v-if="order.displayFinancialStatus === 'PAID'"
                  severity="success"
                  class="mt-2"
                >
                  {{ $utils.t("Paid") }}
                </Tag>
                <Tag
                  v-else-if="order.displayFinancialStatus === 'REFUNDED'"
                  severity="success"
                  class="mt-2"
                >
                  {{ $utils.t("Refunded") }}
                </Tag>
                <Tag v-else severity="warning" class="mt-2">
                  {{ $utils.t("Not Paid") }}
                </Tag>
              </div>
            </div>
          </div>

          <!--Shipping Status-->
          <div class="col-xs-12 col-md-4">
            <div class="d-block fixedHeight text-center p-6 mb-3">
              <div>
                <i class="pi pi-truck text-xl mb-2"></i>

                <h3 class="mb-2">{{ $utils.t("Shipping Information") }}</h3>

                <Tag v-if="order.cancelReason" severity="danger" class="mb-1">
                  {{ $utils.t("Cancelled") }}
                </Tag>
                <Tag
                  v-else-if="order.displayFulfillmentStatus === 'UNFULFILLED'"
                  severity="warn"
                  class="mb-1"
                >
                  {{ $utils.t("Not Delivered") }}
                </Tag>
                <Tag
                  v-else-if="order.displayFulfillmentStatus === 'FULFILLED'"
                  severity="success"
                  class="mb-1"
                >
                  {{ $utils.t("Delivered") }}
                </Tag>
              </div>
            </div>
          </div>

          <!--Products-->
          <div class="col-xs-12">
            <div class="d-block text-center p-4 mb-3">
              <i class="pi pi-shopping-cart text-xl"></i>

              <h3 class="my-1">{{ $utils.t("Products Information") }}</h3>

              <p class="font3">
                {{ $utils.t("Total Products") }}:

                <Badge
                  :value="`${order.subtotalLineItemsQuantity}`"
                  severity="contrast"
                ></Badge>
              </p>
            </div>

            <div v-if="items" class="productsGrid row mb-2">
              <ProductsLineItem
                v-for="(item, index) in items"
                :item="item"
                :key="`product_line_item_${index}`"
              ></ProductsLineItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      orderId: null,
      order: null,
    }
  },

  computed: {
    items() {
      if (this.order) {
        if (this.order.lineItems) {
          return this.order.lineItems.nodes
        }
      }
      return []
    },
  },

  async created() {
    const id = useRoute().params.id
    this.orderId = id

    // console.log("Order ID ::: ", this.orderId)

    const res = await this.$shopify.order({
      orderId: this.orderId,
    })

    // console.log("Orders ::: ", res)

    if (res && res.order) {
      this.order = res.order
    }

    setTimeout(() => {
      this.loading = false
    }, 1500)
  },
}
</script>
