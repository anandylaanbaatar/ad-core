<template>
  <div class="c-box flex flex-wrap align-content-center justify-content-center">
    <slot v-if="type === 'custom'"></slot>

    <div v-else class="text-center">
      <i v-if="icon" :class="icon"></i>
      <h2>{{ title }}</h2>
      <h4>{{ desc }}</h4>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: "404",
    },
    desc: {
      type: String,
      default: "Oops, something went wrong.",
    },
    type: {
      type: String,
      default: null,
    },
  },
}
</script>
