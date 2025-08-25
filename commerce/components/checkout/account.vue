<template>
  <Loader v-if="loading"></Loader>

  <template v-else>
    <section v-if="user" class="mb-5">
      <h3 class="mb-3">{{ $utils.t("Account") }}</h3>

      <ul class="c-radio">
        <li>
          <i class="pi pi-circle-fill"></i>

          <div class="d-block active">
            <div class="row">
              <div class="col-xs-8">
                <div>
                  <h3>{{ user.firstName }} {{ user.lastName }}</h3>
                  <p v-if="user.email" class="mt-1 flex align-items-center">
                    <i class="pi pi-envelope mr-2"></i> {{ user.email }}
                    <template v-if="user.phone">
                      <i class="pi pi-phone ml-3 mr-2"></i>
                      {{ $utils.formatPhone(user.phone) }}
                    </template>
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
  computed: {
    user() {
      return useAuthStore().user
    },
  },

  data() {
    return {
      loading: false,
    }
  },
}
</script>
