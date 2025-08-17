<template>
  <Loader v-if="loading"></Loader>

  <DataView v-else :value="products" :layout="layout">
    <!--List-->
    <template #list="slotProps">
      <div class="productsGrid row">
        <div
          class="col-xs-12"
          v-for="(item, index) in slotProps.items"
          :key="`product_item_${index}`"
        >
          <ProductsListItem :item="item"></ProductsListItem>
        </div>
      </div>

      <div
        v-if="viewMore"
        class="row viewMore w-full justify-content-center m-0"
      >
        <Button
          v-if="pageInfo && pageInfo.hasNextPage"
          :label="$utils.t('View More')"
          severity="secondary"
          class="sm my-3"
          @click="getProducts(true)"
        ></Button>

        <p v-else class="c-align-center p-3">
          {{ $utils.t("End of Products List.") }}
        </p>
      </div>
    </template>

    <!--Grid-->
    <template #grid="slotProps">
      <div class="productsGrid row">
        <div
          :class="productsGrid"
          v-for="(item, index) in slotProps.items"
          :key="`product_item_${index}`"
        >
          <ProductsGridItem :item="item"></ProductsGridItem>
        </div>
      </div>

      <div
        v-if="viewMore"
        class="row viewMore w-full justify-content-center m-0"
      >
        <Loader v-if="moreLoading"></Loader>

        <template v-else>
          <Button
            v-if="pageInfo && pageInfo.hasNextPage"
            :label="$utils.t('View More')"
            severity="secondary"
            class="sm my-3"
            @click="getProducts(true)"
          ></Button>

          <p v-else class="font3 c-align-center p-3 opacity-50">
            {{ $utils.t("End of Products List.") }}
          </p>
        </template>
      </div>
    </template>

    <!--Empty-->
    <template #empty>
      <p class="font3 c-align-center p-3 opacity-50">
        {{ $utils.t("No Products Found.") }}
      </p>
    </template>
  </DataView>
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
      moreLoading: false,
      pageInfo: null,
      products: null,
    }
  },

  computed: {
    productsGrid() {
      let grid = "col-xs-12 col-md-6 col-lg-3"
      const theme = useAppConfig().theme

      if (theme && theme.productsGrid) {
        grid = theme.productsGrid
      }

      return grid
    },
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

  async mounted() {
    if (useRuntimeConfig().public.integrations.algolia) {
      await this.getProducts()
    } else {
      this.loading = false
    }
  },

  methods: {
    async getProducts(isViewMore) {
      if (isViewMore) {
        this.moreLoading = true
      } else {
        this.loading = true
      }

      let options = {
        limit: this.limit,
        page: 0,
        options: {
          tenant_id: this.tenantId,
          status: "published",
        },
      }

      // Collection Filter
      if (this.category && this.collections) {
        const collection = this.collections.find(
          (i) => i.handle === this.category
        )
        if (collection) {
          options.options["collections.collection_id.id"] = collection.id
        }
      }

      const products = await this.$algolia.search(options)

      if (products?.hits?.length > 0) {
        this.products = products.hits
      }

      console.log(
        "Products ::: ",
        this.filters,
        this.category,
        options,
        products
      )

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
