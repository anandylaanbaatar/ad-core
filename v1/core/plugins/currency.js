import moment from "moment"
import { fx } from "money"

export default defineNuxtPlugin((nuxtApp) => {
  const KEY = useState(
    "currencyKey",
    () => process.env.NUXT_OPEN_EXCHANGE_RATES
  )

  if (import.meta.client) {
    if (!useRuntimeConfig().public.features.currency) {
      // console.log("[Plugins] ::: [Currency] ::: Not Initialized!")
      return
    }
    if (!KEY.value) {
      console.log("[Plugins] ::: [Currency] ::: Missing Integration Key!")
      return
    }

    // console.log("[Plugins] ::: [Currency] ::: Initialized!")
  } else {
    return
  }

  let key = KEY.value
  let BASE_CURRENCY = useAppConfig().theme.currency
  let CURRENCY = null
  let TIMESTAMP = null
  let siteCurrencies = ["MNT", "USD", "CAD", "AUD", "GBP", "EUR"]
  let expireHours = 12

  /**
   * Initialization
   */

  const init = async () => {
    if (localStorage.getItem("currency")) {
      CURRENCY = localStorage.getItem("currency")
    } else {
      CURRENCY = BASE_CURRENCY
      localStorage.setItem("currency", CURRENCY)
    }

    await getRates()

    if (isExpired()) {
      await getRates(true)
    }
  }
  const getRates = async (force) => {
    let ratesData = localStorage.getItem("rates")

    if (ratesData && !force) {
      setupRates(JSON.parse(ratesData).rates, JSON.parse(ratesData).timestamp)

      // console.log("[Plugins] ::: [Currency] :: Setup rates from Localhost!")
    } else {
      const res = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=${key}`
      )
      if (res) {
        const data = await res.json()

        localStorage.setItem(
          "rates",
          JSON.stringify({
            rates: data.rates,
            timestamp: data.timestamp,
          })
        )

        setupRates(data.rates, data.timestamp)

        console.log("[Plugins] ::: [Currency] :: Setup rates from API!")
      }
    }
  }
  const setupRates = (rates, timestamp) => {
    fx.rates = rates
    fx.base = "USD"
    TIMESTAMP = timestamp
  }
  const isExpired = () => {
    // console.log(
    //   "[Currency] ::: Current Time :: ",
    //   moment().format("YYYY-MM-DD HH:mm")
    // )
    // console.log(
    //   "[Currency] ::: Timestamp :: ",
    //   moment.unix(TIMESTAMP).format("YYYY-MM-DD HH:mm")
    // )

    return moment().diff(moment.unix(TIMESTAMP), "hours") >= expireHours
  }
  const allCurrencies = () => {
    let allRates = []

    for (let i = 0; i < siteCurrencies.length; i++) {
      allRates.push({
        name: siteCurrencies[i],
        code: siteCurrencies[i],
      })
    }

    return allRates
  }

  /**
   * Methods
   */

  const convert = (amount) => {
    let convertedAmount = fx.convert(amount, {
      from: BASE_CURRENCY,
      to: CURRENCY,
    })
    convertedAmount = convertedAmount.toFixed(2)

    return parseFloat(convertedAmount)
  }

  /**
   * Format
   */

  const formatCurrency = (currency, amount) => {
    let formattedPrice = parseFloat(amount)
    formattedPrice = nuxtApp.$utils.formatPrice(formattedPrice)

    if (currency === "MNT") {
      formattedPrice = `${formattedPrice}₮`
    } else if (currency === "USD") {
      formattedPrice = `$${formattedPrice}`
    } else if (currency === "CAD") {
      formattedPrice = `CA$${formattedPrice}`
    } else if (currency === "AUD") {
      formattedPrice = `A$${formattedPrice}`
    } else if (currency === "GBP") {
      formattedPrice = `£${formattedPrice}`
    } else if (currency === "EUR") {
      formattedPrice = `€${formattedPrice}`
    }

    return formattedPrice
  }
  const format = (amount) => {
    let toCurrency = CURRENCY

    // Currency is Base Currency then just format
    if (toCurrency === BASE_CURRENCY) {
      return `${formatCurrency(toCurrency, amount)}`
    }

    // Convert Currency and Format
    return formatCurrency(toCurrency, convert(parseFloat(amount)))
  }

  if (import.meta.client) {
    init()
  }

  return {
    provide: {
      currency: {
        allCurrencies,
        convert,
        format,
      },
    },
  }
})
