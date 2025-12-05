export default defineNuxtPlugin((nuxtApp) => {
  // Intersection Observer for lazy loading
  const observerOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.01,
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target
        const imageUrl = element.getAttribute("data-lazy-bg")

        if (imageUrl) {
          // Create a new image to preload
          const img = new Image()
          img.onload = () => {
            element.style.backgroundImage = `url('${imageUrl}')`
            element.classList.add("lazy-loaded")
            element.classList.remove("lazy-loading")
          }
          img.onerror = () => {
            element.classList.add("lazy-error")
            element.classList.remove("lazy-loading")
          }
          img.src = imageUrl
        }

        observer.unobserve(element)
      }
    })
  }, observerOptions)

  // Custom directive for lazy loading background images
  nuxtApp.vueApp.directive("lazy-bg", {
    mounted(el, binding) {
      if (!binding.value) return

      // Add loading class
      el.classList.add("lazy-loading")

      // Store the image URL in a data attribute
      el.setAttribute("data-lazy-bg", binding.value)

      // Start observing
      imageObserver.observe(el)
    },
    updated(el, binding) {
      if (!binding.value) return

      // If the URL has changed and hasn't been loaded yet
      if (
        binding.value !== binding.oldValue &&
        !el.classList.contains("lazy-loaded")
      ) {
        el.setAttribute("data-lazy-bg", binding.value)
      }
    },
    unmounted(el) {
      imageObserver.unobserve(el)
    },
  })

  console.log("[Plugins] ::: [Lazy Loading] ::: Initialized!")
})
