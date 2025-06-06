<template>
  <AppLayout type="regular">
    <div class="c-page plans">
      <div class="container py-4">
        <h1 class="c-title">Plan Upgrade</h1>

        <div class="row mt-4">
          <div
            v-for="plan in plans"
            :key="`plan_${plan.id}`"
            class="col-xs-12 col-md-4"
          >
            <Plan type="select" :plan="plan"></Plan>
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
      plans: [],
    }
  },

  async mounted() {
    await this.setPlans()
  },

  methods: {
    async setPlans() {
      const { data } = await this.$stripe.product.prices()

      let goldPlan = data.find((i) => i.lookup_key === "gold")
      let annualPlan = data.find((i) => i.lookup_key === "annual")
      let monthlyPlan = data.find((i) => i.lookup_key === "monthly")

      this.plans = [monthlyPlan, annualPlan, goldPlan]
    },
  },
}
</script>
