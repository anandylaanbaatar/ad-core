<template>
  <div v-if="allFilterCollections">
    <h3 class="mb-3 flex align-items-center">
      {{ $utils.t("Collections") }}
      <Badge :value="`${allFilterCollections.length}`" class="ml-2"></Badge>
    </h3>

    <ul class="mb-4 collectionFilters">
      <li>
        <h4
          class="c-link p-2 capitalize"
          :class="getClass('all')"
          @click="$bus.$emit('goTo', `/products/all`)"
        >
          {{ $utils.t("All") }}
        </h4>
      </li>
      <li
        v-for="collection in allFilterCollections"
        :key="`collection_${collection.id}`"
      >
        <h4
          class="c-link p-2 capitalize"
          :class="getClass(collection)"
          @click="$bus.$emit('goTo', `/products/${collection.handle}`)"
        >
          {{ $utils.t(collection.title.toLowerCase()) }}
        </h4>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    isAdvanced() {
      return useCommerceStore().advancedCollections
    },
    allFilterCollections() {
      return useCommerceStore().collections
    },
    collectionHandle() {
      return useRoute().params.category
    },
  },

  methods: {
    getClass(collection) {
      let classItem = ""

      if (collection === "all" && this.collectionHandle === "all") {
        return ` active`
      }

      if (this.isAdvanced) {
        classItem += ` level_${collection.level.id.replace("level-", "")}`
      }
      if (this.collectionHandle) {
        if (this.collectionHandle === collection.handle) {
          classItem += ` active`
        }
      }

      return classItem
    },
  },
}
</script>
