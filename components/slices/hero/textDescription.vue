<template>
  <div v-if="item" class="c-textBlock" :class="{ large: item.is_large }">
    <div class="container">
      <div class="content">
        <div class="c-text">
          <i v-if="item.icon" class="pi mb-2" :class="item.icon"></i><br />
          <Tag v-if="item.tag" class="c-custom-tag mb-2">{{ item.tag }}</Tag>

          <p v-if="item.sub_title" class="mb-4">{{ item.sub_title }}</p>

          <div v-if="item.title" class="mb-4">
            <PrismicRichText :field="item.title" />
          </div>
          <div v-if="item.description" class="mb-4">
            <PrismicRichText :field="item.description" />
          </div>

          <Button
            v-if="item.link && item.link.url"
            icon="pi pi-arrow-right"
            iconPos="right"
            :label="item.link.text"
            :class="{
              'c-custom-button': item.link.variant === 'Custom',
              primary: item.link.variant === 'Primary',
              secondary: item.link.variant === 'Secondary',
            }"
            @click="$bus.$emit('goTo', item.link.url)"
          ></Button>
        </div>
      </div>
    </div>
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
    item() {
      if (this.data && this.data.primary) {
        return this.data.primary
      }
      return
    },
  },
}
</script>
