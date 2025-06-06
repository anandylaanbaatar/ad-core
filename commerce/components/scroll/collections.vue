<template>
  <Scroll
    v-if="items"
    title="Sub Collections"
    :hasPadding="false"
    ref="collectionSlider"
  >
    <div
      v-for="collection in items"
      :key="`collection_${collection.id}`"
      class="c-scroll_item collection"
      :class="size"
      :style="blockStyle(collection)"
      @click="$bus.$emit('goTo', `/products/${collection.handle}`)"
    >
      <div class="content">
        <h2>{{ collection.title }}</h2>
      </div>
      <div class="dimmer"></div>
    </div>
  </Scroll>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: "md",
    },
    collectionHandle: {
      type: String,
      default: null,
    },
  },

  computed: {
    allCollections() {
      return useCommerceStore().collections
    },
    isAdvanced() {
      return useCommerceStore().advancedCollections
    },
    items() {
      const allCollections = useCommerceStore().collections

      if (allCollections) {
        if (this.isAdvanced && this.collectionHandle) {
          const currentCollection = allCollections.find(
            (i) => i.handle === this.collectionHandle
          )

          // Level 1 Collections
          if (currentCollection.level.id === "level-1") {
            let allFilteredCollections = allCollections.filter((i) => {
              if (i.level.id === "level-2") {
                let parentId = parseInt(currentCollection.level.code)
                let currentId = parseInt(i.level.code)

                if (currentId > parentId) {
                  if (currentId < parentId + 1000) {
                    return i
                  }
                }
              }
            })

            return allFilteredCollections
          }

          // Level 2 Collections
          if (currentCollection.level.id === "level-2") {
            let allFilteredCollections = allCollections.filter((i) => {
              if (i.level.id === "level-3") {
                let parentId = parseInt(currentCollection.level.code)
                let currentId = parseInt(i.level.code)

                if (currentId > parentId) {
                  if (currentId < parentId + 100) {
                    return i
                  }
                }
              }
            })

            return allFilteredCollections
          }

          // Level 3 Collections
          if (currentCollection.level.id === "level-3") {
            return
          }
        }
      }

      return
    },
  },

  mounted() {
    this.$refs.collectionSlider.init()

    setTimeout(() => {
      this.$refs.collectionSlider.active = true
    }, 1500)
  },

  methods: {
    blockStyle(collection) {
      if (collection && collection.image && collection.image.url) {
        return this.$utils.setBackImage(collection.image.url)
      }
      return ""
    },
  },
}
</script>
