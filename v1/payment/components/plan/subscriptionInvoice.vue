<template>
  <div v-if="invoice" class="d-block c-link mb-3">
    <h3 class="w-full flex mb-1">
      Invoice
      <Tag v-if="invoice.status" severity="success" class="ml-auto">Paid</Tag>
    </h3>

    <h4>
      <span
        >{{ invoice.currency.toUpperCase() }}
        {{ invoice.amount_paid / 100 }}</span
      >
    </h4>

    <p class="text-sm flex w-full">
      {{ $utils.utcSecToDate(invoice.created) }}
      <span class="ml-auto">{{ invoice.number }}</span>
    </p>

    <div class="w-full flex">
      <Button
        icon="pi pi-download"
        class="sm ml-auto mt-2"
        @click.stop="downloadInvoice"
        v-tooltip.left="'Download Invoice PDF'"
      ></Button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    invoice: {
      type: Object,
      default: null,
    },
  },

  mounted() {
    console.log("Invoice ::: ", this.invoice)
  },

  methods: {
    downloadInvoice() {
      let url = this.invoice.invoice_pdf
      window.open(url, "_blank")
    },
  },
}
</script>
