<template>
  <Loader v-if="loading"></Loader>

  <template v-else-if="error">
    <p class="font3 c-align-center p-3 opacity-50">
      {{ $utils.t("No Products Found.") }}
    </p>
  </template>

  <Scroll
    v-else
    title="Similar Products"
    ref="similarProducts"
    :hasPadding="true"
  >
    <div
      v-for="product in products"
      :key="`product_${product.id}`"
      class="c-scroll_item productItem"
    >
      <ProductsGridItem :item="product"></ProductsGridItem>
    </div>
  </Scroll>
</template>

<script>
export default {
  props: {
    layout: String,
    category: String,
    viewMore: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 4,
    },
    filters: {
      type: Object,
      default: null,
    },
    exclude: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      loading: true,
      error: false,
      moreLoading: false,
      pageInfo: null,
      products: null,
    }
  },

  computed: {
    collections() {
      return useCommerceStore().collections
    },
    tenantId() {
      return useRuntimeConfig().public.features.multitenancy.tenantId
    },
  },

  watch: {
    products() {
      let productCount = this.products !== null ? this.products.length : 0
      this.$emit("updateProducts", productCount)
    },
  },

  async created() {
    if (useRuntimeConfig().public.integrations.shopify) {
      await this.getProducts()
      this.$refs.similarProducts.init()
    } else {
      this.loading = false
      this.error = true
    }
  },

  methods: {
    async getProducts(isViewMore) {
      if (isViewMore) {
        this.moreLoading = true
      } else {
        this.loading = true
      }

      // Options
      let options = {
        limit: this.limit,
        page: 0,
        options: {
          tenant_id: this.tenantId,
        },
      }

      // Collection Filter
      if (this.category && this.collections) {
        const collection = this.collections.find(
          (i) => i.handle === this.category
        )
        if (collection) {
          options.options = {
            "collections.collections_id.id": collection.id,
          }
        }
      }

      const products = await this.$algolia.search(options)

      if (this.products === null) {
        if (this.exclude) {
          this.products = products.hits.filter(
            (item) => item.id !== this.exclude
          )
        } else {
          this.products = products.hits
        }
      } else {
        this.products = this.products.concat(products.hits)
      }
      if (isViewMore) {
        this.moreLoading = false
      } else {
        this.loading = false
      }
    },

    // async getProductsV1(isViewMore) {
    //   if (isViewMore) {
    //     this.moreLoading = true
    //   } else {
    //     this.loading = true
    //   }
    //   let cursor = null

    //   // Pagination
    //   if (this.pageInfo) {
    //     if (this.pageInfo.hasNextPage) {
    //       if (this.pageInfo.endCursor) {
    //         cursor = this.pageInfo.endCursor
    //       }
    //     }
    //   }

    //   // Options
    //   let options = {
    //     limit: this.limit,
    //     cursor: cursor,
    //     category: this.category ? this.category : "all",
    //     sort: "CREATED_AT",
    //   }

    //   // Filters
    //   if (this.filters) {
    //     if (this.filters.query) {
    //       options.query = this.filters.query
    //     }
    //     if (this.filters.ids) {
    //       options.ids = this.filters.ids
    //     }
    //     if (this.filters.sort) {
    //       options.sort = this.filters.sort
    //     }
    //   }

    //   const products = await this.$shopify.productsV2(options)

    //   this.pageInfo = products.meta

    //   if (this.products === null) {
    //     if (this.exclude) {
    //       this.products = products.items.filter(
    //         (item) => item.id !== this.exclude
    //       )
    //     } else {
    //       this.products = products.items
    //     }
    //   } else {
    //     this.products = this.products.concat(products.items)
    //   }
    //   if (isViewMore) {
    //     this.moreLoading = false
    //   } else {
    //     this.loading = false
    //   }
    // },
  },
}
</script>
