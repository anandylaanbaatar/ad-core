export default defineNuxtPlugin(async (nuxtApp) => {
  const LOOPS_KEY = useState("loopsKey", () => process.env.NUXT_LOOPS_API_KEY)

  if (import.meta.client) {
    if (!useRuntimeConfig().public.features.notifications) {
      return
    }
    if (!LOOPS_KEY.value) {
      console.log(
        "[Plugins] ::: [Notifications] ::: Missing Loops Integration Key!"
      )
      return
    }

    console.log("[Plugins] ::: [Notifications] ::: Initialized!")
  } else {
    return
  }

  /**
   * Web Push
   * Notifications
   */

  const enableNotifications = async () => {
    return new Promise(async (resolve) => {
      Notification.requestPermission()
        .then(async (permission) => {
          if (permission === "granted") {
            const token = await nuxtApp.$fire.actions.getUserToken()

            if (token) {
              await nuxtApp.$fire.actions.saveUserToken(token)
              resolve(true)
            } else {
              resolve(null)
            }
          }
        })
        .catch((err) => {
          console.log(
            "[Plugins] ::: [Notifications] ::: Permission Error ::",
            err.message
          )
          resolve(null)
        })
    })
  }

  /**
   * Loops
   * Methods
   * https://loops.so/docs/api-reference/send-transactional-email
   */

  const cors = useCoreStore().cors
  const loopsApiKey = LOOPS_KEY.value
  const loopsBaseUrl = `${cors}/https://app.loops.so/api/v1`

  // User
  const loopsUserSearch = async (email) => {
    return new Promise(async (resolve) => {
      // const res = await loops.findContact({ email: email })
      // console.log("[Loops] ::: ", res)

      const dataFetch = await fetch(
        `${loopsBaseUrl}/contacts/find?email=${email}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${loopsApiKey}`,
          },
        }
      )
      const res = await dataFetch.json()

      if (res && res.length === 0) {
        resolve(null)
      } else {
        const contact = res.find((i) => i.email === email)

        if (contact) {
          resolve(contact)
        }
      }

      resolve(null)
    })
  }
  const loopsUserCreate = async (data) => {
    return new Promise(async (resolve) => {
      const dataFetch = await fetch(`${loopsBaseUrl}/contacts/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loopsApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const res = await dataFetch.json()

      if (res) {
        resolve(res.id)
      }

      resolve(null)
    })
  }
  const loopsUserUpdate = async (data) => {
    return new Promise(async (resolve) => {
      const dataFetch = await fetch(`${loopsBaseUrl}/contacts/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loopsApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const res = await dataFetch.json()

      if (res) {
        resolve(res.id)
      }

      resolve(null)
    })
  }

  // Mailing
  const loopsSubscribeToMailingList = async (data) => {
    const formData = `email=${encodeURIComponent(data.email)}&mailingLists=${encodeURIComponent(data.listId)}`

    return new Promise(async (resolve) => {
      const dataFetch = await fetch(
        `${cors}/https://app.loops.so/api/newsletter-form/${data.formId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      )
      const res = await dataFetch.json()

      if (res) {
        resolve(res)
      } else {
        resolve(null)
      }
    })
  }
  const loopsMailingLists = async () => {
    return new Promise(async (resolve) => {
      const dataFetch = await fetch(`${loopsBaseUrl}/lists`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${loopsApiKey}`,
        },
      })
      const res = await dataFetch.json()

      if (res) {
        resolve(res)
      }

      resolve(null)
    })
  }
  const loopsTransactionalEmailSend = async (data) => {
    return new Promise(async (resolve) => {
      const dataFetch = await fetch(`${loopsBaseUrl}/transactional`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loopsApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      const res = await dataFetch.json()

      if (res) {
        resolve(res)
      }
      resolve(null)
    })
  }
  const loopsTransactionalEmailList = async () => {
    return new Promise(async (resolve) => {
      const limit = 50
      const dataFetch = await fetch(
        `${loopsBaseUrl}/transactional?perPage=${limit}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${loopsApiKey}`,
          },
          body: JSON.stringify(data),
        }
      )
      const res = await dataFetch.json()

      if (res) {
        resolve(res)
      }
      resolve(null)
    })
  }
  const loopsSendEvents = async (data) => {
    return new Promise(async (resolve) => {
      let formData = {
        email: data.email,
        eventName: data.eventName,
      }
      if (data.eventProperties) {
        formData.eventProperties = data.eventProperties
      }
      if (data.mailingLists) {
        formData.mailingLists = data.mailingLists
      }

      const dataFetch = await fetch(`${loopsBaseUrl}/events/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loopsApiKey}`,
        },
        body: JSON.stringify(formData),
      })
      const res = await dataFetch.json()

      if (res) {
        resolve(res)
      } else {
        resolve(null)
      }
    })
  }

  return {
    provide: {
      notifications: {
        loops: {
          user: {
            find: loopsUserSearch,
            create: loopsUserCreate,
            update: loopsUserUpdate,
          },
          lists: {
            all: loopsMailingLists,
            subscribe: loopsSubscribeToMailingList,
          },
          email: {
            send: loopsTransactionalEmailSend,
            list: loopsTransactionalEmailList,
          },
          events: {
            send: loopsSendEvents,
          },
        },
        push: {
          enable: enableNotifications,
        },
      },
    },
  }
})
