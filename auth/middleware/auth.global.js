export default defineNuxtRouteMiddleware(async (to, from) => {
  // Client Only
  if (import.meta.client) {
    // console.log("[Middleware] ::: [Auth] ::: Initialized!")

    const nuxtApp = useNuxtApp()
    const authStore = useAuthStore()

    // Firebase Auth
    if (features().auth.type === "firebase") {
      // Use centralized auth composable for cached state
      const { waitForAuth } = useFirebaseAuth()
      const user = await waitForAuth()

      // Logged In User
      if (user && !authStore.user) {
        // Only fetch user data if not already fetched or cache is stale (> 5 min)
        const USER_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
        const shouldFetchUserData =
          !authStore.userDataFetched ||
          !authStore.lastUserFetch ||
          Date.now() - authStore.lastUserFetch > USER_CACHE_DURATION

        if (shouldFetchUserData) {
          // Parallelize independent operations for better performance
          const [userData] = await Promise.all([
            nuxtApp.$fire.actions.user()
          ])

          const newUserData = await authStore.userDataCheck(userData, user)

          authStore.set("user", newUserData)
          authStore.set("userLoggedIn", true)
          authStore.set("userDataFetched", true)
          authStore.set("lastUserFetch", Date.now())
        } else {
          // Use cached user data
          authStore.set("userLoggedIn", true)
        }

        // Commerce User
        if (theme().type === "commerce") {
          await useCommerceStore().setUser()
        }

        // console.log("[Middleware] ::: [Auth] ::: User Set! ", newUserData)
      }
      // Check if email verified!
      if (authStore.user) {
        if (!user.emailVerified) {
          // if (to.path !== "/secure/verify-email") {
          //   return navigateTo({
          //     path: "/secure/verify-email",
          //   })
          // }
        } else if (user.emailVerified && !authStore.user.emailVerified) {
          console.log(
            "[Auth] ::: Middleware :: Check User Email Verified! ",
            user.emailVerified,
            authStore.user.emailVerified
          )
          await nuxtApp.$fire.actions.update(`/users/${user.uid}`, {
            emailVerified: user.emailVerified,
          })
        }
      }
      // Logged Out User
      if (!user && authStore.user) {
        authStore.set("user", null)
        authStore.set("userLoggedIn", false)
      }
      // Redirect if user not logged in.
      if (
        (to.path.includes("/secure") && !user) ||
        (to.path.includes("/admin") && !user)
      ) {
        return navigateTo({
          path: "/",
          query: {
            sidebar: "account",
          },
        })
      }
    }
  }
})
