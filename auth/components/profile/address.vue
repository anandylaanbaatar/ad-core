<template>
  <div class="d-block px-4 relative mb-5">
    <!--Title-->
    <h3 class="mb-3">{{ $utils.t("My Addresses") }}</h3>
    <Button
      icon="pi pi-plus"
      severity="secondary"
      class="c-block-top-right mt-3 mr-3 sm"
      v-tooltip.left="$utils.t('New Address')"
      @click="newAddress"
    ></Button>

    <!--Addresses-->
    <template v-if="allAddresses">
      <div
        v-for="address in allAddresses"
        :key="`address_item_${address.id}`"
        class="d-block c-addressBlock"
      >
        <template v-if="address.isDefault">
          <Tag severity="success" class="mb-1">{{
            $utils.t("Default Address")
          }}</Tag>
          <br />
        </template>
        <p class="font3 line-height-2">
          {{ address.full_address }}
        </p>

        <Button
          icon="pi pi-pencil"
          severity="secondary"
          class="c-block-top-right mt-3 mr-3 sm"
          @click="editAddress(address)"
          v-tooltip.left="$utils.t('Update Address')"
        ></Button>
      </div>
    </template>

    <!--Empty State-->
    <div v-else class="emptyArea">
      <div>
        <i class="pi pi-address-book"></i>
        <p class="mb-3">
          {{ $utils.t("No address found. Please add new address.") }}
        </p>

        <Button
          :label="$utils.t('New Address')"
          class="sm"
          severity="secondary"
          icon="pi pi-plus"
          @click="newAddress"
        ></Button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    customer() {
      return useCommerceStore().customer
    },
    allAddresses() {
      if (this.customer?.addresses?.length) {
        return this.customer.addresses
      }
      return
    },
  },

  methods: {
    newAddress() {
      this.$bus.$emit("sidebarGlobal", {
        id: "address",
        data: null,
        isNew: true,
      })
    },
    editAddress(address) {
      this.$bus.$emit("sidebarGlobal", {
        id: "address",
        data: address,
      })
    },
    isDefaultAddress(address) {
      if (address && address.isDefaultAddress) {
        return true
      }
      return false
    },
  },
}
</script>
