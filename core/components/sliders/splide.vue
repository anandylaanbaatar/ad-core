<template>
  <div class="c-slider">
    <Loader v-if="loading"></Loader>

    <Splide v-else :options="sliderOptions" ref="splide">
      <SplideSlide v-for="item in items" :key="`item_${item}`">
        <div
          class="c-block c-image size-xl"
          :style="`background-image:url(${item.url});`"
        >
          <div class="c-block-bottom-left">
            <div class="c-block-text">
              <h3>New Arrivals</h3>
              <p>Summer 2024 Collection</p>

              <Button
                label="Shop"
                class="mt-3"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="$bus.$emit('goTo', item.link)"
              ></Button>
            </div>
          </div>
        </div>
      </SplideSlide>
    </Splide>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      items: [
        {
          url: "https://ik.imagekit.io/protocol/media/shops/shp_FRsSMcj9NC/media_5E9oCF_zc?tr=dpr-2",
          link: `/products/t-shirts/9697977041210_ad-graph-v1-t-shirt`,
        },
        {
          url: "https://ik.imagekit.io/protocol/media/shops/shp_FRsSMcj9NC/media_lSrf2wMrk?tr=dpr-2",
          link: `/products/t-shirts/9698158018874_ad-graph-v2-t-shirt`,
        },
      ],
      sliderOptions: {
        type: "loop",
        padding: "4rem",
        drag: "free",
        snap: true,
        perPage: 1,
        gap: "10px",
        breakpoints: {
          1400: {
            perPage: 1,
          },
          1199: {
            perPage: 1,
          },
          767: {
            perPage: 1,
            padding: 0,
          },
          575: {
            perPage: 1,
          },
        },
      },
    }
  },

  async created() {
    setTimeout(() => {
      this.loading = false
    }, 100)
  },
}
</script>
