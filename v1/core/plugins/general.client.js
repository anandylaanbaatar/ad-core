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

  // return {
  //   provide: {
  //     Splide,
  //     SplideSlide,
  //   },
  // }
})
