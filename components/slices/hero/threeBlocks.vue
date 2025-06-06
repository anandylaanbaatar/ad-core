<template>
  <div v-if="item" class="container">
    <div class="c-hero three_blocks">
      <div class="row">
        <div class="col-xs-12 col-md-8 left">
          <div
            class="c-block c-image c-link block_1"
            :style="$utils.setBackImage(item.image_1.url)"
          >
            <div class="c-block-bottom-left p-4">
              <i
                v-if="item[`icon_1`]"
                class="pi mb-2"
                :class="item[`icon_1`]"
              ></i
              ><br />

              <Tag v-if="item[`tag_1`]" class="c-custom-tag mb-2">{{
                item[`tag_1`]
              }}</Tag>

              <p v-if="item[`sub_title_1`]" class="mb-1">
                {{ $utils.t(item[`sub_title_1`]) }}
              </p>
              <div v-if="item[`title_1`]" class="mb-1">
                <PrismicRichText :field="item[`title_1`]" />
              </div>
              <div v-if="item[`description_1`]" class="mb-1">
                <PrismicRichText :field="item[`description_1`]" />
              </div>

              <Button
                v-if="item[`link_1`]"
                icon="pi pi-arrow-right"
                iconPos="right"
                :label="item[`link_1`].text"
                :class="{
                  'c-custom-button': item[`link_1`].variant === 'Custom',
                  primary: item[`link_1`].variant === 'Primary',
                  secondary: item[`link_1`].variant === 'Secondary',
                }"
                @click="$bus.$emit('goTo', item[`link_1`].url)"
              ></Button>
            </div>
          </div>
        </div>

        <div class="col-xs-12 col-md-4 right">
          <div
            class="c-block c-image c-link block_2"
            :style="$utils.setBackImage(item.image_2.url)"
          >
            <div class="c-block-bottom-left p-4">
              <i
                v-if="item[`icon_2`]"
                class="pi mb-2"
                :class="item[`icon_2`]"
              ></i
              ><br />

              <Tag v-if="item[`tag_2`]" class="c-custom-tag mb-2">{{
                item[`tag_2`]
              }}</Tag>

              <p v-if="item[`sub_title_2`]" class="mb-1">
                {{ $utils.t(item[`sub_title_2`]) }}
              </p>
              <div v-if="item[`title_2`]" class="mb-1">
                <PrismicRichText :field="item[`title_2`]" />
              </div>
              <div v-if="item[`description_2`]" class="mb-1">
                <PrismicRichText :field="item[`description_2`]" />
              </div>

              <Button
                v-if="item[`link_2`]"
                icon="pi pi-arrow-right"
                iconPos="right"
                :label="item[`link_2`].text"
                :class="{
                  'c-custom-button': item[`link_2`].variant === 'Custom',
                  primary: item[`link_2`].variant === 'Primary',
                  secondary: item[`link_2`].variant === 'Secondary',
                }"
                @click="$bus.$emit('goTo', item[`link_2`].url)"
              ></Button>
            </div>
          </div>

          <div
            class="c-block c-image c-link block_3"
            :style="$utils.setBackImage(item.image_3.url)"
          >
            <div class="c-block-bottom-left p-4">
              <i
                v-if="item[`icon_3`]"
                class="pi mb-2"
                :class="item[`icon_3`]"
              ></i
              ><br />

              <Tag v-if="item[`tag_3`]" class="c-custom-tag mb-2">{{
                item[`tag_3`]
              }}</Tag>

              <p v-if="item[`sub_title_3`]" class="mb-1">
                {{ $utils.t(item[`sub_title_3`]) }}
              </p>
              <div v-if="item[`title_3`]" class="mb-1">
                <PrismicRichText :field="item[`title_3`]" />
              </div>
              <div v-if="item[`description_3`]" class="mb-1">
                <PrismicRichText :field="item[`description_3`]" />
              </div>

              <Button
                v-if="item[`link_3`]"
                icon="pi pi-arrow-right"
                iconPos="right"
                :label="item[`link_3`].text"
                :class="{
                  'c-custom-button': item[`link_3`].variant === 'Custom',
                  primary: item[`link_3`].variant === 'Primary',
                  secondary: item[`link_3`].variant === 'Secondary',
                }"
                @click="$bus.$emit('goTo', item[`link_3`].url)"
              ></Button>
            </div>
          </div>
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
