import { ref, computed } from 'vue'

// Global state - single source of truth for auth
const authState = ref({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  lastChecked: null
})

// Flag to ensure listener is only set up once
let listenerInitialized = false
let unsubscribe = null

/**
 * Centralized Firebase Authentication Composable
 *
 * Provides a single source of truth for auth state across the application.
 * Uses cached state to avoid redundant Firebase API calls on every route navigation.
 *
 * Benefits:
 * - Single onAuthStateChanged listener (no duplicates)
 * - Cached auth state with timestamp validation
 * - Reactive state accessible from anywhere in the app
 * - Automatic cleanup on unmount
 * - Syncs with Pinia auth store
 */
export const useFirebaseAuth = () => {
  const nuxtApp = useNuxtApp()
  const $fire = nuxtApp.$fire

  /**
   * Initialize the auth state listener (called once on app start)
   */
  const initialize = () => {
    if (listenerInitialized) {
      return
    }

    // Get fresh reference to $fire (it might not be available on first call)
    const nuxtApp = useNuxtApp()
    const $fire = nuxtApp.$fire

    if (!$fire?.auth) {
      // Schedule a retry instead of failing
      setTimeout(() => {
        if (!listenerInitialized) {
          initialize()
        }
      }, 100)
      return
    }

    listenerInitialized = true

    // Set up single auth state listener
    unsubscribe = $fire.auth.onAuthStateChanged(async (user) => {
      // Update composable state first (synchronous)
      authState.value = {
        user,
        isAuthenticated: !!user,
        isLoading: false,
        isInitialized: true,
        lastChecked: Date.now()
      }

      // Sync with Pinia store (async but don't block)
      if (user) {
        // User is logged in - fetch and set user data in background
        $fire.actions.user()
          .then((userData) => {
            if (userData) {
              const authStore = useAuthStore()
              authStore.set('user', userData)
              authStore.set('userLoggedIn', true)
              authStore.set('authInitialized', true)
            }
          })
          .catch((error) => {
            console.error('[useFirebaseAuth] Error fetching user data:', error)
          })
      } else {
        // User is logged out - clear store immediately
        try {
          const authStore = useAuthStore()
          authStore.set('user', null)
          authStore.set('userLoggedIn', false)
          authStore.set('authInitialized', true)
        } catch (error) {
          console.error('[useFirebaseAuth] Error clearing store:', error)
        }
      }
    })
  }

  /**
   * Wait for auth state to be initialized
   * Returns immediately if already initialized (instant on subsequent calls)
   */
  const waitForAuth = async () => {
    // If already initialized, return immediately (no waiting!)
    if (authState.value.isInitialized) {
      return authState.value.user
    }

    // Only wait for initialization on first call
    return new Promise((resolve) => {
      // Check if it initialized while we were setting up the promise
      if (authState.value.isInitialized) {
        resolve(authState.value.user)
        return
      }

      const checkInterval = setInterval(() => {
        if (authState.value.isInitialized) {
          clearInterval(checkInterval)
          resolve(authState.value.user)
        }
      }, 50)

      // Timeout after 3 seconds (only affects first load)
      setTimeout(() => {
        clearInterval(checkInterval)
        // Force initialization state to prevent infinite waiting
        authState.value = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          lastChecked: Date.now()
        }
        resolve(null)
      }, 3000)
    })
  }

  /**
   * Force refresh auth state (useful for testing or manual refresh)
   */
  const refreshAuthState = async () => {
    // Get fresh reference to $fire
    const nuxtApp = useNuxtApp()
    const $fire = nuxtApp.$fire

    if (!$fire?.auth?.currentUser) {
      authState.value = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        lastChecked: Date.now()
      }

      // Sync with store
      try {
        const authStore = useAuthStore()
        authStore.set('user', null)
        authStore.set('userLoggedIn', false)
        authStore.set('authInitialized', true)
      } catch (error) {
        console.error('[useFirebaseAuth] Error syncing null user to store:', error)
      }

      return null
    }

    try {
      await $fire.auth.currentUser.reload()
      const userData = await $fire.actions.user()

      authState.value = {
        user: $fire.auth.currentUser,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        lastChecked: Date.now()
      }

      // Sync with store
      try {
        const authStore = useAuthStore()
        if (userData) {
          authStore.set('user', userData)
          authStore.set('userLoggedIn', true)
          authStore.set('authInitialized', true)
        }
      } catch (error) {
        console.error('[useFirebaseAuth] Error syncing refreshed user to store:', error)
      }

      return $fire.auth.currentUser
    } catch (error) {
      console.error('[useFirebaseAuth] Error refreshing auth state:', error)
      return authState.value.user
    }
  }

  /**
   * Cleanup listener (called on app unmount)
   */
  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
      listenerInitialized = false
    }
  }

  // Computed properties for easy access
  const user = computed(() => authState.value.user)
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const isLoading = computed(() => authState.value.isLoading)
  const isInitialized = computed(() => authState.value.isInitialized)

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    isInitialized,

    // Methods
    initialize,
    waitForAuth,
    refreshAuthState,
    cleanup
  }
}
