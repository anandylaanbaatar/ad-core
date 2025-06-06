<template>
  <div class="sidebar">
    <div>
      <UserSubscriptions
        v-if="customerId"
        :id="customerId"
        :header="false"
        :subscriptionId="subscriptionId"
      ></UserSubscriptions>
    </div>

    <div class="bottom">
      <div></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: false,
      active: false,
      subscriptionId: null,
    }
  },

  computed: {
    customerId() {
      const user = useAuthStore().user
      const paymentStore = usePaymentStore()

      if (user && paymentStore) {
        if (paymentStore.customerId) {
          return paymentStore.customerId
        }
      }

      return
    },
  },

  methods: {
    reset() {
      this.subscriptionId = null
    },
    select(id) {
      this.subscriptionId = id
    },
  },
}
</script>
