<template>
  <div class="mapArea">
    <div id="map"></div>

    <div id="infowindow-content">
      <span id="place-address"></span>
    </div>

    <InputGroup class="searchAddressInputGroup">
      <InputGroupAddon>
        <i class="pi pi-search"></i>
      </InputGroupAddon>
      <InputText
        id="searchAddress"
        ref="searchAddress"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :placeholder="$utils.t('Search address')"
        class="searchAddressInput"
      />
      <InputGroupAddon class="findAddressInput p-0">
        <Button
          :label="$utils.t('Find Address')"
          icon="pi pi-map-marker"
          class="w-full m-0"
          @click="getBrowserLocation"
        ></Button>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<script>
export default {
  props: {
    address: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      map: null,
      autocomplete: null,
      infowindow: null,
      marker: null,

      formattedAddress: null,
      userGeoInfo: null,
      mapPosition: {
        lat: 47.9173341,
        lng: 106.9155,
      },
    }
  },

  async mounted() {
    await this.getUserGeo()
    await this.checkDefaultAddress()

    this.initMap()
  },

  methods: {
    async getUserGeo() {
      // const res = await this.$address.geoLocation()
      // this.userGeoInfo = res

      // if (res && res.latitude && res.longitude) {
      //   this.mapPosition = {
      //     lat: res.longitude,
      //     lng: res.latitude,
      //   }
      // }

      const store = useCommerceStore()

      if (store.userLocation) {
        this.mapPosition = {
          lat: store.userLocation.latitude,
          lng: store.userLocation.longitude,
        }
      }
    },
    async getBrowserLocation() {
      const position = await this.$address.getBrowserLocation()

      console.log("Get Browser Location ::: ", position)

      if (position) {
        this.map.setZoom(18)
        this.map.setCenter(position)
        // this.marker.setPosition(position)
        this.setMarker(position)

        this.geoCoderByLatLng(position.lat, position.lng)
      }
    },
    async geoCoderByAddress(full_address) {
      if (!full_address) return

      const res = await this.$address.addressToLatLng(full_address)

      console.log("Address ::: Geocode from address to lat lng: ", res)

      if (res && res.results && res.results.length > 0) {
        this.mapPosition = {
          lat: res.results[0].geometry.location.lat,
          lng: res.results[0].geometry.location.lng,
        }
      }
    },
    geoCoderByPlace(place) {
      const geocoder = new google.maps.Geocoder()

      geocoder
        .geocode({ placeId: place.place_id })
        .then(({ results }) => {
          // console.log("Geocoder ::: PlaceId :: ", results)
        })
        .catch((e) => console.log("Geocoder failed due to: " + e))
    },
    geoCoderByLatLng(lat, lng) {
      const geocoder = new google.maps.Geocoder()

      geocoder
        .geocode({
          location: {
            lat: lat,
            lng: lng,
          },
        })
        .then(({ results }) => {
          // console.log("Geocoder ::: LatLng :: ", results)

          if (results && results.length > 0) {
            this.formatPlace(results[0])
          }
        })
        .catch((e) => console.log("Geocoder failed due to: " + e))
    },
    async checkDefaultAddress() {
      if (this.address) {
        if (this.address.lat && this.address.lng) {
          this.mapPosition = {
            lat: parseFloat(this.address.lat),
            lng: parseFloat(this.address.lng),
          }
        } else if (this.address.full_address) {
          await this.geoCoderByAddress(this.address.full_address)
        }
      }
    },

    // Map
    initMap() {
      setTimeout(async () => {
        await this.setMap()
        this.setInfoWindow()
        this.setAutoComplete()
        await this.setMarker()
      }, 300)
    },
    async setMap() {
      const { Map } = await google.maps.importLibrary("maps")

      let mapPosition = this.mapPosition
      let mapZoom = 15

      if (this.address) {
        mapZoom = 18
      }

      this.map = new Map(document.getElementById("map"), {
        center: mapPosition,
        mapId: "8e428c2868f9b88e",
        zoom: mapZoom,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      this.map.addListener("click", async (event) => {
        const position = event.latLng
        await this.setMarker(position)
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.geoCoderByLatLng(position.lat(), position.lng())
      })
    },

    // Autocomplete
    setAutoComplete() {
      this.autocomplete = new google.maps.places.Autocomplete(
        document.getElementById("searchAddress"),
        {
          // componentRestrictions: { country: "mn" },
          fields: [
            "place_id",
            "address_components",
            "geometry",
            "icon",
            "name",
            "formatted_address",
          ],
          strictBounds: false,
        }
      )
      this.autocomplete.bindTo("bounds", this.map)

      // Events
      this.autocomplete.addListener("place_changed", () => {
        this.infowindow.close()

        const place = this.autocomplete.getPlace()

        if (!place.place_id) {
          return
        }

        const position = place.geometry.location
        this.setMarker(position)
        this.map.setCenter(position)
        this.map.setZoom(18)

        this.geoCoderByPlace(place)
        this.formatPlace(place)
      })
    },

    // InfoWindow
    setInfoWindow() {
      this.infowindow = new google.maps.InfoWindow()
      const infowindowContent = document.getElementById("infowindow-content")
      this.infowindow.setContent(infowindowContent)
    },
    setInfoWindowContent() {
      const position = this.marker.position

      this.infowindow.setContent(`Pin at: ${position.lat()}, ${position.lng()}`)
      this.infowindow.open(this.map, this.marker)
    },

    // Marker
    async setMarker(position) {
      if (this.marker) {
        this.marker.setVisible(false)
        this.marker = null
      }

      let markerPosition = position ? position : this.mapPosition

      const marker = new google.maps.Marker({
        map: this.map,
        position: markerPosition,
        draggable: true,
      })

      // Events
      marker.addListener("click", (event) => {
        const position = event.latLng
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.setInfoWindowContent()
      })
      marker.addListener("dragend", (event) => {
        const position = event.latLng
        this.map.setCenter(position)
        this.map.setZoom(18)
        this.geoCoderByLatLng(position.lat(), position.lng())
      })

      this.marker = marker
    },

    setMapItems(place) {
      // Set Map
      this.map.setZoom(18)
      this.map.setCenter(place.geometry.location)

      // Set Marker
      this.setMarker(place.geometry.location)

      this.marker.setPlace({
        placeId: place.place_id,
        location: place.geometry.location,
      })
      this.marker.setVisible(true)

      // Set InfoWindo
      const infowindowContent = document.getElementById("infowindow-content")

      infowindowContent.children["place-address"].textContent =
        place.formatted_address

      // this.infowindow.open(this.map, this.marker)

      // Set Visible Address
      this.formattedAddress = place.formatted_address
    },

    // Results and Address Mapping
    formatPlace(place) {
      // console.log("Map ::: Place :: ", place)

      let formData = {}

      // Country
      place.address_components
        .filter((i) => i.types.includes("country"))
        .map((i) => (formData.country = i.long_name))

      // Zipcode
      place.address_components
        .filter((i) => i.types.includes("postal_code"))
        .map((i) => (formData.zip = i.long_name))

      // City
      place.address_components
        .filter((i) => i.types.includes("locality"))
        .map((i) => (formData.city = i.long_name))

      for (let i = 0; i < place.address_components.length; i++) {
        let item = place.address_components[i]

        // Mongolia
        if (formData.country === "Mongolia") {
          // Province
          if (item.types.includes("sublocality_level_1")) {
            formData.province = item.long_name
          }
          if (!formData.province) {
            if (item.types.includes("administrative_area_level_2")) {
              formData.province = item.long_name
            }
          }
          // Street
          if (item.types.includes("street_number")) {
            formData.street = item.long_name
          }
          if (item.types.includes("route")) {
            if (formData.street) {
              formData.street += " " + item.short_name
            }
          }
          if (item.types.includes("plus_code")) {
            formData.street = item.long_name
          }
          if (item.types.includes("premise")) {
            formData.street = item.long_name
          }
          // Other Countries
        } else {
          // Province
          if (item.types.includes("administrative_area_level_1")) {
            formData.province = item.long_name
          }
          // Street
          if (item.types.includes("street_number")) {
            formData.street = item.long_name
          }
          if (item.types.includes("route")) {
            if (formData.street) {
              formData.street += " " + item.short_name
            }
          }
        }
      }

      formData.location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      formData.formatted_address = place.formatted_address
      // formData.name = place.name

      console.log("Map ::: Format Place :: ", place, formData)

      this.$emit("geocode", formData)
    },
  },
}
</script>
