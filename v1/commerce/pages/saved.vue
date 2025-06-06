<template>
  <AppLayout type="regular">
    <div class="c-page shop">
      <Loader v-if="loading"></Loader>

      <div v-else class="container py-3">
        <Toolbar class="mb-3">
          <template #start>
            <Button
              icon="pi pi-arrow-left"
              @click="$bus.$emit('goTo', `/`)"
              class="smallBtn mr-3"
            ></Button>
          </template>

          <template #center>
            <h3 class="capitalize">{{ $utils.t("Saved Products") }}</h3>
          </template>

          <template #end>
            <Button
              v-if="type === 'grid'"
              icon="pi pi-list"
              class="smallBtn active ml-3"
              @click="toggleType"
            ></Button>
            <Button
              v-else
              icon="pi pi-th-large"
              class="smallBtnv active ml-3"
              @click="toggleType"
            ></Button>
          </template>
        </Toolbar>

        <ProductsGrid
          v-if="showWishlist"
          :key="`products_grid_${key}`"
          :layout="type"
          :category="'all'"
          :viewMore="true"
          :limit="20"
          :filters="filters"
        ></ProductsGrid>

        <UiEmpty
          v-else
          :desc="$utils.t('No Saved Products.')"
          icon="pi-heart"
        ></UiEmpty>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      type: "grid",
      loading: true,
      showWishlist: false,
      key: 0,

      filters: {
        ids: null,
      },
      pageInfo: null,
      products: null,
    }
  },

  computed: {
    savedItems() {
      return useCommerceStore().savedItems
    },
  },

  async mounted() {
    if (this.savedItems) {
      if (this.savedItems.length > 0) {
        this.filters.ids = this.savedItems
        this.showWishlist = true
      }
    }

    this.loading = false
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
  },
}
</script>
