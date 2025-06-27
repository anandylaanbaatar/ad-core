<template>
  <AppLayout type="regular">
    <div class="c-page shop">
      <Loader v-if="loading"></Loader>

      <div v-else class="container py-4">
        <div class="row pb-5 px-4 md:px-0">
          <!--Collections Block-->
          <div class="col-xs-12 md:p-0">
            <CollectionsBlock></CollectionsBlock>
          </div>

          <!--Sort & Filter-->
          <div class="col-xs-6 md:p-0">
            <div class="flex">
              <Button
                v-if="showFilters"
                icon="pi pi-times"
                class="mr-3 sm"
                @click="toggleFilters(false)"
              ></Button>
              <Button
                v-else
                icon="pi pi-filter"
                class="mr-3 sm"
                @click="toggleFilters(true)"
              ></Button>

              <Select
                v-model="sortBy"
                :options="sortOptions"
                optionLabel="name"
                placeholder="Sort By"
                class="sm"
                @change="changeSort"
              ></Select>

              <!-- <Button
              v-if="type === 'grid'"
              icon="pi pi-list"
              class="smallBtn active ml-3"
              @click="toggleType"
            ></Button>
            <Button
              v-else
              icon="pi pi-th-large"
              class="smallBtn active ml-3"
              @click="toggleType"
            ></Button> -->
            </div>
          </div>

          <!--Meta Info-->
          <div class="col-xs-6 md:p-0">
            <div class="flex justify-content-end align-items-center flex-wrap">
              <h4 v-if="productCounts !== 0" class="mt-3 opacity-30">
                {{ productCounts }} - {{ totalProductsCount }}
                {{ $utils.t("products") }}
              </h4>

              <!-- <Button
              icon="pi pi-arrow-left"
              @click="$bus.$emit('goTo', `/`)"
              class="smallBtn mr-3"
            ></Button> -->
            </div>
          </div>
        </div>

        <div class="row no-margin">
          <!--Collections List-->
          <div v-if="showFilters" class="col-xs-12 col-md-2 md:p-0">
            <CollectionsFilter></CollectionsFilter>
          </div>

          <!--Grid-->
          <div class="col-xs-12" :class="{ 'col-md-10 md:p-0': showFilters }">
            <ProductsGrid
              ref="productsGrid"
              :key="`products_grid_${key}`"
              :layout="type"
              :category="categoryId"
              :viewMore="true"
              :limit="20"
              :filters="filters"
              @updateProducts="(amount) => (productCounts = amount)"
            ></ProductsGrid>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      type: "grid",
      loading: false,

      key: 0,
      categoryId: null,
      sortBy: null,
      filters: {
        sort: null,
      },
      showFilters: false,

      productCounts: 0,
    }
  },

  computed: {
    sortOptions() {
      return [
        {
          name: "Latest",
          code: "CREATED_AT",
        },
        {
          name: "Best Selling",
          code: "BEST_SELLING",
        },
        {
          name: "Price (High to Low)",
          code: "PRICE_HIGH_TO_LOW",
        },
        {
          name: "Price (Low to High)",
          code: "PRICE_LOW_TO_HIGH",
        },
        {
          name: "Relevance",
          code: "RELEVANCE",
        },
      ]
    },
    category() {
      if (this.categoryId) {
        const collections = useCommerceStore().collections

        if (collections) {
          let currentCategory = collections.find(
            (i) => i.handle === this.categoryId
          )

          return currentCategory
        }
      }
      return
    },
    totalProductsCount() {
      return useCommerceStore().productsCount
    },
  },

  created() {
    const category = useRoute().params.category
    this.categoryId = category

    if (this.$route.query.sort) {
      let sortIndex = this.sortOptions.findIndex(
        (i) => i.code === this.$route.query.sort
      )
      if (sortIndex !== -1) {
        this.sortBy = this.sortOptions[sortIndex]
        this.filters.sort = this.sortOptions[sortIndex].code
      }
    } else {
      this.sortBy = this.sortOptions[0]
      this.filters.sort = this.sortOptions[0].code
    }

    this.loading = false
  },
  mounted() {
    let isFiltersOpen = localStorage.getItem("filters")

    if (!isFiltersOpen) {
      localStorage.setItem("filters", false)
    } else {
      if (isFiltersOpen === "true") {
        this.showFilters = true
      } else {
        this.showFilters = false
      }
    }
  },

  methods: {
    toggleType() {
      if (this.type === "grid") {
        this.type = "list"
      } else {
        this.type = "grid"
      }
      this.key += 1
    },
    changeSort() {
      this.filters.sort = this.sortBy.code
      this.loading = true
      this.key += 1

      this.$router.push({
        path: this.$route.path,
        query: {
          sort: this.sortBy.code,
        },
      })

      this.loading = false
    },
    toggleFilters(action) {
      localStorage.setItem("filters", action)
      this.showFilters = action
    },
  },
}
</script>
