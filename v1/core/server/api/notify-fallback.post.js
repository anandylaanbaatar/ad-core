import { defineEventHandler, readBody } from "h3"
import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

/**
 * Main Request
 */

export default defineEventHandler(async (event) => {
  const { type, notification } = await readBody(event)

  console.log("Notify fallback :: ", type, notification)

  try {
    if (type === "push") {
      return { success: await sendPush(notification) }
    }

    if (type === "slack") {
      await sendSlack(notification)
      return { success: true }
    }

    if (type === "email") {
      await sendEmailViaLoops(notification)
      return { success: true }
    }

    return { success: false, error: "Unknown type" }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

/**
 * Types if Notifications
 */

async function sendPush(notification) {
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

  // console.log("Send Push ::: ", notification)

  try {
    const token = notification.fcmToken
    const title = notification.title
    const message = notification.body

    const res = await getMessaging().send({
      token: token,
      notification: {
        title: title,
        body: message,
      },
    })

    return { success: true, res }
  } catch (err) {
    console.log("FCM error ::: ", err.message)
    return { success: false, error: err.message }
  }
}

async function sendSlack(notification) {
  await $fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NUXT_SLACK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: {
      channel: notification.slackUserId,
      text: `${notification.title}: ${notification.body}`,
    },
  })
}

async function sendEmailViaLoops(notification) {
  await $fetch("https://app.loops.so/api/v1/transactional", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NUXT_LOOPS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: {
      userId: notification.userId,
      email: notification.email,
      template: "alert",
      dataVariables: {
        title: notification.title,
        body: notification.body,
      },
    },
  })
}
