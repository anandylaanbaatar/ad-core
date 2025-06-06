<template>
  <AppLayout type="regular">
    <div class="c-page shop">
      <Loader v-if="loading" type="small"></Loader>

      <div v-else class="container py-4">
        <Toolbar class="mb-3">
          <template #start>
            <Button
              icon="pi pi-arrow-left"
              @click="$bus.$emit('goTo', `/`)"
              class="smallBtn mr-3"
            ></Button>
          </template>

          <template #center>
            <div class="w-full">
              <!-- <h3 class="capitalize">{{ $utils.t("Search") + " - " + title }}</h3> -->

              <div class="c-form mt-3 w-full">
                <InputGroup class="c-field c-transparent">
                  <InputGroupAddon
                    ><i class="pi pi-search"></i
                  ></InputGroupAddon>
                  <InputText
                    v-model="filters.query"
                    :placeholder="$utils.t('Enter here to search')"
                    @keydown.enter="search"
                  />
                </InputGroup>
              </div>
            </div>
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
          :key="`products_grid_${key}`"
          :layout="type"
          :category="'all'"
          :viewMore="true"
          :limit="20"
          :filters="filters"
        ></ProductsGrid>
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
      key: 0,
      title: "Search",
      query: null,
      filters: {
        query: null,
      },
    }
  },

  async created() {
    if (this.$route.query.query) {
      this.title = this.$route.query.query
      this.filters.query = this.$route.query.query
    }

    await this.getProducts()
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

  methods: {
    async getProducts() {
      this.loading = false
    },
    async search() {
      this.title = this.filters.query
      this.key += 1
    },
  },
}
</script>
