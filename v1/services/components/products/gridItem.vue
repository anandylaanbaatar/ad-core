<template>
  <div
    v-if="data"
    class="c-item c-image"
    :style="productImage"
    @click="goTo(productUrl)"
  >
    <div class="bottom">
      <div>
        <h3 class="text-white">
          <span v-if="data.name">{{ data.name }}</span>
          <i class="pi pi-arrow-right"></i>
        </h3>

        <h4 class="my-1">
          <span v-if="data.currency" class="mr-2"
            >{{ data.currency.toUpperCase() }}
          </span>
          <span v-if="data.amount"
            >{{ data.amount_formatted }} /
            {{ getClassInterval(data.interval) }}</span
          >
        </h4>

        <p
          v-if="data.description"
          class="text-white text-sm pr-4 line-height-1"
        >
          {{ $utils.addDots(data.description, 50) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },

  computed: {
    productImage() {
      if (this.data) {
        if (this.data.image) {
          return this.$utils.setBackImage(this.data.image)
        }
      }
      return
    },
    productUrl() {
      if (this.data) {
        return `/services/${this.data.id}`
      }
      return
    },
  },
}
</script>
