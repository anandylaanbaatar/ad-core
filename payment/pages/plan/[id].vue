<template>
  <AppLayout type="regular">
    <div class="c-page plan">
      <Loader v-if="loading"></Loader>

      <div v-else class="container small mt-4">
        <div class="row">
          <div class="col-xs-12">
            <div class="d-block text-center p-6 mb-3">
              <i class="pi pi-box text-xl mb-2"></i>
              <h1 class="c-title mb-3">Subscriptions</h1>
            </div>

            <div v-if="subscription" class="d-block">
              <div class="row">
                <div class="col-xs-12 col-md-6">
                  <Tag
                    v-if="subscription.status === 'active'"
                    severity="success"
                    class="mb-2"
                    >Active Subscription</Tag
                  >
                  <h3
                    v-if="subscription.plan.interval === 'month'"
                    class="capitalize mb-1"
                  >
                    Monthly Plan (${{ subscription.plan.amount / 100 }})
                  </h3>
                  <h3
                    v-else-if="subscription.plan.interval === 'year'"
                    class="capitalize mb-2"
                  >
                    Yearly Plan (${{ subscription.plan.amount / 100 }})
                  </h3>
                  <p class="">Started Date: {{ subscription.plan.created }}</p>
                </div>
                <div class="col-xs-12 col-md-6">
                  <div class="actionBtns w-full text-right pt-3">
                    <Button
                      severity="danger"
                      label="Cancel Subscription"
                      @click="cancelSubscription(subscriptionId)"
                    ></Button>
                  </div>
                </div>
              </div>
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

      subscription: null,
      subscriptionId: null,
    }
  },

  async mounted() {
    // const store = useServicesStore()
    // await store.setSubscriptions()

    // this.subscriptionId = useRoute().params.id
    // this.subscription = store.singleSubscription(this.subscriptionId)

    this.loading = false
  },

  methods: {
    cancelSubscription(subscriptionId) {
      this.$confirm.require({
        group: "global",
        message: "Are you sure you want to Cancel your subscription?",
        header: "Cancel Subscription",
        rejectLabel: "Keep Subscription",
        acceptLabel: "Cancel Subscription",
        accept: () => {
          console.log("Cancel Subscription!")
        },
      })
    },
  },
}
</script>
