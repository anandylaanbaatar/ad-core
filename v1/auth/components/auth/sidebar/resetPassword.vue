<template>
  <div class="sidebar accountSidebar">
    <h1 class="mt-5 mb-6">{{ $utils.t("Reset Password") }}</h1>

    <div v-if="isReset" class="c-form row">
      <div class="c-field col-xs-12">
        <label for="password">{{ $utils.t("New Password") }}</label>
        <Password
          v-model="form.password"
          :feedback="false"
          aria-describedby="password-help"
          :placeholder="$utils.t('New Password')"
          :invalid="errors.password"
          @change="validation"
        />
        <small
          v-if="errors.password"
          id="password-help"
          class="error"
          v-html="errors.password"
        ></small>
      </div>

      <div class="c-field col-xs-12">
        <label for="confirmPassword">{{
          $utils.t("Confirm New Password")
        }}</label>
        <Password
          v-model="form.confirmPassword"
          :feedback="false"
          aria-describedby="confirmPassword-help"
          :placeholder="$utils.t('Confirm New Password')"
          :invalid="errors.confirmPassword"
          @change="validation"
        />
        <small
          v-if="errors.confirmPassword"
          id="confirmPassword-help"
          class="error"
          v-html="errors.confirmPassword"
        ></small>
      </div>

      <div class="c-field col-xs-12">
        <Loader v-if="loading" type="small"></Loader>

        <Button
          v-else
          :label="$utils.t('Reset Password')"
          severity="primary"
          class="w-full"
          @click="resetPassword"
          :disabled="!isValid"
        ></Button>

        <Message
          v-if="errors['system']"
          severity="error"
          icon="pi pi-times"
          closable
          class="mt-3 c-message"
        >
          {{ errors["system"] }}
        </Message>
      </div>
    </div>

    <div v-else class="c-form row">
      <div class="c-field col-xs-12">
        <label for="email">{{ $utils.t("Email Address") }}</label>
        <InputText
          id="email"
          v-model="form.email"
          aria-describedby="email-help"
          :placeholder="$utils.t('Email Address')"
          :invalid="errors.email"
          @change="validation"
        />
        <small v-if="errors.email" id="email-help" class="error">{{
          errors.email
        }}</small>
      </div>

      <div class="c-field col-xs-12">
        <Loader v-if="loading" type="small"></Loader>

        <Button
          v-else
          :label="$utils.t('Send Reset Email')"
          severity="primary"
          class="blockBtn w-full"
          @click="resetPasswordEmail"
          :disabled="!isValid"
        ></Button>

        <Message
          v-if="errors['system']"
          severity="error"
          icon="pi pi-times"
          closable
          class="mt-3 c-message"
        >
          {{ errors["system"] }}
        </Message>
      </div>
    </div>

    <div class="bottom">
      <div
        @click="
          $bus.$emit('sidebarGlobal', {
            id: 'account',
          })
        "
        class="btn"
      >
        {{ $utils.t("Already have an account?") }}
        <strong>{{ $utils.t("Sign In") }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: false,
      isValid: false,

      form: {},
      errors: {},
      loading: false,
    }
  },

  computed: {
    isReset() {
      if (this.$route.query.resetPassword) {
        return true
      }
      return false
    },
  },

  mounted() {
    this.reset(true)
    this.validation()
  },

  methods: {
    reset(force) {
      this.isValid = false
      this.errors = {}

      if (force) {
        if (this.isReset) {
          this.form = {
            password: null,
            confirmPassword: null,
          }
        } else {
          this.form = {
            email: null,
          }
        }
      }
    },
    validation() {
      this.reset()
      const validation = this.$forms.validateForm(this.form)
      this.isValid = validation.isValid
      this.errors = validation.errors
    },

    async resetPasswordEmail() {
      console.log("Send email reset pass to : ", this.form.email)

      if (!this.isValid) return

      this.loading = true

      const res = await this.$shopify.resetPassword({
        email: this.form.email,
      })

      console.log("Email reset res ::: ", res)

      if (res.error) {
        for (let i = 0; i < res.error.length; i++) {
          let error = res.error[i]
          if (typeof error.field === "Array") {
            this.errors[error.field[0]] = error.message
          } else {
            this.errors[error.field] = error.message
          }
        }
      } else {
        this.$bus.$emit("toast", {
          severity: "success",
          summary: this.$utils.t("Reset Password"),
          detail: this.$utils.t("Sent a password reset request to your email."),
        })
        this.reset(true)
      }

      this.loading = false
    },
    async resetPassword() {
      let url = this.$route.query.resetPassword
      let fullUrl = `https://${url}`

      console.log("Reset Pass: ", fullUrl)

      if (this.isValid) {
        this.loading = true

        const res = await this.$shopify.resetPasswordUrl({
          url: fullUrl,
          password: this.form.password,
        })

        console.log("Reset Password ::: ", res)

        if (res) {
          this.$bus.$emit("toast", {
            severity: "success",
            summary: this.$utils.t("Reset Password"),
            detail: this.$utils.t("Successfully reset password."),
          })
          this.reset(true)

          this.$bus.$emit("sidebarGlobal", {
            id: "account",
          })
        }

        this.loading = false
      }
    },
  },
}
</script>
