import { defineEventHandler, readBody } from "h3"
import path from "node:path"

export default defineEventHandler(async (event) => {
  const { useCredential } = await import(path.resolve("v1/core/site.config.js"))
  const body = await readBody(event)

  const integrationId = body.integrationId
  const tenantId = body.tenantId
  const storeId = body.storeId

  // Missing Ids
  if (!tenantId || !storeId || !integrationId) {
    return { success: false, error: "Missing params!" }
  }

  const creds = await useCredential(tenantId, storeId, integrationId)

  // Not Found
  if (!creds) {
    return { success: false, error: "Credentials not found!" }
  }

  return {
    success: true,
    credentials: creds,
  }
})
