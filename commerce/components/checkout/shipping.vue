<template>
  <Loader v-if="loading"></Loader>

  <section class="mb-5">
    <h3 class="mb-3">{{ $utils.t("Shipping") }}</h3>

    <!--Select Warning Message-->
    <Message
      v-if="options.shipping === null"
      severity="warn"
      class="c-message my-3"
      :closable="false"
    >
      <template #icon>
        <i class="pi pi-exclamation-triangle"></i>
      </template>
      <span class="ml-2">{{
        $utils.t("Select shipping address or pickup location")
      }}</span>
      <template #closeicon>
        <i class="pi pi-trash"></i>
      </template>
    </Message>

    <!--Shipping Options-->
    <ul class="c-radio">
      <li>
        <i
          class="pi"
          :class="{
            'pi-circle-fill': options.shipping === 'address',
            'pi-circle': options.shipping !== 'address',
          }"
        ></i>
        <div
          class="d-block"
          :class="{ active: options.shipping === 'address' }"
          @click="selectItem('shipping', 'address')"
        >
          <div class="row">
            <div class="col-xs-6">
              {{ $utils.t("Ship to Address") }}
            </div>
            <div class="col-xs-6 right">
              <i class="pi pi-truck"></i>
            </div>
          </div>
        </div>
      </li>
      <li>
        <i
          class="pi"
          :class="{
            'pi-circle-fill': options.shipping === 'pickup',
            'pi-circle': options.shipping !== 'pickup',
          }"
        ></i>
        <div
          class="d-block"
          :class="{ active: options.shipping === 'pickup' }"
          @click="selectItem('shipping', 'pickup')"
        >
          <div class="row">
            <div class="col-xs-6">
              {{ $utils.t("Pickup at a store - (Free)") }}
            </div>
            <div class="col-xs-6 right">
              <i class="pi pi-shop"></i>
            </div>
          </div>
        </div>
      </li>
    </ul>

    <!--Shipping to Address-->
    <div v-if="options.shipping === 'address'" class="mt-2 p-3 relative">
      <label class="mb-2 font2">{{ $utils.t("Shipping Address") }}</label>

      <Button
        icon="pi pi-plus"
        severity="secondary"
        class="c-block-top-right sm mt-2 mr-3"
        @click="$bus.$emit('sidebarGlobal', { id: 'address' })"
        v-tooltip.left="$utils.t('New Address')"
      ></Button>

      <!--Select Warning Message-->
      <Message
        v-if="options.address === null"
        severity="warn"
        class="c-message mt-3"
        :closable="false"
      >
        <template #icon>
          <i class="pi pi-exclamation-triangle"></i>
        </template>
        <span class="ml-2">{{ $utils.t("Select shipping address.") }}</span>
        <template #closeicon>
          <i class="pi pi-trash"></i>
        </template>
      </Message>

      <ul v-if="allAddresses" class="c-radio mt-3">
        <li
          v-for="address in allAddresses"
          :key="`address_item_${address.id}`"
          @click="selectItem('address', address.id)"
        >
          <i
            class="pi"
            :class="{
              'pi-circle-fill': options.address === address.id,
              'pi-circle': options.address !== address.id,
            }"
          ></i>
          <div
            class="d-block"
            :class="{ active: options.address === address.id }"
          >
            <div class="row px-3 relative mb-2">
              <p class="font2">{{ address.full_address }}</p>
              <Tag
                v-if="checkAddress(address)"
                severity="success"
                class="ml-2"
                >{{ $utils.t("Default Address") }}</Tag
              >
            </div>
          </div>
        </li>
      </ul>

      <!--Empty State-->
      <div v-else class="d-block p-4 mt-3 emptyArea">
        <div>
          <i class="pi pi-address-book"></i>
          <p>
            {{ $utils.t("No address found. Please add new address.") }}
          </p>

          <Button
            severity="secondary"
            class="sm inline-flex align-items-center"
            @click="$bus.$emit('sidebarGlobal', { id: 'address' })"
          >
            {{ $utils.t("New Address") }}
          </Button>
        </div>
      </div>

      <!--Distance-->
      <Message
        v-if="options.distance"
        severity="info"
        class="c-message mt-3"
        :closable="false"
      >
        <template #icon>
          <i class="pi pi-check"></i>
        </template>

        <span class="ml-2">
          {{ $utils.t(shippingLine.title) }} -
          {{ $currency.format(shippingLine.price) }}

          <!-- {{ options.distance.formatted }} - ({{
                      $utils.formatPrice(options.distance.price)
                    }}₮ / km нь 2,000₮) -->
        </span>

        <template #closeicon>
          <i class="pi pi-trash"></i>
        </template>
      </Message>
    </div>

    <!--Pickup from Location-->
    <div v-if="options.shipping === 'pickup'" class="p-3">
      <ul v-if="locations" class="c-radio mt-3">
        <li
          v-for="location in locations"
          :key="`address_loc_${location.id}`"
          @click="selectItem('location', location)"
        >
          <i
            class="pi"
            :class="{
              'pi-circle-fill': options.location?.id === location.id,
              'pi-circle': options.location?.id !== location.id,
            }"
          ></i>
          <div
            class="d-block"
            :class="{ active: options.location?.id === location.id }"
          >
            <div class="row px-3 relative mb-0">
              <div>
                <p class="font2">
                  {{ location.title }}

                  <!-- <Tag
                    v-if="location.name === 'Улаанбаатар'"
                    severity="success"
                    class="ml-1"
                    :style="`position:relative;top:-4px;`"
                    >{{ $utils.t("Main Location") }}</Tag
                  > -->
                </p>
                <p v-if="location.address?.full_address" class="opacity-50">
                  {{ location.address?.full_address }}
                </p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    options: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: true,
    }
  },

  computed: {
    cart() {
      return useCommerceStore().cart
    },
    user() {
      return useAuthStore().user
    },
    customer() {
      return useCommerceStore().customer
    },
    allAddresses() {
      if (
        this.customer &&
        this.customer.addresses &&
        this.customer.addresses.length
      ) {
        return this.customer.addresses.map((i) => {
          return {
            ...i.shipping_address,
            isDefault:
              this.customer.default_address === i.shipping_address.id
                ? true
                : false,
          }
        })
      }
      return
    },
    locations() {
      let allLocations = useCommerceStore().locations
      return allLocations
    },
    shippingLines() {
      return useCommerceStore().shippingLines
    },
    shippingLine() {
      // Pickup
      if (this.options.shipping === "pickup" && this.options.location) {
        return {
          title: this.$utils.t("Pickup at a store"),
          price: 0,
        }
      }

      // Address
      if (
        this.options.shipping &&
        this.options.address &&
        this.options.distance
      ) {
        if (this.options.distance.price <= this.shippingLines[0].price) {
          return this.shippingLines[0]
        } else if (this.options.distance.price >= this.shippingLines[3].price) {
          return this.shippingLines[3]
        } else if (this.options.distance.price <= this.shippingLines[1].price) {
          return this.shippingLines[1]
        } else if (this.options.distance.price <= this.shippingLines[2].price) {
          return this.shippingLines[2]
        }
      }

      // if (this.options.shipping === "address" && this.options.address) {
      //   return this.shippingLines[0]
      // }

      return null
    },
    shippingAddress() {
      if (
        this.options.shipping === "address" &&
        this.options.address &&
        this.allAddresses
      ) {
        let selectedAddress = this.allAddresses.find(
          (i) => i.id === this.options.address
        )

        if (selectedAddress) {
          return {
            address1: selectedAddress.address1
              ? selectedAddress.address1
              : null,
            address2: selectedAddress.address2
              ? selectedAddress.address2
              : null,
            city: selectedAddress.city ? selectedAddress.city : null,
            province: selectedAddress.province
              ? selectedAddress.province
              : null,
            country: selectedAddress.country ? selectedAddress.country : null,
            zip: selectedAddress.zip ? selectedAddress.zip : null,
          }
        }
      } else if (
        this.options.shipping === "pickup" &&
        this.options.location &&
        this.locations
      ) {
        let selectedAddress = this.locations.find(
          (i) => i.name === this.options.location
        )

        if (selectedAddress) {
          return {
            address1: selectedAddress.address1
              ? selectedAddress.address1
              : null,
            address2: selectedAddress.address2
              ? selectedAddress.address2
              : null,
            city: selectedAddress.city ? selectedAddress.city : null,
            province: selectedAddress.province
              ? selectedAddress.province
              : null,
            country: selectedAddress.country ? selectedAddress.country : null,
            zip: selectedAddress.zip ? selectedAddress.zip : null,
          }
        }
      }

      return null
    },
  },

  mounted() {
    this.loading = false
  },

  methods: {
    async selectItem(type, value) {
      if (type === "shipping") {
        this.options.address = null
        this.options.location = null
        this.options.payment = null
        this.options.distance = null

        if (value === "pickup") {
          this.options.location = this.locations.find((i) => i.id === value)
        }
      }
      if (type === "address") {
        this.options.location = null
        this.options.shipping = "address"
      }
      if (type === "location") {
      }

      this.options[type] = value

      // Calculate Address
      if (type === "address") {
        this.options.distance = null
        await this.calculateAddresses()
        useCommerceStore().set("shippingAmount", this.shippingLine.price)
      }

      console.log("Select Item ::: ", this.options)
    },
    async calculateAddresses() {
      if (!useCommerceStore().selectedLocation) return

      const location = this.locations.find(
        (i) =>
          i.address?.id === useCommerceStore().selectedLocation?.address?.id
      )

      // Mongolia
      if (location && this.shippingAddress.country === "Mongolia") {
        let address1 = this.getFormattedAddress(location.address)
        let address2 = this.getFormattedAddress(this.shippingAddress)

        const res = await this.$address.getDirections(address1, address2)

        console.log("Get Directions ::: ", address1, address2, res)

        if (res && res.routes) {
          if (res.routes[0] && res.routes[0].legs && res.routes[0].legs[0]) {
            let routeItem = res.routes[0].legs[0]
            let distanceObj = {
              distance: routeItem.distance,
              duration: routeItem.duration,
              start: {
                address: routeItem.start_address,
                location: routeItem.start_location,
              },
              end: {
                address: routeItem.end_address,
                location: routeItem.end_location,
              },
              price: (routeItem.distance.value / 1000) * 2000,
              formatted: 0,
            }
            distanceObj.formatted = `${distanceObj.distance.text} (${distanceObj.duration.text})`

            if (distanceObj.price >= this.shippingLines[2].price) {
              distanceObj.price = this.shippingLines[2].price
            }

            this.options.distance = distanceObj

            console.log("Direction Summary ::: ", distanceObj)
          }
        }
      } else {
        this.options.distance = {
          price: 1000000,
          distance: {
            text: "8000 km",
            value: 8000,
          },
          formatted: "8000 km",
        }

        return
      }
    },
    checkAddress(address) {
      if (this.user && this.user.defaultAddress) {
        if (
          this.user.defaultAddress.formatted.join(", ") ===
          address.formatted.join(", ")
        ) {
          return true
        }
      }
      return false
    },
    getFormattedAddress(location, sep, encode) {
      let address = ``
      let seperator = sep ? sep : ", "

      const addSep = () => {
        if (address !== "") address += seperator
      }

      if (location) {
        if (location.address2) {
          addSep()
          address += location.address2
        }
        if (location.address1) {
          addSep()
          address += location.address1
        }
        if (location.city) {
          addSep()
          address += location.city
        }
        if (location.province) {
          addSep()
          address += location.province
        }
        if (location.country) {
          addSep()
          address += location.country
        }
        if (location.zip) {
          addSep()
          address += location.zip
        }
      }

      if (encode) {
        return address.replace(/ /g, "%20")
      } else {
        return address
      }
    },
  },
}
</script>
