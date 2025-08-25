<template>
  <Loader v-if="loading && !cart" type="small"></Loader>

  <section v-else class="mb-5">
    <h3 class="mb-3">
      {{ $utils.t("Cart Items") }}

      <Badge
        v-if="cart.totals.itemsTotal"
        :value="cart.totals.itemsTotal"
        severity="contrast"
        :style="`position:relative; top:-2px;`"
      ></Badge>
    </h3>

    <div class="productsGrid row">
      <div class="productsGridScroll w-full">
        <ProductsCartItem
          v-for="cartItem in cart.items"
          :cartItem="cartItem"
          :key="`product_summary_cartItem_${cartItem.key}`"
          :preview="true"
        ></ProductsCartItem>
      </div>
    </div>

    <div class="row">
      <!--Discount Codes
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
      -->

      <!--Summary-->
      <div class="c-divider sm"></div>

      <!--Subtotal-->
      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Sub Total")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3>{{ $currency.format(cart.totals.subtotalAmount) }}</h3>
        </div>
      </div>

      <!--Tax-->
      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{ $utils.t("Tax") }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div v-if="theme().type === 'commerce'" class="w-full text-right">
          <h3 v-if="useCommerceStore().allowTax">
            {{ $currency.format(cart.totals.taxAmount) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <!--Discount-->
      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Discount")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3 v-if="cart.totals.discountAmount !== 0">
            {{ $currency.format(cart.totals.discountAmount) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <!--Shipping-->
      <div class="col-xs-6 mb10 pl-0">
        <label class="font-bold font3 text-md">{{
          $utils.t("Shipping")
        }}</label>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3 v-if="cart.totals.shippingAmount !== null">
            {{ $currency.format(cart.totals.shippingAmount) }}
          </h3>
          <h3 v-else>-</h3>
        </div>
      </div>

      <!--Total-->
      <div class="col-xs-6 pl-0">
        <h3 class="font-bold font3 text-md">{{ $utils.t("Total") }}</h3>
      </div>
      <div class="col-xs-6 pr-0">
        <div class="w-full text-right">
          <h3>
            <!-- <span class="font3 text-sm">{{ currency }}</span> -->
            {{ $currency.format(cart.totals.totalAmount) }}
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
      loading: false,
    }
  },

  computed: {
    cart() {
      return {
        cart: useCommerceStore().cart,
        items: useCommerceStore().cartItems,
        isEmpty: useCommerceStore().cart.length === 0 ? true : false,
        totals: useCommerceStore().cartTotals,
      }
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
  },
}
</script>
