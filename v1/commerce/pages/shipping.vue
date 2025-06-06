<template>
  <AppLayout type="regular">
    <div class="c-page shipping">
      <div class="container py-4">
        <h1>Shipping</h1>

        <Button @click="init" label="Get Rates"></Button>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  methods: {
    async init() {
      if (!useRuntimeConfig().public.integrations.shippo && !this.$shippo)
        return

      // 1. Create Parcel
      const res = await this.$shippo.createParcel({
        extra: {
          cod: {
            amount: "5.5",
            currency: "USD",
            paymentMethod: "CASH",
          },
          insurance: {
            amount: "5.5",
            content: "Laptop",
            currency: "USD",
            provider: "UPS",
          },
        },
        metadata: "Customer ID 123456",
        massUnit: "lb",
        weight: "1",
        distanceUnit: "in",
        height: "1",
        length: "1",
        width: "1",
      })

      if (!res && !res.objectId) return

      const parcelId = res.objectId

      console.log("[Shippo] ::: 1. Parcel Id :: ", parcelId)

      const addressFrom = "<value>"
      const addressTo = {
        name: "Shwan Ippotle",
        company: "Shippo",
        street1: "215 Clayton St.",
        street3: "",
        streetNo: "",
        city: "San Francisco",
        state: "CA",
        zip: "94117",
        country: "US",
        phone: "+1 555 341 9393",
        email: "shippotle@shippo.com",
        isResidential: true,
        metadata: "Customer ID 123456",
        validate: true,
      }
      const lineItems = [
        {
          currency: "USD",
          manufactureCountry: "US",
          maxDeliveryTime: new Date("2016-07-23T00:00:00Z"),
          maxShipTime: new Date("2016-07-23T00:00:00Z"),
          quantity: 20,
          sku: "HM-123",
          title: "Hippo Magazines",
          totalPrice: "12.1",
          variantTitle: "June Edition",
          weight: "0.4",
          weightUnit: "lb",
          objectId: "abf7d5675d744b6ea9fdb6f796b28f28",
        },
      ]
      const res2 = await this.$shippo.createRate({
        addressFrom: addressFrom,
        addressTo: addressTo,
        lineItems: lineItems,
        parcel: parcelId,
      })

      console.log("[Shippo] ::: 2. Rate :: ", res2)
    },
  },
}
</script>
