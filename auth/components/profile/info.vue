<template>
  <div v-if="account" class="c-block text-center relative py-6 mb-5">
    <!--Trigger Btn-->
    <Button
      icon="pi pi-user-edit"
      severity="secondary"
      class="c-block-top-right mt-3 mr-3 sm"
      @click="infoDialog = true"
      v-tooltip.left="$utils.t('Update')"
    ></Button>

    <!--Info-->
    <div class="px-4">
      <!--Avatar-->
      <Avatar
        v-if="account.photoURL"
        :image="account.photoURL ? account.photoURL : null"
        shape="circle"
        class="c-avatar mb-3"
        v-tooltip.top="`${account.displayName ? account.displayName : 'User'}`"
      />
      <i v-else class="pi pi-user userIcon text-2xl mb-3"></i>

      <h3>
        <template v-if="userCountry">
          <img
            height="12px"
            :src="`https://flagcdn.com/w20/${userCountry}.png`"
            class="mr-1"
          /><br />
        </template>

        <template v-if="account.roles">
          <template v-if="account.roles.includes('admin')">
            <Tag severity="warn" class="mb-2">{{ $utils.t("Admin") }}</Tag
            ><br />
          </template>
          <template v-if="account.roles.includes('staff')">
            <Tag severity="warn" class="mb-2">{{ $utils.t("Staff") }}</Tag
            ><br />
          </template>
          <template v-if="account.roles.includes('user')">
            <Tag severity="info" class="mb-2">{{ $utils.t("User") }}</Tag
            ><br />
          </template>
        </template>

        <span v-if="account.firstName">{{ account.firstName }}</span>
        <span v-if="account.lastName" class="ml-1">{{ account.lastName }}</span>
      </h3>
      <p class="font3 mt-1">
        <i class="pi pi-envelope"></i> {{ account.email }}
      </p>
      <p v-if="account.phone" class="font3">
        <i class="pi pi-phone"></i> {{ $utils.formatPhone(account.phone) }}
      </p>

      <template v-if="isShopify">
        <p class="font3">
          {{ $utils.t("Member since") }}:
          {{ $utils.formatDate(account.createdAt) }}
        </p>
      </template>
      <template v-else-if="isFirebase">
        <!-- <p v-if="account.createdAt" class="font3">
          {{ $utils.t("Member since") }}:
          {{ $utils.utcToLocal(account.createdAt) }}
        </p> -->
        <!-- <p v-if="account.lastLoginAt" class="font3">
          {{ $utils.t("Last login") }}:
          {{ $utils.utcToLocal(account.lastLoginAt) }}
        </p> -->

        <template v-if="!account.emailVerified">
          <Message
            severity="warn"
            class="mt-3 mb-3"
            icon="pi pi-exclamation-circle"
          >
            <div>Please verify your email. We have sent an email.</div>
          </Message>

          <Loader type="sm" v-if="sendingEmail"></Loader>
          <Button
            v-else
            label="Resend Email"
            severity="secondary"
            icon="pi pi-envelope"
            @click="sendEmailVerification"
          ></Button>
        </template>
      </template>

      <!-- <p v-if="userData" class="font3">
        {{ $utils.t("Profile updated on") }}:
        {{ $utils.formatDateTime(userData.expiresAt) }}
      </p> -->
    </div>

    <!--Dialog-->
    <Dialog
      modal
      v-model:visible="infoDialog"
      :header="$utils.t('Update')"
      class="c-dialog"
    >
      <FormsUpdateCustomer
        v-if="infoDialog"
        :account="account"
        @updated="updated"
        @close="close"
      ></FormsUpdateCustomer>
    </Dialog>
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
      infoDialog: false,
      sendingEmail: false,
    }
  },

  computed: {
    isShopify() {
      return useRuntimeConfig().public.features.auth.type === "shopify"
    },
    isFirebase() {
      return useRuntimeConfig().public.features.auth.type === "firebase"
    },
    userCountry() {
      const store = useAuthStore()

      if (store.userLocation) {
        if (store.userLocation.country) {
          return store.userLocation.country.toLowerCase()
        } else if (store.userLocation.country_code) {
          return store.userLocation.country_code.toLowerCase()
        }
      }

      return null
    },
  },

  methods: {
    close() {
      this.infoDialog = false
    },
    updated() {
      this.close()
      this.$emit("updated")
    },
    async sendEmailVerification() {
      this.sendingEmail = true
      await this.$fire.actions.resendEmailVerification()

      setTimeout(() => {
        this.sendingEmail = false
      }, 3000)
    },
  },
}
</script>
