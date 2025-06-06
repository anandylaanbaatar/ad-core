<template>
  <div v-if="user" class="c-block verifyPhoneBlock">
    <i class="pi pi-phone text-2xl mb-4"></i>
    <h3 class="mb-2">Verify Phone</h3>
    <p class="mb-3">We have sent you a verification code to:</p>

    <div class="c-form">
      <!--Phone Number-->
      <div class="c-field col-xs-12">
        <label for="phone">{{ $utils.t("Phone") }}</label>

        <InputGroup>
          <InputGroupAddon class="c-phoneDropdown-wrapper">
            <Select
              v-model="form.selectedCountry"
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
    </div>

    <div>
      <Loader v-if="sendingCode" type="none" class="my-auto"></Loader>
      <template v-else>
        <Button
          label="Check Verification"
          severity="secondary"
          icon="pi pi-refresh"
          class="mr-3"
          @click="checkVerification"
        ></Button>
        <Button
          label="Resend Code"
          severity="secondary"
          icon="pi pi-phone"
          @click="sendPhoneVerification"
        ></Button>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sendingCode: false,

      form: {
        phone: null,
        phoneCode: null,
        selectedCountry: null,
      },
      isValid: false,
      errors: {},
    }
  },

  computed: {
    user() {
      return useAuthStore().user
    },
    allCountries() {
      return this.$forms.phoneCountries()
    },
  },

  mounted() {
    this.setPhoneCountry()
  },

  methods: {
    setPhoneCountry() {
      const store = useAuthStore()

      // Set Phone Code User Location
      if (store.userLocation) {
        if (store.userLocation.country_code) {
          this.form.selectedCountry = this.allCountries.find(
            (i) => i.code === store.userLocation.country_code
          )
          this.form.phoneCode = this.form.selectedCountry.dialCode
        }
      }

      // Set From LocalStorage
      if (!this.form.selectedCountry) {
        const userLocationData = localStorage.getItem("userLocation")

        if (userLocationData) {
          const userLocation = JSON.parse(userLocationData)

          if (userLocation.country_code) {
            this.form.selectedCountry = this.$forms.phoneCountryByCode(
              userLocation.country_code
            )

            this.form.phoneCode = this.form.selectedCountry.dialCode
          }
        }
      }

      // Set Default Phone Code
      if (!this.form.selectedCountry) {
        this.form.selectedCountry = this.allCountries.find(
          (i) => i.code === useAppConfig().theme.country
        )
        this.form.phoneCode = this.form.selectedCountry.dialCode
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
        this.form.selectedCountry.code
      )
      this.isValid = validation.isValid
      this.errors = validation.errors
    },

    async checkVerification() {
      console.log("[User] ::: Phone Verification Check :::")
    },
    async sendPhoneVerification() {
      this.sendingCode = true

      console.log("[User] ::: Phone Code Sent :::")

      this.$bus.$emit("toast", {
        severity: "success",
        summary: "Code Sent",
        detail: "Successfully sent verification code.",
      })

      setTimeout(() => {
        this.sendingCode = false
      }, 3000)
    },
  },
}
</script>
