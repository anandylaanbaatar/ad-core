import { initializeApp } from "firebase/app"
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import {
  getDatabase,
  ref,
  ref as vdbRef,
  child,
  get,
  onValue,
  push,
  update,
  remove,
  // runTransaction
} from "firebase/database"

import {
  useCurrentUser,
  useDatabaseList,
  useDatabaseObject,
  useFirebaseAuth,
  VueFire,
  VueFireAuth,
  VueFireDatabaseOptionsAPI,
  VueFireFirestoreOptionsAPI,
} from "vuefire"

export default defineNuxtPlugin((nuxtApp) => {
  const CONFIG = useState(
    "firebaseConfig",
    () => useRuntimeConfig().public.firebase
  )

  if (!useRuntimeConfig().public.features.firebase) {
    // console.log("[Plugins] ::: [Firebase] ::: Not Initialized!")
    return
  }
  if (!CONFIG.value) {
    console.log("[Firebase] ::: Config not found! :: Not Initialized")
    return
  }

  const config = CONFIG.value
  const firebaseConfig = config
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  // const auth = useFirebaseAuth()
  const firestore = getFirestore(app)
  const database = getDatabase(app)
  const dbRef = ref(getDatabase(app))

  // console.log("[Firebase] ::: Initialized! :: User ", auth.currentUser)

  // Setup VueFire
  nuxtApp.vueApp.use(VueFire, {
    firebaseApp: app,
    modules: [
      VueFireAuth(),
      VueFireDatabaseOptionsAPI(),
      VueFireFirestoreOptionsAPI(),
    ],
  })

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
            console.log("[Firebase] ::: Data :: Nothing Found!")
            reject(null)
          }
        })
        .catch((err) => {
          console.log("[Firebase] ::: Error ::", err)
          reject(null)
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
    return new Promise((resolve, reject) => {
      try {
        update(ref(database, path), data)
        resolve(true)
      } catch (err) {
        reject(null)
      }
    })
  }
  const deleteDb = (path) => {
    return new Promise((resolve, reject) => {
      try {
        remove(ref(database, path))
        resolve(true)
      } catch (err) {
        reject(null)
      }
    })
  }

  /**
   * Auth
   */

  const signUp = (data) => {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          const user = userCredential.user
          resolve(user)
        })
        .catch((err) => {
          console.log("[Firebase] ::: Error ::", err)

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
          console.log("[Firebase] ::: Error ::", err)

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
  const loginWithGoogle = () => {
    return new Promise(async (resolve, reject) => {
      const gogoleAuthProvider = new GoogleAuthProvider()
      gogoleAuthProvider.addScope(
        "https://www.googleapis.com/auth/contacts.readonly"
      )

      signInWithPopup(auth, gogoleAuthProvider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result)
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
          const credential = GoogleAuthProvider.credentialFromError(err)
          console.log("[Firebase] ::: Google Sign In Error ::", err, credential)

          reject({
            code: err.code,
            msg: err.message,
            error: err,
          })
        })
    })
  }
  const authState = () => {
    console.log("[Firebase] ::: Plugins :: Auth State Initialized!")

    // const store = useAuthStore()

    // onAuthStateChanged(auth, async (user) => {
    //   if (user) {
    //     console.log("[Firebase] ::: Plugins :: Logged In!")

    //     // const user = await getUser()

    //     // if (user) {
    //     //   await store.set("user", user)
    //     // }
    //     // await store.set("userLoggedIn", true)
    //   } else {
    //     console.log("[Firebase] ::: Plugins :: Logged Out!")
    //     // await store.set("userLoggedIn", false)
    //   }
    // })
  }

  /**
   * User
   */

  const isLoggedIn = () => {
    const user = useCurrentUser()
    return user
  }
  const getUser = () => {
    return new Promise(async (resolve, reject) => {
      const user = await getCurrentUser()

      if (user) {
        const userData = await read(`/users/${user.uid}`)

        resolve(userData)
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
   * VueFire
   */

  const bind = (path, type) => {
    if (type === "list") {
      return useDatabaseList(ref(database, path))
    }
    return useDatabaseObject(ref(database, path))
  }

  return {
    provide: {
      fire: {
        auth,
        firestore,
        database,
        dbRef,
        vdbRef,
        ref,
        child,
        get,
        onValue,
        push,
        bind,
        onAuthStateChanged,
        actions: {
          read,
          listen,
          update: updateDb,
          remove: deleteDb,
          signUp: signUp,
          login: login,
          loginWithGoogle: loginWithGoogle,
          logout: logout,
          isLoggedIn,
          user: getUser,
          currentUser: useCurrentUser,
          updateUser,
          resendEmailVerification,
        },
      },
    },
  }
})
