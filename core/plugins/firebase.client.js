import { watch } from "vue"
import { initializeApp, getApps } from "firebase/app"
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  sendEmailVerification,
  updateProfile,
  signOut,
  getAdditionalUserInfo,
  applyActionCode,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import {
  getDatabase,
  ref,
  ref as vdbRef,
  child,
  onChildAdded,
  onChildChanged,
  off,
  get,
  set,
  onValue,
  push,
  update,
  remove,
  onDisconnect,
  serverTimestamp,
  // runTransaction
} from "firebase/database"
// import {
//   useDatabaseList,
//   useDatabaseObject,
//   VueFire,
//   VueFireDatabaseOptionsAPI,
//   VueFireFirestoreOptionsAPI,
// } from "vuefire"
// import { getMessaging, onMessage, getToken } from "firebase/messaging"
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserProperties,
} from "firebase/analytics"

export default defineNuxtPlugin(async (nuxtApp) => {
  const CONFIG = useState(
    "firebaseConfig",
    () => useRuntimeConfig().public.firebase
  )

  if (!useRuntimeConfig().public.integrations.firebase) {
    console.log("[Plugins] ::: [Firebase] ::: Not Initialized!")
    return
  }
  if (!CONFIG.value) {
    console.log("[Firebase] ::: Config not found! :: Not Initialized")
    return
  }

  if (useRuntimeConfig().public.features.log) {
    console.log("[Plugins] ::: [Firebase] ::: Initialized!")
  }

  const runtimeConfig = useRuntimeConfig()
  const isProduction = process.env.NODE_ENV === "production"
  const config = CONFIG.value
  const firebaseConfig = config
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  const auth = getAuth(app)

  // Configure Firebase Auth Persistence - CRITICAL for auth state to persist
  try {
    await setPersistence(auth, browserLocalPersistence)
    if (runtimeConfig.public.features.log) {
      console.log('[Plugins] ::: [Firebase] ::: Auth persistence enabled (browserLocalPersistence)')
    }
  } catch (error) {
    console.error('[Plugins] ::: [Firebase] ::: Error setting persistence:', error)
  }

  const firestore = getFirestore(app)
  const database = getDatabase(app)
  const dbRef = ref(getDatabase(app))
  // const messaging = getMessaging(app)
  let analytics = null

  // Initialize centralized auth composable (single source of truth)
  const { initialize: initializeAuth } = useFirebaseAuth()
  initializeAuth()

  /**
   * Analytics
   */

  if (runtimeConfig.public.features.analytics) {
    const isAnalyticsSupported = await isSupported()
    if (isAnalyticsSupported && typeof window !== "undefined") {
      try {
        analytics = getAnalytics(app) // { autoLog: false }

        const route = useRoute()
        let tenantId = null
        const domain = window.location.hostname

        // Multi Tenancy
        if (runtimeConfig.public.features.multitenancy) {
          if (runtimeConfig.public.features.multitenancy.tenantId) {
            tenantId = runtimeConfig.public.features.multitenancy.tenantId
          } else if (runtimeConfig.public.features.multitenancy.parentId) {
            tenantId = runtimeConfig.public.features.multitenancy.parentId
          }
        }

        // Set Tenant ID as user property
        if (tenantId) {
          setUserProperties(analytics, { tenant_id: tenantId, domain: domain })
        }

        // Log Page View
        nuxtApp.hook("page:finish", () => {
          let eventData = {
            page_path: route.fullPath,
            page_title: document.title,
            page_location: window.location.href,
            domain: domain,
          }
          if (tenantId) {
            eventData.tenant_id = tenantId
          }

          // console.log("[Analytics] ::: Event Data ::: ", eventData)

          logEvent(analytics, "page_view", eventData)
        })

        if (runtimeConfig.public.features.log) {
          console.log("[Plugins] ::: [Analytics] ::: Initialized!")
        }
      } catch (err) {
        console.warn("[Plugins] ::: [Analytics] ::: Init Error!", err.message)
      }
    }
  }

  // Setup VueFire
  // console.log("[Plugins] ::: [Firebase] ::: Setup VueFire!")
  // nuxtApp.vueApp.use(VueFire, {
  //   firebaseApp: app,
  //   modules: [VueFireDatabaseOptionsAPI(), VueFireFirestoreOptionsAPI()],
  // })

  /**
   * CRUD
   */

  const read = (path) => {
    return new Promise((resolve, reject) => {
      get(child(dbRef, path))
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val())
          } else {
            // console.log("[Firebase] ::: Data :: Nothing Found!")
            resolve(null)
          }
        })
        .catch((err) => {
          console.log("[Firebase] ::: Read Error ::", err)
          resolve(null)
        })
    })
  }
  const listen = (path, callback) => {
    onValue(ref(database, path), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val())
      } else {
        callback(null)
      }
    })
  }
  const updateDb = (path, data) => {
    console.log("Update ", path, data)

    return new Promise((resolve, reject) => {
      try {
        update(ref(database, path), data)
        resolve(true)
      } catch (err) {
        console.log("[Firebase] ::: Update Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const pushDb = (path, data) => {
    return new Promise((resolve, reject) => {
      try {
        const newPostKey = push(child(ref(database), path)).key

        let updates = {}
        let newData = data

        if (!newData.id) {
          newData.id = newPostKey
        }

        updates[`${path}/${newPostKey}`] = newData
        update(ref(database), updates)

        resolve(newPostKey)
      } catch (err) {
        console.log("[Firebase] ::: Push Error :: ", err.message)
        resolve(null)
      }
    })
  }
  const deleteDb = (path) => {
    return new Promise((resolve, reject) => {
      try {
        remove(ref(database, path))
        resolve(true)
      } catch (err) {
        resolve(null)
      }
    })
  }

  /**
   * Auth
   */

  const usePresence = (user) => {
    const uid = user.uid
    let tenantId = null
    let mainPath = `/status/${uid}`

    if (!import.meta.client) {
      return
    }
    const router = useRouter()
    const path = router.currentRoute.value.fullPath

    // Multitenancy
    if (
      runtimeConfig.public.features.multitenancy &&
      runtimeConfig.public.features.multitenancy.tenantId
    ) {
      tenantId = runtimeConfig.public.features.multitenancy.tenantId
      mainPath = `/status/${tenantId}/${uid}`
    }

    let userStatusRef = child(dbRef, `${mainPath}/state`)
    let userPageRef = child(dbRef, `${mainPath}/page`)

    // Disconnect cleanup
    onDisconnect(userPageRef).remove()

    // Page Presence
    watch(
      () => path,
      (newPath) => {
        set(userPageRef, {
          path: newPath,
          last_changed: serverTimestamp(),
        })
      },
      { immediate: true }
    )
    // User Online Presence
    const isOfflineForDatabase = {
      state: "offline",
      last_changed: serverTimestamp(),
    }
    const isOnlineForDatabase = {
      state: "online",
      last_changed: serverTimestamp(),
    }
    const connectedRef = child(dbRef, ".info/connected")

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return

      onDisconnect(userStatusRef)
        .set(isOfflineForDatabase)
        .then(() => {
          set(userStatusRef, isOnlineForDatabase)
        })
    })
  }
  const authState = async () => {
    // Use centralized auth composable instead of creating new listeners
    const { waitForAuth } = useFirebaseAuth()
    const user = await waitForAuth()

    // Handle user presence if enabled
    if (user && runtimeConfig.public.features.auth.userPresence) {
      usePresence(user)
    }

    // Update auth store state
    if (!user) {
      useAuthStore().set("user", null)
      useAuthStore().set("userLoggedIn", false)
    }

    return user
  }
  const signUp = (data) => {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          const user = userCredential.user
          resolve(user)
        })
        .catch((err) => {
          console.log("[Firebase] ::: SignUp Error ::", err)

          reject({
            code: err.code,
            msg: err.message,
            error: err,
          })
        })
    })
  }
  const login = (data) => {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          const user = userCredential.user

          resolve(user)
        })
        .catch((err) => {
          console.log("[Firebase] ::: Login Error ::", err)

          reject({
            code: err.code,
            msg: err.message,
            error: err,
          })
        })
    })
  }
  const logout = () => {
    return new Promise((resolve, reject) => {
      signOut(auth)
        .then(() => {
          localStorage.removeItem("cartId")
          localStorage.removeItem("accessToken")

          const store = useAuthStore()
          store.set("userLoggedIn", false)
          store.set("user", false)

          resolve(true)
        })
        .catch((err) => reject(null))
    })
  }
  const loginWithToken = (token) => {
    return new Promise(async (resolve) => {
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          const user = userCredential.user

          console.log(
            "[Firebase] ::: Login With Token ::: Success :: ",
            userCredential
          )

          resolve(user)
        })
        .catch((err) => {
          console.log(
            "[Firebase] ::: Login With Token ::: Error :: ",
            err.message
          )
          resolve(null)
        })
    })
  }
  const loginWithProvider = (id) => {
    return new Promise(async (resolve, reject) => {
      let provider = null

      // Set Auth Provider
      if (id === "google") {
        provider = new GoogleAuthProvider()

        // provider.addScope(
        //   "https://www.googleapis.com/auth/contacts.readonly"
        // )
      }

      signInWithPopup(auth, provider)
        .then((result) => {
          let credential = null

          if (id === "google") {
            credential = GoogleAuthProvider.credentialFromResult(result)
          }

          // const token = credential.accessToken
          const user = result.user
          const additionalUserInfo = getAdditionalUserInfo(result)

          console.log(
            "[Firebase] ::: Google Sign In Success :: ",
            user,
            credential,
            additionalUserInfo
          )

          resolve(user)
        })
        .catch((err) => {
          let credential = null

          // Redirect Fallback
          if (err.code === "auth/popup-blocked") {
            signInWithRedirect(auth, provider)
              .then((result1) => {
                let credential1 = null

                if (id === "google") {
                  credential1 = GoogleAuthProvider.credentialFromResult(result1)
                }

                // const token = credential.accessToken
                const user1 = result1.user
                const additionalUserInfo1 = getAdditionalUserInfo(result1)

                console.log(
                  "[Firebase] ::: Google Sign In Success :: ",
                  user1,
                  credential1,
                  additionalUserInfo1
                )

                resolve(user1)
              })
              .catch((err1) => {
                let credential1 = null

                if (id === "google") {
                  credential1 = GoogleAuthProvider.credentialFromError(err1)
                }

                console.log(
                  "[Firebase] ::: Google Sign In Error ::",
                  err1,
                  credential1
                )

                reject({
                  code: err1.code,
                  msg: err1.message,
                  error: err1,
                })
              })
          } else {
            if (id === "google") {
              credential = GoogleAuthProvider.credentialFromError(err)
            }

            console.log(
              "[Firebase] ::: Google Sign In Error ::",
              err,
              credential
            )

            reject({
              code: err.code,
              msg: err.message,
              error: err,
            })
          }
        })
    })
  }
  const loginAnonymous = () => {
    return new Promise(async (resolve) => {
      auth
        .signInAnonymously()
        .then((userCredential) => {
          const user = userCredential.user
          console.log("[Firebase] ::: Anonymous User ::: ", user)
          resolve(user)
        })
        .catch((err) => {
          console.log("[Firebase] ::: Anon Login Error ::: ", err.message)
          resolve(null)
        })
    })
  }
  const resetPassword = (data) => {
    return new Promise(async (resolve) => {
      try {
        await sendPasswordResetEmail(auth, data.email)
        resolve(true)
      } catch (err) {
        console.log("Firebase ::: Error sending reset email!", err.message)
        resolve(null)
      }
    })
  }
  const verifyResetPassword = (code) => {
    return new Promise(async (resolve) => {
      try {
        await verifyPasswordResetCode(auth, code)
        resolve(true)
      } catch (err) {
        console.log(
          "Firebase ::: Error verifying reset password code!",
          err.message
        )
        resolve(null)
      }
    })
  }
  const confirmResetPassword = (data) => {
    return new Promise(async (resolve) => {
      try {
        await confirmPasswordReset(auth, data.code, data.password)
        resolve(true)
      } catch (err) {
        console.log("Firebase ::: Error confirming new password!", err.message)
        resolve(null)
      }
    })
  }
  const checkProviderRedirect = async () => {
    try {
      const result = await getRedirectResult(auth)

      if (result.user) {
      }
    } catch (err) {
      console.log("[Firebase] ::: Error checking redirect result!", err.message)
    }
  }
  const verifyEmail = async (code) => {
    return new Promise(async (resolve) => {
      const user = auth.currentUser

      if (!user) {
        console.log("[Plugins] ::: [Firebase] ::: User not logged In!")
        resolve(null)
        return
      }

      applyActionCode(auth, code)
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          console.log(
            "[Plugins] ::: [Firebase] ::: Error verifying user email!",
            err
          )

          resolve(null)
        })
    })
  }

  /**
   * User
   */

  const isLoggedIn = () => {
    // const user = useCurrentUser()
    return auth.currentUser
  }
  const getUser = () => {
    return new Promise(async (resolve, reject) => {
      const user = await auth.currentUser

      // console.log("[Plugins] ::: [Firebase] ::: User Profile :: ", user)

      if (user) {
        const userData = await read(`/users/${user.uid}`)

        // console.log("User Data ::: ", userData)

        // Save Initial User Data
        if (!userData) {
          let updates = {
            acceptsMarketing: true,
            createdAt: null,
            email: null,
            emailVerified: user.emailVerified,
            firstName: null,
            lastName: null,
            phone: null,
            uid: user.uid,
            photoURL: null,
          }
          if (user.email) {
            updates.email = user.email
          }
          if (user.photoURL) {
            updates.photoURL
          }
          if (user.displayName) {
            let name = nuxtApp.$utils.splitDisplayName(user.displayName)
            updates.firstName = name.firstName
            updates.lastName = name.lastName
          }
          if (user.phoneNumber) {
            updates.phone = user.phoneNumber
          }
          if (user.metadata) {
            updates.createdAt = user.metadata.createdAt
          }
          await updateDb(`/users/${user.uid}`, updates)

          resolve(updates)
        } else {
          resolve(userData)
        }
      } else {
        reject(null)
      }
    })
  }
  const updateUser = async (data) => {
    return new Promise((resolve, reject) => {
      updateProfile(auth.currentUser, {
        displayName: `${data.firstName} ${data.lastName}`,
        photoURL: data.photoURL ? data.photoURL : null,
        phoneNumber: data.phone ? data.phone : null,
      })
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  const resendEmailVerification = async () => {
    return new Promise((resolve, reject) => {
      sendEmailVerification(auth.currentUser)
        .then(() => {
          resolve(true)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Notifications
   */

  // onMessage(messaging, (payload) => {
  //   console.log("[Firebase] ::: Foreground messaging :: ", payload)
  //   useInAppNotifications().add(payload.notification)
  // })

  // const getUserToken = async () => {
  //   return new Promise(async (resolve) => {
  //     const key = useRuntimeConfig().public.features.firebaseWebPushKey

  //     if (!key) {
  //       console.log(
  //         "[Plugins] ::: [Firebase] ::: Not Setup Yet. Firebase Web Push Key Missing!"
  //       )
  //       resolve(null)
  //       return
  //     }

  //     getToken(messaging, { vapidKey: key })
  //       .then(async (token) => {
  //         console.log(
  //           "[Plugins] ::: [Firebase] ::: FCM Token Success ::",
  //           token
  //         )
  //         resolve(token)
  //       })
  //       .catch((err) => {
  //         console.log(
  //           "[Plugins] ::: [Firebase] ::: FCM Token Error ::",
  //           err.message
  //         )
  //         resolve(null)
  //       })
  //   })
  // }
  // const saveUserToken = async (token) => {
  //   return new Promise(async (resolve) => {
  //     const user = await auth.currentUser

  //     console.log("[Plugins] ::: [Firebase] ::: Save User Token :: ", user)

  //     if (user) {
  //       await updateDb(`/users/${user.uid}`, {
  //         fcmToken: token,
  //       })
  //       resolve(true)
  //     } else {
  //       resolve(null)
  //     }
  //   })
  // }

  // /**
  //  * VueFire
  //  */

  // const bind = (path, type) => {
  //   if (type === "list") {
  //     return useDatabaseList(ref(database, path))
  //   }
  //   return useDatabaseObject(ref(database, path))
  // }

  return {
    provide: {
      fire: {
        auth,
        firestore,
        database,
        dbRef,
        vdbRef,
        ref,
        onChildAdded,
        onChildChanged,
        child,
        off,
        get,
        onValue,
        push,
        // bind,
        actions: {
          // Database
          read,
          listen,
          add: pushDb,
          update: updateDb,
          remove: deleteDb,

          // Auth
          signUp,
          login,
          loginWithToken,
          loginWithProvider,
          loginAnonymous,
          verifyEmail,
          logout,
          isLoggedIn,
          resetPassword,
          verifyResetPassword,
          confirmResetPassword,
          resendEmailVerification,

          // User
          user: getUser,
          authState,
          updateUser,

          // Notifications
          // getUserToken,
          // saveUserToken,
        },
        analytics: analytics,
      },
    },
  }
})
