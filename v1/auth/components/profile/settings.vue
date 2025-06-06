<template>
  <div class="d-block px-4 mb-5">
    <h3 class="mb-3">{{ $utils.t("Settings") }}</h3>

    <SwitcherLanguage></SwitcherLanguage>
    <SwitcherCurrency></SwitcherCurrency>
    <div class="flex inline-flex ml-2">
      <SwitcherDarkMode></SwitcherDarkMode>
    </div>
  </div>
</template>

<script>
export default {}
</script>
