<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else-if="error" class="container py-4">
        <UiError
          icon="pi pi-barcode"
          title="No Product Found"
          desc="This product has been removed or it's not available at this time."
        ></UiError>

        <div class="w-full text-center">
          <Nuxt-link to="/">
            <Button icon="pi pi-arrow-left" label="Go Home"></Button>
          </Nuxt-link>
        </div>
      </div>

      <template v-else>
        <div class="container py-4">
          <!--Toolbar-->
          <Toolbar class="mb-3 px-3 desktopOnly">
            <template #start>
              <Button
                icon="pi pi-arrow-left"
                @click="$bus.$emit('goTo', `/products/${category}/`)"
                class="sm mr-3"
              ></Button>

              <ul class="c-breadcrumb">
                <li @click="$bus.$emit('goTo', '/')" class="text-sm">
                  {{ $utils.t("Home") }}
                </li>
                <li class="c-breadcrumb-arrow text-sm">
                  <i class="pi pi-chevron-right"></i>
                </li>
                <li
                  @click="$bus.$emit('goTo', `/products/${category}/`)"
                  class="capitalize text-sm"
                >
                  {{ $utils.t(category) }}
                </li>
                <li class="c-breadcrumb-arrow text-sm">
                  <i class="pi pi-chevron-right"></i>
                </li>
                <li class="text-sm">{{ product.title }}</li>
              </ul>
            </template>

            <template #end>
              <Button
                v-if="!isSavedItem"
                icon="pi pi-heart"
                class="sm desktopOnly"
                @click.stop="useSaveProduct(product)"
              ></Button>
              <Button
                v-else
                icon="pi pi-heart-fill"
                class="sm desktopOnly"
                @click.stop="useRemoveProduct(product)"
              ></Button>
            </template>
          </Toolbar>

          <!--Contents-->
          <div class="row">
            <!--Images Slider-->
            <div v-if="productImages" class="col-xs-12 col-md-4 mb-4">
              <div class="c-product-images relative">
                <SlidersProduct
                  class="c-product-detailed-slider"
                  :item="product"
                  type="productDetailedSlider"
                ></SlidersProduct>

                <div class="c-product-images-overlay">
                  <div class="c-block-top-right p-2">
                    <Button
                      v-tooltip.left="`Image Preview`"
                      icon="pi pi-external-link"
                      class="sm imagePreviewBtn"
                      @click="
                        $bus.$emit('imagePreviewGlobal', {
                          images: productImages,
                          index: 0,
                        })
                      "
                    ></Button>
                  </div>
                </div>
              </div>
            </div>

            <!--Single Image-->
            <div
              v-else-if="product.featured_image"
              class="col-xs-12 col-md-8 mb-4"
            >
              <div class="c-product-images">
                <div
                  class="c-block c-image size-xl"
                  :style="$utils.setBackImage(product.featured_image.url)"
                ></div>
              </div>
            </div>

            <!--No Image-->
            <div v-else class="col-xs-12 col-md-8 mb-4">
              <div class="c-product-images">
                <div class="c-block c-no-image size-xl">
                  <h5>{{ useAppConfig().theme.name_short }}</h5>
                </div>
              </div>
            </div>

            <!--Featured Image-->
            <div
              v-if="featuredImage"
              class="col-xs-12 col-md-4 mb-4 desktopOnly inline"
            >
              <div class="c-product-images">
                <div
                  class="c-block c-image size-2xl"
                  :style="$utils.setBackImage(featuredImage)"
                ></div>
              </div>
            </div>

            <!--Content-->
            <div class="col-xs-12 col-md-4">
              <div class="py-3">
                <!--Tags, Title & Description-->
                <div class="mb-3">
                  <div class="mb-2 flex align-items-center">
                    <template
                      v-if="product.collections && product.collections.length"
                    >
                      <Tag
                        v-for="collection in product.collections"
                        severity="success"
                        class="mr-2 c-link capitalize"
                        @click="
                          $bus.$emit(
                            'goTo',
                            `/products/${collection.collection_id.handle}/`
                          )
                        "
                        >{{
                          $utils.t(collection.collection_id.title.toLowerCase())
                        }}</Tag
                      >
                    </template>

                    <template
                      v-for="tag in product.tags"
                      :key="`product_tag_${tag}`"
                    >
                      <Tag
                        v-if="tag === 'Available'"
                        severity="success"
                        class="mr-2 capitalize"
                        >{{ $utils.t(tag) }}</Tag
                      >
                      <Tag
                        v-else-if="tag === 'Sale'"
                        severity="danger"
                        class="mr-2 capitalize"
                        >{{ $utils.t(tag) }}</Tag
                      >
                      <Tag v-else severity="info" class="mr-2 capitalize">{{
                        $utils.t(tag)
                      }}</Tag>

                      <Button
                        v-if="!isSavedItem"
                        icon="pi pi-heart"
                        class="sm ml-auto mobileOnly"
                        @click.stop="useSaveProduct(product)"
                      ></Button>
                      <Button
                        v-else
                        icon="pi pi-heart-fill"
                        class="sm ml-auto mobileOnly"
                        @click.stop="useRemoveProduct(product)"
                      ></Button>
                    </template>
                  </div>

                  <h1 class="mb-2">{{ product.title }}</h1>

                  <div
                    class="font1 text-surface-500 dark:text-surface-400 text-sm mb-3"
                    v-html="product.description"
                  ></div>

                  <h3 class="font3 ml-auto">
                    {{ productPrice.priceFormatted }}

                    <span
                      v-if="productPrice.compare"
                      class="ml-2 line-through opacity-60"
                      >{{ productPrice.compareFormatted }}</span
                    >
                  </h3>
                </div>

                <!--Variants-->
                <div v-if="product.variants.length > 1" class="row">
                  <p>{{ $utils.t("Color") }} / {{ $utils.t("Size") }}:</p>
                  <ul class="c-sizes w-full">
                    <li
                      v-for="variant in product.variants"
                      :key="`product_item_variant_${variant.id}`"
                      class="c-size"
                      :class="{
                        active: select.variantSku === variant.sku,
                        notAvailable: variant.inventory_available === 0,
                      }"
                      @click="selectVariant(variant)"
                    >
                      {{ variant.sku.toUpperCase() }}
                    </li>
                  </ul>
                </div>

                <!--Availability-->
                <div
                  v-if="select && select.variant"
                  class="row w-full mt-2 mb-4"
                >
                  <Message
                    v-if="select.variant.inventory_available > 0"
                    severity="success"
                    class="c-message w-full"
                    :closable="false"
                  >
                    <template #icon>
                      <i class="pi pi-exclamation-triangle"></i>
                    </template>
                    <span class="w-full"
                      >{{ select.variant.inventory_available }}
                      {{ $utils.t("Available In Stock") }}</span
                    >
                  </Message>
                  <Message
                    v-else-if="select.variant.inventory_available === 0"
                    severity="error"
                    class="c-message w-full"
                    :closable="false"
                  >
                    <template #icon>
                      <i class="pi pi-exclamation-triangle"></i>
                    </template>
                    <span class="w-full"> {{ $utils.t("Out of Stock") }}</span>
                  </Message>
                </div>

                <!--Add to Cart-->
                <Button
                  v-if="
                    select &&
                    select.variant &&
                    select.variant.inventory_available > 0
                  "
                  :label="$utils.t('Add To Cart')"
                  icon="pi pi-shopping-cart"
                  iconPos="right"
                  class="w-full"
                  @click="addToCart"
                ></Button>

                <div class="c-divider md"></div>

                <!--QPay-->
                <PaymentBox
                  v-if="appConfig.integrations.qpay"
                  id="qpay"
                ></PaymentBox>

                <!--StorePay-->
                <PaymentBox
                  v-if="appConfig.integrations.storepay"
                  id="storepay"
                  :price="parseFloat(product.price)"
                ></PaymentBox>

                <!--Reviews
            <div class="d-block mt-3">
              <h5 class="mb-1">Reviews</h5>
              <Rating v-model="rating" :cancel="false" />
            </div>-->
              </div>
            </div>
          </div>
        </div>

        <!--Similar Products-->
        <div v-if="category" class="mt-6">
          <!-- <h3 class="mb-5 text-center">{{ $utils.t("Similar Products") }}</h3>
        <ProductsGrid
          :key="`products_grid_0`"
          layout="grid"
          :category="category"
          :viewMore="true"
          :limit="5"
          :exclude="id"
        ></ProductsGrid> -->

          <ScrollSimilarProducts
            :key="`products_grid_0`"
            layout="grid"
            :hasPadding="true"
            :category="category"
            :viewMore="true"
            :limit="25"
            :exclude="id"
          ></ScrollSimilarProducts>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      error: false,
      panelIndex: null,

      id: null,
      category: null,
      product: null,

      select: {
        amount: 1,
        variantSku: null,
        variant: null,
      },

      rating: null,
    }
  },

  computed: {
    appConfig() {
      return useRuntimeConfig().public
    },
    isSavedItem() {
      const savedItems = useCommerceStore().savedItems
      if (savedItems.indexOf(this.product.id) > -1) {
        return true
      }
      return false
    },
    featuredImage() {
      if (this.product) {
        if (this.product.featured_image) {
          return this.product.featured_image.url
        }
      }
      return
    },
    productPrice() {
      let prices = {
        price: 0,
        priceFormatted: 0,
        compare: 0,
        compareFormatted: 0,
      }

      if (this.product) {
        if (this.product.price) {
          prices.price = this.product.price
          prices.priceFormatted = this.$currency.format(this.product.price)

          if (this.product.compare_price) {
            prices.compare = this.product.compare_price
            prices.compareFormatted = this.$currency.format(
              this.product.compare_price
            )
          }

          if (this.select.variantSku && this.product.variants.length > 0) {
            let variant = this.product.variants.find(
              (i) => i.sku === this.select.variantSku
            )

            if (variant) {
              if (variant.price) {
                prices.price = variant.price
                prices.priceFormatted = this.$currency.format(variant.price)
              }
              if (variant.compare_price) {
                prices.compare = variant.compare_price
                prices.compareFormatted = this.$currency.format(
                  variant.compare_price
                )
              }
            }
          }
        }
      }

      return prices
    },
    productImages() {
      if (this.product && this.product.images) {
        if (this.product.images.length) {
          return this.product.images.map((i) => i.files_id)
        }
      }
      return
    },
  },

  async mounted() {
    this.loading = true

    const id = useRoute().params.id
    const category = useRoute().params.category

    this.id = id
    this.category = category

    const productData = await this.$algolia.getSingle(id)

    console.log("Product ::: ", productData)

    if (productData) {
      this.product = productData

      // Select Default Variant if it's only item.
      if (this.product.variants && this.product.variants.length > 0) {
        if (this.$route.query.variant) {
          this.selectVariant(
            this.product.variants.find(
              (variant) => variant.sku === this.$route.query.variant
            )
          )
        } else {
          this.selectVariant(this.product.variants[0], true)
        }
      }

      this.loading = false
      this.error = false
    } else {
      this.loading = false
      this.error = true
    }
  },

  methods: {
    async selectVariant(variant, isDefault) {
      this.select.variant = variant
      this.select.variantSku = variant.sku

      if (!isDefault) {
        this.$router.push({
          path: this.$route.path,
          query: {
            variant: variant.sku,
          },
        })
      }
    },
    addToCart() {
      let options = {
        id: this.product.id,
        variantSku: this.select.variantSku,
        qty: this.select.amount,
        merge: true,
      }

      useCommerceStore().addToCart(options)
    },
  },
}
</script>
