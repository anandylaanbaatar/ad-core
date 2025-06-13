<template>
  <div class="c-form row">
    <!--Avatar-->
    <div v-if="isFirebase" class="c-field col-xs-12">
      <label for="avatar"
        >{{ $utils.t("Avatar") }} ({{ $utils.t("Optional") }})</label
      >

      <div class="w-full flex align-items-center mb-3">
        <Avatar
          v-if="formOptional.photoURL"
          :image="formOptional.photoURL"
          class="mr-2 c-link"
          size="large"
          shape="circle"
        />
        <Avatar
          v-else
          icon="pi pi-image"
          class="mr-2"
          size="large"
          shape="circle"
        />

        <Loader v-if="uploading" type="none"></Loader>

        <FileUpload
          v-else
          mode="basic"
          name="uploadImage"
          accept="image/*"
          :maxFileSize="1000000"
          chooseLabel="Upload Image"
          @select="uploader"
          customUpload
          auto
          severity="secondary"
          class="p-button-secondary"
        ></FileUpload>
      </div>

      <InputText
        v-if="false"
        v-model="formOptional.photoURL"
        placeholder="Avatar"
        @change="validation"
      ></InputText>
    </div>

    <!--First Name-->
    <div class="c-field col-xs-6 mb-3">
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

    <!--Last Name-->
    <div class="c-field col-xs-6 mb-3">
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

    <!--Email Address-->
    <div class="c-field col-xs-12 mb-3">
      <label for="emailAddress">{{ $utils.t("Email Address") }}</label>
      <InputText
        id="emailAddress"
        v-model="form.email"
        aria-describedby="emailAddress-help"
        :placeholder="$utils.t('Email Address')"
        :invalid="errors.email"
        @change="validation"
        :disabled="true"
      />
      <small v-if="errors.email" id="emailAddress-help" class="error">{{
        errors.email
      }}</small>
    </div>

    <!--Phone Number-->
    <div class="c-field col-xs-12 mb-3">
      <label for="phone">{{ $utils.t("Phone") }}</label>

      <InputGroup>
        <InputGroupAddon class="c-phoneDropdown-wrapper">
          <Select
            v-if="allCountries"
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

    <!--Action Btns-->
    <div class="c-field col-xs-12 mb-0">
      <div class="flex justify-content-end gap-2 w-full">
        <Loader v-if="updating" type="sm"></Loader>

        <template v-else>
          <Button
            type="button"
            :label="$utils.t('Cancel')"
            severity="secondary"
            @click="$emit('close')"
          ></Button>

          <Button
            type="button"
            :label="$utils.t('Save')"
            @click="updateCustomer"
            :disabled="!isValid"
          ></Button>
        </template>
      </div>
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
      updating: false,
      uploading: false,

      form: {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        acceptsMarketing: true,
      },
      formOptional: {
        photoURL: null,
        phoneCode: null,
        selectedCountry: null,
      },
      isValid: false,
      errors: {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        acceptsMarketing: true,
      },
    }
  },

  computed: {
    allCountries() {
      return this.$forms.phoneCountries()
    },
    accountPhone() {
      if (this.account && this.account.phone) {
        return this.$utils.parsePhoneNumber(this.account.phone)
      } else {
        return null
      }
    },

    isShopify() {
      if (features().auth.connect) {
        return features().auth.connect.shopify
      }
    },
    isFirebase() {
      return useRuntimeConfig().public.features.auth.type === "firebase"
    },

    shopifyUser() {
      if (this.isShopify) {
        if (useCommerceStore()) {
          return useCommerceStore().shopifyUser
        }
      }
      return
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

  mounted() {
    this.reset()
    this.fillForm()
  },

  methods: {
    reset() {
      this.isValid = false
      this.errors = {}
    },
    validation() {
      this.reset()

      const validation = this.$forms.validateForm(
        this.form,
        this.formOptional.selectedCountry.code
      )

      this.isValid = validation.isValid
      this.errors = validation.errors
    },
    editProfileInfo() {},
    fillForm() {
      let newForm = {
        acceptsMarketing: this.account.acceptsMarketing,
        firstName: this.account.firstName,
        lastName: this.account.lastName,
        email: this.account.email,
        phone: this.account.phone,
      }
      let newFormOptional = {
        phoneCode: this.account.phoneCode ? this.account.phoneCode : null,
        selectedCountry: null,
        photoURL: this.account.photoURL ? this.account.photoURL : null,
      }

      if (this.account.phone) {
        const parsedPhone = this.accountPhone

        if (parsedPhone) {
          let selectedCountry = this.$forms.phoneCountryByCode(
            parsedPhone.country
          )

          newFormOptional.selectedCountry = selectedCountry
          newFormOptional.phoneCode = `+${parsedPhone.countryCallingCode}`
          newForm.phone = parsedPhone.nationalNumber
        }
      } else {
        if (this.userCountry) {
          let selectedCountry = this.$forms.phoneCountryByCode(this.userCountry)
          newFormOptional.selectedCountry = selectedCountry
          newFormOptional.phoneCode = selectedCountry.dialCode
        }
      }

      this.form = newForm
      this.formOptional = newFormOptional
    },

    async updateCustomer() {
      this.validation()
      this.updating = true

      if (this.isValid) {
        if (this.isShopify) {
          await this.updateCustomerShopify()
        }
        if (this.isFirebase) {
          await this.updateCustomerFirebase()
        }
      }

      this.updating = false
    },
    async uploader(e) {
      if (!e.files) return
      if (!this.account) return
      this.uploading = true

      // Upload to user folder
      const userUid = this.account.uid
      const images = await this.$forms.upload(e.files, userUid)

      // Set Images to fields
      if (images) {
        this.formOptional.photoURL = images[0]
        this.validation()
      }

      this.uploading = false
    },

    /**
     * Integrations
     */

    async updateCustomerShopify() {
      const accessToken = this.$shopify.getUserToken()

      if (!accessToken) {
        console.log("Account ::: User not logged in")
        return
      }
      if (!this.shopifyUser) return

      // Form Data
      let formData = this.form
      let selectedCountry = this.formOptional.selectedCountry

      formData.phone = `${selectedCountry.dialCode}${this.form.phone}`

      if (this.isShopify) {
        formData.id = this.shopifyUser.id
      }

      const res = await this.$shopify.updateCustomer(formData)

      console.log("Update Customer ::: ", res)

      // Error
      if (res.error) {
        this.errors["system"] = res.error
        return
      }

      await useCommerceStore().setUser()
    },
    async updateCustomerFirebase() {
      // const user = await
      const user = await this.$fire.actions.user()

      // Is user logged in
      if (!user) {
        console.log("[Firebase] ::: User not logged in!")
        return
      }
      // Check roles for permission
      if (user.uid !== this.account.uid) {
        let hasAccess = false

        if (!user.roles) {
          hasAccess = false
        } else if (user.roles.includes("admin")) {
          hasAccess = true
        }

        if (!hasAccess) {
          this.$bus.$emit("toast", {
            severity: "error",
            summary: "Error",
            detail: "You do not have permission to update this user.",
          })
          return
        }
      }

      // Form Data
      let formData = this.form

      if (!this.isShopify) {
        formData.phone = `${this.formOptional.selectedCountry.dialCode}${this.form.phone}`
      }

      try {
        let updates = {
          displayName: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          phoneCode: this.formOptional.phoneCode,
          photoURL: this.formOptional.photoURL,
        }
        await this.$fire.actions.update(`/users/${this.account.uid}`, updates)

        this.$bus.$emit("toast", {
          severity: "success",
          summary: this.$utils.t("Update"),
          detail: this.$utils.t("Successfully updated account information"),
        })

        this.reset()
        await useAuthStore().setUser()
        await useAuthStore().setUsers()
        this.$emit("updated")
      } catch (err) {
        console.log("[Firebase] ::: Update Customer :: Error:", err)

        this.errors["system"] = err.message
      }
    },
  },
}
</script>
