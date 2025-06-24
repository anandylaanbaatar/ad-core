<template>
  <div :style="'display:inline-flex;'" class="mr-2">
    <Select
      v-model="language"
      :options="languages"
      optionLabel="name"
      placeholder="Language"
      :class="classes"
      @change="changeLanguage"
    ></Select>
  </div>
</template>

<script>
export default {
  props: {
    classes: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      language: null,
      languages: [
        {
          name: "Монгол хэл",
          code: "mn",
        },
        {
          name: "English",
          code: "en",
        },
      ],
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      if (useI18n()) {
        const { locale } = useI18n()
        this.language = this.languages.find((i) => i.code === locale._value)
      }
    },
    changeLanguage(lang) {
      localStorage.setItem("language", lang.value.code)
      this.$i18n.setLocale(lang.value.code)

      setTimeout(() => {
        this.$bus.$emit("toast", {
          severity: "secondary",
          summary: this.$utils.t("Language"),
          detail: this.$utils.t("Successfully updated language."),
        })
      }, 500)
    },
  },
}
</script>
