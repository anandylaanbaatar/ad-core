<template>
  <AppLayout type="app">
    <div class="page auth fullPage">
      <div class="fullPageContent">
        <!-- Loading State -->
        <div v-if="loading" class="c-block verifyEmailBlock">
          <Loader type="sm" />
          <p class="mt-3">Processing...</p>
        </div>

        <!-- Verify Email Mode -->
        <template v-else-if="mode === 'verifyEmail'">
          <div v-if="verified" class="c-block verifyEmailBlock">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
            <h3 class="mb-2">Email Verified!</h3>
            <p class="mb-4">Your email has been successfully verified.</p>
            <Button
              label="Continue"
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="redirect"
            />
          </div>

          <div v-else-if="error" class="c-block verifyEmailBlock">
            <i class="pi pi-times-circle text-4xl text-red-500 mb-4"></i>
            <h3 class="mb-2">Verification Failed</h3>
            <p class="mb-4">{{ errorMessage }}</p>
            <Button
              label="Request New Link"
              severity="secondary"
              icon="pi pi-envelope"
              @click="resendVerification"
              :loading="resending"
            />
          </div>
        </template>

        <!-- Reset Password Mode -->
        <template v-else-if="mode === 'resetPassword'">
          <div class="c-block verifyEmailBlock">
            <i class="pi pi-lock text-2xl mb-4"></i>
            <h3 class="mb-2">Reset Password</h3>

            <template v-if="!passwordReset">
              <p class="mb-4">Enter your new password below.</p>

              <div class="field mb-3" style="max-width: 300px;">
                <Password
                  v-model="newPassword"
                  placeholder="New Password"
                  :feedback="true"
                  toggleMask
                  class="w-full"
                />
              </div>

              <div class="field mb-4" style="max-width: 300px;">
                <Password
                  v-model="confirmPassword"
                  placeholder="Confirm Password"
                  :feedback="false"
                  toggleMask
                  class="w-full"
                />
              </div>

              <Button
                label="Reset Password"
                icon="pi pi-check"
                @click="handleResetPassword"
                :loading="resetting"
                :disabled="!newPassword || newPassword !== confirmPassword"
              />

              <p v-if="error" class="text-red-500 mt-3">{{ errorMessage }}</p>
            </template>

            <template v-else>
              <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
              <p class="mb-4">Your password has been reset successfully.</p>
              <Button
                label="Sign In"
                icon="pi pi-sign-in"
                @click="goToLogin"
              />
            </template>
          </div>
        </template>

        <!-- Recover Email Mode -->
        <template v-else-if="mode === 'recoverEmail'">
          <div class="c-block verifyEmailBlock">
            <template v-if="emailRecovered">
              <i class="pi pi-check-circle text-4xl text-green-500 mb-4"></i>
              <h3 class="mb-2">Email Restored</h3>
              <p class="mb-4">Your email address has been restored to {{ restoredEmail }}.</p>
              <Button
                label="Continue"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="redirect"
              />
            </template>

            <template v-else-if="error">
              <i class="pi pi-times-circle text-4xl text-red-500 mb-4"></i>
              <h3 class="mb-2">Recovery Failed</h3>
              <p class="mb-4">{{ errorMessage }}</p>
            </template>
          </div>
        </template>

        <!-- Invalid/Missing Mode -->
        <template v-else>
          <div class="c-block verifyEmailBlock">
            <i class="pi pi-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <h3 class="mb-2">Invalid Link</h3>
            <p class="mb-4">This link is invalid or has expired.</p>
            <Button
              label="Go Home"
              severity="secondary"
              icon="pi pi-home"
              @click="redirect"
            />
          </div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script>
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  checkActionCode,
  reload,
} from "firebase/auth"

