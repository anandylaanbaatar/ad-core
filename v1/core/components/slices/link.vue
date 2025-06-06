<template>
  <template v-if="link && link.url">
    <Button
      v-if="linkVariant === 'link'"
      link
      :severity="linkVariant"
      @click="linkGoTo"
      icon="pi pi-arrow-right"
      iconPos="right"
    >
      {{ linkText }}
    </Button>

    <Button
      v-else-if="linkVariant === 'glass'"
      class="p-glass-button"
      block
      @click="linkGoTo"
    >
      {{ linkText }}
    </Button>

    <Button v-else :severity="linkVariant" @click="linkGoTo">
      {{ linkText }}
    </Button>
  </template>
</template>

<script>
export default {
  props: {
    link: {
      type: Object,
      default: null,
    },
  },

  computed: {
    linkVariant() {
      if (this.link) {
        if (this.link.variant) {
          return this.link.variant
        }
      }
      return "primary"
    },
    linkText() {
      if (this.link && this.link.text) {
        return this.$utils.t(this.link.text)
      }
      return
    },
  },

  methods: {
    linkGoTo() {
      if (this.link && this.link.url) {
        this.$bus.$emit("goTo", this.link.url)
      }
    },
  },
}
</script>
