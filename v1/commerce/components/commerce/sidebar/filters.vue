<template>
  <div class="sidebar filtersSidebar">
    <div class="c-divider"></div>
    <div class="row p-3">
      <h5>Шүүлтүүр</h5>
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
  },

  data() {
    return {
      active: false,
    }
  },
}
</script>
