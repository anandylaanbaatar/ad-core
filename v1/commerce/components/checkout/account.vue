<template>
  <Loader v-if="loading"></Loader>

  <template v-else>
    <section v-if="account" class="mb-5">
      <h3 class="mb-3">{{ $utils.t("Account") }}</h3>

      <ul class="c-radio">
        <li>
          <i class="pi pi-circle-fill"></i>

          <div class="d-block active">
            <div class="row">
              <div class="col-xs-8">
                <div>
                  <h3>{{ account.firstName }} {{ account.lastName }}</h3>
                  <p class="mt-1">
                    <i class="pi pi-envelope"></i> {{ account.email }} |
                    <i class="pi pi-phone"></i>
                    {{ $utils.formatPhone(account.phone) }}
                  </p>
                </div>
              </div>
              <div class="col-xs-4 right"></div>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <NotLoggedIn v-else></NotLoggedIn>
  </template>
</template>

<script>
export default {
  props: {
    account: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      loading: false,
    }
  },
}
</script>
