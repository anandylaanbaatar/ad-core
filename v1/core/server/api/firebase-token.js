import { defineEventHandler, readBody } from "h3"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { uid } = body

    if (!uid) {
      console.log("[Firebase] ::: Token uid missing!")
      return
    }
    if (
      !process.env.NUXT_FIREBASE_PROJECT_ID ||
      !process.env.NUXT_FIREBASE_CLIENT_EMAIL ||
      !process.env.NUXT_FIREBASE_PRIVATE_KEY
    ) {
      console.log("[Firebase] ::: Project id, client email or key missing!")
      return
    }

    // Initialize once
    if (!getApps().length) {
      let privateKey = process.env.NUXT_FIREBASE_PRIVATE_KEY
      privateKey = privateKey.replace(/\\n/g, "\n").replace(/\\/g, "")
      initializeApp({
        credential: cert({
          projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
          clientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      })
    }

    // Generate a custom token for this user
    const customToken = await getAuth().createCustomToken(uid)

    return { userToken: customToken }
  } catch (err) {
    console.error("[Firebase] ::: Token error ::: ", err.message)
  }
})
