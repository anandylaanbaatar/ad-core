<template>
  <AdminLayout>
    <h2 class="mb-4">Dashboard</h2>

    <div class="row no-margin">
      <!--Revenue-->
      <div class="col-xs-12 col-md-3 mb-4">
        <div class="d-block p-4">
          <h4>Total Revenue</h4>
          <h2 class="mt-2 mb-1">$1200.00</h2>
          <p>*Including taxes and fees</p>
        </div>
      </div>

      <!--Customers-->
      <div class="col-xs-12 col-md-3 mb-4">
        <div class="d-block p-4">
          <h4>Customers</h4>
          <h2 class="mt-2 mb-1">4</h2>
          <p>*Including active and inactive</p>
        </div>
      </div>

      <!--Sales-->
      <div class="col-xs-12 col-md-3 mb-4">
        <div class="d-block p-4">
          <h4>Sales</h4>
          <h2 class="mt-2 mb-1">5</h2>
          <p>*Including recurring payments</p>
        </div>
      </div>

      <!--Subscriptions-->
      <div class="col-xs-12 col-md-3 mb-4">
        <div class="d-block p-4">
          <h4>Active Subscriptions</h4>
          <h2 class="mt-2 mb-1">5</h2>
          <p>*Including trials and free plans</p>
        </div>
      </div>

      <!--Transactions-->
      <div class="col-xs-12 col-md-8 mb-4">
        <div class="d-block p-4 size-l-9">
          <h4>Active Subscriptions</h4>
          <p class="mb-3">Recent transactions from your site.</p>

          <ul>
            <li v-for="i in 10" class="d-block mb-2"></li>
          </ul>
        </div>
      </div>

      <!--Recent Customers-->
      <div class="col-xs-12 col-md-4 mb-4">
        <div class="d-block p-4 size-l-9">
          <h4>Recent Customers</h4>
          <p class="mb-3">Latest registered users.</p>

          <ul>
            <li v-for="i in 10" class="d-block mb-2"></li>
          </ul>
        </div>
      </div>

      <!--Analytics - Visitors-->
      <div class="col-xs-12 col-md-4 mb-4">
        <div class="d-block p-4">
          <h4>Total Visitors</h4>
          <h2 class="mt-2 mb-1">0</h2>
          <p>*All real time visitors.</p>
        </div>
      </div>

      <!--Analytics - Page Views-->
      <div class="col-xs-12 col-md-4 mb-4">
        <div class="d-block p-4">
          <h4>Page Views</h4>
          <h2 class="mt-2 mb-1">0</h2>
          <p>*All website page views.</p>
        </div>
      </div>

      <!--Analytics - Page Views-->
      <div class="col-xs-12 col-md-4 mb-4">
        <div class="d-block p-4">
          <h4>Bounce Rate</h4>
          <h2 class="mt-2 mb-1">0</h2>
          <p>*Your website bounce rate.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>
