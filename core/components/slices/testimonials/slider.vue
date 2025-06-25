<template>
  <div v-if="item" class="c-testimonials">
    <div v-if="item.title" class="c-textBlock mb-0">
      <div class="container">
        <div class="content">
          <div class="c-text">
            <Tag v-if="item.tag" rounded class="c-custom-tag mb-4">{{
              item.tag
            }}</Tag>
            <h2 v-if="item.title" class="mb-4">{{ item.title }}</h2>
            <p v-if="item.description" class="mb-4">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Loader v-if="loading"></Loader>

    <template v-else-if="!reviews">
      <div class="container">
        <UiEmpty icon="pi pi-users" desc="No Testimonials Found."></UiEmpty>
      </div>
    </template>

    <div v-else-if="items && items.length > 0" class="c-testimonialsScroll">
      <div class="container">
        <Sliders :options="{ padding: '0px' }">
          <Slide v-for="review in items" :key="`slide_${review.id}`">
            <SlicesTestimonialsItem
              :useRating="reviews.use_rating"
              :item="review"
            ></SlicesTestimonialsItem>
          </Slide>
        </Sliders>
      </div>
    </div>

    <div v-if="item.link && item.link.url" class="container">
      <div class="text-center">
        <Button
          icon="pi pi-arrow-right"
          iconPos="right"
          :label="$utils.t(item.link.text)"
          :class="{ 'c-custom-button': item.link.variant === 'Custom' }"
          @click="$bus.$emit('goTo', item.link.url)"
        ></Button>
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

  data() {
    return {
      loading: true,
      reviews: null,
    }
  },

  computed: {
    item() {
      if (this.data) {
        if (this.data.primary) {
          return this.data.primary
        }
      }
      return
    },
    items() {
      if (this.reviews) {
        if (this.reviews.data_type === "Static") {
          if (this.reviews.static_data) {
            return this.reviews.static_data
          }
        } else if (this.reviews.data_type === "Dynamic") {
          return []
        }
      }
      return
    },
  },

  async mounted() {
    if (this.data) {
      if (this.data.primary) {
        if (
          this.data.primary.static_data &&
          !this.data.primary.static_data.isBroken
        ) {
          await this.getDoc(this.data.primary.static_data.id)
        }
      }
    }
  },

  methods: {
    async getDoc(id) {
      if (integrations().prismic) {
        if (!this.$prismicClient) return
        this.loading = true

        try {
          const items = await this.$prismicClient.getSingle("testimonials")

          if (items) {
            this.reviews = items.data
          }
        } catch (err) {
          console.log("[Prismic] ::: Error ::", err.message)
        }

        this.loading = false
      }
    },
  },
}
</script>
