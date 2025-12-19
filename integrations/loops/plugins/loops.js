/**
 * Loops Integration Plugin
 *
 * This plugin is only loaded when integrations.loops = true
 * (conditionally registered via v1/integrations/loops layer)
 *
 * https://loops.so/docs/api-reference/send-transactional-email
 */

export default defineNuxtPlugin(async () => {
  const LOOPS_KEY = useState("loopsKey", () => process.env.NUXT_LOOPS_API_KEY)

  if (import.meta.client) {
    if (!LOOPS_KEY.value) {
      console.log("[Plugins] ::: [Loops] ::: Missing Loops API Key!")
      return
    }

    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Loops] ::: Initialized!")
    }
  } else {
    return
  }

  /**
   * Loops Methods
   */

  // User
  const loopsUserSearch = async (email) => {
    return new Promise(async (resolve) => {
      if (!email) {
        console.log("[Loops] ::: No email provided!")
        resolve(null)
      }

      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsUserSearch",
          email: email,
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }
  const loopsUserCreate = async (data) => {
    return new Promise(async (resolve) => {
      if (!data) {
        console.log("[Loops] ::: No data provided!")
        resolve(null)
      }

      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsUserCreate",
          data: data,
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }
  const loopsUserUpdate = async (data) => {
    return new Promise(async (resolve) => {
      if (!data) {
        console.log("[Loops] ::: No data provided!")
        resolve(null)
      }

      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsUserUpdate",
          data: data,
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }

  // Mailing
  const loopsSubscribeToMailingList = async (data) => {
    return new Promise(async (resolve) => {
      if (!data) {
        console.log("[Loops] ::: No data provided!")
        resolve(null)
      }

      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsSubscribeToMailingList",
          data: data,
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }
  const loopsMailingLists = async () => {
    return new Promise(async (resolve) => {
      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsMailingLists",
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }
  const loopsTransactionalEmailSend = async (data) => {
    return new Promise(async (resolve) => {
      if (!data) {
        console.log("[Loops] ::: No data provided!")
        resolve(null)
      }

      const res = await $fetch(`/api/loops`, {
        method: "POST",
        body: {
          type: "loopsTransactionalEmailSend",
          data: data,
        },
      })

      if (res) {
        resolve(res)
      }
      resolve(null)
    })
  }
  const loopsTransactionalEmailList = async () => {
    return new Promise(async (resolve) => {
      const limit = 50
      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsTransactionalEmailList",
          limit: limit,
        },
      })

      if (res) {
        resolve(res)
      }
      resolve(null)
    })
  }
  const loopsSendEvents = async (data) => {
    return new Promise(async (resolve) => {
      if (!data) {
        console.log("[Loops] ::: No data provided!")
        resolve(null)
      }

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

      const res = await $fetch("/api/loops", {
        method: "POST",
        body: {
          type: "loopsSendEvents",
          data: data,
        },
      })

      if (res && res.success) {
        resolve(res.results)
      }

      resolve(null)
    })
  }

  return {
    provide: {
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
    },
  }
})
