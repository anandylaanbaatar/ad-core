<template>
  <div class="d-block px-4 mb-5">
    <h3 class="mb-3">{{ $utils.t("My Orders") }}</h3>

    <!--Orders-->
    <template v-if="allOrders">
      <div
        v-for="order in allOrders"
        :key="`order_item_${order.id}`"
        class="d-block px-3 relative c-link mb-2"
        @click="
          $bus.$emit(
            'goTo',
            `/orders/${order.id.replace('gid://shopify/Order/', '')}`
          )
        "
      >
        <Tag v-if="order.cancelReason" severity="danger" class="mb-1">
          {{ $utils.t("Cancelled") }}
        </Tag>
        <Tag
          v-else-if="order.fulfillmentStatus === 'UNFULFILLED'"
          severity="warn"
          class="mb-1"
          icon="pi pi-exclamation-circle"
        >
          {{ $utils.t("Not Delivered") }}
        </Tag>
        <Tag
          v-else-if="order.fulfillmentStatus === 'FULFILLED'"
          severity="success"
          class="mb-1"
          icon="pi pi-check"
        >
          {{ $utils.t("Delivered") }}
        </Tag>

        <p class="font3">{{ $utils.t("Order Number") }}: {{ order.name }}</p>
        <p class="font3 text-sm line-height-2">
          {{ $utils.formatDateTime(order.processedAt) }}
        </p>
      </div>
    </template>

    <!--Empty-->
    <div v-else class="emptyArea">
      <div>
        <i class="pi pi-box"></i>
        <h4>{{ $utils.t("No Orders Yet") }}</h4>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    account: {
      type: Object,
      default: null,
    },
  },

  computed: {
    allOrders() {
      if (this.account && this.account.orders) {
        if (this.account.orders.edges && this.account.orders.edges.length > 0) {
          let orderItems = this.account.orders.edges.map((i) => i.node)
          return orderItems
        }
      }
      return
    },
  },
}
</script>
