import { defineEventHandler, readBody } from "h3"

export default defineEventHandler(async (event) => {
  const { initializeApp, cert, getApps, getApp } = await import(
    "firebase-admin/app"
  )
  const { getAuth } = await import("firebase-admin/auth")

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
      !process.env.NUXT_FIREBASE_PRIVATE_KEY ||
      !process.env.NUXT_FIREBASE_DATABASE_URL
    ) {
      console.log(
        "[Firebase] ::: Project id, client email, key or database url missing!"
      )
      return
    }
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
    const customToken = await auth.createCustomToken(uid)

    return { userToken: customToken }
  } catch (err) {
    console.error("[Firebase] ::: Token error ::: ", err.message)
    return null
  }
})
