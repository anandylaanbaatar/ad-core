<template>
  <div
    v-if="id === 'storepay' && price >= 100000"
    class="d-block image mt-3"
    :style="`background-image:url(/images/theme/storepay-background.png);`"
  >
    <div class="w-full color-white">
      <img
        src="/images/theme/storepay_logo_white.png"
        height="25"
        alt="StorePay"
        class="my-2"
      />
      <p class="text-white">{{ $utils.t("Available with StorePay") }}</p>
    </div>
  </div>

  <div
    v-if="id === 'qpay'"
    class="d-block image mt-3"
    :style="`background-color: rgb(14, 47, 92);`"
  >
    <div class="w-full color-white">
      <img
        src="/images/theme/qpay_logo_white.png"
        height="25"
        alt="QPay"
        class="my-2"
        :style="`filter: brightness(0) invert(1);`"
      />
      <p class="text-white">{{ $utils.t("Available with QPay") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
  },
}
</script>
