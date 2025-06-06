<template>
  <div class="w-full">
    <div>
      <h2>Change Role</h2>

      <Loader v-if="loading"></Loader>

      <template v-else>
        <ProfileInfo :account="account" class="my-3"></ProfileInfo>

        <div class="c-form">
          <div class="c-field mb-3">
            <MultiSelect
              v-model="form.roles"
              display="chip"
              :options="roleOptions"
              optionLabel="name"
              placeholder="Select Roles"
              class="w-full"
            ></MultiSelect>
          </div>

          <div class="c-field">
            <Loader v-if="btnLoading" type="none"></Loader>
            <Button v-else class="w-full" @click="updateRoles"
              >Update roles</Button
            >
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    account: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: false,
      btnLoading: false,
      form: {
        roles: null,
      },
    }
  },

  computed: {
    user() {
      return useAuthStore().user
    },
    isAdmin() {
      if (this.user) {
        if (this.user.roles) {
          if (this.user.roles.include("admin")) {
            return true
          }
        }
      }
      return false
    },
    roleOptions() {
      return [
        {
          id: "user",
          value: "user",
          name: "User",
        },
        {
          id: "admin",
          value: "admin",
          name: "Admin",
        },
        {
          id: "staff",
          value: "staff",
          name: "Staff",
        },
      ]
    },
  },

  mounted() {
    this.fillRoles()
  },

  methods: {
    fillRoles() {
      if (this.account) {
        if (this.account.roles) {
          const roles = this.account.roles.map((i) =>
            this.roleOptions.find((j) => j.id === i)
          )
          this.form.roles = roles
        }
      }
    },

    async updateRoles() {
      this.btnLoading = true
      let roles = this.form.roles.map((i) => i.value)

      // Role Rules
      if (roles.includes("admin")) {
        roles = ["admin"]
      } else if (roles.includes("staff") && roles.includes("user")) {
        roles = ["staff"]
      } else if (roles.length === 0) {
        roles = ["user"]
      }

      this.form.roles = roles.map((i) =>
        this.roleOptions.find((j) => j.id === i)
      )

      // Update User Roles
      await this.$fire.actions.update(`/users/${this.account.uid}`, {
        roles: roles,
      })
      await useAuthStore().setUsers()

      this.$bus.$emit("sidebarClose")
      this.$bus.$emit("toast", {
        severity: "success",
        summary: "Success",
        detail: "Updated user roles.",
      })

      this.btnLoading = false
    },
  },
}
</script>
