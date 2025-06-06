<template>
  <div v-if="account" class="c-form row addressForm">
    <!--Search Address-->
    <div v-if="showMap" class="c-field col-xs-12 mt-0">
      <label for="searchAddress" class="w-full"
        >{{ $utils.t("Search Address") }}
        <span class="absolute right-0 text-500"
          ><i class="pi pi-map-marker"></i>
          {{ $utils.t("Click or Drag marker to find address.") }}</span
        ></label
      >

      <FormsMap @geocode="selectAddress" :address="editAddress"></FormsMap>
    </div>

    <Message
      v-if="form && form.address && form.address.fullAddress"
      severity="success"
      class="c-message mx-3 w-full"
      :closable="false"
    >
      {{ $utils.t("Address") }}:<br />
      {{ form.address.fullAddress }}
    </Message>

    <!--Address Form-->
    <template v-if="selectedAddress">
      <!--Address1-->
      <div class="c-field col-xs-12 col-md-8 mb-3">
        <label for="address1">{{ $utils.t("Address") }} 1 *</label>
        <InputText
          id="address1"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.address1"
          @change="validation"
        />
        <p v-if="errors['address1']" class="error">{{ errors["address1"] }}</p>
      </div>

      <!--Address2-->
      <div class="c-field col-xs-12 col-md-4 mb-3">
        <label for="address2">{{ $utils.t("Address") }} 2</label>
        <InputText
          id="address2"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.address2"
          @change="validation"
        />
        <p v-if="errors['address2']" class="error">{{ errors["address2"] }}</p>
      </div>

      <!--Province-->
      <div class="c-field col-xs-12 col-md-6 mb-3">
        <label for="state">{{ $utils.t("Province") }} *</label>
        <InputText
          id="state"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.province"
          :invalid="errors['province']"
          @change="validation"
        />
        <p v-if="errors['province']" class="error">{{ errors["province"] }}</p>
      </div>

      <!--City-->
      <div class="c-field col-xs-12 col-md-6 mb-3">
        <label for="city">{{ $utils.t("City") }} *</label>
        <InputText
          id="city"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.city"
          :invalid="errors['city']"
          @change="validation"
        />
        <p v-if="errors['city']" class="error">{{ errors["city"] }}</p>
      </div>

      <!--Country-->
      <div class="c-field col-xs-12 col-md-8 mb-3">
        <label for="city">{{ $utils.t("Country") }} *</label>
        <InputText
          id="country"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.country"
          :invalid="errors['country']"
          @change="validation"
        />
        <p v-if="errors['country']" class="error">{{ errors["country"] }}</p>
      </div>

      <!--Zipcode-->
      <div class="c-field col-xs-12 col-md-4 mb-3">
        <label for="zip">{{ $utils.t("Zipcode") }}</label>
        <InputText
          id="zip"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          v-model="form.address.zip"
          :invalid="errors['zip']"
          @change="validation"
        />
        <p v-if="errors['zip']" class="error">{{ errors["zip"] }}</p>
      </div>
    </template>

    <!--Default Address Checkbox-->
    <div v-if="selectedAddress && !isDefaultAddress" class="c-field col-xs-12">
      <div class="c-checkbox">
        <Checkbox
          inputId="isDefault"
          name="isDefault"
          :value="$utils.t('Default Address')"
          binary
          v-model="form.address.isDefaultAddress"
        />
        <label for="isDefault" class="ml-2">{{
          $utils.t("Set Default Address")
        }}</label>
      </div>
    </div>

    <!--Action Button-->
    <template v-if="showMap">
      <div class="c-field col-xs-6 mb-5 mt-3">
        <Button
          v-if="isEditMode"
          type="button"
          :label="$utils.t('Delete')"
          severity="danger"
          @click="deleteAddress"
          :disabled="loading"
        ></Button>
      </div>

      <div class="c-field col-xs-6 mb-5 mt-3">
        <div
          v-if="isFormValid"
          class="flex flex-wrap justify-content-end gap-3"
        >
          <Button
            type="button"
            :label="$utils.t('Cancel')"
            severity="secondary"
            @click="$emit('close')"
          ></Button>
          <Button
            type="button"
            :label="saveBtnLabel"
            @click="saveAddress"
            :disabled="!isFormValid || loading"
          ></Button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    address: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      form: {
        address: null,
      },
      fullAddress: null,
      formData: {},
      errors: {},
      loading: false,

      searching: false,
      addresses: null,
      selectedAddress: null,

      showMap: false,
      editAddress: null,
      customerData: null,
    }
  },

  computed: {
    account() {
      if (useCommerceStore()) {
        if (useCommerceStore().shopifyUser) {
          console.log("Shopify User ::: ", useCommerceStore().shopifyUser)
          return useCommerceStore().shopifyUser
        }
      }
      return null
    },
    defaultAddress() {
      if (this.account) {
        if (this.account.defaultAddress) {
          console.log("Default Address ::: ", this.account)
          return this.account.defaultAddress
        }
      }
      return null
    },

    isFormValid() {
      if (Object.keys(this.errors).length > 0) {
        return false
      } else {
        return true
      }
    },
    isEditMode() {
      if (this.address) {
        if (Object.keys(this.address).length > 0) {
          return true
        }
      }
      return false
    },
    isDefaultAddress() {
      if (this.defaultAddress && this.isEditMode) {
        if (
          this.defaultAddress.formatted.join(", ") ===
          this.address.formatted.join(", ")
        ) {
          return true
        }
      } else if (!this.isEditMode) {
        if (this.account) {
          if (this.account.defaultAddress !== null) {
            return true
          }
        }
      }
      return false
    },
    saveBtnLabel() {
      if (this.isEditMode) {
        return this.$utils.t("Update")
      }
      return this.$utils.t("Save")
    },
  },

  async created() {
    // this.customerData = await this.$shopify.customer({
    //   access_token: this.$shopify.getUserToken(),
    // })

    this.fillForm()
    this.validation()

    setTimeout(() => {
      this.showMap = true
    }, 100)

    console.log("Form Address :: ", this.address)
  },
  beforeUnmount() {
    this.reset()
    this.formData = {}
    this.form = {
      address: null,
    }
    this.loading = false
    this.searching = false
    this.addresses = null
    this.selectedAddress = null

    this.showMap = false
    this.customerData = null
    this.editAddress = null
  },

  methods: {
    reset() {
      this.errors = {}
    },
    fillForm() {
      if (this.isEditMode) {
        this.selectedAddress = this.address

        this.form.address = {
          id: this.address.id,
          address1: this.address.address1,
          address2: this.address.address2,
          city: this.address.city,
          country: this.address.country,
          province: this.address.province,
          state: this.address.address1,
          zip: this.address.zip,
          isDefaultAddress: this.address.isDefaultAddress,
          fullAddress: this.address.fullAddress,
        }

        this.editAddress = this.address.fullAddress
      } else {
        this.form.address = {
          id: null,
          address1: null,
          address2: null,
          city: null,
          country: null,
          province: null,
          state: null,
          zip: null,
          isDefaultAddress: this.isDefaultAddress,
          fullAddress: null,
        }
        if (this.account && !this.account.defaultAddress) {
          this.form.address.isDefaultAddress = true
        }
      }
    },

    // Search
    selectAddress(address) {
      this.selectedAddress = address

      this.form.address.address1 = address.street ? address.street : null
      this.form.address.address2 = address.state ? address.state : null
      this.form.address.province = address.province ? address.province : null
      this.form.address.city = address.city ? address.city : null
      this.form.address.country = address.country ? address.country : null
      this.form.address.zip = address.zip ? address.zip : null

      this.form.address.search = null
      this.addresses = null

      this.form.address.fullAddress = address.formatted_address

      // console.log("Address ::: Selected Address :: ", this.form.address)

      this.validation()
    },

    // Form Validation
    validation() {
      this.reset()

      if (this.form.address) {
        if (this.form.address.country) {
          this.formData.country = this.form.address.country
        } else {
          this.errors["country"] = "Улс оруулаагүй байна."
        }

        if (this.form.address.city) {
          this.formData.city = this.form.address.city
        } else {
          this.errors["city"] = "Хот / Аймаг оруулаагүй байна."
        }

        if (this.form.address.province) {
          this.formData.province = this.form.address.province
        } else {
          this.errors["province"] = "Сум / Дүүрэг оруулаагүй байна."
        }

        if (this.form.address.address1) {
          this.formData.address1 = this.form.address.address1
        } else {
          this.errors["address1"] = "Байр оруулаагүй байна."
        }

        if (!this.form.address.address2) {
          this.formData.address2 = null
        }

        // if (this.form.address.address2) {
        //   this.formData.address2 = this.form.address.address2
        // }

        // if (this.form.address.zip) {
        //   this.formData.zip = this.form.address.zip
        // } else {
        //   this.errors["zip"] = "Зип код оруулаагүй байна."
        // }

        if (this.account.firstName) {
          this.formData.firstName = this.account.firstName
        }

        if (this.account.lastName) {
          this.formData.lastName = this.account.lastName
        }

        if (this.account.phone) {
          this.formData.phone = this.account.phone
        }

        // console.log("Validation ::: Errors :: ", this.errors, this.account)
      }

      // console.log("Validation ::: Form :: ", this.form)
    },

    // Form Submition
    async saveAddress() {
      this.loading = true
      this.validation()

      // Invalid Form
      if (!this.isFormValid) {
        this.loading = false
        return
      }

      let formData = {
        access_token: this.$shopify.getUserToken(),
        address1: this.form.address.address1,
        address2: this.form.address.address2,
        city: this.form.address.city,
        country: this.form.address.country,
        province: this.form.address.province,
        zip: this.form.address.zip,
        firstName: this.account.firstName,
        lastName: this.account.lastName,
        phone: this.account.phone,
      }

      // Update
      if (this.isEditMode) {
        formData.id = this.address.id

        const res = await this.$shopify.updateCustomerAddress(formData)

        console.log("Update Address :: ", res)

        if (this.form.address.isDefaultAddress) {
          if (
            res &&
            res.customerAddressUpdate &&
            res.customerAddressUpdate.customerAddress
          ) {
            let addressId = res.customerAddressUpdate.customerAddress.id

            await this.saveDefaultAddress(addressId)
          }
        }

        this.$bus.$emit("updateAccount")
        await useCommerceStore().setUser()
        // Create
      } else {
        const res = await this.$shopify.createCustomerAddress(formData)

        if (this.form.address.isDefaultAddress) {
          if (
            res &&
            res.customerAddressCreate &&
            res.customerAddressCreate.customerAddress
          ) {
            let addressId = res.customerAddressCreate.customerAddress.id

            await this.saveDefaultAddress(addressId)
          }
        }

        this.$bus.$emit("updateAccount")
        await useCommerceStore().setUser()
      }

      this.loading = false
    },
    async saveDefaultAddress(id) {
      const res = await this.$shopify.updateCustomerDefaultAddress({
        access_token: this.$shopify.getUserToken(),
        id: id,
      })

      console.log("Update Default Address :: ", res)
    },
    async deleteAddress() {
      this.loading = true

      if (!this.address.id) {
        return
      }

      this.$confirm.require({
        group: "global",
        message: this.$utils.t("Are you sure you want to delete address?"),
        header: this.$utils.t("Address"),
        rejectLabel: this.$utils.t("Cancel"),
        acceptLabel: this.$utils.t("Confirm"),
        accept: async () => {
          const res = await this.$shopify.deleteCustomerAddress({
            id: this.address.id,
            access_token: this.$shopify.getUserToken(),
          })

          if (res) {
            await useCommerceStore().setUser()

            this.$bus.$emit("updateAccount")
            this.$bus.$emit("toast", {
              severity: "success",
              summary: "Address",
              detail: "Succesfully deleted address.",
            })
          }

          this.loading = false
        },
        reject: () => {
          this.loading = false
        },
      })
    },
  },
}
</script>
