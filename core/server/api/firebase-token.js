import { defineEventHandler, readBody } from "h3"
import path from "node:path"

const { auth } = await import(path.resolve("v1/core/site.config.js"))

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
      !process.env.NUXT_FIREBASE_PRIVATE_KEY ||
      !process.env.NUXT_FIREBASE_DATABASE_URL
    ) {
      console.log(
        "[Firebase] ::: Project id, client email, key or database url missing!"
      )
      return
    }

    const customToken = await auth.createCustomToken(uid)

    return { userToken: customToken }
  } catch (err) {
    console.error("[Firebase] ::: Token error ::: ", err.message)
  }
})
