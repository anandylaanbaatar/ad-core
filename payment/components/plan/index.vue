<template>
  <div v-if="plan" class="c-block plan">
    <h2 class="title">{{ plan.lookup_key }} Plan</h2>
    <h1 class="price">${{ plan.formattedPrice }}</h1>

    <p v-if="plan.lookup_key === 'monthly'" class="price-sub">per month</p>
    <p v-else-if="plan.lookup_key === 'annual'" class="price-sub">per year</p>
    <p v-if="plan.lookup_key === 'gold'" class="price-sub">
      One time - Forever
    </p>

    <Button
      v-if="type === 'select'"
      label="Select Plan"
      class="w-full"
      severity="success"
      @click="$bus.$emit('goTo', `/plan/payment?plan=${plan.lookup_key}`)"
    ></Button>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "select",
    },
    plan: {
      type: Object,
      default: null,
    },
  },
}
</script>
