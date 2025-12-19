export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    if (!useRuntimeConfig().public.features.notifications) {
      return
    }

    if (useRuntimeConfig().public.features.log) {
      console.log("[Plugins] ::: [Notifications] ::: Initialized!")
    }
  } else {
    return
  }

  // /**
  //  * Web Push
  //  * Notifications
  //  */

  // const enableNotifications = async () => {
  //   return new Promise(async (resolve) => {
  //     Notification.requestPermission()
  //       .then(async (permission) => {
  //         if (permission === "granted") {
  //           const token = await nuxtApp.$fire.actions.getUserToken()

  //           if (token) {
  //             await nuxtApp.$fire.actions.saveUserToken(token)
  //             resolve(true)
  //           } else {
  //             resolve(null)
  //           }
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(
  //           "[Plugins] ::: [Notifications] ::: Permission Error ::",
  //           err.message
  //         )
  //         resolve(null)
  //       })
  //   })
  // }

  return {
    provide: {
      notifications: {
        // push: {
        //   enable: enableNotifications,
        // },
      },
    },
  }
})
