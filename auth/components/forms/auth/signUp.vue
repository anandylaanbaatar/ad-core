<template>
  <form class="c-form row">
    <!--Email SignUp Btn-->
    <div v-if="type !== null && type !== 'email'" class="c-field col-xs-12">
      <Button
        label="SignUp with Email"
        class="w-full"
        icon="pi pi-envelope"
        @click="type = 'email'"
      ></Button>
    </div>

    <!--Email Sign Up Form-->
    <template v-if="type === null || type === 'email'">
      <div class="c-field col-xs-6">
        <label for="firstName">{{ $utils.t("First Name") }}</label>
        <InputText
          id="firstName"
          v-model="form.firstName"
          aria-describedby="firstName-help"
          :placeholder="$utils.t('First Name')"
          :invalid="errors.firstName"
          @change="validation"
        />
        <small v-if="errors.firstName" id="firstName-help" class="error">{{
          errors.firstName
        }}</small>
      </div>

      <div class="c-field col-xs-6">
        <label for="lastName">{{ $utils.t("Last Name") }}</label>
        <InputText
          id="lastName"
          v-model="form.lastName"
          aria-describedby="lastName-help"
          :placeholder="$utils.t('Last Name')"
          :invalid="errors.lastName"
          @change="validation"
        />
        <small v-if="errors.lastName" id="lastName-help" class="error">{{
          errors.lastName
        }}</small>
      </div>

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
        <label for="phone">{{ $utils.t("Phone") }}</label>

        <InputGroup>
          <InputGroupAddon class="c-phoneDropdown-wrapper">
            <Select
              v-model="formOptional.selectedCountry"
              :options="allCountries"
              optionLabel="name"
              :placeholder="$utils.t('Select')"
              class="c-phoneDropdown"
              @change="validation"
            >
              <template #value="slotProps">
                <div v-if="slotProps.value" class="flex align-items-center">
                  <img
                    :alt="slotProps.value.label"
                    :src="`https://flagcdn.com/w20/${slotProps.value.code.toLowerCase()}.png`"
                    :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`"
                  />
                  <div>{{ slotProps.value.dialCode }}</div>
                </div>
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <div class="flex align-items-center">
                  <img
                    :alt="slotProps.option.label"
                    :src="`https://flagcdn.com/w20/${slotProps.option.code.toLowerCase()}.png`"
                    :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`"
                  />
                  <div>
                    {{ slotProps.option.dialCode }} -
                    {{ slotProps.option.name }}
                  </div>
                </div>
              </template>
            </Select>
          </InputGroupAddon>

          <InputText
            id="phone"
            class="c-phoneDropdown-input"
            v-model="form.phone"
            aria-describedby="phone-help"
            :placeholder="$utils.t('Phone')"
            autocomplete="off"
            :invalid="errors.phone"
            @change="validation"
          />
        </InputGroup>

        <small v-if="errors.phone" id="phone-help" class="error">{{
          errors.phone
        }}</small>
      </div>

      <div class="c-field col-xs-12">
        <label for="password">{{ $utils.t("Password") }}</label>
        <Password
          v-model="form.password"
          :feedback="false"
          aria-describedby="password-help"
          :placeholder="$utils.t('Password')"
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
        <div class="c-checkbox">
          <Checkbox
            v-model="acceptsMarketing"
            inputId="acceptsMarketing"
            name="acceptsMarketing"
            :binary="true"
            @change="validation"
          />
          <label for="acceptsMarketing">{{
            $utils.t("Subscribe to email marketing")
          }}</label>
        </div>
      </div>

      <div class="c-field col-xs-12">
        <Loader v-if="loading" type="none" class="mx-auto"></Loader>

        <template v-else>
          <Button
            type="submit"
            :label="$utils.t('Sign Up')"
            class="blockBtn w-full"
            @click="signUp"
            :disabled="!isValid"
          ></Button>
        </template>

        <template v-if="errors['system']">
          <Message
            v-for="error in errors['system']"
            :key="`error_${error}`"
            severity="error"
            icon="pi"
            closable
            class="mt-3 c-message"
          >
            {{ error.message }}
          </Message>
        </template>
      </div>
    </template>

    <!--Divider-->
    <div v-if="type === null && showSocialLogins" class="c-divider mt-4 mb-1">
      <span>or</span>
    </div>

    <!--Social Login-->
    <template v-if="type === null && showSocialLogins">
      <div class="c-field col-xs-12 mt-4">
        <!-- <div class="c-divider mt-2 mb-4"></div> -->

        <Button
          label="SignUp with Google"
          class="w-full"
          icon="pi pi-google"
          @click="signUpWithProvider('google')"
        ></Button>
      </div>
    </template>

    <!--Terms-->
    <div class="c-field col-xs-12 mb-4">
      <p class="text-xs">
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
      // Forms
      form: {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        password: null,
      },
      formOptional: {
        phoneCode: null,
        selectedCountry: null,
      },
      isValid: false,
      acceptsMarketing: true,
      errors: {},
      loading: false,
    }
  },

  computed: {
    allCountries() {
      return this.$forms.phoneCountries()
    },
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

    this.setPhoneCountry()
  },

  methods: {
    setPhoneCountry() {
      const store = useAuthStore()

      // Set Phone Code User Location
      if (store.userLocation) {
        if (store.userLocation.country_code) {
          this.formOptional.selectedCountry = this.allCountries.find(
            (i) => i.code === store.userLocation.country_code
          )
          this.formOptional.phoneCode = this.form.selectedCountry.dialCode
        }
      }

      // Set From LocalStorage
      if (!this.formOptional.selectedCountry) {
        const userLocationData = localStorage.getItem("userLocation")

        if (userLocationData) {
          const userLocation = JSON.parse(userLocationData)

          if (userLocation.country_code) {
            this.formOptional.selectedCountry = this.$forms.phoneCountryByCode(
              userLocation.country_code
            )

            this.formOptional.phoneCode =
              this.formOptional.selectedCountry.dialCode
          }
        }
      }

      // Set Default Phone Code
      if (!this.formOptional.selectedCountry) {
        this.formOptional.selectedCountry = this.allCountries.find(
          (i) => i.code === theme().country
        )
        this.formOptional.phoneCode = this.formOptional.selectedCountry.dialCode
      }
    },

    // Form
    reset() {
      this.isValid = false
      this.errors = {}
    },
    validation() {
      const validation = this.$forms.validateForm(
        this.form,
        this.formOptional.selectedCountry.code
      )
      this.isValid = validation.isValid
      this.errors = validation.errors
    },
    getFormData() {
      let formData = this.form
      // let selectedCountry = this.formOptional.selectedCountry

      // Modify Form Data
      // delete formData.selectedCountry
      // formData.phoneCode = selectedCountry.dialCode
      formData.acceptsMarketing = this.acceptsMarketing

      return formData
    },

    async signUp() {
      this.validation()

      if (this.isValid) {
        this.loading = true

        // Commerce
        if (this.isShopifyConnect) {
          await this.signUpWithShopify()
        } else {
          await this.signUpWithEmail()
        }

        this.loading = false
      }
    },
    async connectShopify(formData) {
      return new Promise(async (resolve) => {
        const signUpData = await this.$shopify.signUp(formData)

        // Error Occurred
        if (signUpData.error) {
          for (let i = 0; i < signUpData.error.length; i++) {
            let error = signUpData.error[i]
            this.errors[error.field] = error.message
          }
          this.isValid = false

          console.log("Shopify connect error :::", signUpData.error)

          resolve(null)
        }

        // Signed Up
        if (signUpData) {
          let loginForm = {
            email: formData.email,
            password: formData.password,
          }
          const accessToken = await this.$shopify.login(loginForm)

          if (accessToken) {
            resolve(accessToken)
          } else {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })
    },

    // Signup Methods
    async signUpWithEmail() {
      const formData = this.getFormData()

      try {
        const user = await this.$fire.actions.signUp(formData)
        const emailId = user.email.split("@")[0]

        let newUser = user
        newUser.username = emailId
        newUser.phoneCode = this.formOptional.phoneCode
        newUser.phone = `${newUser.phoneCode}${formData.phone}`

        if (!newUser.firstName) {
          newUser.firstName = formData.firstName
        }
        if (!newUser.lastName) {
          newUser.lastName = formData.lastName
        }
        if (!newUser.displayName) {
          newUser.displayName = `${formData.firstName} ${formData.lastName}`
        }
        if (!newUser.phoneNumber) {
          newUser.phoneNumber = formData.phone
        }
        // Connect
        if (this.isShopifyConnect) {
          let connectOptions = {
            email: formData.email,
            password: `${emailId}_${user.uid}`,
            acceptsMarketing: formData.acceptsMarketing,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: newUser.phone,
          }

          console.log("[Shopify] ::: Connect options ::: ", connectOptions)

          const connectData = await this.connectShopify(connectOptions)

          if (!connectData) {
            console.log("[Login] ::: Shopify Connect Error ::: ", connectData)
          } else {
            console.log("[Login] ::: Shopify Connect Success ::: ", connectData)

            newUser.connect = {
              shopify: connectData,
            }
          }
        }

        await this.$fire.actions.resendEmailVerification()
        await useAuthStore().saveUserFirebase(newUser)

        // Connect
        if (this.isShopifyConnect) {
          await useCommerceStore().setUser()
        }

        this.afterSignUp()
      } catch (err) {
        console.log("SignUp ::: Error :: ", err)

        this.errors["system"] = err.msg
        this.isValid = false
      }
    },
    async signUpWithProvider(id) {
      try {
        const signUpData = await this.$fire.actions.loginWithProvider(id)
        const userData = await this.$fire.actions.user()
        const newUserData = await useAuthStore().userDataCheck(userData)

        await useAuthStore().setUser(newUserData)
        this.afterSignUp()
      } catch (err) {
        console.log("Login ::: Error :: ", err)

        this.errors["system"] = err.msg
        this.isValid = false
      }
    },
    async signUpWithShopify() {
      const formData = this.getFormData()
      let options = {
        email: formData.email,
        password: formData.password,
        acceptsMarketing: formData.acceptsMarketing,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: `${this.formOptional.phoneCode}${formData.phone}`,
      }

      // 1. Signup and get user access token
      const customer = await this.$shopify.signUp(options)

      // Error Occurred
      if (customer.error) {
        for (let i = 0; i < customer.error.length; i++) {
          let error = customer.error[i]
          this.error(error.message)
        }
        this.isValid = false
        return
      }

      this.afterSignUp()
    },

    error(msg) {
      if (msg) {
        this.errors["system"] = this.$utils.t(msg)
      } else {
        this.errors["system"] = this.$utils.t("Error occurred during login.")
      }
    },
    afterSignUp() {
      // Success Message
      this.$bus.$emit("toast", {
        severity: "success",
        summary: this.$utils.t("Sign Up"),
        detail: this.$utils.t("Successfully created account."),
      })
      // Close Sidebar
      this.$bus.$emit("sidebarGlobalClose")

      // Check if user is logged in.
      if (this.user) {
        if (this.user.emailVerified) {
          if (!this.$route.path.includes("/checkout")) {
            this.$bus.$emit("sidebarGlobal", { id: "account" })
          }
        } else {
          this.$bus.$emit("sidebarGlobal", { id: "verifyEmail" })
        }
      }
    },
  },
}
</script>
