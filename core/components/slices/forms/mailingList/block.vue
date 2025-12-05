<template>
  <div v-if="item" class="c-hero mb-8">
    <div class="container">
      <div class="c-block c-image size-md" v-lazy-bg="item.image ? item.image.url : null">
        <div class="c-block-center-center">
          <div>
            <Tag v-if="item.tag" class="c-custom-tag mb-3">{{ item.tag }}</Tag>
            <h2 v-if="item.title" class="mb-3 text-white">{{ item.title }}</h2>

            <p v-if="item.description" class="text-white">
              {{ item.description }}
            </p>

            <FormsMailingList class="mt-4"></FormsMailingList>
          </div>
        </div>
        <div class="c-block-dimmer"></div>
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
  },
}
</script>
