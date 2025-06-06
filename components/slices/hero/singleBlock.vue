<template>
  <div v-if="item" class="container">
    <div class="c-hero one_block">
      <div class="row">
        <div class="col-xs-12 block_1">
          <div
            class="c-block c-image size-xl"
            v-if="item.image && item.image.url"
            :style="$utils.setBackImage(item.image.url)"
          >
            <div class="c-block-bottom-left p-4">
              <i v-if="item.icon" class="pi mb-2" :class="item.icon"></i><br />
              <Tag v-if="item.tag" class="c-custom-tag mb-2">{{
                item.tag
              }}</Tag>

              <p v-if="item.sub_title" class="mb-1">
                {{ $utils.t(item.sub_title) }}
              </p>
              <div v-if="item.title" class="mb-1">
                <PrismicRichText :field="item.title" />
              </div>
              <div v-if="item.description" class="mb-1">
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
      if (this.data) {
        return this.data.primary
      }
      return null
    },
  },

  methods: {
    setStyle(item) {
      if (item) {
        let style = ``

        if (item.image && item.image.url) {
          style += `${this.$utils.setBackImage(item.image.url)}`

          if (item.image_position) {
            style += `background-size:${item.image_position};`
          }
        }
        if (item.background_color) {
          style += `${this.$utils.setBackColor(item.background_color)}`
        }

        return style
      }
      return
    },
    setTextColor(item) {
      if (item) {
        let style = ``

        if (item.text_color) {
          style += `color:${item.text_color};`
        }

        return style
      }
      return
    },
  },
}
</script>
