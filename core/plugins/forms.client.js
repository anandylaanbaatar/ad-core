import { countries } from "country-codes-flags-phone-codes"
import { isValidPhoneNumber } from "libphonenumber-js"

export default defineNuxtPlugin((app) => {
  const phoneCountries = () => {
    return countries
  }
  const phoneCountryByCode = (code) => {
    return countries.find((i) => i.code === code.toUpperCase())
  }
  const validateEmail = (email) => {
    let emailRegex = /\S+@\S+\.\S+/
    if (emailRegex.test(email.trim().toLowerCase())) {
      return true
    }
    return false
  }
  const validateForm = (form, country) => {
    let isValid = true
    let errors = {}

    for (const [key, value] of Object.entries(form)) {
      // 1. Empty Field
      if (!value) {
        errors[key] = app.$utils.t(`This field must not be empty.`)
        isValid = false
      } else {
        // Firstname or Lastname
        if (key === "firstName" || key === "lastName") {
          let lettersRegex = /^[a-zA-Zа-яА-ЯүҮөӨ]+$/

          if (!lettersRegex.test(value)) {
            errors[key] = app.$utils.t(`Enter only letters!`)
            isValid = false
          } else if (value.length < 2) {
            errors[key] = app.$utils.t(`Please enter at least 2 letters!`)
            isValid = false
          }
        }

        // Email Address
        if (key === "email") {
          if (!validateEmail(value)) {
            errors[key] = app.$utils.t(
              `Email must be a full valid email address.`
            )
            isValid = false
          }
        }

        // Phone Number
        if (key === "phone") {
          let phoneCountry = country ? country.toUpperCase() : "MN"

          if (!isValidPhoneNumber(value, phoneCountry)) {
            errors[key] =
              `${phoneCountry} - ` +
              app.$utils.t(`Please enter valid phone number!`)
            isValid = false
          }
        }

        // Password
        if (key === "password") {
          let msg = ``

          if (!/^\S*$/.test(value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Password cannot have spaces!")
          }
          if (!/^(?=.*[A-Z]).*$/.test(value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 uppercase letter!")
          }
          if (!/^(?=.*[a-z]).*$/.test(value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 lowercase letter!")
          }
          if (!/^(?=.*[0-9]).*$/.test(value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 number!")
          }
          if (
            !/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test(value)
          ) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 special character!")
          }
          if (!/^.{10,16}$/.test(value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Password length must be between 10 - 16!")
          }

          if (msg) {
            errors[key] = msg
            isValid = false
          }
        }

        // Confirm Password
        if (key === "confirmPassword") {
          if (form.password !== value) {
            errors[key] = app.$utils.t(
              `Password and Confirm Password does not match!`
            )
            isValid = false
          }
        }
      }
    }

    return {
      isValid: isValid,
      errors: errors,
    }
  }

  return {
    provide: {
      forms: {
        phoneCountries,
        phoneCountryByCode,
        validateForm,
        validateEmail,
      },
    },
  }
})
