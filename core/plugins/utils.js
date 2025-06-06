// import moment from "moment"
import moment from "moment-timezone"
import { parsePhoneNumber } from "libphonenumber-js"
import { findFlagUrlByIso2Code } from "country-flags-svg"
import { getCountry } from "country-from-iso2"

export default defineNuxtPlugin((nuxtApp) => {
  // console.log("[Plugins] ::: [Utils] :: Initialized!")

  const getFlagByCode = (code) => {
    if (!code) return

    if (code === "UK") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg/510px-Flag_of_the_United_Kingdom_%281-2%29.svg.png"
    } else if (code === "CA") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/510px-Flag_of_Canada_%28Pantone%29.svg.png"
    } else if (code === "VE") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Flag_of_Venezuela.svg/510px-Flag_of_Venezuela.svg.png"
    } else if (code === "CR") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Flag_of_Costa_Rica.svg/510px-Flag_of_Costa_Rica.svg.png"
    } else if (code === "AU") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/510px-Flag_of_Australia_%28converted%29.svg.png"
    } else if (code === "CD") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/453px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png"
    } else if (code === "BO") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Bolivia.svg/250px-Flag_of_Bolivia.svg.png"
    } else if (code === "PS") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Flag_of_Palestine.svg/250px-Flag_of_Palestine.svg.png"
    } else if (code === "IE") {
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/260px-Flag_of_Ireland.svg.png"
    }

    return findFlagUrlByIso2Code(code)
  }
  const getCountryName = (country) => {
    return getCountry(country)
  }
  const getCountryStyle = (code) => {
    let styles = ""
    let flag = getFlagByCode(code)

    if (flag) {
      styles = `background-image:url(${flag});`
      if (code === "MN") {
        styles += `background-position:-4px;`
      }
    }

    return styles
  }
  const hash = async (value) => {
    if (!value) return

    const utf8 = new TextEncoder().encode(value)
    const hashBuffer = await crypto.subtle.digest("SHA-256", utf8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("")

    return hashHex
  }

  return {
    provide: {
      utils: {
        // i18n
        t(value) {
          if (!value) return

          if (nuxtApp.$i18n) {
            let translated = nuxtApp.$i18n.t(value)

            if (translated) {
              return translated
            }

            return value
          }

          return value
        },

        // Date & Time
        moment,
        formatDateTime(date) {
          return moment(date).format("MMM DD, YYYY - h:mm a")
        },
        formatDate(date) {
          return moment(date).format("MMM DD, YYYY")
        },
        getCurrentYear() {
          return moment().format("YYYY")
        },
        status(startDate, endDate) {
          let currentTime = moment()
          let startTime = moment(startDate)
          let endTime = moment(endDate)
          let status = "Not Started"

          if (currentTime.isBetween(startTime, endTime)) {
            status = "In Progress"
          } else if (currentTime.isAfter(endTime)) {
            status = "Finished"
          }

          return status
        },
        utcToTime(time) {
          let dateTime = moment.utc(time)
          return dateTime.format("MMM DD, YYYY - h:mm a")
        },
        utcToLocal(time) {
          let dateTime = moment(parseInt(time))
          return dateTime.format("MMM DD, YYYY - h:mm a")
        },
        utcSecToDate(time) {
          let date = moment.utc(time * 1000)
          return date.format("MMM DD, YYYY - h:mm a")
        },
        timestamp() {
          return moment().valueOf()
        },
        timezones() {
          if (Intl.supportedValuesOf) {
            return Intl.supportedValuesOf("timeZone")
          }
          return
        },

        // Images
        setBackImage(image) {
          if (!image) return
          return `background-image:url(${image});`
        },
        setBackColor(color) {
          if (color) {
            return `background-color:${color};`
          }
          return
        },
        setScrollLength(items) {
          if (items) {
            return `width:${Object.keys(items).length * 315 - 15}px`
          }
          return
        },
        async gravatar(email) {
          return new Promise(async (resolve) => {
            if (!email) {
              resolve(null)
              return
            }

            const address = String(email).trim().toLowerCase()
            const userHash = await hash(address)
            const url = `https://gravatar.com/avatar/${userHash}?s=200`

            try {
              const res = await $fetch(`${url}&d=404`)

              if (res.status !== 404) {
                resolve(url)
              } else {
                resolve(null)
              }
            } catch (err) {
              resolve(null)
            }
          })
        },

        // Numbers & Prices
        formatPrice(x) {
          x = x.toString()
          x = x.split(".")[0]
          let pattern = /(-?\d+)(\d{3})/
          while (pattern.test(x)) x = x.replace(pattern, "$1,$2")
          return x
        },

        // Phone Numbers
        parsePhoneNumber(phone) {
          return parsePhoneNumber(phone)
        },
        formatPhone(phone) {
          if (!phone) return

          const parsedPhone = parsePhoneNumber(phone)

          if (parsedPhone) {
            return `+${parsedPhone.countryCallingCode} ${parsedPhone.nationalNumber}`
          }

          return phone
        },

        // Text
        addDots(value, limit) {
          let max = limit ? limit : 100

          if (value) {
            if (value.length > limit) {
              return `${value.substring(0, max)}...`
            } else {
              return value
            }
          }
          return value
        },
        stringToObject(string) {
          return JSON.parse(
            '{"' +
              decodeURI(string)
                .replace(/"/g, '\\"')
                .replace(/&/g, '","')
                .replace(/=/g, '":"') +
              '"}'
          )
        },
        splitDisplayName(fullName) {
          return {
            firstName: fullName.split(" ").slice(0, -1).join(" "),
            lastName: fullName.split(" ").slice(-1).join(" "),
          }
        },
        firstLetterFromName(name) {
          if (!name) return
          return name.charAt(0)
        },
        copyToClipboard(text) {
          if (window.clipboardData && window.clipboardData.setData) {
            return window.clipboardData.setData("Text", text)
          } else if (
            document.queryCommandSupported &&
            document.queryCommandSupported("copy")
          ) {
            var textarea = document.createElement("textarea")
            textarea.textContent = text
            textarea.style.position = "fixed" // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea)
            textarea.select()
            try {
              return document.execCommand("copy") // Security exception may be thrown by some browsers.
            } catch (ex) {
              console.warn("Copy to clipboard failed.", ex)
              return prompt("Copy to clipboard: Ctrl+C, Enter", text)
            } finally {
              document.body.removeChild(textarea)
            }
          }
        },
        processFileName(filename) {
          let fileNameBase = filename.replace(/ /g, "_")
          let fileSplit = fileNameBase.split(".")
          let fileName_noExt = fileSplit.slice(0, -1).join(".")
          fileName_noExt = fileName_noExt.replaceAll(".", "_")
          fileName_noExt = fileName_noExt.replaceAll(" ", "_")
          let fileExtension = fileSplit.pop()
          let fileTimestamp = Math.floor(Date.now() / 1000)
          let fileName = `${fileName_noExt}_${fileTimestamp}.${fileExtension}`
          return encodeURI(fileName)
        },

        // Country
        getFlagByCode,
        getCountryName,
        getCountryStyle,
      },
    },
  }
})
