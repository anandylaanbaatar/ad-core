<template>
  <div class="inline-flex">
    <Select
      v-model="currency"
      :options="currencies"
      optionLabel="name"
      placeholder="Currency"
      @change="changeCurrency"
    ></Select>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currency: null,
      currencies: [],
    }
  },

  mounted() {
    this.init()
  },

  methods: {
    init() {
      if (this.$currency) {
        this.currencies = this.$currency.allCurrencies()

        if (this.currencies.length > 0) {
          const defaultCurrency = localStorage.getItem("currency")
          this.currency = this.currencies.find(
            (i) => i.name === defaultCurrency
          )
        }
      }
    },
    changeCurrency(currency) {
      localStorage.setItem("currency", currency.value.code)

      const store = useCoreStore()
      store.set("currency", currency.value.code)

      setTimeout(() => {
        window.location.reload()
      }, 700)
    },
  },
}
</script>
