<script setup>
const error = useError()
const i18n = useI18n()

let statusCode = error.statusCode ? error.statusCode : "404"

console.log("[Error] ::: ", error)
console.log("[Error] ::: Message :: ", error["_object"].error.message)

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
  <div class="c-errorPage">
    <div class="content">
      <div>
        <h2 class="mb-2">{{ statusCode }}</h2>
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

        <div v-if="error" class="w-full">
          <pre v-if="error">{{ error }}</pre>
        </div>

        <Button
          label="Go Back"
          icon="pi pi-arrow-left"
          @click="handleError"
        ></Button>
      </div>
    </div>

    <!-- <h1 class="backDrop">{{ statusCode }}</h1> -->
  </div>
</template>
