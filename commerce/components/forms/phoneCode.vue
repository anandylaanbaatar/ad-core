<template>
  <div class="c-phoneValidation">
    <h3>{{ $utils.t("Verify Phone") }}</h3>

    <div class="row">
      <div class="col-xs-12">
        <label for="phoneValidation"
          >{{ phone }} {{ $utils.t("will recieve new code.") }}</label
        >

        <InputOtp
          v-model="phoneValidation"
          :length="6"
          class="c-phoneCodeInput"
          @change="checkPhoneCode"
        >
          <template #default="{ attrs, events, index }">
            <input
              type="text"
              v-bind="attrs"
              v-on="events"
              class="custom-otp-input"
            />
            <div v-if="index === 3" class="px-4">
              <i class="pi pi-minus"></i>
            </div>
          </template>
        </InputOtp>

        <small
          v-if="errors.phoneValidation"
          id="phone-validation"
          class="error"
          >{{ errors.phoneValidation }}</small
        >

        <Loader v-if="checking" type="small"></Loader>
        <Button
          v-else
          :label="$utils.t('Verify Code')"
          severity="contrast"
          class="blockBtn"
          @click="checkPhoneCode"
          :disabled="!phoneValidation || phoneValidation.length !== 6"
        ></Button>

        <Button
          :label="$utils.t('Send New Code')"
          severity="secondary"
          class="linkBtn mt-3 w-full"
          @click="resendCode"
        ></Button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    phone: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      phoneCountry: "+976",
      phoneValidation: null,
      errors: {},
      isValid: false,
      checking: false,
    }
  },

  methods: {
    reset() {
      this.phoneValidation = null
      this.errors = {}
    },
    validation() {
      if (!this.phoneValidation) return

      if (this.phoneValidation.length !== 6) {
        this.errors["phoneValidation"] =
          `Код бүрэн биш байна. 6 оронтой код оруулна уу`
        this.isValid = false
        return
      } else {
        this.errors = {}
        this.isValid = true
      }
    },
    async checkPhoneCode() {
      if (this.checking) return
      this.validation()

      if (this.isValid) {
        this.checking = true
        console.log("Check Phone Validation Code ::: ", this.phoneValidation)
      }
    },
    async resendCode() {
      this.reset()
      this.checking = false
    },
  },
}
</script>
