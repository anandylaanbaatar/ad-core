<template>
  <form class="c-form row" @submit.prevent="() => {}">
    <!--Email Login Btn-->
    <div v-if="type !== null && type !== 'email'" class="c-field col-xs-12">
      <Button
        label="Login with Email"
        class="w-full"
        icon="pi pi-envelope"
        @click="type = 'email'"
      ></Button>
    </div>

    <!--Email Login Form-->
    <template v-if="type === null || type === 'email'">
      <div class="c-field col-xs-12">
        <!-- <label for="email">{{ $utils.t("Email Address") }}</label> -->
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
        <label for="password" class="w-full">
          <!-- {{ $utils.t("Password") }} -->
        </label>

        <Password
          v-model="form.password"
          :feedback="false"
          aria-describedby="password-help"
          :placeholder="$utils.t('Password')"
          :invalid="errors.password"
          @change="validation"
          @keypress.enter="login"
        />
        <small
          v-if="errors.password"
          id="password-help"
          class="error"
          v-html="errors.password"
        ></small>
      </div>
      <div class="c-field col-xs-12">
        <div class="flex flex-wrap w-full">
          <Loader v-if="loading" type="none" class="mx-auto"></Loader>

          <template v-else>
            <Button
              type="submit"
              :label="$utils.t('Sign In')"
              class="blockBtn w-full"
              @click="login"
              :disabled="!isValid"
            ></Button>
          </template>
        </div>
      </div>
      <div class="c-field col-xs-12 m-0">
        <p class="text-sm font3 opacity-50">
          <span
            class="c-link float-right"
            @click="$bus.$emit('sidebarGlobal', { id: 'resetPassword' })"
            >{{ $utils.t("Forgot Password") }}</span
          >
        </p>
      </div>
      <!--Error Message-->
      <div class="c-field col-xs-12">
        <Message
          v-if="errors['system']"
          severity="error"
          icon="pi pi-info-circle"
          closable
          class="mt-3 c-message"
        >
          {{ errors["system"] }}
        </Message>
      </div>
    </template>

    <!--Divider-->
    <div v-if="type === null && showSocialLogins" class="c-divider my-1">
      <span>or</span>
    </div>

    <!--Social Login-->
    <template v-if="type === null && showSocialLogins">
      <div class="c-field col-xs-12 mt-4">
        <!-- <div class="c-divider mt-2 mb-4"></div> -->

        <Button
          label="Login with Google"
          class="w-full"
          icon="pi pi-google"
          @click="loginWithProvider('google')"
        ></Button>
      </div>
    </template>

    <!--Login With Token-->
    <template v-if="type === 'token'">
      <!--Login With Token-->
      <div class="c-field col-xs-12">
        <label for="username">{{ $utils.t("Username") }}</label>
        <InputText
          id="username"
          v-model="form.username"
          aria-describedby="username-help"
          :placeholder="$utils.t('Username')"
          :invalid="errors.username"
          @change="validation"
        />
        <small v-if="errors.username" id="username-help" class="error">{{
          errors.username
        }}</small>
      </div>
      <div class="c-field col-xs-12">
        <div class="flex flex-wrap w-full">
          <Loader v-if="loading" type="none" class="mx-auto"></Loader>

          <template v-else>
            <Button
              type="submit"
              :label="$utils.t('Sign In')"
              class="blockBtn w-full"
              @click.stop="loginWithToken"
              :disabled="!isValid"
            ></Button>
          </template>
        </div>
      </div>
    </template>

    <!--Terms-->
    <div v-if="useCoreStore().language === 'en'" class="c-field col-xs-12 mb-4">
      <p class="text-xs opacity-60">
        By continuing, you agree and confirm you’ve read the
        <strong @click="$bus.$emit('goTo', '/terms_of_service')" class="c-link"
          >Terms and Conditions</strong
        >
        and
        <strong @click="$bus.$emit('goTo', '/privacy_policy')" class="c-link"
          >Privacy Policy</strong
        >.
      </p>
    </div>
    <div
      v-else-if="useCoreStore().language === 'mn'"
      class="c-field col-xs-12 mb-4"
    >
      <p class="text-xs opacity-60">
        Та нэвтрэх үйлдэл хийснээр манай
        <strong @click="$bus.$emit('goTo', '/terms_of_service')" class="c-link"
          >Үйлчилгээний нөхцөл</strong
        >
        болон
        <strong @click="$bus.$emit('goTo', '/privacy_policy')" class="c-link"
          >“Нууцлалын бодлого</strong
        >
        -г зөвшөөрч байна гэж үзнэ.
      </p>
    </div>

    <!--Back Btn-->
    <div v-if="type === 'email' && showSocialLogins" class="c-field col-xs-12">
      <Button
        icon="pi pi-arrow-left"
        @click="type = null"
        class="mb-3"
        rounded
      ></Button>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      type: null,
      isValid: false,
      form: {
        email: null,
        password: null,
      },
      errors: {},
      loading: false,
    }
  },

  computed: {
    isShopifyConnect() {
      if (features().auth.connect) {
        if (features().auth.connect.shopify) {
          return true
        }
      }
      return false
    },
    showSocialLogins() {
      if (features().auth.socialLogins === true) {
        if (this.isShopifyConnect) {
          return false
        } else {
          return true
        }
      }
      return false
    },
    authEnabled() {
      if (features().auth) {
        return true
      }
      return false
    },
    user() {
      if (this.authEnabled && useAuthStore()) {
        return useAuthStore().user
      }
      return
    },
  },

  mounted() {
    if (!this.showSocialLogins) {
      this.type = "email"
    }
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

    async login() {
      this.validation()

      if (this.isValid) {
        this.loading = true

        // Commerce
        if (this.isShopifyConnect) {
          await this.loginWithShopify()
        } else {
          await this.loginWithEmail()
        }

        this.loading = false
      }
    },

    // Login Methods
    async loginWithEmail() {
      const formData = this.form

      try {
        const loginData = await this.$fire.actions.login(formData)
        const userData = await this.$fire.actions.user()
        const newUserData = await useAuthStore().userDataCheck(userData)

        // console.log("[Login] ::: User ::", loginData, newUserData)

        if (loginData) {
          let updates = {
            emailVerified: loginData.emailVerified,
            lastLoginAt: loginData.metadata.lastLoginAt,
          }

          // Update Fire User
          await this.$fire.actions.update(`/users/${loginData.uid}`, updates)
        }

        await useAuthStore().setUser(newUserData)
        this.afterLogin()
      } catch (err) {
        console.log("Login ::: Error ::", err)

        if (err.code === "auth/invalid-credential") {
          this.error("Email or password is incorrect")
        } else if (err.code === "auth/user-not-found") {
          this.error("User not found")
        } else {
          this.error(err.msg)
        }
      }
    },
    async loginWithProvider(id) {
      try {
        const loginData = await this.$fire.actions.loginWithProvider(id)
        const userData = await this.$fire.actions.user()
        const newUserData = await useAuthStore().userDataCheck(userData)

        // console.log("[Login] ::: User ::", loginData, newUserData)

        if (loginData) {
          let updates = {
            emailVerified: loginData.emailVerified,
            lastLoginAt: loginData.metadata.lastLoginAt,
          }

          // Update Fire User
          await this.$fire.actions.update(`/users/${loginData.uid}`, updates)
        }

        await useAuthStore().setUser(newUserData)
        this.afterLogin()
      } catch (err) {
        console.log("Login ::: Error :: ", err)
        this.error(err.msg)
      }
    },
    async loginWithShopify() {
      const formData = this.form
      const loginData = {
        email: formData.email,
        password: formData.password,
      }

      // 1. Login and get user access token
      const accessToken = await this.$shopify.login(loginData)
      if (accessToken.error) return this.error(accessToken.error)

      // 2. Get shopify user data
      const customer = await useCommerceStore().getUserByEmail(this.form.email)
      if (!customer) return this.error()

      // 3. Shopify customer id
      const sid = customer.id.replace("gid://shopify/Customer/", "")

      // 4. Get Firebase user token
      const { userToken } = await useCommerceStore().getUserByToken(sid)
      if (!userToken) return this.error()

      // 5. Login with user token
      const user = await this.$fire.actions.loginWithToken(userToken)

      if (!user) return this.error()

      // 6. Update Firebase data and serve
      let updates = user
      updates.email = customer.email
      updates.displayName = customer.displayName
      updates.firstName = customer.firstName
      updates.lastName = customer.lastName
      updates.phone = customer.phone
      updates.emailVerified = true
      updates.connect = {
        shopify: accessToken,
      }
      updates.connect.shopify.sid = sid
      updates.connect.shopify.id = customer.id

      await useAuthStore().saveUserFirebase(updates)
      await useCommerceStore().setUser()
      this.afterLogin()
    },

    error(msg) {
      if (msg) {
        this.errors["system"] = this.$utils.t(msg)
      } else {
        this.errors["system"] = this.$utils.t("Error occurred during login.")
      }

      setTimeout(() => {
        this.errors = {}
      }, 5000)
    },
    afterLogin() {
      // Success Message
      // this.$bus.$emit("toast", {
      //   severity: "success",
      //   summary: this.$utils.t("Login"),
      //   detail: this.$utils.t("Successfully logged in."),
      // })

      // Check if user is logged in.
      if (this.user) {
        if (this.user.emailVerified) {
          // Close Sidebar
          if (this.$route.path.includes("/checkout")) {
            this.$bus.$emit("sidebarGlobalClose")
          }
        } else {
          this.$bus.$emit("sidebarGlobal", { id: "verifyEmail" })
        }
      }
    },
  },
}
</script>