export default {
  data() {
    return {
      loading: true,
      mode: null,
      oobCode: null,
      continueUrl: null,

      // Verify email state
      verified: false,

      // Reset password state
      newPassword: "",
      confirmPassword: "",
      passwordReset: false,
      resetting: false,

      // Recover email state
      emailRecovered: false,
      restoredEmail: null,

      // Error state
      error: false,
      errorMessage: "",

      // Resend state
      resending: false,
    }
  },

  async mounted() {
    const route = useRoute()

    // Extract query parameters
    this.mode = route.query.mode
    this.oobCode = route.query.oobCode
    this.continueUrl = route.query.continueUrl

    if (!this.mode || !this.oobCode) {
      this.loading = false
      return
    }

    // Process based on mode
    switch (this.mode) {
      case "verifyEmail":
        await this.handleVerifyEmail()
        break
      case "resetPassword":
        await this.handleVerifyResetCode()
        break
      case "recoverEmail":
        await this.handleRecoverEmail()
        break
      default:
        this.loading = false
    }
  },

  methods: {
    async handleVerifyEmail() {
      try {
        const auth = this.$fire.auth

        // Apply the verification code - this updates Firebase Auth emailVerified
        await applyActionCode(auth, this.oobCode)

        // If user is currently signed in, reload to get updated emailVerified status
        if (auth.currentUser) {
          await reload(auth.currentUser)
          console.log("[Auth Action] Firebase Auth user reloaded, emailVerified:", auth.currentUser.emailVerified)
        }

        // Update user in Firebase Realtime DB
        const user = await this.$fire.actions.user()
        if (user) {
          await this.$fire.actions.update(`/users/${user.uid}`, {
            emailVerified: true,
          })
          console.log("[Auth Action] Firebase Realtime DB updated for user:", user.uid)

          // Update auth store
          const authStore = useAuthStore()
          if (authStore.user) {
            authStore.user.emailVerified = true
            await authStore.set("user", { ...authStore.user, emailVerified: true })
          }
        } else {
          console.log("[Auth Action] User not logged in - DB will be updated on next login")
        }

        this.verified = true

        // Redirect to homepage after short delay to show success message
        setTimeout(() => {
          this.redirect()
        }, 1500)
      } catch (err) {
        console.error("[Auth Action] Verify email error:", err)
        this.error = true
        this.errorMessage = this.getErrorMessage(err.code)
      } finally {
        this.loading = false
      }
    },

    async handleVerifyResetCode() {
      try {
        const auth = this.$fire.auth
        // Just verify the code is valid, don't apply yet
        await verifyPasswordResetCode(auth, this.oobCode)
        // Code is valid, show password reset form
      } catch (err) {
        console.error("[Auth Action] Verify reset code error:", err)
        this.error = true
        this.errorMessage = this.getErrorMessage(err.code)
      } finally {
        this.loading = false
      }
    },

    async handleResetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.error = true
        this.errorMessage = "Passwords do not match."
        return
      }

      this.resetting = true
      this.error = false

      try {
        const auth = this.$fire.auth
        await confirmPasswordReset(auth, this.oobCode, this.newPassword)
        this.passwordReset = true
      } catch (err) {
        console.error("[Auth Action] Reset password error:", err)
        this.error = true
        this.errorMessage = this.getErrorMessage(err.code)
      } finally {
        this.resetting = false
      }
    },

    async handleRecoverEmail() {
      try {
        const auth = this.$fire.auth

        // Check action code to get the restored email
        const info = await checkActionCode(auth, this.oobCode)
        this.restoredEmail = info.data.email

        // Apply the action code to restore the email
        await applyActionCode(auth, this.oobCode)

        this.emailRecovered = true
      } catch (err) {
        console.error("[Auth Action] Recover email error:", err)
        this.error = true
        this.errorMessage = this.getErrorMessage(err.code)
      } finally {
        this.loading = false
      }
    },

    async resendVerification() {
      this.resending = true

      try {
        await this.$fire.actions.resendEmailVerification()

        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Email Sent",
          detail: "A new verification email has been sent.",
        })
      } catch (err) {
        console.error("[Auth Action] Resend verification error:", err)
        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Error",
          detail: "Failed to send verification email. Please try again.",
        })
      } finally {
        this.resending = false
      }
    },

    redirect() {
      const destination = this.continueUrl || "/"
      this.$bus.$emit("goTo", destination)
    },

    goToLogin() {
      this.$bus.$emit("goTo", "/")
    },

    getErrorMessage(code) {
      const messages = {
        "auth/expired-action-code": "This link has expired. Please request a new one.",
        "auth/invalid-action-code": "This link is invalid or has already been used.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/user-not-found": "No account found with this email.",
        "auth/weak-password": "Password should be at least 6 characters.",
      }

      return messages[code] || "An error occurred. Please try again."
    },
  },
}
</script>
