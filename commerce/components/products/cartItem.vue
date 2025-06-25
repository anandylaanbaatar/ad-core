<template>
  <div v-if="item" class="col-xs-12">
    <div
      class="product cartItem"
      :class="{ preview: preview }"
      @click="
        $bus.$emit(
          'goTo',
          `/products/${this.productCategoryHandle}/${this.item.id}_${this.item.handle}`
        )
      "
    >
      <div class="imageArea">
        <div
          class="image block relative"
          :class="{ emptyImage: !itemImage }"
          :style="`background-image:url(${itemImage});`"
        >
          <div class="c-block-top-right">
            <Badge
              :value="`${quantity}`"
              severity="contrast"
              class="mt-1 mr-1"
            ></Badge>
          </div>

          <h5 v-if="!itemImage">{{ useAppConfig().theme.name_short }}</h5>

          <div class="p5">
            <Tag
              v-if="item.tags && item.tags.includes('эрэлттэй')"
              value="Эрэлттэй"
              severity="success"
              class="mr10"
            ></Tag>
            <Tag
              v-if="item.tags && item.tags.includes('онцлох')"
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
            {{ item.product.title }}
          </p>

          <span class="price">
            {{ $currency.format(item.price.amount) }}
          </span>

          <span
            v-if="
              item.title !== 'Default Title' &&
              item.title !== 'Default' &&
              item.title !== 'default'
            "
            class="description font3 ml-3"
          >
            {{ this.$utils.addDots(item.title, 23) }}
          </span>

          <div v-if="!preview" class="buttonsArea">
            <div>
              <div
                class="c-inputIncrement"
                v-tooltip.top="
                  `${item.quantityAvailable - currentAmount} ${$utils.t('more available')}`
                "
              >
                <Button
                  :disabled="updating"
                  icon="pi pi-minus"
                  class="sm"
                  @click.stop="amountSubtract"
                ></Button>
                <InputNumber
                  :disabled="true"
                  v-model="currentAmount"
                ></InputNumber>
                <Button
                  :disabled="updating"
                  icon="pi pi-plus"
                  class="sm"
                  @click.stop="amountAdd"
                ></Button>
              </div>

              <Button
                icon="pi pi-trash"
                class="iconBtn sm ml-2 mb-1"
                @click.stop="deleteItem"
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
    product: {
      type: Object,
      default: null,
    },
    cartLineId: {
      type: String,
      default: null,
    },
    item: {
      type: Object,
      default: null,
    },
    quantity: {
      type: Number,
      default: null,
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    productCategoryHandle() {
      if (this.item) {
        if (this.item.category) {
          return this.item.category.handle
        }
      }
      return "all"
    },
    itemImage() {
      if (this.item && this.item.image) {
        return this.item.image.url
      }
      return false
    },
  },

  data() {
    return {
      updating: false,
      currentAmount: null,
      prevAmount: null,
    }
  },

  mounted() {
    if (this.item && this.quantity) {
      this.currentAmount = this.quantity
    } else {
      this.currentAmount = 1
    }

    console.log("Current Amount ::: ", this.currentAmount)
  },

  methods: {
    async removeFromCart(cartLineId) {
      await useRemoveFromCart({
        cartLineId: cartLineId,
      })
    },
    deleteItem() {
      this.$confirm.require({
        group: "global",
        message: this.$utils.t("Remove From Cart"),
        header: this.$utils.t("Delete"),
        rejectLabel: this.$utils.t("Cancel"),
        acceptLabel: this.$utils.t("Confirm"),
        accept: async () => {
          await useRemoveFromCart({
            cartLineId: this.cartLineId,
          })
        },
      })
    },

    async amountSubtract() {
      if (this.updating) return
      this.currentAmount -= 1

      if (this.currentAmount < 1) {
        this.currentAmount = 1
        await this.deleteItem()
      } else {
        await this.amountChange(this.currentAmount)
      }
    },
    async amountAdd() {
      if (this.updating) return
      this.prevAmount = this.currentAmount
      this.currentAmount += 1

      if (this.item.quantityAvailable !== null) {
        const maxAmount = this.item.quantityAvailable

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

      await this.amountChange(this.currentAmount)
    },
    async amountChange(amount) {
      if (this.updating) return
      this.updating = true

      await useUpdateItem({
        variantId: this.item.id,
        amount: amount,
        itemId: this.cartLineId,
      })

      this.prevAmount = amount
      this.updating = false
    },
  },
}
</script>
