import path from "node:path"

export default async function siteConfigModule(moduleOptions, nuxt) {
  const siteConfigData = await import(path.resolve("config/site.config.json"), {
    with: { type: "json" },
  })
  let config = siteConfigData.default

  // Commerce
  if (config.theme.type === "commerce") {
    console.log(
      "✅ Site config commerce loaded!",
      process.env.NUXT_SHOPIFY_STORE_DOMAIN,
      config.defaults.siteUrl
    )
  } else {
    console.log("✅ Site config loaded!", config.defaults.siteUrl)
  }
}
