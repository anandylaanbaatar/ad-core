/**
 * Commerce Composables
 */

// export const useGetCartItems = async () => {
//   const { $shopify } = useNuxtApp()
//   const store = useCommerceStore()
//   const cartId = localStorage.getItem("cartId")

//   if (cartId) {
//     const cartItems = await $shopify.cartItems({
//       cartId: cartId,
//     })
//     if (cartItems) {
//       store.set("cart", cartItems)

//       if (typeof store.cart.totalQuantity !== "undefined") {
//         await store.set("cartBadge", store.cart.totalQuantity.toString())
//       }
//     }
//   }
// }
// export const useUpdateCart = async () => {
//   await useGetCartItems()
// }
// export const useAddToCart = async (product) => {
//   const cart = useCommerceStore().cart

//   if (cart) {
//     await useAddItem(product)
//   } else {
//     await useCreateCart(product)
//   }
// }
// export const useAddItem = async (product) => {
//   useCommerceStore().addToCart(product)
//   useUpdateCart()

//   // const { $shopify, $bus, $utils } = useNuxtApp()
//   // const cartId = localStorage.getItem("cartId")

//   // const addItemData = await $shopify.addItem({
//   //   cartId: cartId,
//   //   amount: product.amount,
//   //   variantId: product.variantId,
//   // })

//   // if (addItemData) {
//   //   useUpdateCart()
//   //   $bus.$emit("sidebarGlobal", { id: "cart" })
//   // } else {
//   //   $bus.$emit("toast", {
//   //     severity: "danger",
//   //     summary: $utils.t("Cart"),
//   //     detail: $utils.t("Error adding item to cart."),
//   //   })
//   // }
// }
// export const useCreateCart = async (product) => {
//   const tenantId = useRuntimeConfig().public.features.multitenancy.tenantId
//   localStorage.setItem(`${tenantId}_cart`, JSON.stringify([product]))

//   await useAddItem(product)
//   await useUpdateCart()
// }
// export const useUpdateItem = async (product) => {
//   const { $shopify, $bus, $utils } = useNuxtApp()
//   const cartId = localStorage.getItem("cartId")

//   const updateItemData = await $shopify.updateItem({
//     cartId: cartId,
//     itemId: product.itemId,
//     amount: product.amount,
//     variantId: product.variantId,
//   })

//   if (updateItemData) {
//     await useUpdateCart()

//     $bus.$emit("toast", {
//       severity: "secondary",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Updated cart item amount."),
//     })
//   } else {
//     $bus.$emit("toast", {
//       severity: "danger",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Error updating cart item amount."),
//     })
//   }
// }
// export const useEmptyCart = async () => {
//   const store = useCommerceStore()

//   await store.set("cartBadge", "0")
//   await store.set("cart", null)
// }
// export const useRemoveFromCart = async (product) => {
//   const { $shopify, $bus, $utils } = useNuxtApp()
//   const store = useCommerceStore()
//   const cartId = localStorage.getItem("cartId")

//   const removeItemData = await $shopify.removeItem({
//     cartId: cartId,
//     cartLineId: product.cartLineId,
//   })

//   if (removeItemData) {
//     await useUpdateCart()

//     let amount = removeItemData.cartLinesRemove.cart.totalQuantity
//     await store.set("cartBadge", amount.toString())
//   } else {
//     $bus.$emit("toast", {
//       severity: "danger",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Error removing item from cart."),
//     })
//   }
// }

// export const useUpdateDiscountCode = async (discountCodes) => {
//   const { $shopify, $bus, $utils } = useNuxtApp()
//   const cartId = localStorage.getItem("cartId")

//   const res = await $shopify.updateDiscountCodes({
//     cartId: cartId,
//     discountCodes: discountCodes,
//   })

//   // console.log("Discount Code ::: Update ::", res)

//   if (res && res.cartDiscountCodesUpdate && res.cartDiscountCodesUpdate.cart) {
//     await useUpdateCart()

//     $bus.$emit("toast", {
//       severity: "secondary",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Cart updated."),
//     })
//   } else {
//     $bus.$emit("toast", {
//       severity: "danger",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Error updating cart."),
//     })
//   }
// }
// export const useUpdateGiftCardCode = async (giftCardCodes) => {
//   const { $shopify, $bus, $utils } = useNuxtApp()
//   const cartId = localStorage.getItem("cartId")

//   const res = await $shopify.updateGiftCardCodes({
//     cartId: cartId,
//     giftCardCodes: giftCardCodes,
//   })

//   console.log("Gift Card Code ::: Update ::", res)

//   if (res && res.cartGiftCardCodesUpdate && res.cartGiftCardCodesUpdate.cart) {
//     await useUpdateCart()

//     $bus.$emit("toast", {
//       severity: "secondary",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Cart updated."),
//     })
//   } else {
//     $bus.$emit("toast", {
//       severity: "danger",
//       summary: $utils.t("Cart"),
//       detail: $utils.t("Error updating cart."),
//     })
//   }
// }

export const useSaveProduct = async (product) => {
  const { $bus, $utils } = useNuxtApp()
  const store = useCommerceStore()

  const productId = product.id
  let allSavedItems = store.savedItems

  if (allSavedItems.indexOf(productId) === -1) {
    allSavedItems.push(productId)
  }

  await store.setSavedItems(allSavedItems)

  $bus.$emit("toast", {
    severity: "success",
    summary: $utils.t("Product"),
    detail: $utils.t("Successfully added to wishlist."),
  })
}
export const useRemoveProduct = async (product) => {
  const { $bus, $utils } = useNuxtApp()
  const store = useCommerceStore()
  const productId = product.id

  let newSavedItems = store.savedItems.filter((i) => i !== productId)

  await store.setSavedItems(newSavedItems)

  $bus.$emit("toast", {
    severity: "success",
    summary: $utils.t("Product"),
    detail: $utils.t("Successfully removed from wishlist."),
  })
}
