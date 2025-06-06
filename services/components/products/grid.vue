<template>
  <div class="c-classes">
    <div class="container">
      <!--Collections-->
      <div v-if="filters" class="col-xs-12 mb-6">
        <ul class="c-list-nav text-center">
          <li>
            <div
              class="c-list-item font3"
              :class="{ active: selected === null }"
              @click="selected = null"
            >
              All
              <span class="c-list-item-span"></span>
            </div>
          </li>
          <li
            v-for="collection in collections"
            :key="`collection_item_${collection.id}`"
          >
            <div
              class="c-list-item font3"
              :class="{ active: collection.id === selected }"
              @click="selected = collection.id"
            >
              {{ collection.name }}
              <span class="c-list-item-span"></span>
            </div>
          </li>
        </ul>
      </div>

      <div class="row">
        <!--Intro Block-->
        <div v-if="firstBlock" class="col-xs-12 col-md-3">
          <div class="c-item first">
            <Tag rounded class="c-custom-tag inverted mb-4">Classes</Tag>
            <h2>Discover<br />Pilates<br />Power</h2>
            <div class="bottom">
              <p>
                At BettinkaPilates, we believe that true well-being comes from
                within. Our classes are designed to help you reconnect with your
                body. mind. spirit.
              </p>
            </div>
          </div>
        </div>

        <!--Grid Products-->
        <div
          v-for="product in filteredProducts"
          :key="`class_item_${product.id}`"
          class="col-xs-12 col-md-3"
        >
          <ProductsGridItem :data="product"></ProductsGridItem>
        </div>

        <!--Final Block-->
        <div v-if="lastBlock" class="col-xs-12 col-md-3">
          <div class="c-item last">
            <div class="content">
              <Tag rounded class="c-custom-tag mb-3">Classes</Tag>
              <p class="mb-3">View and Filter <br />All Classes</p>
              <Button
                class="c-custom-button"
                icon="pi pi-arrow-right"
                iconPos="right"
                label="All Classes"
                @click="goTo('/services')"
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
    filters: {
      type: Boolean,
      default: false,
    },
    firstBlock: {
      type: Boolean,
      default: true,
    },
    lastBlock: {
      type: Boolean,
      default: true,
    },
    max: {
      type: Number,
      default: 7,
    },
  },

  data() {
    return {
      selected: null,
    }
  },

  computed: {
    products() {
      return useServicesStore().products
    },
    collections() {
      return useServicesStore().collections
    },
    filteredProducts() {
      if (this.products && this.selected && this.filters) {
        return this.products.filter((i) => i.collection === this.selected)
      }
      return this.products
    },
  },
}
</script>
