<template>
  <div class="sidebar searchSidebar">
    <div class="w-full">
      <InputGroup class="c-field c-transparent">
        <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
        <InputText
          v-model="query"
          class="w-full"
          :placeholder="$utils.t('Search')"
          @keydown.enter="search"
        />
      </InputGroup>
    </div>

    <!-- <div class="row quickLinks">
      <div class="col-xs-12 col-md-6 col-lg-4">
        <div class="box">
          <h5>Бараа бүтээгдэхүүн</h5>

          <ul class="c-list">
            <li>
              <nuxt-link to="/">Гэрэл гэрэлтүүлэг</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Цахилгаан бараа</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Гэр ахуйн бараа</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Хүүхдийн бараа</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Шил шаазан</nuxt-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-xs-12 col-md-6 col-lg-4">
        <div class="box">
          <h5>Компани</h5>

          <ul class="c-list">
            <li>
              <nuxt-link to="/">Бидний тухай</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Салбар байршил</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Түгээмэл асуулт, хариулт</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Түнш болох</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Холбоо барих</nuxt-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-xs-12 col-md-6 col-lg-4">
        <div class="box">
          <h5>Тусламж</h5>

          <ul class="c-list">
            <li>
              <nuxt-link to="/">Харилцагчдийн тусламж</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Буцаах болон солих</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Барааны тусламж</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Хүргэлтийн тусламж</nuxt-link>
            </li>
            <li>
              <nuxt-link to="/">Холбоосууд</nuxt-link>
            </li>
          </ul>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: false,
      query: null,
    }
  },

  methods: {
    search() {
      if (!this.query) return
      this.$bus.$emit("goTo", `/search?query=${this.query}`)
    },
  },
}
</script>
