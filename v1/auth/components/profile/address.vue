<template>
  <div class="d-block px-4 relative mb-5">
    <!--Title-->
    <h3 class="mb-3">{{ $utils.t("My Addresses") }}</h3>
    <Button
      icon="pi pi-plus"
      rounded
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
        <template v-if="isDefaultAddress(address)">
          <Tag severity="success" class="mb-1">{{
            $utils.t("Default Address")
          }}</Tag>
          <br />
        </template>
        <p class="font3 line-height-2">{{ address.fullAddress }}</p>

        <Button
          icon="pi pi-pencil"
          rounded
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
        <h4 class="font3 mb-3">
          {{ $utils.t("No address found. Please add new address.") }}
        </h4>

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
  props: {
    account: {
      type: Object,
      default: null,
    },
  },

  computed: {
    allAddresses() {
      if (this.account && this.account.addresses) {
        if (
          this.account.addresses.edges &&
          this.account.addresses.edges.length > 0
        ) {
          let addressItems = this.account.addresses.edges.map((i) => {
            let item = i.node

            if (item.address2) {
              if (item.address2 === "undefined") {
                item.address2 = null
              }
            }

            item.fullAddress = this.$address.formatAddress(item)
            return item
          })

          return addressItems
        }
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
      if (
        this.account.defaultAddress.formatted.join(", ") ===
        address.formatted.join(", ")
      ) {
        return true
      }
      return false
    },
  },
}
</script>
