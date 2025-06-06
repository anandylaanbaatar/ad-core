<template>
  <AdminLayout>
    <div class="w-full flex align-items-center">
      <h2>Collections</h2>

      <Button
        icon="pi pi-plus"
        label="Add Collection"
        class="ml-auto"
        @click="$bus.$emit('sidebarAdmin', { id: 'collections', data: null })"
      ></Button>
    </div>

    <DataTable
      v-if="collections && collections.length > 0"
      :value="collections"
      tableStyle="min-width: 50rem"
      class="c-table mt-4"
    >
      <!-- <Column v-if="fields.id" field="id" header="Id"></Column> -->
      <Column field="name" header="Name">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.name" severity="warn">{{
            slotProps.data.name
          }}</Tag>
        </template>
      </Column>

      <Column header="Action" :style="'width: 50px;'">
        <template #body="slotProps">
          <div class="w-full flex justify-content-center">
            <Loader v-if="actionLoading" type="none"></Loader>
            <PopoverActions v-else>
              <ul class="c-list">
                <li>
                  <div
                    class="c-list-item"
                    @click="
                      $bus.$emit('sidebarAdmin', {
                        id: 'collections',
                        data: slotProps.data.id,
                      })
                    "
                  >
                    <i class="pi pi-pen-to-square"></i> Edit
                  </div>
                </li>
                <li>
                  <div
                    class="c-list-item"
                    @click="deleteCollection(slotProps.data.id)"
                  >
                    <i class="pi pi-trash"></i> Delete
                  </div>
                </li>
              </ul>
            </PopoverActions>
          </div>
        </template>
      </Column>
    </DataTable>

    <UiEmpty
      v-else
      icon="pi-tags"
      desc="No Collections Here Yet."
      class="mt-4 p-6"
    ></UiEmpty>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      actionLoading: false,
    }
  },

  computed: {
    collections() {
      return useServicesStore().collections
    },
  },

  methods: {
    async deleteCollection(id) {
      this.$bus.$emit("confirm", {
        header: "Collection",
        message: "Are you sure you want to delete this collection?",
        callback: async () => {
          this.actionLoading = true

          try {
            const res = await this.$fire.actions.remove(
              `${tenantPath()}/collections/${id}`
            )

            this.actionLoading = false
            this.$bus.$emit("toast", {
              severity: "success",
              summary: "Collection",
              detail: "Successfully deleted collection.",
            })

            await useServicesStore().setCollections()
          } catch (err) {
            console.log("Error deleting collection :: ", err.message)

            this.$bus.$emit("toast", {
              severity: "danger",
              summary: "Collection",
              detail: "Error deleting collection.",
            })
            this.actionLoading = false
          }
        },
      })
    },
  },
}
</script>
