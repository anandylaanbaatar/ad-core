<template>
  <AppLayout type="regular">
    <div class="c-page">
      <Loader v-if="loading"></Loader>

      <div v-else class="container">
        <div class="row mt-8">
          <div class="col-xs-12">
            <section class="c-block text-center p-8">
              <i class="pi pi-check"></i>
              <h3 class="my-3">{{ $utils.t("Order Successfull.") }}</h3>
              <p class="mb-4">
                {{ $utils.t("We have recieved your order.") }} <br />
                {{
                  $utils.t(
                    "You can find your detailed order and shipping information from My Orders area."
                  )
                }}
              </p>

              <div class="flex align-items-center mx-auto">
                <Button
                  severity="secondary"
                  icon="pi pi-box"
                  :label="$utils.t('My Orders')"
                  class="sm"
                  @click="$bus.$emit('sidebarGlobal', { id: 'account' })"
                ></Button>
                <p class="my-3 mx-4">{{ $utils.t("or") }}</p>
                <Button
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  :label="$utils.t('Shop')"
                  class="sm"
                  @click="$bus.$emit('goTo', '/products/all')"
                ></Button>
              </div>
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

  async mounted() {
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
