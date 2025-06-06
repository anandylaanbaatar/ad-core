<template>
  <div v-if="account" class="d-block px-4 mb-5">
    <h3 class="mb-3">{{ $utils.t("Notifications") }}</h3>

    <!--Trigger Btn-->
    <Button
      icon="pi pi-cog"
      severity="secondary"
      class="c-block-top-right mt-3 mr-3 sm"
      @click="$bus.$emit('sidebarGlobal', { id: 'notifications' })"
      v-tooltip.left="$utils.t('Notifications')"
    ></Button>

    <template v-if="isSupported">
      <Button
        v-if="!permission && !optedIn"
        class="sp_notify_prompt mb-3"
        @click="activateUser"
        >Activate Notifications</Button
      >
      <Button v-else class="sp_notify_prompt mb-3" @click="deactivateUser"
        >Deactivate Notifications</Button
      >
    </template>

    <div class="c-checkbox">
      <Checkbox
        v-model="account.acceptsMarketing"
        inputId="ingredient1"
        name="ingredient1"
        :value="$utils.t('Subscribe to email marketing')"
        binary
      />
      <label for="ingredient1" class="ml-2">{{
        $utils.t("Subscribe to email marketing")
      }}</label>
    </div>

    <div class="c-checkbox">
      <Checkbox
        v-model="account.acceptsMarketing"
        inputId="ingredient1"
        name="ingredient1"
        :value="$utils.t('Subscribe to sms marketing')"
        binary
      />
      <label for="ingredient1" class="ml-2">{{
        $utils.t("Subscribe to sms marketing")
      }}</label>
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
      isSupported: null,
      permission: null,
      optedIn: null,
    }
  },

  async mounted() {
    // if (useRuntimeConfig().public.integrations.onesignal) {
    //   await this.initNotifications()
    // }
  },

  methods: {
    async initNotifications() {
      this.isSupported = OneSignal.Notifications.isPushSupported()
      this.permission = OneSignal.Notifications.permission
      this.optedIn = OneSignal.User.PushSubscription.optedIn

      OneSignal.Notifications.addEventListener(
        "permissionChange",
        (permission) => {
          if (permission) {
            this.permission = true

            console.log(`[OneSignal] ::: permission accepted!`)

            if (!OneSignal.User.PushSubscription.optedIn) {
              OneSignal.User.PushSubscription.optIn()
            }
          } else {
            this.permission = false

            console.log(`[OneSignal] ::: permission rejected!`)

            if (OneSignal.User.PushSubscription.optedIn) {
              OneSignal.User.PushSubscription.optOut()
            }
          }
        }
      )

      OneSignal.User.PushSubscription.addEventListener("change", (event) => {
        if (event.current.token) {
          console.log(`The push subscription has received a token!`)
        }
      })

      let userData = {
        id: OneSignal.User.PushSubscription.id,
        token: OneSignal.User.PushSubscription.token,
        optedIn: OneSignal.User.PushSubscription.optedIn,
        email: this.account.email,
        phone: this.account.phone,
      }

      if (this.account.email) {
        OneSignal.User.addEmail(this.account.email)
      }
      if (this.account.phone) {
        OneSignal.User.addSms(this.account.phone)
      }

      console.log("[OneSignal] ::: User :: ", userData)
    },
    async activateUser() {
      if (this.isSupported) {
        OneSignal.Notifications.requestPermission()

        if (!OneSignal.User.PushSubscription.optedIn) {
          OneSignal.User.PushSubscription.optIn()
          console.log("[OneSignal] ::: ", OneSignal.User.PushSubscription.id)
        }
      }
    },
    async deactivateUser() {
      OneSignal.User.PushSubscription.optOut()
    },
  },
}
</script>
