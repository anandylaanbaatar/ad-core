<template>
  <div class="sidebar storesSidebar">
    <h3>Байршил сонгох</h3>

    <div class="row">
      <div class="col-xs-12">
        <div class="c-form">
          <label for="search">Байршил хайх</label>

          <InputGroup class="c-field">
            <InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
            <InputText
              id="search"
              v-model="form.search"
              aria-describedby="search-help"
              placeholder="Аймаг нэр болон байршил оруулна уу"
            />
          </InputGroup>
        </div>
        <!-- <small id="emailAddress-help" class="error"
          >Enter your username to reset your password.</small
        > -->
      </div>

      <div v-if="loading" class="w-full justify-content-center">
        <Loader></Loader>
      </div>

      <div v-else class="col-xs-12">
        <ScrollPanel style="width: 100%; height: 500px">
          <div
            v-for="location in filteredLocations"
            :key="`store_item_${location.id}`"
            class="d-box sm mb15 storeItem"
            :class="{ active: location.active }"
            @click="selectLocation(location)"
          >
            <div>
              <i v-if="location.active" class="pi pi-check c-green"></i>
              <h4 class="font2">{{ location.name }}</h4>
              <p>{{ location.desc }}</p>
            </div>
          </div>
        </ScrollPanel>
      </div>
    </div>

    <div class="bottom">
      <div @click="$bus.$emit('goTo', '/contact')">
        Шинэ түнш болох хүсэлтэй байна уу? <strong>Холбоо барих</strong>
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
      loading: false,

      form: {
        search: null,
      },
    }
  },

  computed: {
    locations() {
      let allLocations = useCommerceStore().locations
      return allLocations
    },
    filteredLocations() {
      if (this.locations) {
        if (this.form.search) {
          return this.locations.filter(
            (i) => i.name.indexOf(this.form.search) !== -1
          )
        } else {
          return this.locations
        }
      }
      return []
    },
    selectedLocation() {
      return useCommerceStore().selectedLocation
    },
  },

  methods: {
    async selectLocation(location) {
      this.loading = true

      const store = useCommerceStore()
      await store.setLocation(location.name)

      this.loading = false
    },
  },
}
</script>
