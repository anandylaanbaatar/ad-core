<template>
  <div v-if="item" class="col-xs-12 px-0">
    <div class="product cartItem preview">
      <div class="imageArea">
        <div
          class="image block relative"
          :class="{ emptyImage: !itemImage }"
          :style="`background-image:url(${itemImage});`"
        >
          <div class="c-block-top-right p-1">
            <Badge :value="`${item.quantity}`" severity="contrast"></Badge>
          </div>
          <h5 v-if="!itemImage">{{ useAppConfig().theme.name_short }}</h5>
        </div>
      </div>

      <div class="content">
        <div>
          <p class="font2 title">
            {{ $utils.addDots(item.title, 23) }}
          </p>
          <p class="font2 price">
            {{ $currency.format(item.originalTotal) }}
          </p>

          <p
            v-if="
              item.variantTitle !== 'Default Title' &&
              item.variantTitle !== 'Default' &&
              item.variantTitle !== 'default'
            "
            class="description"
          >
            {{ item.variantTitle }}
          </p>
        </div>
      </div>
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
    return {}
  },

  computed: {
    itemImage() {
      if (this.item && this.item.image) {
        return this.item.image.url
      }
      return false
    },
  },
}
</script>
