import {
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  generateRegistrationOptions,
  generateAuthenticationOptions,
} from "@simplewebauthn/server"
import { readBody } from "h3"

const verifyRegistration = async (body) => {
  return new Promise(async (resolve) => {
    const verification = await verifyRegistrationResponse({
      response: body.res,
      expectedChallenge: "stored-challenge",
      expectedOrigin: "https://localhost:3001",
      expectedRPID: "localhost",
      authenticator: {},
    })

    console.log("[WebAuthn] ::: Verify Registration ::: ", verification)

    if (verification.verified) {
      resolve(true)
    }
    resolve(false)
  })
}
const verifyAuthentication = async (body) => {
  return new Promise(async (resolve) => {
    const verification = await verifyAuthenticationResponse({
      response: body.res,
      expectedChallenge: "stored-challenge",
      expectedOrigin: "https://localhost:3001",
      expectedRPID: "localhost",
      authenticator: {},
    })

    console.log("[WebAuthn] ::: Verify Authentication ::: ", verification)

    if (verification.verified) {
      resolve(true)
    }
    resolve(false)
  })
}
const generateOptions = async (body) => {
  return new Promise(async (resolve) => {
    const optionItems = {
      rpName: "App Name",
      rpID: "localhost",
      userID: "123",
      userName: "user@email.com",
    }

    if (body.type === "registrationOptions") {
      const options = generateRegistrationOptions(optionItems)
      resolve(options)
    } else if (body.type === "authenticationOptions") {
      const options = generateAuthenticationOptions(optionItems)
      resolve(options)
    }
    resolve(null)
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const type = body.type

  if (type === "registrationOptions") {
    const options = generateOptions(type)
    res.status(200).json(options)
  } else if (type === "authenticationOptions") {
    const options = generateOptions(type)
    res.status(200).json(options)
  } else if (type === "verifyRegistration") {
    const verification = await verifyRegistration(body)
    res.status(200).json(verification)
  } else if (type === "verifyAuthentication") {
    const verification = await verifyAuthentication(body)
    res.status(200).json(verification)
  }

  res.status(400).json({
    error: "Failed",
  })
})
