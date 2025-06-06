<template>
  <div v-if="product">
    <div v-if="product.results && product.results.classes">
      <!--Week Filter-->
      <ProductsFiltersWeek
        :filters="filters"
        :classes="product.results.classes"
        @updated="(date) => (filters.selected = date)"
      ></ProductsFiltersWeek>

      <!--Classes-->
      <h4
        v-if="filteredClasses.length === 0"
        class="text-sm text-center opacity-50 py-3"
      >
        <i class="pi pi-calendar text-xl mb-2"></i><br />
        No classes found for this date.
      </h4>

      <div
        v-for="classItem in filteredClasses"
        :key="`${product.id}_${classItem.date}`"
        class="d-block mb-2 flex flex-wrap gap-3 align-items-center c-link"
        @click="selectClass(product.id, classItem.id)"
      >
        <div v-if="image">
          <div
            v-if="product.image"
            class="c-image productImage"
            :style="$utils.setBackImage(product.image)"
          ></div>
        </div>
        <div>
          <h4 v-if="product.name" class="w-full flex">
            <span>{{ product.name }}</span>
          </h4>

          <h4 v-if="price" class="w-full flex mb-1">
            <span
              >{{ product.currency.toUpperCase() }}
              {{ product.amount_formatted }} /
              {{ getClassInterval(product.interval) }}</span
            >
          </h4>

          <h5 class="w-full flex">
            {{ classItem.formatted }}
          </h5>
        </div>
        <div class="ml-auto">
          <div class="w-full flex justify-content-end">
            <h4>
              <Tag v-if="classItem.comingUp" severity="success">{{
                classItem.comingUp
              }}</Tag>
              <Tag
                v-else-if="classItem.status === 'Finished'"
                severity="danger"
                >{{ classItem.status }}</Tag
              >
              <Tag
                v-else-if="classItem.status === 'In Progress'"
                severity="info"
                >{{ classItem.status }}</Tag
              >
              <Tag
                v-else-if="classItem.status === 'Not Started'"
                severity="success"
                >{{ classItem.status }}</Tag
              >
              <br />

              <Tag
                v-if="classItem.status !== 'Finished' && classItem.slotsLeft"
                severity="warn"
                class="float-right"
                >{{ classItem.slotsLeft }} spots left</Tag
              >
            </h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      default: null,
    },
    price: {
      type: Boolean,
      default: true,
    },
    image: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      filters: {
        selected: this.$utils.moment(),
        showFinished: true,
        showAll: false,
      },
    }
  },

  computed: {
    productImage() {
      if (this.product) {
        if (this.product.image) {
          return this.$utils.setBackImage(this.product.image)
        }
      }
      return
    },
    productUrl() {
      if (this.product) {
        return `/services/${this.product.id}`
      }
      return
    },
    filteredClasses() {
      let allClasses = this.product.results.classes

      // All Classes
      if (this.filters.showAll) {
        return allClasses
      }

      if (!this.filters.showFinished) {
        allClasses = allClasses.filter((i) => i.status !== "Finished")
      }
      if (this.filters.selected) {
        const format = "MMM DD, YYYY"
        const dayFormatted = this.$utils
          .moment(this.filters.selected)
          .format(format)
        allClasses = allClasses.filter(
          (i) => this.$utils.moment(i.date).format(format) === dayFormatted
        )
      }

      return allClasses
    },
  },

  methods: {
    selectClass(productId, classId) {
      this.$bus.$emit("sidebarGlobal", {
        id: "productClass",
        data: {
          id: classId,
          productId: productId,
        },
      })
    },
  },
}
</script>

<style lang="scss">
.productImage {
  display: block;
  width: 80px;
  border-radius: 12px;
  aspect-ratio: 4/4;
  float: left;
}
</style>
