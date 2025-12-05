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
      <div v-else-if="item.featured_image" class="w-full text-center">
        <div
          v-if="item.featured_image.url"
          class="c-block c-image size-m"
          v-lazy-bg="item.featured_image.url"
          @click.stop="$bus.$emit('goTo', productUrl)"
        ></div>
      </div>

      <!--No Image-->
      <div v-else class="w-full text-center">
        <div
          class="c-block c-no-image size-m"
          @click.stop="$bus.$emit('goTo', productUrl)"
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
              $utils.t(tag.toLowerCase())
            }}</Tag>
            <Tag v-else-if="tag === 'Sale'" severity="danger" class="mr-2">{{
              $utils.t(tag.toLowerCase())
            }}</Tag>
            <Tag v-else severity="info" class="mr-2 capitalize">{{
              $utils.t(tag.toLowerCase())
            }}</Tag>
          </template>
        </div>

        <!--Save Btn-->
        <div class="c-block-top-right p-2">
          <Button
            v-if="!isSavedItem"
            icon="pi pi-heart"
            class="sm p-glass-button text-white"
            @click.stop="useSaveProduct(item)"
            aria-label="Save Button"
          ></Button>
          <Button
            v-else
            icon="pi pi-heart-fill"
            class="sm p-glass-button text-white"
            @click.stop="useRemoveProduct(item)"
            aria-label="Remove Button"
          ></Button>
        </div>

        <div class="c-block-bottom-right p-2">
          <!--Inventory-->
          <template v-if="inventoryTotal !== null">
            <Tag
              v-if="inventoryTotal < 5 && inventoryTotal > 1"
              :value="`${$utils.t('Low')} ${inventoryTotal}`"
              severity="warn"
              class="ml-2"
            ></Tag>
            <Tag
              v-else-if="inventoryTotal === 0"
              :value="`${$utils.t('Out of Stock')}`"
              severity="danger"
              class="ml-2"
            ></Tag>
            <Tag
              v-else-if="inventoryTotal >= 5"
              :value="`${$utils.t('Available')} ${inventoryTotal}`"
              severity="success"
              class="ml-2"
            ></Tag>
          </template>
        </div>
      </div>
    </div>

    <!--Content-->
    <div
      @click.stop="$bus.$emit('goTo', productUrl)"
      class="flex items-center c-product-content"
    >
      <div class="flex flex-col">
        <div>
          <p class="block font-bold mb-1">{{ item.title }}</p>
          <div class="flex align-items-center w-full">
            <p class="font-bold">
              {{ $currency.format(item.price) }}
              <span
                v-if="item.compare_price"
                class="ml-2 line-through opacity-60"
                >{{ $currency.format(item.compare_price) }}</span
              >
            </p>

            <Tag v-if="item.compare_price" severity="danger" class="ml-3">{{
              $utils.t("Sale")
            }}</Tag>
          </div>

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
    productCategoryHandle() {
      if (this.item) {
        if (this.item.collections && this.item.collections.length) {
          if (this.item.collections[0].collections_id.handle) {
            return this.item.collections[0].collections_id.handle
          }
        }
      }
      return "all"
    },
    productUrl() {
      return `/products/${this.productCategoryHandle}/${this.item.id}_${this.item.handle}`
    },
    inventoryTotal() {
      if (this.item && this.item.variants) {
        let count = 0

        for (let i = 0; i < this.item.variants.length; i++) {
          if (this.item.variants[i]) {
            if (this.item.variants[i].inventory_available) {
              count += this.item.variants[i].inventory_available
            }
          }
        }

        return count
      }
      return
    },
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
