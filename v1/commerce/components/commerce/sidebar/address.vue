<template>
  <div class="sidebar addressSidebar">
    <FormsAddress
      v-if="active"
      :key="`addressForm_${addressKey}`"
      :address="item"
      @close="close"
    ></FormsAddress>
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
      loading: true,

      addressKey: 0,
      address: null,
    }
  },

  mounted() {
    this.active = true
  },

  methods: {
    close() {
      this.reset()
      this.active = false
    },
    reset() {
      this.addressKey += 1
      this.address = null
      this.$bus.$emit("sidebarGlobalClose")
    },
  },
}
</script>
