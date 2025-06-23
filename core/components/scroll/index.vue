<template>
  <div>
    <Loader v-if="!active" type="sm"></Loader>

    <template v-else>
      <div v-if="hasHeader" class="container">
        <div class="row">
          <div class="col-xs-6">
            <h2 v-if="title">{{ $utils.t(title) }}</h2>
          </div>
          <div class="col-xs-6 flex flex-wrap justify-content-end">
            <template v-if="showArrows">
              <Button
                icon="pi pi-arrow-left"
                class="mr-3 sm"
                @click="scrollEl('left')"
                :disabled="!showLeft"
              ></Button>

              <Button
                icon="pi pi-arrow-right"
                class="sm"
                @click="scrollEl('right')"
                :disabled="!showRight"
              ></Button>
            </template>
          </div>
        </div>
      </div>

      <div
        class="c-scroll"
        :class="{ 'mb-0 p-0': !hasPadding }"
        ref="sliderScroll"
        @scroll="setScroll"
      >
        <div class="c-scroll_inner" :style="`padding-left:${marginLeft};`">
          <slot></slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null,
    },
    showArrows: {
      type: Boolean,
      default: true,
    },
    hasPadding: {
      type: Boolean,
      default: true,
    },
    hasHeader: {
      type: Boolean,
      default: true,
    },
    itemWidth: {
      type: Number,
      default: 400,
    },
    autoInit: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      active: false,
      scroll: {
        init: false,
        position: 0,
        scrollAmount: 0,
        available: 0,
      },
      marginLeft: null,
      resizeInit: false,
    }
  },

  computed: {
    showLeft() {
      return this.scroll.position > 0
    },
    showRight() {
      return this.scroll.position < this.scroll.available
    },
  },

  mounted() {
    if (this.autoInit) {
      this.init()
    }
  },

  methods: {
    init() {
      this.active = true
      this.setStyle()

      setTimeout(() => {
        this.setScroll()
      }, 500)
    },
    reset() {
      this.scrollTo(0)
    },
    setStyle() {
      const containerEl = document.querySelector(".container")

      if (this.hasPadding && containerEl) {
        let style = getComputedStyle(containerEl)
        this.marginLeft = style.marginLeft
      }

      if (window) {
        if (this.resizeInit) return
        window.onresize = (e) => {
          this.resizeInit = true
          this.setStyle()
        }
      }
    },
    scrollEl(direction) {
      if (direction === "left") {
        let position = this.scroll.position - this.scroll.scrollAmount
        this.scrollTo(position)
      } else if (direction === "right") {
        let position = this.scroll.scrollAmount + this.scroll.position

        if (
          this.scroll.available - this.scroll.position <
          this.scroll.scrollAmount
        ) {
          position = this.scroll.available
        }

        this.scrollTo(position)
      }
    },
    scrollTo(position) {
      const container = this.$refs.sliderScroll
      container.scrollTo({
        top: 0,
        left: position,
        behavior: "smooth",
      })
    },
    setScroll(e) {
      const container = e ? e.target : this.$refs.sliderScroll
      const itemEl = document.querySelector(".c-scroll_item")

      if (!this.scroll.init) {
        if (itemEl) {
          this.scroll.scrollAmount = itemEl.offsetWidth
        } else {
          this.scroll.scrollAmount = this.itemWidth
        }
        this.scroll.init = true
      }

      this.scroll.position = container.scrollLeft
      this.scroll.available = container.scrollWidth - window.innerWidth
    },
  },
}
</script>
