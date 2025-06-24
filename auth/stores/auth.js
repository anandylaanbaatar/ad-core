import { defineStore } from "pinia"

export const useAuthStore = defineStore("auth", {
  id: "auth-store",

  state: () => ({
    users: null,
    user: null,
    userLoggedIn: false,
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },

    async logout() {
      const config = useRuntimeConfig()
      const nuxtApp = useNuxtApp()

      if (config.public.features.auth.type === "shopify") {
        await nuxtApp.$shopify.logout()
      } else if (config.public.features.auth.type === "firebase") {
        await nuxtApp.$fire.actions.logout()
      }

      this.set("user", null)
      this.set("userLoggedIn", false)

      if (theme().type === "commerce") {
        if (useCommerceStore().shopifyUser) {
          useCommerceStore().set("shopifyUser", null)
        }
      }

      nuxtApp.$bus.$emit("sidebarGlobalClose")
      nuxtApp.$bus.$emit("toast", {
        summary: "Logout",
        detail: "Successfully logged out.",
      })
      nuxtApp.$bus.$emit("goTo", "/")
    },
    async setUsers() {
      // console.log("[Store] ::: [Auth] ::: Set Users!")

      if (integrations().firebase) {
        const users = await useNuxtApp().$fire.actions.read("/users")

        if (users) {
          let allUsers = []

          for (const [key, value] of Object.entries(users)) {
            allUsers.push(value)
          }

          // Multitenancy
          if (features().multitenancy && features().multitenancy.tenantId) {
            const tenantId = features().multitenancy.tenantId
            allUsers = allUsers.filter((i) => i[tenantId])
          }

          this.users = allUsers
        }
      }
    },
    async setUser(user) {
      // console.log("[Store] ::: [Auth] ::: Set User!", user)

      if (features().auth.type === "firebase") {
        await this.setUserFirebase(user)
      }
      if (features().auth.connect && features().auth.connect.shopify) {
        if (useCommerceStore()) {
          await useCommerceStore().setUser(user)
        }
      }
    },

    // Getters
    async getUserByEmail(email) {
      if (!this.users) return null

      return new Promise(async (resolve) => {
        const user = this.users.find((i) => i.email === email)
        if (user) {
          resolve(user)
        } else {
          resolve(null)
        }
      })
    },
    getUserById(id) {
      if (!this.users) return null

      const user = this.users.find((i) => i.uid === id)

      if (user) {
        return user
      }
      return null
    },

    /**
     * Firebase
     */

    async setUserFirebase(user) {
      if (user) {
        this.set("user", user)
        this.set("userLoggedIn", true)
        return
      }

      const nuxtApp = useNuxtApp()

      if (nuxtApp.$fire.actions.isLoggedIn()) {
        const userData = await nuxtApp.$fire.actions.user()

        if (userData) {
          this.set("user", userData)
          this.set("userLoggedIn", true)
        }
      }
    },
    async saveUserFirebase(user) {
      let updates = {
        uid: user.uid,
        email: user.email ? user.email : null,
        emailVerified: user.emailVerified ? user.emailVerified : false,
        firstName: user.firstName ? user.firstName : null,
        lastName: user.lastName ? user.lastName : null,
        displayName: user.displayName ? user.displayName : null,
        photoURL: user.photoURL ? user.photoURL : null,
        phone: user.phoneNumber ? user.phoneNumber : null,
        phoneCode: user.phoneCode ? user.phoneCode : null,
        createdAt: user.metadata.createdAt,
        lastLoginAt: user.metadata.lastLoginAt,
        acceptsMarketing: user.acceptsMarketing ? user.acceptsMarketing : true,
        username: user.username ? user.username : null,
      }
      if (!user.username && !updates.username && user.email) {
        updates.username = user.email.split("@")[0]
      }
      if (user.phone && !updates.phone) {
        updates.phone = user.phone
      }
      if (updates.phone) {
        if (!updates.phone.includes("+")) {
          updates.phone = `${updates.phoneCode}${updates.phone}`
        }
      }
      if (user.providerData && user.providerData.length > 0) {
        updates.providerId = user.providerData[0].providerId
      }
      if (user.roles) {
        updates.roles = user.roles
      }
      if (user.connect) {
        if (user.connect.shopify) {
          updates.connect = {
            shopify: user.connect.shopify,
          }
        }
      }

      console.log("Save User Firebase ::: ", user)

      await useNuxtApp().$fire.actions.update(`/users/${user.uid}`, updates)
      await this.setUserFirebase()
    },
    async userEmailVerified(user) {
      const nuxtApp = useNuxtApp()

      await nuxtApp.$fire.actions.update(
        `/users/${user.uid}/emailVerified`,
        true
      )
      this.user.emailVerified = true

      nuxtApp.$bus.$emit("toast", {
        severity: "success",
        summary: "Success",
        detail: "Successfully verified email address.",
      })
      nuxtApp.$bus.$emit("sidebarGlobalClose")
      nuxtApp.$bus.$emit("goTo", "/")
    },
    async userDataCheck(userData, user) {
      const uid = userData.uid
      let newUserData = userData
      let updates = {}

      /**
       * General
       */

      // Set User Tenants
      if (features().multitenancy && features().multitenancy.tenantId) {
        const tenants = userData.tenants ? userData.tenants : []
        const tenantId = features().multitenancy.tenantId

        if (tenantId && !tenants.includes(tenantId)) {
          tenants.push(tenantId)

          updates.tenants = tenants
          newUserData.tenants = tenants
        }
      }
      // Check if User Roles Set
      if (!userData.roles) {
        const roles = ["user"]

        updates.roles = roles
        newUserData.roles = roles
      }
      // Check Name
      if (userData.displayName && !userData.firstName && !userData.lastName) {
        const fullName = useNuxtApp().$utils.splitDisplayName(
          userData.displayName
        )

        if (fullName) {
          if (fullName.firstName) {
            updates.firstName = fullName.firstName
            newUserData.firstName = fullName.firstName
          }
          if (fullName.lastName) {
            updates.lastName = fullName.lastName
            newUserData.lastName = fullName.lastName
          }
        }
      }
      if (!userData.displayName && userData.firstName && userData.lastName) {
        updates.displayName = `${userData.firstName} ${userData.lastName}`
      }
      // Check Photo Url
      if (!userData.photoURL) {
        if (user && user.photoURL) {
          updates.photoURL = user.photoURL
        }
      }

      /**
       * Commerce & Payment
       */

      // Check if Shopify Customer Set
      if (features().auth.connect && features().auth.connect.shopify) {
        await useCommerceStore().setUser(userData)
      }
      // Check if Stripe Customer Id Set
      if (integrations().stripe && userData.email) {
        const customerId = await usePaymentStore().setStripeCustomerId(userData)

        // console.log(
        //   "[Store] ::: [Auth] ::: Stripe Customer Id ::: ",
        //   customerId
        // )
      }

      /**
       * Notifications
       */

      // Check Loops User Set
      if (integrations().loops && userData.email) {
        if (features().notifications.loops && useNuxtApp().$notifications) {
          let isSet = false

          // Check Loops User Id
          if (features().multitenancy && features().multitenancy.tenantId) {
            const tenantId = features().multitenancy.tenantId

            if (userData[tenantId]) {
              if (userData[tenantId].loopsUserId) {
                const userId = userData[tenantId].loopsUserId
                isSet = true

                // console.log("[Store] ::: [Auth] ::: Loops User Id :::", userId)
              }
            }
          } else {
            if (userData.loopsUserId) {
              const userId = userData.loopsUserId
              isSet = true

              console.log("[Store] ::: [Auth] ::: Loops User Id :::", userId)
            }
          }

          // Check Loops User
          if (!isSet) {
            let userId = null
            const loopUser = await useNuxtApp().$notifications.loops.user.find(
              userData.email
            )

            // Check Mailing List
            let mailingLists = {}
            mailingLists[features().notifications.loops.listId] = true
            let userUpdateData = {
              userId: userData.uid,
              email: userData.email,
              firstName: userData.firstName ? userData.firstName : null,
              lastName: userData.lastName ? userData.lastName : null,
              mailingLists: mailingLists,
            }

            // Create User
            if (!loopUser) {
              userId =
                await useNuxtApp().$notifications.loops.user.create(
                  userUpdateData
                )

              console.log(
                "[Store] ::: [Auth] ::: New Loops User Id :::",
                userId
              )

              // Update User
            } else {
              let isUpdate = false

              if (loopUser.mailingLists) {
                if (
                  !loopUser.mailingLists[features().notifications.loops.listId]
                ) {
                  isUpdate = true
                }
              }

              if (isUpdate) {
                userId =
                  await useNuxtApp().$notifications.loops.user.update(
                    userUpdateData
                  )

                console.log(
                  "[Store] ::: [Auth] ::: Found Loops User Id and Updated :::",
                  userId
                )
              } else {
                // console.log(
                //   "[Store] ::: [Auth] ::: Found Loops User Id not Updated :::",
                //   userId
                // )
              }
            }

            // Add to updates
            if (userId) {
              if (features().multitenancy && features().multitenancy.tenantId) {
                const tenantId = features().multitenancy.tenantId

                if (!userData[tenantId]) {
                  updates[tenantId] = {
                    loopsUserId: userId,
                  }
                  newUserData[tenantId] = {
                    loopsUserId: userId,
                  }
                } else {
                  updates[tenantId] = userData[tenantId]
                  updates[tenantId].loopsUserId = userId
                  newUserData[tenantId].loopsUserId = userId
                }
              } else {
                updates.loopsUserId = userId
                newUserData.loopsUserId = userId
              }
            }
          }
        }
      }

      // Update User Data
      if (Object.keys(updates).length > 0) {
        await useNuxtApp().$fire.actions.update(`/users/${uid}`, updates)
      }

      // console.log("[Store] ::: [Auth] ::: User Data Check ::", userData)

      return newUserData
    },
  },
})
