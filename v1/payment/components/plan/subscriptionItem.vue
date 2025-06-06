<template>
  <div v-if="subscription" class="d-block c-link mb-3">
    <h3 class="w-full flex mb-1">
      <span v-if="subscriptionName">{{ subscriptionName }}</span>

      <!--Status-->
      <Tag
        v-if="subscription.status === 'active'"
        severity="success"
        class="ml-auto"
        >Active</Tag
      >
      <Tag
        v-else-if="subscription.status === 'canceled'"
        severity="danger"
        class="ml-auto"
        >Canceled</Tag
      >
      <Tag
        v-else-if="subscription.status === 'incomplete'"
        severity="warn"
        class="ml-auto"
        >InComplete</Tag
      >
      <Tag
        v-else-if="subscription.status === 'incomplete_expired'"
        severity="warn"
        class="ml-auto"
        >InComplete Expired</Tag
      >
    </h3>

    <h4 v-if="subscriptionPrice" class="capitalize">{{ subscriptionPrice }}</h4>

    <template v-if="type === 'detailed'">
      <!--Active-->
      <p v-if="subscription.status === 'active'" class="text-sm flex w-full">
        Billing Period:<br />
        {{ $utils.utcSecToDate(subscription.current_period_start) }}
        -
        {{ $utils.utcSecToDate(subscription.current_period_end) }}
      </p>

      <!--Cancelled-->
      <p v-else-if="subscription.status === 'canceled'" class="text-sm w-full">
        Cancelled At: {{ $utils.utcSecToDate(subscription.canceled_at) }}<br />
        <span
          v-if="
            subscription.cancellation_details &&
            subscription.cancellation_details.reason
          "
          >Reason: {{ subscription.cancellation_details.reason }}
        </span>
      </p>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    subscription: {
      type: Object,
      default: null,
    },
    type: {
      type: String,
      default: "simple",
    },
  },

  computed: {
    products() {
      return useServicesStore().products
    },
    subscriptionName() {
      let name = ""

      if (this.subscription) {
        if (this.subscription.plan) {
          if (this.subscription.plan.product) {
            if (this.products) {
              let product = this.products.find(
                (i) => i.id === this.subscription.plan.product
              )
              if (product) {
                return `${product.name}`
              }
            }
          }
          if (this.subscription.plan.interval) {
            return getClassInterval(this.subscription.plan.interval)
          }
        }
      }

      return name
    },
    subscriptionPrice() {
      if (this.subscription && this.subscription.plan) {
        if (this.subscription.plan.product) {
          let product = this.products.find(
            (i) => i.id === this.subscription.plan.product
          )
          if (product) {
            return `${product.currency.toUpperCase()} ${product.amount_formatted} / ${getClassInterval(product.interval)}`
          }
        }
      }
      return
    },
  },
}
</script>
