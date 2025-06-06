<template>
  <div>
    <h3 v-if="header" class="mb-3">{{ $utils.t("Subscriptions") }}</h3>

    <Loader v-if="loading"></Loader>
    <template v-else-if="!subscriptions">
      <div class="d-block py-6">
        <div class="emptyArea">
          <div>
            <i class="pi pi-box"></i>
            <h4 class="font3 mb-0">
              {{ $utils.t("No Subscriptions found.") }}
            </h4>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <!--Single Selected-->
      <template v-if="selected && product">
        <div class="c-block text-center relative py-6 mb-4">
          <Button
            icon="pi pi-arrow-left"
            class="sm mb-3 absolute top-0 left-0 ml-3 mt-3"
            @click="selected = null"
          ></Button>
          <Button
            v-if="subscription.status === 'active'"
            severity="danger"
            icon="pi pi-trash"
            class="sm mb-3 absolute top-0 right-0 mr-3 mt-3"
            @click="deleteSubscription"
            v-tooltip.left="`${$utils.t('Cancel Subscription')}`"
          ></Button>

          <div class="px-4">
            <i class="pi pi-box"></i>
            <h2 class="my-2">
              {{ product.name }}
            </h2>
            <h4>
              {{ product.currency.toUpperCase() }}
              {{ product.amount_formatted }} /
              {{ product.interval }}
            </h4>

            <!--Status-->
            <Tag
              v-if="subscription.status === 'active'"
              severity="success"
              class="mt-3"
              >Active</Tag
            >
            <Tag
              v-else-if="subscription.status === 'canceled'"
              severity="danger"
              class="mt-3"
              >Canceled</Tag
            >
            <Tag
              v-else-if="subscription.status === 'incomplete'"
              severity="warn"
              class="mt-3"
              >InComplete</Tag
            >
            <Tag
              v-else-if="subscription.status === 'incomplete_expired'"
              severity="warn"
              class="mt-3"
              >InComplete Expired</Tag
            >

            <p v-if="subscription.status === 'canceled'">
              Subscription ended at:
              {{ $utils.utcSecToDate(subscription.ended_at) }}
            </p>
          </div>
        </div>

        <Tabs value="classes">
          <TabList>
            <Tab value="classes" class="font3">Classes</Tab>
            <Tab value="invoices" class="font3">Invoices</Tab>
          </TabList>

          <TabPanels class="p-0 py-3">
            <TabPanel value="classes">
              <ProductsListItem :product="product"></ProductsListItem>
            </TabPanel>
            <TabPanel value="invoices">
              <template
                v-if="invoice"
                v-for="invoice in invoice"
                :key="`invoice_item_${invoice.id}`"
              >
                <PlanSubscriptionInvoice
                  :invoice="invoice"
                ></PlanSubscriptionInvoice>
              </template>

              <div v-else class="d-block py-6">
                <div class="emptyArea">
                  <div>
                    <i class="pi pi-receipt"></i>
                    <h4 class="font3 mb-0">
                      {{ $utils.t("No Invoices found.") }}
                    </h4>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>

      <!--All Subscriptions-->
      <div
        v-else-if="subscriptions"
        v-for="subscription in subscriptions"
        :key="`subscription_item_${subscription.id}`"
        @click="select(subscription.id)"
      >
        <PlanSubscriptionItem
          :subscription="subscription"
          type="detailed"
        ></PlanSubscriptionItem>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: null,
    },
    header: {
      type: Boolean,
      default: true,
    },
    subscriptionId: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      loading: true,
      subscriptions: null,
      invoices: null,
      selected: null,
    }
  },

  computed: {
    subscription() {
      if (this.subscriptions && this.selected) {
        return this.subscriptions.find((i) => i.id === this.selected)
      }
      return
    },
    product() {
      if (this.subscription && this.selected) {
        return getProductById(this.subscription.plan.product)
      }
      return
    },
    invoice() {
      if (this.invoices && this.selected) {
        return this.invoices.filter((i) => i.subscription === this.selected)
      }
      return
    },
  },

  async mounted() {
    this.loading = true

    if (this.subscriptionId) {
      this.selected = this.subscriptionId
    }

    await this.getSubscriptions()
    await this.getInvoices()

    this.loading = false
  },

  methods: {
    async getSubscriptions() {
      const { data } = await this.$stripe.subscription.list({
        customerId: this.id,
      })

      if (data && data.length > 0) {
        let filteredData = data.filter(
          (i) => i.status === "active" || i.status === "canceled"
        )
        if (filteredData.length > 0) {
          this.subscriptions = filteredData
        }
      }

      console.log("Subscriptions ::: ", this.subscriptions)
    },
    async getInvoices() {
      const { data } = await this.$stripe.invoice.list(this.id)

      if (data && data.length > 0) {
        this.invoices = data
      }

      console.log("Invoices ::: ", data)
    },
    select(id) {
      this.selected = id
    },
    async deleteSubscription() {
      this.$bus.$emit("confirm", {
        header: "Cancel Subscription",
        message: "Are you sure you want to cancel your subsription?",
        callback: async () => {
          const subscriptionId = this.selected
          const res = await this.$stripe.subscription.cancel(subscriptionId)

          console.log("Delete subscription ::: ", res)

          if (res) {
            this.$bus.$emit("toast", {
              severity: "success",
              summary: "Subscription",
              detail: "Successfully cancelled subscription.",
            })

            await useServicesStore().setSubscriptions()
            await useServicesStore().setInvoices()

            this.$bus.$emit("sidebarGlobal", { id: "account" })
          }
        },
      })
    },
  },
}
</script>
