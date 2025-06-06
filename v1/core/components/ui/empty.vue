<template>
  <div class="c-box flex flex-wrap align-content-center justify-content-center">
    <div v-if="type && type === 'custom'">
      <slot></slot>
    </div>
    <div v-else class="text-center">
      <i v-if="icon" class="pi mb-3 text-2xl" :class="icon"></i>
      <h4>{{ desc }}</h4>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      defaul: null,
    },
    desc: {
      type: String,
      default: "This is an empty box",
    },
    icon: {
      type: String,
      default: null,
    },
  },
}
</script>
