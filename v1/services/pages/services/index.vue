<template>
  <AppLayout type="regular">
    <div class="c-page customPage">
      <Loader v-if="loading"></Loader>

      <div v-else>
        <div class="c-textBlock large mb-0">
          <div class="container">
            <div class="content">
              <div class="c-text">
                <Tag rounded class="c-custom-tag mb-4">Classes</Tag>
                <h2 class="mb-4">Find your perfect class</h2>
                <p class="mb-4">
                  At BettinkaPilates, we believe that true well-being comes from
                  within. Our classes are designed to help you reconnect with
                  your body. mind. spirit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!--Products-->
        <ProductsGrid
          :firstBlock="false"
          :lastBlock="false"
          :filters="true"
        ></ProductsGrid>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
    }
  },
}
</script>
