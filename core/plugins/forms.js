import { countries } from "country-codes-flags-phone-codes"
import { isValidPhoneNumber } from "libphonenumber-js"

export default defineNuxtPlugin((app) => {
  const UPLOADER_KEY = useState(
    "uploaderKey",
    () => process.env.NUXT_BUNNY_API_KEY
  )
  if (!import.meta.client) return

  /**
   * Phone
   */

  const phoneCountries = () => {
    return countries
  }
  const phoneCountryByCode = (code) => {
    return countries.find((i) => i.code === code.toUpperCase())
  }

  /**
   * Validations
   */

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
  // Validate Form v2 - Supports objects input fields with rules
  const validateFormV2 = (fields) => {
    let isValid = true
    let errors = {}

    for (const [key, field] of Object.entries(fields)) {
      const fieldKey = key.toLowerCase()

      // Check Only Required Fields
      if (field.required) {
        // 1. Empty Fields
        if (!field.value) {
          errors[key] = app.$utils.t(`This field must not be empty.`)
          isValid = false
        }

        // 2. General Fields Check
        // Names
        if (
          fieldKey === "firstname" ||
          fieldKey === "lastname" ||
          fieldKey === "fullname"
        ) {
          const lettersRegex = /^[a-zA-Zа-яА-ЯүҮөӨ]+$/

          if (!lettersRegex.test(field.value)) {
            errors[key] = app.$utils.t(`Enter only letters!`)
            isValid = false
          } else if (field.value.length < 2) {
            errors[key] = app.$utils.t(`Please enter at least 2 letters!`)
            isValid = false
          }
        }
        // Email Address
        if (fieldKey === "email" || fieldKey === "emailaddress") {
          if (!validateEmail(field.value)) {
            errors[key] = app.$utils.t(
              `Email must be a full valid email address.`
            )
            isValid = false
          }
        }
        // Phone Number
        if (fieldKey === "phone" || fieldKey === "phonenumber") {
          const phoneCountry = field.country
            ? field.country.toUpperCase()
            : useAppConfig().theme.country

          if (!isValidPhoneNumber(field.value, phoneCountry)) {
            errors[key] =
              `${phoneCountry} - ${app.$utils.t(`Please enter valid phone number!`)}`
            isValid = false
          }
        }
        // Password
        if (fieldKey === "password") {
          let msg = ``

          if (!/^\S*$/.test(field.value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Password cannot have spaces!")
          }
          if (!/^(?=.*[A-Z]).*$/.test(field.value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 uppercase letter!")
          }
          if (!/^(?=.*[a-z]).*$/.test(field.value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 lowercase letter!")
          }
          if (!/^(?=.*[0-9]).*$/.test(field.value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 number!")
          }
          if (
            !/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/.test(
              field.value
            )
          ) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Include 1 special character!")
          }
          if (!/^.{10,16}$/.test(field.value)) {
            if (msg) msg += `<br>`
            msg += app.$utils.t("Password length must be between 10 - 16!")
          }

          if (msg) {
            errors[key] = msg
            isValid = false
          }
        }
        // Confirm Password
        if (fieldKey === "confirmpassword") {
          if (fields["password"] !== field.value) {
            errors[key] = app.$utils.t(
              `Password and Confirm Password does not match!`
            )
            isValid = false
          }
        }

        // 3. All other fields check
        if (field.rule) {
          const regex = field.rule

          if (!regex.test(field.value)) {
            const msg = field.errorMsg
              ? field.errorMsg
              : `This field does not match the requirements.`
            errors[key] = app.$utils.t(msg)
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

  /**
   * Uploader
   */

  const uploader = async (file, tenantId, filePath) => {
    return new Promise(async (resolve) => {
      const apiKey = UPLOADER_KEY.value
      let storageUrl = "https://storage.bunnycdn.com/melodu"
      let cdnUrl = "https://melodu.b-cdn.net"
      let siteUrl = "https://melodu.b-cdn.net"

      if (features().fileSystem.bunny.storageUrl) {
        storageUrl = features().fileSystem.bunny.storageUrl
      }
      if (features().fileSystem.bunny.cdnUrl) {
        cdnUrl = features().fileSystem.bunny.cdnUrl
      }
      if (features().fileSystem.bunny.siteUrl) {
        siteUrl = features().fileSystem.bunny.siteUrl
      }

      try {
        const filename = app.$utils.processFileName(file.name)

        // Build path: adcommerce/{tenantId}/{filePath?}/{filename}
        const rootPath = features().fileSystem.bunny.filesPath // "adcommerce"
        let filesPath = `${rootPath}/${tenantId}`

        if (filePath) {
          filesPath = `${filesPath}/${filePath}`
        }

        const requestUrl = `${storageUrl}/${filesPath}/${filename}`
        const downloadUrl = `${siteUrl}/${filesPath}/${filename}`
        const downloadOriginUrl = `${cdnUrl}/${filesPath}/${filename}`

        const res = await $fetch(requestUrl, {
          method: "PUT",
          headers: {
            "content-type": "application/octet-stream",
            AccessKey: apiKey,
          },
          body: file,
        })

        if (res && res.Message === "File uploaded.") {
          resolve({
            url: downloadUrl,
            originUrl: downloadOriginUrl,
            fileId: filename,
          })
        } else {
          resolve(null)
        }
      } catch (err) {
        console.log("Error uploading file ::: ", err.message)
        resolve(null)
      }
    })
  }
  const upload = async (files, tenantId, filePath) => {
    if (!UPLOADER_KEY.value) return
    if (!features().fileSystem) return
    if (!features().fileSystem.bunny) return
    if (!features().fileSystem.bunny.filesPath) return

    // Validate tenant ID is provided
    if (!tenantId) {
      console.warn("[Forms] Upload failed: No tenant ID provided")
      return null
    }

    let results = []

    for (let i = 0; i < files.length; i++) {
      const downloaded = await uploader(files[i], tenantId, filePath)

      if (downloaded) {
        results.push(downloaded)
      }
    }

    if (results.length > 0) {
      return results
    }

    return null
  }
  const uploadUrl = async (url, tenantId, filePath) => {
    if (!UPLOADER_KEY.value) return
    if (!features().fileSystem) return
    if (!features().fileSystem.bunny) return
    if (!features().fileSystem.bunny.filesPath) return

    // Validate tenant ID is provided
    if (!tenantId) {
      return {
        success: false,
        error: "No tenant ID provided!",
      }
    }

    if (!url) {
      return {
        success: false,
        error: "Remote url is missing!",
      }
    }

    // 1. Fetch Image
    const remoteRes = await $fetch(url)
    if (!remoteRes.ok) {
      return {
        success: false,
        error: "Remote url fetch failed!",
      }
    }
    const blob = await remoteRes.blob()
    const remoteFileName = url.split("/").pop().split("?")[0].split("#")[0]
    const file = new File([blob], remoteFileName, { type: blob.type })

    // 2. Upload Image to Bunny
    const downloaded = await uploader(file, tenantId, filePath)

    if (downloaded) {
      return downloaded
    }

    return null
  }

  return {
    provide: {
      forms: {
        phoneCountries,
        phoneCountryByCode,
        validateForm,
        validateFormV2,
        validateEmail,
        upload,
        uploadUrl,
      },
    },
  }
})
