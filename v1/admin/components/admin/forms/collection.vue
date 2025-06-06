<template>
  <div class="w-full">
    <div>
      <h2>
        <span v-if="editMode">Update</span>
        <span v-else>Create</span>
        Collection
      </h2>

      <div class="c-form row adminForm">
        <!--Name-->
        <div class="c-field col-xs-12">
          <label for="name">Name</label>
          <InputText
            id="name"
            v-model="form.name"
            placeholder="Collection Name"
            :invalid="errors.name"
            @change="validation"
          ></InputText>
          <small v-if="errors.name" class="error">{{ errors.name }}</small>
        </div>

        <!--Image-->
        <div class="c-field col-xs-12">
          <label for="image">Image</label>
          <InputText
            id="image"
            v-model="form.image"
            placeholder="Collection Image Url"
            :invalid="errors.image"
            @change="validation"
          ></InputText>
          <small v-if="errors.image" class="error">{{ errors.image }}</small>
        </div>

        <!--Submit Button-->
        <div class="c-field col-xs-12">
          <Loader v-if="loading" type="none"></Loader>
          <Button
            v-else
            primary
            class="w-full"
            @click="createOrUpdate"
            :disabled="!isValid"
          >
            <template v-if="editMode">Update</template>
            <template v-else>Create</template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      form: {
        name: null,
        image: null,
      },
      errors: {},
      loading: false,
      isValid: false,
      preview: true,
    }
  },

  computed: {
    editMode() {
      if (this.id) return true
      return false
    },
    collections() {
      return useServicesStore().collections
    },
    collection() {
      if (this.collections) {
        if (this.id) {
          let collection = this.collections.find((i) => i.id === this.id)

          console.log("Edit Collection ::: ", this.id, collection)

          return collection
        }
      }
      return
    },
  },

  async mounted() {
    this.fillForm(this.collection)
  },

  methods: {
    reset() {
      this.isValid = false
      this.errors = {}
    },
    validation() {
      this.reset()
      const validation = this.$forms.validateForm(this.form)
      this.isValid = validation.isValid
      this.errors = validation.errors
    },

    async createOrUpdate() {
      if (this.editMode) {
        await this.update()
      } else {
        await this.create()
      }
    },
    async create() {
      if (!integrations().firebase) {
        console.log("[Forms] ::: Firebase not setup!")
        return
      }
      this.loading = true

      try {
        let form = {
          name: this.form.name,
        }
        if (this.form.image) {
          form.image = this.form.image
        }

        const res = await this.$fire.actions.add(
          `${tenantPath()}/collections`,
          form
        )

        console.log("[Firebase] ::: Collection Create ::: ", res)

        // Success Message
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Collection",
          detail: "Successfully added collection.",
        })
        this.loading = false
        this.reset()

        // Update Collections
        await useServicesStore().setCollections()

        // Close Sidebar
        this.$bus.$emit("sidebar", {
          id: null,
        })
      } catch (err) {
        console.log(
          "[Collections] ::: Error creating collection ::: ",
          err.message
        )

        this.$bus.$emit("toast", {
          severity: "danger",
          summary: "Collections",
          detail: "Error creating collection.",
        })
        this.loading = false
      }
    },
    async update() {
      if (!integrations().firebase) {
        console.log("[Forms] ::: Firebase not setup!")
        return
      }
      this.loading = true

      try {
        const res = await this.$fire.actions.update(
          `${tenantPath()}/collections/${this.form.id}`,
          this.form
        )

        console.log("[Firebase] ::: Collection Updated :: ", res)

        // Success Message
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Collection",
          detail: "Successfully updated collection.",
        })
        this.loading = false
        this.reset()

        // Update Collections
        await useServicesStore().setCollections()

        // Close Sidebar
        this.$bus.$emit("sidebar", {
          id: null,
        })
      } catch (err) {
        console.log(
          "[Collections] ::: Error updating collection ::: ",
          err.message
        )

        this.$bus.$emit("toast", {
          severity: "danger",
          summary: "Collection",
          detail: "Error updating collection.",
        })
        this.loading = false
      }
    },

    fillForm(data) {
      this.form.id = data.id
      this.form.name = data.name || null
      this.form.image = data.image || null
    },
  },
}
</script>

<style lang="scss">
.adminForm {
  width: 500px;
  max-width: 100%;
  margin-top: 30px;
}
</style>
