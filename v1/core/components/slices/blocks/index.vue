<template>
  <div v-if="items" class="c-blocks">
    <div class="container">
      <div
        v-for="(item, itemIndex) in items"
        :key="`block_item_${itemIndex}`"
        class="row"
      >
        <div v-if="!isEven(itemIndex)" class="col-xs-12 col-md-6 c-block-item">
          <div
            v-if="item.image && item.image.url"
            class="content c-image"
            :style="$utils.setBackImage(item.image.url)"
          ></div>
        </div>

        <div class="col-xs-12 col-md-6 c-block-item">
          <div class="content">
            <div class="c-text">
              <Tag v-if="item.tag" rounded class="c-custom-tag mb-4">{{
                item.tag
              }}</Tag>

              <p v-if="item.sub_title" class="mb-1">
                {{ $utils.t(item.sub_title) }}
              </p>
              <div v-if="item.title" class="mb-4">
                <PrismicRichText :field="item.title" />
              </div>
              <div v-if="item.description" class="mb-4">
                <PrismicRichText :field="item.description" />
              </div>

              <Button
                v-if="item.link && item.link.url"
                icon="pi pi-arrow-right"
                iconPos="right"
                :label="item.link.text"
                :class="{
                  'c-custom-button': item.link.variant === 'Custom',
                  primary: item.link.variant === 'Primary',
                  secondary: item.link.variant === 'Secondary',
                }"
                @click="$bus.$emit('goTo', item.link.url)"
              ></Button>
            </div>
          </div>
        </div>

        <div v-if="isEven(itemIndex)" class="col-xs-12 col-md-6 c-block-item">
          <div
            v-if="item.image && item.image.url"
            class="content c-image"
            :style="$utils.setBackImage(item.image.url)"
          ></div>
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
    items() {
      if (this.data && this.data.primary) {
        if (this.data.primary.blocks) {
          return this.data.primary.blocks
        }
      }
      return
    },
  },

  methods: {
    isEven(n) {
      return n % 2 == 0
    },
  },
}
</script>
