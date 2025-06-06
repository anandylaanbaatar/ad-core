<template>
  <div class="d-block px-4 mb-5">
    <h3 class="mb-3">{{ $utils.t("Subscriptions") }}</h3>
    <Button
      v-if="subscriptions"
      icon="pi pi-arrow-right"
      severity="secondary"
      class="c-block-top-right mt-3 mr-3 sm"
      @click="$bus.$emit('sidebarGlobal', { id: 'payments' })"
      v-tooltip.left="$utils.t('All Subscriptions')"
    ></Button>

    <div
      v-if="subscriptions && subscriptions.length > 0"
      v-for="subscription in subscriptions"
      :key="`subs_${subscription.id}`"
      @click="
        $bus.$emit('sidebarGlobal', {
          id: 'payments',
          data: {
            id: subscription.id,
          },
        })
      "
    >
      <PlanSubscriptionItem :subscription="subscription"></PlanSubscriptionItem>
    </div>

    <div v-else class="emptyArea">
      <div>
        <i class="pi pi-box"></i>
        <h4 class="font3">
          {{ $utils.t("No subscriptions found at this time.") }}
        </h4>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },

  computed: {
    subscriptions() {
      return useServicesStore().subscriptions
    },
  },
}
</script>
