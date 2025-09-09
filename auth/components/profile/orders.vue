<template>
  <div class="d-block px-4 mb-5">
    <h3 class="mb-3">{{ $utils.t("My Orders") }}</h3>

    <!--Orders-->
    <template v-if="allOrders">
      <div
        v-for="order in allOrders"
        :key="`order_item_${order.id}`"
        class="d-block px-3 relative c-link mb-2"
        @click="$bus.$emit('goTo', `/orders/${order.id}`)"
      >
        <Tag
          v-if="order.fulfillment_status === 'open'"
          severity="warn"
          class="mb-1"
        >
          {{ $utils.t("Open") }}
        </Tag>
        <Tag
          v-else-if="order.fulfillment_status === 'in_progress'"
          severity="warn"
          class="mb-1"
          icon="pi pi-refresh"
        >
          {{ $utils.t("In Progress") }}
        </Tag>
        <Tag
          v-else-if="order.fulfillment_status === 'fulfilled'"
          severity="success"
          class="mb-1"
          icon="pi pi-check"
        >
          {{ $utils.t("Delivered") }}
        </Tag>
        <Tag
          v-else-if="order.fulfillment_status === 'on_hold'"
          severity="info"
          class="mb-1"
          icon="pi pi-exclamation-circle"
        >
          {{ $utils.t("On Hold") }}
        </Tag>

        <p class="font3">
          {{ $utils.t("Order Number") }}: #{{ order.order_number }}
        </p>
        <p class="opacity-50 text-sm line-height-2">
          {{ $utils.formatDateTime(order.processedAt) }}
        </p>
      </div>
    </template>

    <!--Empty-->
    <div v-else class="emptyArea">
      <div>
        <i class="pi pi-box"></i>
        <p>{{ $utils.t("No Orders Yet") }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    customer() {
      return useCommerceStore().customer
    },
    allOrders() {
      if (this.customer?.orders?.length) {
        return this.customer.orders
      }
      return
    },
  },
}
</script>
