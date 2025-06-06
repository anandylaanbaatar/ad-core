<template>
  <div v-if="data" class="container mb-6">
    <ProductsGrid
      :firstBlock="show_first_block"
      :lastBlock="show_view_all"
      :max="max"
    ></ProductsGrid>
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
    collection() {
      if (this.data) {
        if (this.data.primary.grid_collection) {
          return this.data.primary.grid_collection
        }
      }
      return "all"
    },
    show_first_block() {
      if (this.data) {
        if (this.data.primary.show_first_block) {
          return this.data.primary.show_first_block
        }
      }
      return true
    },
    show_view_all() {
      if (this.data) {
        if (this.data.primary.show_view_all_block) {
          return this.data.primary.show_view_all_block
        }
      }
      return true
    },
    max() {
      if (this.data) {
        if (this.data.primary.max) {
          return this.data.primary.max
        }
      }
      return 7
    },
  },
}
</script>
