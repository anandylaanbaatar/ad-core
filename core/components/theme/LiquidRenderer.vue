<template>
  <div class="liquid-renderer" v-if="!error">
    <div v-html="renderedHtml"></div>
  </div>
  <div v-else class="liquid-renderer liquid-renderer--error">
    <div class="error-message">
      <h3>Template Rendering Error</h3>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup>
/**
 * Liquid Renderer Component
 *
 * Renders Liquid templates within Vue components
 * Automatically updates when template or context changes
 */

const props = defineProps({
  // Liquid template string
  template: {
    type: String,
    required: true
  },

  // Additional context data (merged with global context)
  context: {
    type: Object,
    default: () => ({})
  },

  // Enable live preview mode (design_mode)
  designMode: {
    type: Boolean,
    default: false
  },

  // Theme settings (from theme_settings collection)
  themeSettings: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['rendered', 'error'])

const { $liquid } = useNuxtApp()
const liquidContext = useLiquidContext()

const renderedHtml = ref('')
const error = ref(null)
const isRendering = ref(false)

/**
 * Render Liquid template
 */
async function render() {
  if (!props.template || isRendering.value) return

  isRendering.value = true
  error.value = null

  try {
    // Build complete context
    const fullContext = {
      ...liquidContext,
      ...props.context,
      settings: {
        ...liquidContext.settings,
        ...props.themeSettings
      },
      request: {
        ...liquidContext.request,
        design_mode: props.designMode
      }
    }

    // Render template
    renderedHtml.value = await $liquid.render(props.template, fullContext)

    emit('rendered', renderedHtml.value)
  } catch (err) {
    console.error('[LiquidRenderer] Render error:', err)
    error.value = err.message || 'Unknown rendering error'
    emit('error', error.value)
  } finally {
    isRendering.value = false
  }
}

// Watch for template changes
watch(() => props.template, render, { immediate: true })

// Watch for context changes (deep)
watch(() => props.context, render, { deep: true })

// Watch for theme settings changes
watch(() => props.themeSettings, render, { deep: true })

// Initial render
onMounted(() => {
  if (!renderedHtml.value) {
    render()
  }
})
</script>

<style scoped lang="scss">
.liquid-renderer {
  width: 100%;

  // Reset styles to prevent conflicts
  &:not(.liquid-renderer--error) {
    all: revert;
  }

  &--error {
    padding: 2rem;
    background: #fee;
    border: 2px solid #f00;
    border-radius: 4px;
    margin: 1rem 0;

    .error-message {
      h3 {
        color: #c00;
        margin: 0 0 1rem;
        font-size: 1.25rem;
      }

      pre {
        background: #fff;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.5;
        color: #333;
      }
    }
  }
}
</style>
