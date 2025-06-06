<template>
  <div class="admin-header">
    <div class="left">
      <img
        src="https://images.prismic.io/adoriginalstudio/Z_1ZrevxEdbNPB83_AD-Logo-WhiteBlank.png?auto=format,compress"
        alt="AD Logo"
        height="23"
        class="c-link"
        @click="$bus.$emit('goTo', '/admin')"
      />
    </div>

    <div class="center"></div>

    <div class="right ml-auto">
      <Button
        class="iconBtn sm ml-auto"
        icon="pi pi-user"
        severity="contrast"
        @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
        aria-label="Account Button"
      ></Button>
    </div>
  </div>
</template>

<script>
export default {}
</script>
