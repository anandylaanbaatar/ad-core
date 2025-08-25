<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else class="container">
        <div class="row mt-8">
          <div class="col-xs-12">
            <section class="c-block text-center p-8">
              <i class="pi pi-check"></i>
              <h3 class="my-3">{{ $utils.t("Order Successful.") }}</h3>
              <p class="mb-4">
                Таны захиалгыг бид хүлээн авлаа. <br />Та миний захиалга хэсгээс
                бараа хүргэлт болон захиалгын <br />дэлгэрэнгүй мэдээллийг авна
                уу.
              </p>

              <Button
                icon="pi pi-box"
                :label="$utils.t('My Orders')"
                class="secondary"
                @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
              ></Button>
              <p class="my-3">{{ $utils.t("or") }}</p>
              <Button
                icon="pi pi-arrow-left"
                :label="$utils.t('Shop')"
                class="secondary"
                @click="$bus.$emit('goTo', '/products/all')"
              ></Button>
            </section>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
    }
  },

  async created() {
    await useCommerceStore().setUser()
    await this.cleanUpCart()

    setTimeout(() => {
      this.loading = false
    }, 700)
  },

  methods: {
    async cleanUpCart() {
      localStorage.removeItem("cartId")
      localStorage.removeItem("draftOrderId")
      localStorage.removeItem("qpay_token")

      await useCommerceStore().clearCart()
    },
  },
}
</script>
