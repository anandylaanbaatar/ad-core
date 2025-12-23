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
        <!-- <label for="firstName">{{ $utils.t("First Name") }}</label> -->
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
        <!-- <label for="lastName">{{ $utils.t("Last Name") }}</label> -->
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
        <!-- <label for="phone">{{ $utils.t("Phone") }}</label> -->

        <InputGroup>
          <InputGroupAddon class="c-phoneDropdown-wrapper p-0">
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
        <!-- <label for="password">{{ $utils.t("Password") }}</label> -->
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
            icon="pi pi-info-circle"
            closable
            class="mt-3 c-message"
          >
            {{ $utils.t(error.message) }}
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
          :label="$utils.t('SignUp with Google')"
          class="w-full"
          icon="pi pi-google"
          @click="signUpWithProvider('google')"
        ></Button>
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
    showSocialLogins() {
      if (features().auth.socialLogins === true) {
        return true
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
        await this.signUpWithEmail()

        this.loading = false
      }
    },

    async signUpWithEmail() {
      const formData = this.getFormData()

      try {
        // NEW: Call centralized auth API instead of Firebase SDK
        const apiUrl = useRuntimeConfig().public.apiUrl || 'https://api.adcommerce.mn'

        // Determine signup source and tenant ID
        const isStorefront = !!features().multitenancy?.tenantId
        const signupSource = isStorefront ? 'storefront' : 'platform'
        const tenantId = features().multitenancy?.tenantId || 'adcommerce'

        const response = await $fetch(`${apiUrl}/auth/signup`, {
          method: 'POST',
          body: {
            email: formData.email,
            password: formData.password,
            displayName: `${formData.firstName} ${formData.lastName}`,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone ? `${this.formOptional.phoneCode}${formData.phone}` : null,
            phoneCode: this.formOptional.phoneCode,
            acceptsMarketing: formData.acceptsMarketing,
            signupSource: signupSource,
            tenantId: tenantId,
            isManualCustomer: false
          }
        })

        if (!response.success) {
          throw new Error(response.error || 'Signup failed')
        }

        // Login with custom token returned from API
        await this.$fire.actions.loginWithToken(response.customToken)

        // Get updated user data from Firebase
        const userData = await this.$fire.actions.user()

        // Set user in store (cloud function has already created all integrations)
        await useAuthStore().setUserFirebase(userData)

        // Commerce User (fetch existing customer created by cloud function)
        if (theme().type === "commerce") {
          await useCommerceStore().setUser()
        }

        // Send branded verification email
        try {
          await $fetch("/api/auth/send-verification-email", {
            method: "POST",
            body: {
              email: formData.email,
              displayName: `${formData.firstName} ${formData.lastName}`,
              tenantUrl: window.location.origin,
              storeName: useAppConfig()?.name,
              logoUrl: useAppConfig()?.theme?.logoUrl,
            },
          })
        } catch (emailErr) {
          console.error("[SignUp] Failed to send verification email:", emailErr)
          // Don't block signup if email fails
        }

        this.afterSignUp()
      } catch (err) {
        console.log("SignUp ::: Error :: ", err)

        let msg = err.message || err.code || 'Signup failed'

        if (msg.includes("email-already-in-use")) {
          msg = `Email already in use`
        } else if (msg.includes("weak-password")) {
          msg = `Password should be at least 6 characters`
        } else if (msg.includes("invalid-email")) {
          msg = `Invalid email address`
        }

        this.errors["system"] = [
          {
            message: msg,
          },
        ]
        this.isValid = false

        setTimeout(() => {
          this.errors = {}
        }, 5000)
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
