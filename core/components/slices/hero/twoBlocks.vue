<template>
  <div v-if="item" class="container">
    <div class="c-hero two_blocks">
      <div class="row">
        <div
          v-for="i in 2"
          :key="`block_${i}`"
          class="col-xs-12 col-md-6"
          :class="`block_${i}`"
        >
          <div
            class="c-block c-image size-xl"
            :style="$utils.setBackImage(item[`image_${i}`].url)"
          >
            <div class="c-block-bottom-left p-4">
              <i
                v-if="item[`icon_${i}`]"
                class="pi mb-2"
                :class="item[`icon_${i}`]"
              ></i
              ><br />

              <Tag v-if="item[`tag_${i}`]" class="c-custom-tag mb-2">{{
                item[`tag_${i}`]
              }}</Tag>

              <p v-if="item[`sub_title_${i}`]" class="mb-1">
                {{ $utils.t(item[`sub_title_${i}`]) }}
              </p>
              <div v-if="item[`title_${i}`]" class="mb-1">
                <PrismicRichText :field="item[`title_${i}`]" />
              </div>
              <div v-if="item[`description_${i}`]" class="mb-1">
                <PrismicRichText :field="item[`description_${i}`]" />
              </div>

              <Button
                v-if="item[`link_${i}`]"
                icon="pi pi-arrow-right"
                iconPos="right"
                :label="item[`link_${i}`].text"
                :class="{
                  'c-custom-button': item[`link_${i}`].variant === 'Custom',
                  primary: item[`link_${i}`].variant === 'Primary',
                  secondary: item[`link_${i}`].variant === 'Secondary',
                }"
                @click="$bus.$emit('goTo', item[`link_${i}`].url)"
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
      if (this.data && this.data.primary) {
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
