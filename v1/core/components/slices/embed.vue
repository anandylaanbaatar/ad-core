<template>
  <div v-if="embed" class="c-embed">
    <PrismicEmbed :field="data.primary.embed"></PrismicEmbed>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },

  computed: {
    embed() {
      if (this.data) {
        if (this.data.primary && this.data.primary.embed) {
          return this.data.primary.embed
        }
      }
      return
    },
  },

  methods: {
    getEmbedUrl(embed) {
      if (embed.provider_name === "YouTube") {
        let start = embed.html.indexOf("src=") + 5
        let end = embed.html.indexOf('oembed"') + 6
        let embedUrl = embed.html.substring(start, end)
        let id = embedUrl.substring(
          embedUrl.indexOf("embed/") + 6,
          embedUrl.indexOf("?feature")
        )
        let fullUrl = `<iframe src="https://www.youtube.com/embed/${id}?si=xShOsp0-Y8_gCalT&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`

        return fullUrl
      } else {
        return embed.html
      }
    },
  },
}
</script>
