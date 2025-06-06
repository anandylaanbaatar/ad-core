<template>
  <AdminLayout>
    <h2 class="flex align-items-center">
      <Button
        icon="pi pi-arrow-left"
        class="sm mr-3"
        @click="goTo('/admin/products')"
      ></Button>
      <template v-if="editMode">Edit</template>
      <template v-else>Add</template>
      Product
    </h2>

    <AdminFormsProduct></AdminFormsProduct>
  </AdminLayout>
</template>

<script>
export default {
  computed: {
    editMode() {
      if (this.$route.query.id) return true
      return false
    },
  },
}
</script>
