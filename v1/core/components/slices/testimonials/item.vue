<template>
  <div v-if="item" class="c-testimonial">
    <div>
      <Avatar
        v-if="item.image && item.image.url"
        :image="item.image.url"
        class="mb-2"
        size="large"
        shape="circle"
      />

      <h3 v-if="item.name" class="mb-2">{{ item.name }}</h3>

      <div
        v-if="useRating && item.rating"
        class="flex justify-content-center mb-3 w-full"
      >
        <Rating
          :modelValue="item.rating"
          :defaultValue="item.rating"
          :readOnly="true"
          disabled
          :style="'opacity:1;'"
        />
      </div>

      <p v-if="item.description">
        {{ item.description }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
    useRating: {
      type: Boolean,
      default: true,
    },
  },
}
</script>
