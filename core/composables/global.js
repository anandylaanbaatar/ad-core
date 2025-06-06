/**
 * Global Computed
 */

let listenerRef = null

// Theme
export const theme = () => {
  return useAppConfig().theme
}
export const layout = () => {
  return useCoreStore().layout
}
export const siteLoading = () => {
  return useCoreStore().loading
}
export const features = () => {
  return useRuntimeConfig().public.features
}
export const integrations = () => {
  return useRuntimeConfig().public.integrations
}

// Auth
export const authEnabled = () => {
  if (useRuntimeConfig().public.features.auth) {
    return true
  }
  return false
}
export const user = () => {
  if (authEnabled() && useAuthStore()) {
    return useAuthStore().user
  }
  return
}

// Multitenancy
export const isMultitenant = () => {
  if (features().multitenancy) {
    if (features().multitenancy.tenantId) {
      return true
    }
  }
  return false
}
export const useTenantId = () => {
  if (isMultitenant()) {
    return features().multitenancy.tenantId
  }
  return
}
export const tenantPath = () => {
  if (isMultitenant()) {
    const tenantId = useTenantId()
    return `/${tenantId}`
  }
  return ""
}

/**
 * Global functions
 */

// Go To Link
export const goTo = (link) => {
  useNuxtApp().$bus.$emit("goTo", link)
}

// Notifications
export const useInAppNotifications = () => {
  const { $fire, $bus } = useNuxtApp()
  const user = useAuthStore().user
  const notifications = useCoreStore().userNotifications

  const add = (notify) => {
    if (!notifications.find((i) => i.id === notify.id)) {
      notifications.unshift({
        id: notify.id || Date.now(),
        ...notify,
      })

      $bus.$emit("toast", {
        severity: "success",
        summary: notify.title,
        detail: notify.body,
      })

      console.log("[Firebase] ::: Notifications Added!")
    }
  }
  const update = (notify) => {
    let newNotifications = useCoreStore().userNotifications.map((i) => {
      if (i.id === notify.id) {
        return notify
      } else {
        return i
      }
    })
    useCoreStore().set("userNotifications", newNotifications)
  }
  const fallbackHandle = async (notification, type) => {
    return await $fetch(`/api/notify-fallback`, {
      method: "POST",
      body: { type, notification },
    })
  }
  const handle = async (type, notify) => {
    const userStatus = await $fire.actions.read(
      `status${tenantPath()}/${user.uid}`
    )
    let online = false

    // Check if user is Online
    if (userStatus && userStatus.state === "online") {
      online = true
    }

    // 1. In App Notifications
    if (online) {
      if (type === "add") {
        return add(notify)
      } else if (type === "update") {
        return update(notify)
      }
    }

    // 2. Send Push Notifications
    if (user && user.fcmToken) {
      let notification = notify
      notification.fcmToken = user.fcmToken

      const push = await fallbackHandle(notification, "push")
      if (push.success) return
    }

    // 3. Send Slack Notifications
    if (user && user.slackUserId) {
      let notification = notify
      notification.slackUserId = user.slackUserId

      const slack = await fallbackHandle(notification, "slack")
      if (slack.success) return
    }

    // 4. Email
    if (user) {
      let notification = notify
      notification.email = user.email
      notification.userId = user.adcommerce.loopsUserId

      await fallbackHandle(notification, "email")
    }
  }
  const listen = (userId) => {
    if (listenerRef) return

    const db = $fire.database
    const notificationsPath = `notifications/users/${userId}`
    listenerRef = $fire.ref(db, notificationsPath)

    console.log("[Firebase] ::: Notifications Listening!")

    // Clean previous listener if any
    if (listenerRef) {
      $fire.off(listenerRef)
    }

    $fire.onChildAdded(listenerRef, (snapshot) => {
      const data = snapshot.val()
      handle("add", { id: snapshot.key, ...data })
    })
    $fire.onChildChanged(listenerRef, (snapshot) => {
      const data = snapshot.val()
      handle("update", { id: snapshot.key, ...data })
    })
  }
  const stop = () => {
    if (listenerRef) {
      $fire.off(listenerRef)
      listenerRef = null
    }
    useCoreStore().set("userNotifications", [])

    // console.log("[Firebase] ::: Notifications Stopped!")
  }
  const markAsRead = async (notificationId) => {
    await $fire.actions.update(
      `users/${user.uid}/notifications/${notificationId}`,
      {
        read: true,
      }
    )
  }

  return {
    notifications,
    add,
    fallbackHandle,
    handle,
    listen,
    stop,
    markAsRead,
  }
}
