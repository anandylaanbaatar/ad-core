/**
 * General
 * Vue Plugins
 */

// Mitt
// https://splidejs.com
// Infinite Loading
// https://sortablejs.github.io/vue.draggable.next/#/transition-example

import { Splide, SplideSlide } from "@splidejs/vue-splide"
import InfiniteLoading from "v3-infinite-loading"
import draggable from "vuedraggable"
import "v3-infinite-loading/lib/style.css"
import mitt from "mitt"
const emitter = mitt()

export default defineNuxtPlugin((nuxtApp) => {
  /**
   * Core Plugins
   */

  // Mitt
  nuxtApp.provide("bus", {
    $on: emitter.on,
    $emit: emitter.emit,
  })

  // Infinite Loading
  nuxtApp.vueApp.component("InfiniteLoading", InfiniteLoading)

  // Draggable
  nuxtApp.vueApp.component("Draggable", draggable)

  // Splide
  nuxtApp.vueApp.component("Splide", Splide)
  nuxtApp.vueApp.component("SplideSlide", SplideSlide)

  /**
   * Feature Based
   * Plugins
   */

  const config = useRuntimeConfig().public.features
  const linkTags = []
  const scriptTags = []

  // Calendar
  if (config.calendar) {
    linkTags.push({
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/@event-calendar/build@4.0.2/dist/event-calendar.min.css",
    })
    scriptTags.push({
      src: "https://cdn.jsdelivr.net/npm/@event-calendar/build@4.0.2/dist/event-calendar.min.js",
    })
  }

  // Editor
  if (config.editor) {
    linkTags.push({
      rel: "stylesheet",
      href: "https://cdn.quilljs.com/1.3.6/quill.snow.css",
    })
    linkTags.push({
      rel: "stylesheet",
      href: "https://cdn.quilljs.com/1.3.6/quill.bubble.css",
    })
    scriptTags.push({
      src: "https://cdn.quilljs.com/1.3.6/quill.min.js",
      defer: true,
    })
  }

  // Add to Head
  if (linkTags.length || scriptTags.length) {
    useHead({
      link: linkTags,
      script: scriptTags,
    })
  }
})
