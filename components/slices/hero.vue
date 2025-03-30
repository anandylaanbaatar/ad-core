<template>
  <div v-if="items" class="container">
    <div
      class="c-hero"
      :class="{
        three_blocks: totalBlocks === 3,
        two_blocks: totalBlocks === 2,
        one_block: totalBlocks === 1,
      }"
    >
      <div class="row">
        <!--Single Block-->
        <template v-if="totalBlocks === 1">
          <div
            v-for="(item, index) in items"
            :key="`item_${data.id}_${index}`"
            class="col-xs-12"
            :class="`block_${index + 1}`"
          >
            <div
              class="c-block c-image size-xl"
              :style="setStyle(item)"
              @click="$bus.$emit('goTo', item.link.url)"
            >
              <div class="c-block-bottom-left p-4">
                <i
                  v-if="item.icon"
                  class="pi mb-2"
                  :class="item.icon"
                  :style="setTextColor(item)"
                ></i>
                <p
                  v-if="item.sub_title"
                  class="mb-1"
                  :style="setTextColor(item)"
                >
                  {{ $utils.t(item.sub_title) }}
                </p>
                <h3 v-if="item.title" :style="setTextColor(item)">
                  {{ $utils.t(item.title) }}
                </h3>

                <SlicesLink :link="item.link" class="mt-2"></SlicesLink>
              </div>
            </div>
          </div>
        </template>

        <!--Two Blocks-->
        <template v-else-if="totalBlocks === 2">
          <div
            v-for="(item, index) in items"
            :key="`item_${data.id}_${index}`"
            class="col-xs-12 col-md-6"
            :class="`block_${index + 1}`"
          >
            <div
              class="c-block c-image size-xl"
              :style="setStyle(item)"
              @click="$bus.$emit('goTo', item.link.url)"
            >
              <div class="c-block-bottom-left p-4">
                <i
                  v-if="item.icon"
                  class="pi mb-2"
                  :class="item.icon"
                  :style="setTextColor(item)"
                ></i>
                <p
                  v-if="item.sub_title"
                  class="mb-1"
                  :style="setTextColor(item)"
                >
                  {{ $utils.t(item.sub_title) }}
                </p>
                <h3 v-if="item.title" :style="setTextColor(item)">
                  {{ $utils.t(item.title) }}
                </h3>

                <SlicesLink :link="item.link" class="mt-2"></SlicesLink>
              </div>
            </div>
          </div>
        </template>

        <!--Three Blocks-->
        <template v-else-if="totalBlocks === 3">
          <div class="col-xs-12 col-md-8 left">
            <div
              class="c-block c-image c-link block_1"
              :style="setStyle(items[0])"
              @click="$bus.$emit('goTo', items[0].link.url)"
            >
              <div class="c-block-bottom-left p-4">
                <i
                  v-if="items[0].icon"
                  class="pi mb-2"
                  :class="items[0].icon"
                  :style="setTextColor(items[0])"
                ></i>

                <h3
                  v-if="items[0].title"
                  :style="setTextColor(items[0])"
                  class="mb-1"
                >
                  {{ $utils.t(items[0].title) }}
                </h3>

                <p
                  v-if="items[0].sub_title"
                  :style="setTextColor(items[0])"
                  class="desc mb-1"
                >
                  {{ items[0].sub_title }}
                </p>

                <SlicesLink :link="items[0].link" class="mt-2"></SlicesLink>
              </div>
            </div>
          </div>

          <div class="col-xs-12 col-md-4 right">
            <div
              class="c-block c-image c-link block_2"
              :style="setStyle(items[1])"
              @click="$bus.$emit('goTo', items[1].link.url)"
            >
              <div class="c-block-bottom-left p-4">
                <i
                  v-if="items[1].icon"
                  class="pi mb-2"
                  :class="items[1].icon"
                  :style="setTextColor(items[1])"
                ></i>

                <h3
                  v-if="items[1].title"
                  :style="setTextColor(items[1])"
                  class="mb-1"
                >
                  {{ $utils.t(items[1].title) }}
                </h3>

                <p
                  v-if="items[1].sub_title"
                  :style="setTextColor(items[1])"
                  class="desc mb-1"
                >
                  {{ items[1].sub_title }}
                </p>

                <SlicesLink :link="items[1].link" class="mt-2"></SlicesLink>
              </div>
            </div>

            <div
              class="c-block c-image c-link block_3"
              :style="setStyle(items[2])"
              @click="$bus.$emit('goTo', items[2].link.url)"
            >
              <div class="c-block-bottom-left p-4">
                <i
                  v-if="items[2].icon"
                  class="pi mb-2"
                  :class="items[2].icon"
                  :style="setTextColor(items[2])"
                ></i>

                <h3
                  v-if="items[2].title"
                  :style="setTextColor(items[2])"
                  class="mb-1"
                >
                  {{ $utils.t(items[2].title) }}
                </h3>

                <p
                  v-if="items[1].sub_title"
                  :style="setTextColor(items[2])"
                  class="desc mb-1"
                >
                  {{ items[2].sub_title }}
                </p>

                <SlicesLink :link="items[2].link" class="mt-2"></SlicesLink>
              </div>
            </div>
          </div>
        </template>
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
    totalBlocks() {
      if (this.data) {
        if (this.data.primary.block) {
          return this.data.primary.block.length
        }
      }
      return 0
    },
    items() {
      if (this.data) {
        return this.data.primary.block
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
