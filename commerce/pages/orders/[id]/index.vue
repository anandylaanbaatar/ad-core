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

              <h1 v-if="order.order_number" class="w-full mb-2">
                {{ $utils.t("Order") }}: {{ order.order_number }}
              </h1>

              <p v-if="order.id" class="font3">
                {{ $utils.t("Confirmation Number") }}:
                {{ order.id }}
              </p>

              <p v-if="order.date_created" class="font3">
                {{ $utils.t("Ordered Date") }}:
                {{ $utils.formatDateTime(order.date_created) }}
              </p>

              <p v-if="order.date_updated" class="font3">
                {{ $utils.t("Updated Date") }}:
                {{ $utils.formatDateTime(order.date_updated) }}
              </p>

              <p v-if="order.canceled_at" class="font3">
                {{ $utils.t("Cancelled Date") }}:
                {{ $utils.formatDateTime(order.canceled_at) }}
              </p>

              <p v-if="order.completed_at" class="font3">
                {{ $utils.t("Completed Date") }}:
                {{ $utils.formatDateTime(order.completed_at) }}
              </p>
            </div>
          </div>

          <!--Account Info-->
          <div class="col-xs-12 col-md-4">
            <div class="d-block fixedHeight text-center p-6 mb-3">
              <div>
                <i class="pi pi-user text-xl mb-2"></i>

                <h3 class="mb-2">{{ $utils.t("Account") }}</h3>

                <template v-if="order.customer">
                  <p v-if="order.customer.first_name || order.customer.last_name" class="font3">
                    {{ order.customer.first_name }} {{ order.customer.last_name }}
                  </p>
                  <p v-if="order.customer.email" class="font3">
                    {{ order.customer.email }}
                  </p>
                  <p v-if="order.customer.phone" class="font3">
                    {{ $utils.formatPhone(order.customer.phone) }}
                  </p>
                </template>
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
                  {{ $utils.t("Tax") }}: {{ $currency.format(order.tax_total) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Shipping") }}:
                  {{ $currency.format(order.shipping_total) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Discount") }}:
                  {{ $currency.format(order.discount_total) }}
                </p>

                <p class="font3">
                  {{ $utils.t("Total") }}:
                  {{ $currency.format(order.total) }}
                </p>

                <p v-if="order.payment?.method" class="font3">
                  {{ $utils.t("Method") }}:
                  {{ order.payment.method.toUpperCase() }}
                </p>

                <Tag
                  v-if="order.payment?.status === 'paid'"
                  severity="success"
                  class="mt-2"
                >
                  {{ $utils.t("Paid") }}
                </Tag>
                <Tag
                  v-else-if="order.payment?.status === 'refunded'"
                  severity="info"
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

                <p v-if="order.shipping_method" class="font3 mb-2">
                  {{ order.shipping_method }}
                </p>

                <p v-if="order.shipping_address?.full_address" class="font3 mb-2">
                  {{ order.shipping_address.full_address }}
                </p>

                <Tag v-if="order.canceled_at" severity="danger" class="mb-1">
                  {{ $utils.t("Cancelled") }}
                </Tag>
                <Tag
                  v-else-if="order.fulfillment_status === 'open'"
                  severity="warn"
                  class="mb-1"
                >
                  {{ $utils.t("Not Delivered") }}
                </Tag>
                <Tag
                  v-else-if="order.fulfillment_status === 'in_progress'"
                  severity="warn"
                  class="mb-1"
                >
                  {{ $utils.t("In Progress") }}
                </Tag>
                <Tag
                  v-else-if="order.fulfillment_status === 'fulfilled'"
                  severity="success"
                  class="mb-1"
                >
                  {{ $utils.t("Delivered") }}
                </Tag>
                <Tag
                  v-else-if="order.fulfillment_status === 'on_hold'"
                  severity="warn"
                  class="mb-1"
                >
                  {{ $utils.t("On Hold") }}
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

                <Badge :value="`${lineItemsCount}`" severity="contrast"></Badge>
              </p>
            </div>

            <div v-if="lineItems" class="productsGrid row mb-2">
              <ProductsLineItem
                v-for="(item, index) in lineItems"
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
    lineItems() {
      if (this.order?.line_items) {
        return this.order.line_items.map((item) => item.line_items_id).filter(Boolean)
      }
      return []
    },
    lineItemsCount() {
      if (this.lineItems) {
        let count = 0

        for (let i = 0; i < this.lineItems.length; i++) {
          count += this.lineItems[i]?.quantity || 0
        }

        return count
      }
      return 0
    },
  },

  async mounted() {
    const id = useRoute().params.id
    this.orderId = id

    const res = await this.$directus.order.item({
      id: id,
    })

    console.log("Orders ::: ", res)

    if (res.success && res.data) {
      this.order = res.data
    }

    setTimeout(() => {
      this.loading = false
    }, 1500)
  },
}
</script>
