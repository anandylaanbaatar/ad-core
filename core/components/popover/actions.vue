<template>
  <Button
    :icon="icon"
    :class="classes"
    :disabled="disabled"
    class="sm"
    @click.stop="(event) => $refs.morePopup.toggle(event)"
  ></Button>
  <Popover ref="morePopup">
    <slot></slot>
  </Popover>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: "pi pi-ellipsis-h",
    },
    classes: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
