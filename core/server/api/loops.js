import { defineEventHandler, readBody } from "h3"

const BASE_URL = `https://app.loops.so/api/v1`

async function loopsUserSearch(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.email) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/contacts/find?email=${body.email}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    if (res && res.length > 0) {
      const contact = res.find((i) => i.email === body.email)

      if (contact) {
        resolve(contact)
      }
    }

    resolve(null)
  })
}
async function loopsUserCreate(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.data) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/contacts/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
    })

    if (res && res.id) {
      resolve(res.id)
    }

    resolve(null)
  })
}
async function loopsUserUpdate(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.data) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/contacts/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
    })

    if (res && res.id) {
      resolve(res.id)
    }

    resolve(null)
  })
}
async function loopsSubscribeToMailingList(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.data) {
      resolve(null)
      return
    }

    const data = body.data
    const formData = `email=${encodeURIComponent(data.email)}&mailingLists=${encodeURIComponent(data.listId)}`
    const reqUrl = `https://app.loops.so/api/newsletter-form/${data.formId}`

    const res = await $fetch(reqUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })

    if (res) {
      resolve(res)
    }

    resolve(null)
  })
}
async function loopsMailingLists() {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/lists`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (res) {
      resolve(res)
    }

    resolve(null)
  })
}
async function loopsTransactionalEmailSend(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.data) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/transactional`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
    })

    if (res) {
      resolve(res)
    }

    resolve(null)
  })
}
async function loopsTransactionalEmailList(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    let limit = body.limit || 50

    const res = await $fetch(`${BASE_URL}/transactional?perPage=${limit}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (res) {
      resolve(res)
    }

    resolve(null)
  })
}
async function loopsSendEvents(body) {
  return new Promise(async (resolve) => {
    const API_KEY = process.env.NUXT_LOOPS_API_KEY

    if (!API_KEY) {
      resolve(null)
      return
    }
    if (!body.data) {
      resolve(null)
      return
    }

    const res = await $fetch(`${BASE_URL}/events/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body.data),
    })

    if (res) {
      resolve(res)
    }

    resolve(null)
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    let results = null

    if (body.type === "loopsUserSearch") {
      results = await loopsUserSearch(body)
    } else if (body.type === "loopsUserCreate") {
      results = await loopsUserCreate(body)
    } else if (body.type === "loopsUserUpdate") {
      results = await loopsUserUpdate(body)
    } else if (body.type === "loopsSubscribeToMailingList") {
      results = await loopsSubscribeToMailingList(body)
    } else if (body.type === "loopsMailingLists") {
      results = await loopsMailingLists(body)
    } else if (body.type === "loopsTransactionalEmailSend") {
      results = await loopsTransactionalEmailSend(body)
    } else if (body.type === "loopsTransactionalEmailList") {
      results = await loopsTransactionalEmailList(body)
    } else if (body.type === "loopsSendEvents") {
      results = await loopsSendEvents(body)
    }

    return { success: true, results: results }
  } catch (err) {
    return { success: false, error: err.message }
  }
})
