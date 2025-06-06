<template>
  <AdminLayout>
    <!--Title-->
    <h2 class="w-full flex">
      <span> Customers </span>

      <div class="ml-auto">
        <PopoverActions icon="pi pi-filter">
          <div
            v-for="(key, value) in fields"
            :key="`field_control_${key}`"
            class="flex align-items-center gap-2 capitalize c-link py-1"
          >
            <Checkbox
              v-model="fields[value]"
              :inputId="value"
              :name="value"
              binary
              @change="saveFields"
            />
            <label :for="value">{{ value }}</label>
          </div>
        </PopoverActions>
      </div>
    </h2>

    <!--Loader-->
    <Loader v-if="loading"></Loader>

    <!--Empty-->
    <UiEmpty
      v-else-if="allUsers === null"
      icon="pi-users"
      desc="No Customers Here Yet."
      class="mt-4 p-6"
    ></UiEmpty>

    <!--Table-->
    <DataTable
      v-else
      :value="users"
      tableStyle="min-width: 50rem"
      class="c-table mt-4"
    >
      <!--Role-->
      <Column v-if="fields.role" field="role" header="Role">
        <template #body="slotProps">
          <template v-if="slotProps.data.roles">
            <Tag v-if="slotProps.data.roles.includes('admin')" severity="warn"
              >Admin</Tag
            >
            <Tag v-if="slotProps.data.roles.includes('staff')" severity="warn"
              >Staff</Tag
            >
            <Tag
              v-if="slotProps.data.roles.includes('user')"
              severity="secondary"
              >User</Tag
            >
          </template>
        </template>
      </Column>

      <!--Tenants-->
      <Column v-if="fields.tenants && isAdmin" field="tenants" header="Tenants">
        <template #body="slotProps">
          <template v-if="isMultitenantParent">
            <Tag
              v-if="slotProps.data.tenants"
              v-for="tenantId in slotProps.data.tenants"
              :key="`user_${slotProps.data.uid}_tenants_${tenantId}`"
              severity="info"
              class="mr-2"
              >{{ tenantId }}</Tag
            >
          </template>
          <template v-else-if="isMultitenant">
            <Tag v-if="slotProps.data.tenants" severity="info" class="mr-2">
              {{ isMultitenant }}
            </Tag>
          </template>
        </template>
      </Column>

      <!--Display Name-->
      <Column
        v-if="fields.displayName"
        field="displayName"
        header="Display Name"
      ></Column>

      <!--Customer Id-->
      <Column
        v-if="fields.customerId"
        field="customerId"
        header="Customer Id"
      ></Column>

      <!--User Id-->
      <Column v-if="fields.uid" field="uid" header="User Id"></Column>

      <!--Loops Id-->
      <Column
        v-if="fields.loopsUserId"
        field="loopsUserId"
        header="Marketing Id"
      ></Column>

      <!--Email-->
      <Column v-if="fields.email" field="email" header="Email"></Column>

      <!--Phone-->
      <Column v-if="fields.phone" field="phone" header="Phone"></Column>

      <!--Login Method-->
      <Column v-if="fields.providerId" field="providerId" header="Login">
        <template #body="slotProps">
          <i
            v-if="slotProps.data.providerId === 'password'"
            class="pi pi-at"
            v-tooltip.top="'Password'"
          ></i>
          <i
            v-else-if="slotProps.data.providerId === 'google.com'"
            class="pi pi-google"
            v-tooltip.top="'Google'"
          ></i>
        </template>
      </Column>

      <!--Created At-->
      <Column v-if="fields.createdAt" field="createdAt" header="Created At">
        <template #body="slotProps">
          <Tag severity="secondary">{{
            $utils.utcToLocal(slotProps.data.createdAt)
          }}</Tag>
        </template>
      </Column>

      <!--Last Login At-->
      <Column
        v-if="fields.lastLoginAt"
        field="lastLoginAt"
        header="Last Login At"
      >
        <template #body="slotProps">
          <Tag severity="secondary">{{
            $utils.utcToLocal(slotProps.data.lastLoginAt)
          }}</Tag>
        </template>
      </Column>

      <!--Actions-->
      <Column header="Action" :style="'width: 50px;'">
        <template #body="slotProps">
          <div class="w-full flex justify-content-center">
            <Loader v-if="actionLoading" type="none"></Loader>
            <PopoverActions>
              <ul class="c-list">
                <li v-if="isAdmin">
                  <div
                    class="c-list-item"
                    @click="
                      $bus.$emit('sidebarAdmin', {
                        id: 'userRoles',
                        data: slotProps.data,
                      })
                    "
                  >
                    Change Role
                  </div>
                </li>
                <li v-if="slotProps.data.customerId">
                  <div
                    class="c-list-item"
                    @click="
                      $bus.$emit('sidebarAdmin', {
                        id: 'userSubscriptions',
                        data: slotProps.data.customerId,
                      })
                    "
                  >
                    View Subscriptions
                  </div>
                </li>
              </ul>
            </PopoverActions>
          </div>
        </template>
      </Column>
    </DataTable>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      fields: {
        role: true,
        displayName: true,
        customerId: false,
        loopsUserId: false,
        uid: false,
        email: true,
        phone: true,
        providerId: false,
        createdAt: false,
        lastLoginAt: false,
      },
      loading: false,
      actionLoading: false,
    }
  },

  computed: {
    // Checks
    isStripeTestMode() {
      return usePaymentStore().stripeTestMode
    },
    isMultitenant() {
      if (features().multitenancy && features().multitenancy.tenantId) {
        return features().multitenancy.tenantId
      }
      return
    },
    isMultitenantParent() {
      if (this.isMultitenant) {
        if (features().multitenancy) {
          if (
            features().multitenancy.parentId ===
            features().multitenancy.tenantId
          ) {
            return true
          }
        }
      }
      return false
    },
    isAdmin() {
      if (this.user) {
        if (this.user.roles) {
          if (this.user.roles.includes("admin")) {
            return true
          }
        }
      }
      return false
    },

    // Data
    users() {
      let allUsers = useAuthStore().users

      if (this.isMultitenant) {
        const tenantId = this.isMultitenant

        if (!this.isMultitenantParent) {
          allUsers = allUsers.filter((i) => {
            if (i.tenants) {
              if (i.tenants.includes(tenantId)) {
                return i
              }
            }
          })
        }

        allUsers = allUsers.map((i) => {
          let userItem = i

          if (userItem[tenantId]) {
            // Set Stripe Id
            if (this.isStripeTestMode) {
              if (userItem[tenantId].test_customerId) {
                userItem.customerId = userItem[tenantId].test_customerId
              }
            } else {
              if (userItem[tenantId].customerId) {
                userItem.customerId = userItem[tenantId].customerId
              }
            }

            // Set Loops Id
            if (userItem[tenantId].loopsUserId) {
              userItem.loopsUserId = userItem[tenantId].loopsUserId
            }
          }

          return userItem
        })
      }

      return allUsers
    },
    user() {
      return useAuthStore().user
    },
  },

  mounted() {
    this.setFields()

    if (this.isMultitenant) {
      this.fields.tenants = true
    }
  },

  methods: {
    setFields() {
      let userFields = localStorage.getItem("admin_users_fields")

      if (userFields) {
        userFields = JSON.parse(userFields)
        this.fields = userFields
      }
    },
    saveFields() {
      localStorage.setItem("admin_users_fields", JSON.stringify(this.fields))
    },
  },
}
</script>
