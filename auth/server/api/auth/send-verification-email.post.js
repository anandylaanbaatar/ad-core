import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const { initializeApp, cert, getApps, getApp } = await import(
    "firebase-admin/app"
  )
  const { getAuth } = await import("firebase-admin/auth")

  try {
    const body = await readBody(event)
    const { email, displayName, tenantUrl, storeName, logoUrl } = body

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      }
    }

    // Check Firebase Admin credentials
    if (
      !process.env.NUXT_FIREBASE_PROJECT_ID ||
      !process.env.NUXT_FIREBASE_CLIENT_EMAIL ||
      !process.env.NUXT_FIREBASE_PRIVATE_KEY
    ) {
      console.error("[SendVerificationEmail] Firebase credentials missing!")
      return {
        success: false,
        error: "Server configuration error",
      }
    }

    // Check Loops API key
    if (!process.env.NUXT_LOOPS_API_KEY) {
      console.error("[SendVerificationEmail] Loops API key missing!")
      return {
        success: false,
        error: "Email service configuration error",
      }
    }

    // Initialize Firebase Admin
    const credentials = {
      projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NUXT_FIREBASE_PRIVATE_KEY.replace(
        /\\n/g,
        "\n"
      ).replace(/\\/g, ""),
    }

    const app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert(credentials),
        })

    const auth = getAuth(app)

    // Generate verification link with custom action URL pointing to storefront
    const actionCodeSettings = {
      url: `${tenantUrl || "https://adcommerce.mn"}/auth/action`,
      handleCodeInApp: false,
    }

    const verificationLink = await auth.generateEmailVerificationLink(
      email,
      actionCodeSettings
    )

    console.log("[SendVerificationEmail] Generated verification link for:", email)

    // Send via Loops transactional email
    const loopsResponse = await $fetch(
      "https://app.loops.so/api/v1/transactional",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NUXT_LOOPS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: {
          transactionalId: "cmjiqqqjz0q2z0iyoi14qmpft",
          email,
          dataVariables: {
            storeName: storeName || "AD Commerce",
            logoUrl: logoUrl || "https://adcommerce.mn/logo.png",
            verificationLink,
          },
        },
      }
    )

    console.log("[SendVerificationEmail] Loops response:", loopsResponse)

    return {
      success: true,
    }
  } catch (err) {
    console.error("[SendVerificationEmail] Error:", err.message)
    return {
      success: false,
      error: err.message,
    }
  }
})
