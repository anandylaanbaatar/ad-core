<script setup>
const error = useError()
const i18n = useI18n()

let codeBlockActive = ref(false)

const handleError = () => {
  clearError({
    redirect: "/",
  })
}
const translate = (value) => {
  return i18n.t(value)
}
</script>

<template>
  <div class="c-errorPage" @click="codeBlockActive = false">
    <div class="content">
      <div>
        <Logo class="mb-4"></Logo>

        <h4 class="mb-2">
          {{ translate("Sorry we couldn't find this page.") }}
        </h4>
        <p class="mb-3 desc">
          {{
            translate(
              "The page you are looking for does not exist or an error occurred."
            )
          }}
        </p>

        <Button
          label="Go Home"
          icon="pi pi-home"
          severity="secondary"
          @click.stop="handleError"
        ></Button>

        <div
          v-if="error"
          class="c-error-content"
          :class="{ active: codeBlockActive }"
          @click.stop="codeBlockActive = true"
        >
          <div class="d-block relative">
            <div class="text-center">
              <i class="pi pi-info-circle text-xl"></i>
              <p>Report</p>
            </div>

            <template v-if="error.url">
              <h4>Url</h4>
              <p class="mb-2">{{ error.url }}</p>
            </template>

            <template v-if="error.statusCode">
              <h4>Status Code</h4>
              <p class="mb-2">{{ error.statusCode }}</p>
            </template>

            <template v-if="error.statusMessage">
              <h4>Message</h4>
              <p class="mb-2">
                {{ error.statusMessage }}
              </p>
            </template>

            <template v-if="error.message">
              <h4 class="mb-1">Details</h4>
              <pre>{{ error.message }}</pre>
            </template>
          </div>
        </div>
        <Button
          icon="pi pi-info-circle"
          class="sm fixed bottom-0 right-0 m-4"
          @click.stop="codeBlockActive = !codeBlockActive"
        ></Button>
      </div>
    </div>

    <!-- <h1 class="backDrop">{{ statusCode }}</h1> -->
  </div>
</template>
