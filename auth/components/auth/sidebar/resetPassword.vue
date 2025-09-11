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
      isVerified: false,

      form: {},
      errors: {},
      loading: false,
    }
  },

  computed: {
    isReset() {
      if (
        this.$route.query.resetPassword ||
        (this.$route.query.mode === "resetPassword" &&
          this.$route.query.oobCode)
      ) {
        return true
      }
      return false
    },
  },

  async mounted() {
    this.reset(true)
    this.validation()

    if (this.isReset) {
      await this.verifyCode()
    }
  },

  methods: {
    reset(force) {
      this.isVerified = false
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

    async verifyCode() {
      if (!this.$route.query.oobCode) return

      const code = this.$route.query.oobCode
      const verify = await this.$fire.actions.verifyResetPassword(code)

      if (verify) {
        this.isVerified = true
      }
    },
    async resetPasswordEmail() {
      console.log("Send email reset pass to : ", this.form.email)

      if (!this.isValid) return

      this.loading = true

      const res = await this.$fire.actions.resetPassword({
        email: this.form.email,
      })

      console.log("Email reset res ::: ", res)

      if (res) {
        this.$bus.$emit("toast", {
          severity: "success",
          summary: this.$utils.t("Reset Password"),
          detail: this.$utils.t("Sent a password reset request to your email."),
        })
        this.reset(true)
      } else {
        this.errors["system"] = "Error sending reset password email."
      }

      this.loading = false
    },
    async resetPassword() {
      if (!this.isVerified) return
      if (!this.$route.query.oobCode) return

      this.loading = true

      const res = await this.$fire.actions.confirmResetPassword({
        code: this.$route.query.oobCode,
        password: this.form.confirmPassword,
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
    },
  },
}
</script>
