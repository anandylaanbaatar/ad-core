<template>
  <div v-if="data" class="container mb-6">
    <div class="c-align-center mb-6">
      <h2 v-if="data.primary.title">{{ $utils.t(data.primary.title) }}</h2>
      <p v-if="data.primary.sub_title" class="c-secondary">
        {{ $utils.t(data.primary.sub_title) }}
      </p>
    </div>

    <ProductsGrid
      :layout="layout"
      :category="category"
      :filters="filters"
    ></ProductsGrid>

    <div v-if="data.primary.link && data.primary.link.url" class="row mt-5">
      <div class="col-xs-12">
        <div class="c-align-center">
          <Button
            link
            :label="$utils.t(data.primary.link.text)"
            icon="pi pi-arrow-right"
            iconPos="right"
            @click="$bus.$emit('goTo', data.primary.link.url)"
          ></Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },

  computed: {
    layout() {
      if (this.data) {
        if (this.data.primary.grid_layout) {
          return this.data.primary.grid_layout
        }
      }
      return "grid"
    },
    category() {
      if (this.data) {
        if (this.data.primary.grid_category) {
          return this.data.primary.grid_category
        }
      }
      return "all"
    },
    filters() {
      let filters = null

      if (this.data) {
        if (this.data.primary.grid_sort) {
          filters = {
            sort: this.data.primary.grid_sort,
          }
        }
      }

      return filters
    },
  },
}
</script>
