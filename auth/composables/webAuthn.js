import { startAuthentication, startRegistration } from "@simplewebauthn/browser"

export function useWebAuthn() {
  const register = async () => {
    // 1. Get Options
    const { options } = await useFetch(`/api/webauthn`, {
      method: "POST",
      body: {
        type: "registrationOptions",
      },
    })
    // 2. Start Registration
    const response = await startRegistration(options.value)
    // 3. Verify Registration
    const verify = await $fetch(`/api/webauthn`, {
      method: "POST",
      body: {
        type: "verifyRegistration",
        res: response,
      },
    })

    // 4. Get Firebase Token & Login
    if (verify) {
      console.log("Verification ::: ", verify)
    }

    return
  }
  const login = async () => {
    // 1. Get Options
    const { options } = await useFetch(`/api/webauthn`, {
      method: "POST",
      body: {
        type: "authenticationOptions",
      },
    })
    // 2. Start Authentication
    const response = await startAuthentication(options.value)
    const verify = await $fetch(`/api/webauthn/verify-authentication`, {
      method: "POST",
      body: {
        type: "verifyAuthentication",
        res: response,
      },
    })

    if (verify) {
      console.log("Verification ::: ", verify)
    }

    return
  }

  return {
    register,
    login,
  }
}
