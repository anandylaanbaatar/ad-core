<template>
  <div v-if="isActive" class="formMailingList">
    <div class="c-form row">
      <h4 v-if="form.success" class="col-xs-12 text-white">
        <i class="pi pi-check mr-2"></i>
        {{ form.success }}
      </h4>

      <template v-else>
        <div class="c-field col-xs-12 col-md-8">
          <InputText
            id="subscribeEmail"
            v-model="form.fields.email"
            aria-describedby="email-help"
            :placeholder="$utils.t('Email Address')"
            :invalid="form.errors.email"
            @change="validation"
            :disabled="form.loading"
          ></InputText>
          <small v-if="form.errors.email" id="email-help" class="error">{{
            form.errors.email
          }}</small>
        </div>

        <div class="c-field col-xs-12 col-md-4">
          <Loader
            v-if="form.loading"
            type="none"
            color="white"
            class="mx-auto"
          ></Loader>
          <Button v-else class="w-full" @click="subscribe"
            >Join Mailing List</Button
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        fields: {
          email: null,
        },
        loading: false,
        isValid: false,
        errors: {},
        success: null,
      },
    }
  },

  computed: {
    isActive() {
      if (features().notifications && features().notifications.loops) {
        if (
          features().notifications.loops.mailingFormId &&
          features().notifications.loops.mailingListId
        ) {
          return true
        }
      }
      return false
    },
  },

  methods: {
    reset() {
      this.form.isValid = false
      this.form.errors = {}
      this.form.success = null
      this.form.loading = false
    },
    validation() {
      this.reset()
      const validation = this.$forms.validateForm(this.form.fields)
      this.form.isValid = validation.isValid
      this.form.errors = validation.errors
    },

    async subscribe() {
      this.validation()
      if (!this.form.isValid) {
        setTimeout(() => {
          this.reset()
        }, 3000)
        return
      }

      this.form.loading = true

      try {
        await this.$loops.lists.subscribe({
          email: this.form.fields.email,
          formId: features().notifications.loops.mailingFormId,
          listId: features().notifications.loops.mailingListId,
        })

        const msg = "Successfully joined mailing list."
        this.form.success = msg
        setTimeout(() => {
          this.reset()
          this.form.fields.email = null
        }, 10000)
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Success",
          detail: msg,
        })
      } catch (err) {
        const msg = "Oops, something went wrong."

        this.form.success = msg
        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Error",
          detail: msg,
        })
      }

      this.form.loading = false
    },
  },
}
</script>
