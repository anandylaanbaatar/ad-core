<template>
  <!--Advanced Collections-->
  <div v-if="isAdvanced">
    <div v-if="collection && collection.level.id !== 'level-3'">
      <div
        v-if="collection.level.id === 'level-1'"
        class="c-block c-image mb-5 collectionBlock"
        :class="{
          'size-md': collectionImage,
          'size-xs': !collectionImage,
        }"
        v-lazy-bg="collectionImage"
      >
        <div class="c-block-center">
          <div>
            <h1>{{ $utils.t(collection.title) }}</h1>
          </div>
        </div>

        <div class="c-block-dimmer"></div>
      </div>
      <h1 v-else="collection" class="capitalize w-full text-center">
        {{ $utils.t(collection.title) }}
      </h1>

      <ScrollCollections
        :collectionHandle="collectionHandle"
        size="xxs"
      ></ScrollCollections>
    </div>

    <!--No Block-->
    <h1 v-else-if="collection" class="capitalize w-full text-center">
      {{ $utils.t(collection.title) }}
    </h1>
  </div>

  <!--Simple Collections-->
  <div v-else>
    <div v-if="collectionHandle !== 'all' && collection">
      <div
        class="c-block c-image mb-5 collectionBlock"
        :class="{
          'size-md': collectionImage,
          'size-xs': !collectionImage,
        }"
        v-lazy-bg="collectionImage"
      >
        <div class="c-block-center">
          <div>
            <h1>{{ $utils.t(collection.title) }}</h1>
          </div>
        </div>

        <div class="c-block-dimmer"></div>
      </div>
    </div>

    <!--No Block-->
    <h2 v-else class="capitalize w-full text-center">
      {{ $utils.t(collectionHandle) }}
    </h2>
  </div>
</template>

<script>
export default {
  computed: {
    allCollections() {
      return useCommerceStore().collections
    },
    isAdvanced() {
      return useCommerceStore().advancedCollections
    },
    collectionHandle() {
      return useRoute().params.category
    },
    collection() {
      if (this.collectionHandle) {
        const collectionItem = this.allCollections.find(
          (i) => i.handle === this.collectionHandle
        )
        return collectionItem
      }
      return
    },
    collectionImage() {
      if (this.collection) {
        if (this.collection.image) {
          if (this.collection.image.url) {
            return this.collection.image.url
          }
        }
      }
      return
    },
  },
}
</script>
