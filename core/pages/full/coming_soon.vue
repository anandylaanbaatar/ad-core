<template>
  <AppLayout type="app">
    <div class="c-page fullPage comingSoonPage">
      <div class="fullPageContent">
        <div class="logo">
          <Logo :noLink="true"></Logo>
        </div>

        <div class="text-center text-white">
          <i class="pi pi-envelope text-2xl mb-4"></i>
          <h1 class="mb-2">{{ $utils.t("Coming Soon") }}</h1>
          <p class="mb-3">
            {{
              $utils.t(
                "Be part of something truly extraordinary. Join thousands of others already gaining early access to our revolutionary new product."
              )
            }}
          </p>

          <div v-if="!success" class="emailSubscribeForm">
            <InputText
              v-model="email"
              :placeholder="$utils.t('Email Address')"
              class="text-white font3"
            ></InputText>

            <Button class="ml-2" @click="subscribeUser" :disabled="sending">{{
              $utils.t("Submit")
            }}</Button>
          </div>

          <div v-else class="mt-5">
            <h4>
              <i class="pi pi-check mr-3"></i>
              {{ $utils.t("Successfully subscribed to email list.") }}
            </h4>
          </div>
        </div>

        <div class="socials">
          <a
            v-if="theme.contact.instagram"
            :href="theme.contact.instagram"
            target="_blank"
          >
            <i class="pi pi-instagram"></i>
          </a>

          <a
            v-if="theme.contact.facebook"
            :href="theme.contact.facebook"
            target="_blank"
          >
            <i class="pi pi-facebook"></i>
          </a>

          <a
            v-if="theme.contact.linkedin"
            :href="theme.contact.linkedin"
            target="_blank"
          >
            <i class="pi pi-linkedin"></i>
          </a>
        </div>
      </div>
      <div class="backPattern"></div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      email: null,
      sending: false,
      success: false,
    }
  },

  computed: {
    theme() {
      return useAppConfig().theme
    },
  },

  beforeMount() {
    useSeoMeta({
      title: `Coming Soon | ${this.theme.name}`,
    })
  },

  methods: {
    async subscribeUser() {
      if (!this.email) return
      this.sending = true

      const API_KEY = `re_GwVV3mdD_4ibJ1QPHySXE3uFQpHthhL3a`
      const audienceID = "81e9c0cf-fe79-4900-af70-4523ad41e118"
      const cors = useCoreStore().cors

      let url = `${cors}/https://api.resend.com/audiences/${audienceID}/contacts`
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email: this.email,
          unsubscribed: false,
        }),
      }

      try {
        const res = await $fetch(url, options)

        if (res) {
          console.log("[Resend] ::: User Subscribed :: ", res)

          this.$bus.$emit("toast", {
            severity: "success",
            summary: "Success",
            detail: "Successfully subscribed to email list.",
          })
          this.success = true

          setTimeout(() => {
            this.success = false
          }, 7000)

          this.reset()
        }
      } catch (err) {
        console.log("[Resend] ::: User Subscribe Error :: ", err.message)

        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Error",
          detail: err.message,
        })
        this.reset()
      }
    },
    async sendEmail() {
      if (!this.email) return
      this.sending = true

      const API_KEY = `re_GwVV3mdD_4ibJ1QPHySXE3uFQpHthhL3a`
      const cors = useCoreStore().cors

      let url = `${cors}/https://api.resend.com/emails`
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          from: `${this.theme.name} <${this.theme.contact.email}>`,
          to: [this.email],
          subject: "Welcome to AD Original Studio",
          html: "<strong>Subscribed to Email List.</strong>",
        }),
      }

      try {
        const res = await $fetch(url, options)

        if (res) {
          console.log("[Resend] ::: Email Sent :: ", res)

          this.$bus.$emit("toast", {
            severity: "success",
            summary: this.$utils.t("Success"),
            detail: this.$utils.t("Successfully subscribed to email list."),
          })
          this.success = true

          setTimeout(() => {
            this.success = false
          }, 5000)

          this.reset()
        }
      } catch (err) {
        console.log("[Resend] ::: Email Send Error :: ", err.message)

        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Error",
          detail: err.message,
        })
        this.reset()
      }
    },
    reset() {
      this.email = null
      this.sending = false
    },
  },
}
</script>
