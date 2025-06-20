<template>
  <Loader v-if="loading && !cart" type="small"></Loader>

  <section v-else class="mb-5">
    <h3 class="mb-3">
      {{ $utils.t("Cart Items") }}

      <Badge
        v-if="cart.totalQuantity"
        :value="cart.totalQuantity"
        severity="contrast"
        :style="`position:relative; top:-2px;`"
      ></Badge>
    </h3>

    <div class="productsGrid row">
      <ProductsCartItem
        v-for="(item, index) in cart.items"
        :product="item"
        :cartLineId="item.uid"
        :item="item.merchandise"
        :quantity="item.quantity"
        :key="`product_item_${index}`"
        :preview="true"
        class="p-0"
      ></ProductsCartItem>
    </div>

    <div class="row">
      <!--Discount Codes-->
      <div class="c-divider sm"></div>
      <div class="c-form col-xs-12 p-0">
        <div class="c-field">
          <label for="discountCode">{{
            $utils.t("Discount Code or Gift Card")
          }}</label>
        </div>
        <InputGroup class="c-field c-transparent w-full">
          <InputGroupAddon><i class="pi pi-credit-card"></i></InputGroupAddon>
          <InputText
            v-model="options.discountCodes"
            id="discountCode"
            autocomplete="off"
            :placeholder="$utils.t('Enter code here')"
            @change="updateDiscountCodes"
          />
        </InputGroup>

        <template
          v-for="code in cart.discountCodes"
          :key="`discountCode_${code.code}`"
        >
          <Message
            v-if="code.applicable"
            severity="success"
            class="c-message mt-2"
            @close="removeDiscountCode(code)"
          >
            <template #icon>
              <i class="pi pi-credit-card"></i>
            </template>
            <span class="ml-2">{{ code.code }}</span>
            <template #closeicon>
              <i class="pi pi-trash"></i>
            </template>
          </Message>
          <Message
            v-else
            severity="error"
            class="c-message mt-2"
            @close="removeDiscountCode(code)"
          >
            <template #icon>
              <i class="pi pi-credit-card"></i>
            </template>
            <span class="ml-2"
              >{{ code.code }} ({{
                $utils.t("Code is expired or invalid.")
              }})</span
            >
            <template #closeicon>
              <i class="pi pi-trash"></i>
            </template>
          </Message>
        </template>
      </div>

      <!--Summary Total-->
      <div class="c-divider sm"></div>

      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Sub Total")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3>{{ $currency.format(totalAmount.charge) }}</h3>
        </div>
      </div>

      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{ $utils.t("Tax") }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div v-if="theme().type === 'commerce'" class="w-full text-right">
          <h3 v-if="useCommerceStore().allowTax">
            {{ $currency.format(cart.cost.totalTaxAmount.amount) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Discount")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3 v-if="totalAmount && totalAmount.discount !== 0">
            {{ $currency.format(totalAmount.discount) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Shipping")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3 v-if="totalAmount && totalAmount.shipping !== null">
            {{ $currency.format(totalAmount.shipping) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <div class="col-xs-6 pl-0">
        <h3 class="font-bold font3 text-md">{{ $utils.t("Total") }}</h3>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3>
            <span class="font3 text-sm">{{ currency }}</span>
            {{ $currency.format(totalAmount.total) }}
          </h3>
        </div>
      </div>
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
    currency() {
      let currencyData = localStorage.getItem("currency")
      if (currencyData) {
        return currencyData
      }
      return useCoreStore().currency
    },

    // Shipping
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

    // Cart
    cart() {
      return useCommerceStore().cart
    },
    lineItems() {
      if (this.cart && this.cart.items) {
        return this.cart.items.map((i) => {
          return {
            quantity: i.quantity,
            variantId: i.merchandise.id,
          }
        })
      }
      return null
    },

    // Discount Codes
    discountCodes() {
      if (this.cart && this.cart.discountCodes) {
        if (this.cart.discountCodes.length > 0) {
          let allApplicableDiscountCodes = this.cart.discountCodes.filter(
            (i) => i.applicable
          )
          if (allApplicableDiscountCodes.length > 0) {
            return allApplicableDiscountCodes.map((i) => {
              return `${i.code}`
            })
          }
        }
      }
      return null
    },

    // Calculated
    totalAmount() {
      let cartAmount = 0
      let taxAmount = 0
      let shippingAmount = 0
      let totalAmount = 0
      let formatted = 0
      let chargeAmount = 0
      let discountAmount = 0

      if (this.cart && this.cart.cost && this.cart.cost.totalAmount) {
        if (theme().type === "commerce" && useCommerceStore().allowTax) {
          cartAmount = parseFloat(this.cart.cost.totalAmount.amount)
        } else {
          cartAmount = parseFloat(this.cart.cost.subtotalAmount.amount)
        }
      }
      if (this.shippingLine) {
        shippingAmount = parseFloat(this.shippingLine.price)
      }
      if (this.cart && this.cart.cost && this.cart.cost.checkoutChargeAmount) {
        chargeAmount = parseFloat(this.cart.cost.checkoutChargeAmount.amount)
      }
      if (this.cart) {
        let discountCodes = this.cart.discountCodes.filter(
          (i) => i.applicable === true
        )
        if (discountCodes.length > 0) {
          discountAmount = cartAmount - chargeAmount
        } else if (chargeAmount !== cartAmount) {
          discountAmount = cartAmount - chargeAmount
        }
      }

      totalAmount = cartAmount + shippingAmount
      formatted = this.$utils.formatPrice(totalAmount)

      let finalAmount = {
        cart: cartAmount,
        tax: taxAmount,
        shipping: shippingAmount,
        total: totalAmount,
        discount: discountAmount,
        charge: chargeAmount,
        formatted: formatted,
      }

      // console.log("Total Amount ::: ", finalAmount)

      return finalAmount
    },
  },

  async mounted() {
    await this.init()
  },

  methods: {
    async init() {
      this.loading = true
      await useGetCartItems()
      this.loading = false
    },

    // Cart
    async updateDiscountCodes() {
      let discountCodes = this.options.discountCodes

      console.log("Discount Code Update ::: ", discountCodes)

      await useUpdateDiscountCode(discountCodes)

      setTimeout(() => {
        this.loading = true
        this.$emit("restart")
        this.loading = false
      }, 3000)
    },
    async removeDiscountCode(code) {
      let discountCodes = this.cart.discountCodes
      discountCodes = discountCodes
        .filter((i) => i.code !== code.code)
        .map((i) => {
          return i.code
        })

      console.log(
        "Remove Discount Code ::: ",
        code,
        this.cart.discountCodes,
        discountCodes
      )

      await useUpdateDiscountCode(discountCodes)

      setTimeout(() => {
        this.loading = true
        this.$emit("restart")
        this.loading = false
      }, 3000)
    },
  },
}
</script>
