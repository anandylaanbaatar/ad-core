<template>
  <Button
    :icon="icon"
    :class="classes"
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
  },
}
</script>
