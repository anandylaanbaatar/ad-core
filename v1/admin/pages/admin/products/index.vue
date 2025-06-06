<template>
  <AdminLayout>
    <div class="w-full flex align-items-center">
      <h2>Products</h2>

      <Button
        icon="pi pi-plus"
        label="Add Product"
        @click="goTo('/admin/products/create')"
        class="ml-auto"
      ></Button>
    </div>

    <Loader v-if="loading"></Loader>

    <DataTable
      v-if="products && products.length > 0"
      :value="products"
      class="c-table mt-4 w-full"
    >
      <!-- <Column v-if="fields.id === true" field="id" header="Id"></Column> -->
      <Column field="name" header="Name">
        <template #body="slotProps">
          <div class="flex align-items-center">
            <div
              v-if="slotProps.data.image"
              class="c-block c-image size-xxs-5 mr-3"
              :style="
                $utils.setBackImage(slotProps.data.image) +
                'width:50px;height:50px;'
              "
            ></div>
            <Tag v-if="slotProps.data.name" severity="info">{{
              slotProps.data.name
            }}</Tag>
          </div>
        </template>
      </Column>
      <!-- <Column field="currency" header="Currency"></Column> -->
      <Column field="amount_formatted" header="Price">
        <template #body="slotProps">
          {{ slotProps.data.currency.toUpperCase() }}
          {{ slotProps.data.amount_formatted }}
        </template>
      </Column>
      <!-- <Column field="type" header="Type"></Column> -->
      <Column field="interval" header="Recurring">
        <template #body="slotProps">
          <span v-if="slotProps.data.interval">
            {{ getClassInterval(slotProps.data.interval) }}
          </span>
        </template>
      </Column>
      <Column field="instructors" header="Instructors">
        <template #body="slotProps">
          <template v-if="slotProps.data.instructors">
            <Tag
              v-for="userId in slotProps.data.instructors"
              severity="warn"
              class="mr-2"
              >{{ userName(userId) }}</Tag
            >
          </template>
        </template>
      </Column>
      <Column field="collection" header="Collection">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.collection" severity="warn">{{
            collectionName(slotProps.data.collection)
          }}</Tag>
        </template>
      </Column>
      <Column field="slots" header="Slots">
        <template #body="slotProps">
          <Tag v-if="slotProps.data.slots" severity="warn"
            >{{ getAvailableSlots(slotProps.data.id, slotProps.data.slots) }} /
            {{ slotProps.data.slots }} Available</Tag
          >
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
                      goTo(`/admin/products/create?id=${slotProps.data.id}`)
                    "
                  >
                    <i class="pi pi-pen-to-square"></i> Edit
                  </div>
                </li>
                <li>
                  <div
                    class="c-list-item"
                    @click="deleteProduct(slotProps.data.id)"
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
      desc="No Products Here Yet."
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
    products() {
      return useServicesStore().products
    },
    collections() {
      return useServicesStore().collections
    },
    users() {
      return useAuthStore().users
    },
  },

  async mounted() {
    this.loading = true
    this.loading = false
  },

  methods: {
    async deleteProduct(id) {
      this.$bus.$emit("confirm", {
        header: "Product",
        message: "Are you sure you want to delete this product?",
        callback: async () => {
          this.actionLoading = true

          try {
            const res = await this.$stripe.product.delete(id)
            const res2 = await this.$fire.actions.remove(`/products/${id}`)

            this.actionLoading = false
            this.$bus.$emit("toast", {
              severity: "success",
              summary: "Product",
              detail: "Successfully deleted product.",
            })

            await useServicesStore().setProducts()
          } catch (err) {
            console.log("Error deleting product :: ", err.message)

            this.$bus.$emit("toast", {
              severity: "danger",
              summary: "Product",
              detail: "Error deleting product.",
            })
            this.actionLoading = false
          }
        },
      })
    },
    collectionName(id) {
      if (this.collections) {
        let item = this.collections.find((i) => i.id === id)
        if (item) {
          return item.name
        }
      }
      return
    },
    userName(id) {
      if (this.users) {
        let item = this.users.find((i) => i.uid === id)
        if (item) {
          return item.displayName
        }
      }
      return
    },
  },
}
</script>
