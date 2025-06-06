<template>
  <div
    v-if="item"
    class="c-product box animate-fadein animate-duration-500 mb-4 w-full"
  >
    <!--Images-->
    <div class="c-product-images">
      <!--Images Slider-->
      <SlidersProduct
        v-if="item.images.length > 1"
        class="c-product-slider"
        :item="item"
        type="productItemSlider"
      ></SlidersProduct>

      <!--Single Image-->
      <div v-else-if="item.featuredImage" class="w-full text-center">
        <div
          v-if="item.featuredImage.url"
          class="c-block c-image size-m"
          :style="$utils.setBackImage(item.featuredImage.url)"
          @click.stop="
            $bus.$emit(
              'goTo',
              `/products/${this.item.category.handle}/${this.item.id}_${this.item.handle}`
            )
          "
        ></div>
      </div>

      <!--No Image-->
      <div v-else class="w-full text-center">
        <div
          class="c-block c-no-image size-m"
          @click.stop="
            $bus.$emit(
              'goTo',
              `/products/${this.item.category.handle}/${this.item.id}_${this.item.handle}`
            )
          "
        >
          <h5>{{ useAppConfig().theme.name_short }}</h5>
        </div>
      </div>

      <!--Overlay Items-->
      <div class="c-product-images-overlay">
        <div v-if="item.tags" class="c-block-top-left p-2">
          <!--Tags-->
          <template v-for="tag in item.tags" :key="`product_tag_${tag}`">
            <Tag v-if="tag === 'Available'" severity="success" class="mr-2">{{
              $utils.t(tag)
            }}</Tag>
            <Tag v-else-if="tag === 'Sale'" severity="danger" class="mr-2">{{
              $utils.t(tag)
            }}</Tag>
            <Tag v-else severity="info" class="mr-2">{{ $utils.t(tag) }}</Tag>
          </template>

          <!--Inventory-->
          <Tag
            v-if="item.totalInventory && item.totalInventory < 5"
            :value="`${$utils.t('Low in Stock')} (${item.totalInventory})`"
            severity="warn"
            class="mr10"
          ></Tag>
          <Tag
            v-else-if="!item.totalInventory || item.totalInventory === 0"
            :value="`${$utils.t('Out of Stock')}`"
            severity="danger"
            class="mr-10"
          ></Tag>
          <Tag
            v-else-if="item.totalInventory && item.totalInventory >= 5"
            :value="`${$utils.t('Available In Stock')} (${item.totalInventory})`"
            severity="success"
            class="mr-10"
          ></Tag>
        </div>

        <div class="c-block-top-right p-2">
          <Button
            v-if="!isSavedItem"
            icon="pi pi-heart"
            class="sm p-glass-button"
            @click.stop="useSaveProduct(item)"
            aria-label="Save Button"
          ></Button>
          <Button
            v-else
            icon="pi pi-heart-fill"
            class="sm p-glass-button"
            @click.stop="useRemoveProduct(item)"
            aria-label="Remove Button"
          ></Button>
        </div>
      </div>
    </div>

    <!--Content-->
    <div
      @click.stop="
        $bus.$emit(
          'goTo',
          `/products/${this.item.category.handle}/${this.item.id}_${this.item.handle}`
        )
      "
      class="flex items-center c-product-content"
    >
      <div class="flex flex-col">
        <div>
          <p class="block font-bold mb-1">{{ item.title }}</p>
          <!-- <p
            class="block text-surface-500 dark:text-surface-400 text-sm mt-2 mb-2"
          >
            (Unisex) Premium Quality
          </p> -->

          <p class="font-bold">
            {{ $currency.format(item.price) }}
          </p>

          <!-- <Button
            label="View Product"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="p-button-secondary w-full addToCart"
            @click.stop="$bus.$emit('goTo', `/shop/t-shirt/${item.uid}`)"
          ></Button> -->
        </div>
      </div>

      <!-- <div class="ml-auto text-right">
        <ul class="c-colors">
          <li class="c-color black"></li>
          <li class="c-color white"></li>
        </ul>
      </div> -->
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

  computed: {
    itemPath() {
      return `/products/${this.item.category.handle}/${this.item.id}_${this.item.handle}`
    },
  },

  computed: {
    isSavedItem() {
      const savedItems = useCommerceStore().savedItems
      if (savedItems.indexOf(this.item.id) > -1) {
        return true
      }
      return false
    },
  },
}
</script>
