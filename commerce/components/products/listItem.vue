<template>
  <div
    v-if="item"
    class="c-product box list large w-full"
    @click="$bus.$emit('goTo', `/shop/t-shirt/${item.id}_${item.handle}`)"
  >
    <div class="row h-full flex align-items-center">
      <!--Image-->
      <div v-if="item.featuredImage" class="col-xs-3 image">
        <div
          v-if="item.featuredImage.url"
          class="c-block c-image w-full size-xxs"
          :style="$utils.setBackImage(item.featuredImage.url)"
        ></div>
      </div>

      <!--No Image-->
      <div v-else class="col-xs-3 image">
        <div class="c-block c-image w-full size-xxs"></div>
      </div>

      <!--Content-->
      <div class="col-xs-5 h-full flex align-items-center">
        <div class="relative">
          <p class="block text-sm">{{ item.title }}</p>
          <!-- <span class="text-sm mb-1"> Premium Quality </span> -->
          <p class="text-sm">{{ $currency.format(item.price) }}</p>

          <!--Button
          <Button
            label="Add To Cart"
            icon="pi pi-shopping-cart"
            iconPos="right"
            class="p-button-secondary addToCart mt-3"
            block
            @click.stop="addToCart"
          ></Button>-->
        </div>
      </div>

      <div class="col-xs-4 h-full flex align-items-center left-auto"></div>
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
}
</script>
