<template>
  <AdminLayout>
    <h2>Settings</h2>

    <div class="row">
      <div class="col-xs-12 col-md-6">
        <div class="d-block my-3 size-l-5">
          <h3 class="mb-3">Website Info</h3>
          <!-- <p v-if="tenantId()">Tenant Id: {{ tenantId() }}</p> -->
          <p v-if="tenantPath()">Tenant Path: {{ tenantPath() }}</p>
          <p v-if="features().auth && features().auth.type">
            Authentication: {{ features().auth.type }}
          </p>
        </div>
      </div>
      <div class="col-xs-12 col-md-6">
        <div class="d-block my-3 size-l-5">
          <h3 class="mb-3">Migration and Scripts</h3>

          <Loader v-if="loading"></Loader>
          <template v-else>
            <Button severity="secondary" @click="moveToMultitenant"
              >Move from Single Tenant to Multitenant</Button
            >
          </template>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
    }
  },

  methods: {
    async moveToMultitenant() {
      if (!tenantPath()) return

      this.loading = true

      // const tenantId = features().multitenancy.tenantId
      const products = await this.$fire.actions.read("/products")
      const collections = await this.$fire.actions.read("/collections")

      console.log("Data ::: Tenant Id ::: ", tenantId)
      console.log("Data ::: Products ::: ", products)
      console.log("Data ::: Collections ::: ", collections)

      if (collections) {
        await this.$fire.actions.update(
          `${tenantPath()}/collections`,
          collections
        )
        await this.$fire.actions.remove(`collections`)
      }
      if (products) {
        await this.$fire.actions.update(`${tenantPath()}/products`, products)
        await this.$fire.actions.remove("products")
      }

      this.$bus.$emit("toast", {
        severity: "success",
        summary: "Success",
        detail: "Successfully migrated to multitenancy.",
      })
      this.loading = false
    },
  },
}
</script>
