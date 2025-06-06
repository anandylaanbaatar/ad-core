<template>
  <div class="sidebar authSidebar">
    <!--Step 1-->
    <template v-if="step === 1">
      <h1 class="my-3 md:my-4">{{ $utils.t("Welcome") }}</h1>
      <FormsAuthSignUp></FormsAuthSignUp>
    </template>

    <!--Step 2-->
    <!-- <FormsPhoneCode v-else-if="step === 2" :phone="form.phone"></FormsPhoneCode> -->

    <div class="bottom">
      <div
        @click="
          $bus.$emit('sidebarGlobal', {
            id: 'account',
          })
        "
        class="btn"
      >
        {{ $utils.t("Already have an account?") }}
        <strong>{{ $utils.t("Sign In") }}</strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      active: false,
      step: 1,
    }
  },
}
</script>
