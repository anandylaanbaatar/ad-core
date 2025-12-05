<template>
  <div v-if="item" class="mb-6 w-full">
    <div class="container">
      <div class="row">
        <div class="col-xs-12 mb-4 md:mb-0" :class="gridSize.left">
          <div class="c-block size-m darkBlock">
            <div class="p-6">
              <Tag v-if="item.tag" class="c-custom-tag mb-3">{{
                item.tag
              }}</Tag>
              <h2 v-if="item.title" class="mb-3">
                {{ item.title }}
              </h2>
              <p v-if="item.description">
                {{ item.description }}
              </p>

              <FormsMailingList class="mt-4 ml-0 w-full"></FormsMailingList>
            </div>
          </div>
        </div>
        <div class="col-xs-12" :class="gridSize.right">
          <div class="c-block c-image size-m" v-lazy-bg="item.image ? item.image.url : null"></div>
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
    item() {
      if (this.data && this.data.primary) {
        return this.data.primary
      }
      return
    },
    gridSize() {
      let sizing = {
        left: "col-md-4",
        right: "col-md-8",
      }

      if (this.item) {
        if (this.item.grid_size === "40/60") {
          sizing = {
            left: "col-md-5",
            right: "col-md-7",
          }
        } else if (this.item.grid_size === "50/50") {
          sizing = {
            left: "col-md-6",
            right: "col-md-6",
          }
        }
      }

      return sizing
    },
  },
}
</script>
