<template>
  <div v-if="cartItem" class="col-xs-12">
    <div
      class="product cartItem"
      :class="{ preview: preview }"
      @click="
        $bus.$emit(
          'goTo',
          `/products/${this.productCollectionHandle}/${this.cartItem.product.id}_${this.cartItem.product.handle}`
        )
      "
    >
      <div class="imageArea">
        <div
          class="image block relative"
          :class="{ emptyImage: !productImage }"
          :style="`background-image:url(${productImage});`"
        >
          <div class="c-block-top-right">
            <Badge
              :value="`${cartItem.qty}`"
              severity="contrast"
              class="mt-1 mr-1"
            ></Badge>
          </div>

          <h5 v-if="!productImage">{{ useAppConfig().theme.name_short }}</h5>

          <div class="p5">
            <Tag
              v-if="
                cartItem.product.tags &&
                cartItem.product.tags.includes('эрэлттэй')
              "
              value="Эрэлттэй"
              severity="success"
              class="mr10"
            ></Tag>
            <Tag
              v-if="
                cartItem.product.tags &&
                cartItem.product.tags.includes('онцлох')
              "
              value="Онцлох"
              severity="info"
              class="mr10"
            ></Tag>
          </div>
        </div>
      </div>

      <div class="content">
        <div>
          <p class="title">
            {{ cartItem.product.title }}
          </p>

          <span class="price">
            <template v-if="cartItem.variant && cartItem.variant.price">{{
              $currency.format(cartItem.variant.price)
            }}</template>
            <template v-else>{{
              $currency.format(cartItem.product.price)
            }}</template>
          </span>

          <span class="description font3 ml-3 uppercase">
            <template v-if="cartItem.variant && cartItem.variant.sku">
              {{ this.$utils.addDots(cartItem.variant.sku, 23) }}
            </template>
          </span>

          <div v-if="!preview" class="buttonsArea">
            <div>
              <div
                class="c-inputIncrement"
                v-tooltip.top="
                  `${productVariantAmountLeft} ${$utils.t('more available')}`
                "
              >
                <Button
                  :disabled="updating"
                  icon="pi pi-minus"
                  class="sm"
                  @click.stop="amountSubtract(cartItem.key)"
                ></Button>
                <!-- <InputNumber
                  :disabled="true"
                  v-model="currentAmount"
                ></InputNumber> -->
                <span class="mx-2">{{ currentAmount }}</span>
                <Button
                  :disabled="updating || productVariantAmountLeft === 0"
                  icon="pi pi-plus"
                  class="sm"
                  @click.stop="amountAdd(cartItem.key)"
                ></Button>
              </div>

              <Button
                icon="pi pi-trash"
                class="iconBtn sm ml-2 mb-1"
                @click.stop="removeFromCart(cartItem.key)"
                v-tooltip.top="`${$utils.t('Delete')}`"
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
    cartItem: {
      type: Object,
      default: null,
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      updating: false,
      currentAmount: null,
      prevAmount: null,
    }
  },

  computed: {
    productCollectionHandle() {
      if (this.cartItem && this.cartItem.product) {
        if (
          this.cartItem.product.collections &&
          this.cartItem.product.collections.length > 0
        ) {
          return this.cartItem.product.collections[0].collection_id.handle
        }
      }
      return "all"
    },
    productImage() {
      if (
        this.cartItem &&
        this.cartItem.variant &&
        this.cartItem.variant.image
      ) {
        return this.cartItem.variant.image.url
      } else if (
        this.cartItem &&
        this.cartItem.product &&
        this.cartItem.product.featured_image &&
        this.cartItem.product.featured_image.url
      ) {
        return this.cartItem.product.featured_image.url
      }
      return false
    },
    productVariantAmountLeft() {
      return this.cartItem.variant.inventory_available - this.currentAmount
    },
  },

  mounted() {
    // console.log("Cart Item ::: ", this.cartItem)

    if (this.cartItem && this.cartItem.qty) {
      this.currentAmount = this.cartItem.qty
    } else {
      this.currentAmount = 1
    }

    // console.log("Current Amount ::: ", this.currentAmount)
  },

  methods: {
    removeFromCart(itemKey) {
      this.$confirm.require({
        group: "global",
        message: this.$utils.t("Remove From Cart"),
        header: this.$utils.t("Delete"),
        rejectLabel: this.$utils.t("Cancel"),
        acceptLabel: this.$utils.t("Confirm"),
        accept: async () => {
          await useCommerceStore().removeFromCart(itemKey)
          this.$bus.$emit("updateCart")
        },
      })
    },
    amountSubtract(itemKey) {
      if (this.updating) return
      this.currentAmount -= 1

      if (this.currentAmount < 1) {
        this.currentAmount = 1
        this.removeFromCart(itemKey)
      } else {
        this.amountChange(itemKey, this.currentAmount)
      }
    },
    amountAdd(itemKey) {
      if (this.updating) return
      this.prevAmount = this.currentAmount
      this.currentAmount += 1

      if (this.cartItem.variant.inventory_available !== null) {
        const maxAmount = this.cartItem.variant.inventory_available

        if (this.currentAmount > maxAmount) {
          this.currentAmount = this.prevAmount

          this.$bus.$emit("toast", {
            severity: "danger",
            summary: this.$utils.t("Cart"),
            detail: `${$utils.t("Max")} ${maxAmount} ${$utils.t("pieces are available")}`,
          })

          return
        }
      }

      this.amountChange(itemKey, this.currentAmount)
    },
    async amountChange(itemKey, amount) {
      if (this.updating) return
      this.updating = true

      await useCommerceStore().updateQuantity(itemKey, amount)

      this.prevAmount = amount
      this.updating = false
      this.$bus.$emit("updateCart")
    },
  },
}
</script>
