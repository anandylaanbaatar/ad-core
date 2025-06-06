<template>
  <AdminLayout>
    <div class="mb-3">
      <h2>Media</h2>

      <InputGroup class="mt-2">
        <InputGroupAddon>
          <i class="pi pi-search"></i>
        </InputGroupAddon>
        <InputText
          v-model="inputSearch"
          :placeholder="$utils.t('Search')"
          @keypress.enter="search"
          @keyup="searchDebounce(search)"
        ></InputText>
        <Button :style="`border-radius:10px;height:41px;`" @click="search"
          >Search</Button
        >
      </InputGroup>
    </div>

    <div class="row">
      <div v-if="loading" class="col-xs-12">
        <Loader></Loader>
      </div>

      <template v-else-if="source">
        <Tabs :value="tab" class="w-full">
          <TabList class="px-3">
            <Tab
              v-for="sourceId in tabs"
              :key="`tab_item_${sourceId}`"
              :value="sourceId"
              class="font3 capitalize"
              @click="tab = sourceId"
            >
              <template v-if="sourceId === 'ad_media'">AD Media</template>
              <template v-else>
                {{ sourceId }}
              </template>
              <span v-if="source[sourceId].meta" class="ml-1">
                ({{ source[sourceId].meta.total }})</span
              ></Tab
            >
          </TabList>

          <TabPanels>
            <TabPanel value="ad_media" :key="`ad_media_${key}`">
              <div class="row">
                <div v-if="!source.ad_media.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p v-if="source.ad_media.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.ad_media.page }} of
                  {{ source.ad_media.meta.totalPages }}. Showing
                  {{ source.ad_media.photos.length }} of
                  {{ source.ad_media.meta.total }} photos.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.ad_media.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.url)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.url)"
                  >
                    <div class="c-block-top-right p-2">
                      <PopoverActions>
                        <ul class="c-list">
                          <li
                            v-if="
                              adMedia &&
                              adMedia.allPhotos &&
                              adMedia.allPhotos.find((i) => i.url === photo.url)
                            "
                            @click.stop="removePhoto(photo.url)"
                          >
                            <div class="c-list-item">
                              <i class="pi pi-heart-fill"></i> Remove
                            </div>
                          </li>
                          <li v-else @click.stop="savePhoto(photo.url)">
                            <div class="c-list-item">
                              <i class="pi pi-heart"></i> Save
                            </div>
                          </li>
                          <li @click.stop="copyPhotoUrl(photo.url)">
                            <div class="c-list-item">
                              <i class="pi pi-copy"></i> Copy
                            </div>
                          </li>
                        </ul>
                      </PopoverActions>
                    </div>
                  </div>
                </div>

                <div
                  v-if="source.ad_media.meta && source.ad_media.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.ad_media.loading" type="none"></Loader>
                  <Button v-else @click="searchADMedia(true)">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="prismic" :key="`prismic_${key}`">
              <div class="row">
                <div v-if="!source.prismic.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <div class="col-xs-12 text-center">
                  <FileUpload
                    mode="basic"
                    name="prismic"
                    accept="image/*"
                    :maxFileSize="1000000"
                    chooseLabel="Upload Image"
                    @select="uploadPrismic"
                    customUpload
                    auto
                    severity="secondary"
                  ></FileUpload>
                </div>

                <p v-if="source.prismic.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.prismic.page }} of
                  {{ source.prismic.meta.totalPages }}. Showing
                  {{ source.prismic.photos.length }} of
                  {{ source.prismic.meta.total }} photos.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.prismic.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.url)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.url)"
                  >
                    <div class="c-block-top-right p-2">
                      <PopoverActions>
                        <ul class="c-list">
                          <li @click.stop="copyPhotoUrl(photo.url)">
                            <div class="c-list-item">
                              <i class="pi pi-copy"></i> Copy
                            </div>
                          </li>
                        </ul>
                      </PopoverActions>
                    </div>
                  </div>
                </div>

                <div
                  v-if="source.prismic.meta && source.prismic.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.prismic.loading" type="none"></Loader>
                  <Button v-else @click="searchPrismic(true)">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="uploadcare" :key="`uploadcare_${key}`">
              <div class="row">
                <div v-if="!source.uploadcare.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <div class="col-xs-12 text-center">
                  <FileUpload
                    mode="basic"
                    name="uploadcare"
                    accept="image/*"
                    :maxFileSize="1000000"
                    chooseLabel="Upload Image"
                    @select="uploadCare"
                    customUpload
                    auto
                    severity="secondary"
                  ></FileUpload>
                </div>

                <p v-if="source.uploadcare.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.uploadcare.page }} of
                  {{ source.uploadcare.meta.totalPages }}. Showing
                  {{ source.uploadcare.photos.length }} of
                  {{ source.uploadcare.meta.total }} photos.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.uploadcare.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.cdnUrl)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.cdnUrl)"
                  >
                    <div class="c-block-top-right p-2">
                      <PopoverActions>
                        <ul class="c-list">
                          <li @click.stop="copyPhotoUrl(photo.cdnUrl)">
                            <div class="c-list-item">
                              <i class="pi pi-copy"></i> Copy
                            </div>
                          </li>
                        </ul>
                      </PopoverActions>
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    source.uploadcare.meta && source.uploadcare.meta.hasMore
                  "
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.uploadcare.loading" type="none"></Loader>
                  <Button v-else @click="searchUploadCare(true)"
                    >View More</Button
                  >
                </div>
              </div>
            </TabPanel>

            <TabPanel value="unsplash" :key="`unsplash_${key}`">
              <div class="row">
                <div v-if="!source.unsplash.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p v-if="source.unsplash.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.unsplash.page }} of
                  {{ source.unsplash.meta.totalPages }}. Total
                  {{ source.unsplash.meta.total }} photos found.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.unsplash.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.urls.regular)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.urls.regular)"
                  >
                    <div class="c-block-top-right p-2">
                      <Button
                        v-if="
                          adMedia &&
                          adMedia.allPhotos &&
                          adMedia.allPhotos.find(
                            (i) => i.url === photo.urls.regular
                          )
                        "
                        icon="pi pi-heart-fill"
                        class="sm p-button-secondary"
                        severity="secondary"
                        @click.stop="removePhoto(photo.urls.regular)"
                      ></Button>
                      <Button
                        v-else
                        icon="pi pi-heart"
                        class="sm p-button-secondary"
                        severity="secondary"
                        @click.stop="savePhoto(photo.urls.regular)"
                      ></Button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="source.unsplash.meta && source.unsplash.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.unsplash.loading" type="none"></Loader>
                  <Button v-else @click="searchUnsplash">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="lummi" :key="`lummi_${key}`">
              <div class="row">
                <div v-if="!source.lummi.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p v-if="source.lummi.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.lummi.page }} of {{ source.lummi.meta.totalPages }}.
                  Total {{ source.lummi.meta.total }} photos found.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.lummi.photos"
                  :key="`photo_${photo.id}`"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.url)"
                    @click="selectPhoto(photo.url)"
                  >
                    <div class="c-block-top-right p-2">
                      <Button
                        v-if="
                          adMedia &&
                          adMedia.allPhotos &&
                          adMedia.allPhotos.find((i) => i.url === photo.url)
                        "
                        icon="pi pi-heart-fill"
                        class="sm p-button-secondary"
                        severity="secondary"
                        @click.stop="removePhoto(photo.url)"
                      ></Button>
                      <Button
                        v-else
                        icon="pi pi-heart"
                        class="sm p-button-secondary"
                        severity="secondary"
                        @click.stop="savePhoto(photo.url)"
                      ></Button>
                    </div>
                  </div>
                </div>

                <div
                  v-if="source.lummi.meta && source.lummi.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.lummi.loading" type="none"></Loader>
                  <Button v-else @click="searchLummi">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="pexels" :key="`pexels_${key}`">
              <div class="row">
                <div v-if="!source.pexels.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p v-if="source.pexels.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.pexels.page }} of
                  {{ source.pexels.meta.totalPages }}. Total
                  {{ source.pexels.meta.total }} photos found.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.pexels.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.src.large2x)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.src.large2x)"
                  ></div>
                </div>

                <div
                  v-if="source.pexels.meta && source.pexels.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.pexels.loading" type="none"></Loader>
                  <Button v-else @click="searchPexels">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="pixabay" :key="`pixabay_${key}`">
              <div class="row">
                <div v-if="!source.pixabay.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p v-if="source.pixabay.meta" class="col-xs-12 mb-3 text-sm">
                  Page
                  {{ source.pixabay.page }} of
                  {{ source.pixabay.meta.totalPages }}. Total
                  {{ source.pixabay.meta.total }} photos found.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.pixabay.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.largeImageURL)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.largeImageURL)"
                  ></div>
                </div>

                <div
                  v-if="source.pixabay.meta && source.pixabay.meta.hasMore"
                  class="col-xs-12 text-center py-3"
                >
                  <Loader v-if="source.pixabay.loading" type="none"></Loader>
                  <Button v-else @click="searchPixabay">View More</Button>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="shutterstock" :key="`shutterstock_${key}`">
              <div class="row">
                <div v-if="!source.shutterstock.photos" class="col-xs-12">
                  <UiEmpty
                    icon="pi-images"
                    desc="No photos here. Try searching a photo"
                    class="py-8"
                  ></UiEmpty>
                </div>

                <p
                  v-if="source.shutterstock.meta"
                  class="col-xs-12 mb-3 text-sm"
                >
                  Page
                  {{ source.shutterstock.page }} of
                  {{ source.shutterstock.meta.totalPages }}. Total
                  {{ source.shutterstock.meta.total }} photos found.
                </p>

                <div
                  class="col-xs-12 col-md-3"
                  v-for="photo in source.shutterstock.photos"
                  :key="`photo_${photo.id}`"
                  @click="selectPhoto(photo.assets.preview_1500.url)"
                >
                  <div
                    class="c-block image mb-4 imageSelect"
                    :style="$utils.setBackImage(photo.assets.preview_1500.url)"
                  ></div>
                </div>

                <div
                  v-if="
                    source.shutterstock.meta && source.shutterstock.meta.hasMore
                  "
                  class="col-xs-12 text-center py-3"
                >
                  <Loader
                    v-if="source.shutterstock.loading"
                    type="none"
                  ></Loader>
                  <Button v-else @click="searchShutterstock">View More</Button>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </template>

      <Drawer
        v-model:visible="imagePreview.active"
        position="full"
        ref="imagePreview"
        class="imagePreview"
        @hide="
          imagePreview = {
            active: false,
            url: null,
          }
        "
      >
        <div class="content">
          <div class="top">
            <div class="menu" :key="`imagePreview_menu_${key}`">
              <Button
                v-tooltip.top="'Copy'"
                icon="pi pi-copy"
                @click="copyPhotoUrl(imagePreview.url)"
              ></Button>

              <Button
                v-if="
                  adMedia &&
                  adMedia.allPhotos &&
                  adMedia.allPhotos.find((i) => i.url === imagePreview.url)
                "
                v-tooltip.top="'Remove'"
                icon="pi pi-heart-fill"
                @click="removePhoto(imagePreview.url)"
              ></Button>
              <Button
                v-else
                v-tooltip.top="'Save'"
                icon="pi pi-heart"
                @click="savePhoto(imagePreview.url)"
              ></Button>
            </div>
          </div>

          <div class="center">
            <img
              v-if="imagePreview.url"
              class="image"
              :src="imagePreview.url"
              @click="copyPhotoUrl(imagePreview.url)"
            />
          </div>

          <div
            v-if="imagePreview.url"
            class="back"
            :style="$utils.setBackImage(imagePreview.url)"
            @click="copyPhotoUrl(imagePreview.url)"
          >
            <div class="dimmer"></div>
          </div>
        </div>
      </Drawer>
    </div>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      inputSearch: null,
      loading: false,
      tab: "unsplash",
      key: 0,

      filters: {
        perPage: 20,
        color: null,
      },

      uploadSources: ["ad_media", "prismic", "uploadcare"],
      sources: ["unsplash", "lummi", "pexels", "pixabay", "shutterstock"],
      source: null,

      imagePreview: {
        active: false,
        url: null,
      },
    }
  },

  computed: {
    colorOptions() {
      return [
        {
          id: "black",
          hex: "#000000",
          value: "black",
        },
        {
          id: "white",
          hex: "#ffffff",
          value: "white",
        },
        {
          id: "yellow",
          hex: "#ffff00",
          value: "yellow",
        },
        {
          id: "orange",
          hex: "#ffa500",
          value: "orange",
        },
        {
          id: "red",
          hex: "#ff0000",
          value: "red",
        },
        {
          id: "purple",
          hex: "#800080",
          value: "purple",
        },
        {
          id: "magenta",
          hex: "#ff00ff",
          value: "magenta",
        },
        {
          id: "green",
          hex: "#008000",
          value: "green",
        },
        {
          id: "teal",
          hex: "#069494",
          value: "teal",
        },
        {
          id: "blue",
          hex: "#0000ff",
          value: "blue",
        },
      ]
    },
    tabs() {
      let allTabs = []

      for (let i = 0; i < this.uploadSources.length; i++) {
        allTabs.push(this.uploadSources[i])
      }
      for (let i = 0; i < this.sources.length; i++) {
        allTabs.push(this.sources[i])
      }

      return allTabs
    },
  },

  async mounted() {
    this.init()

    this.initADMedia()
    this.searchPrismic()
    this.searchUploadCare()

    if (
      this.adMedia &&
      this.adMedia.allPhotos &&
      this.adMedia.allPhotos.length > 0
    ) {
      this.tab = "ad_media"
    }
  },

  methods: {
    init() {
      this.reset()
    },
    reset() {
      this.meta = null
      // this.inputSearch = null

      this.filters = {
        perPage: 20,
      }

      if (this.source === null) {
        this.source = {}

        for (let i = 0; i < this.uploadSources.length; i++) {
          const id = this.uploadSources[i]

          this.source[id] = {
            loading: false,
            page: 0,
            meta: null,
            photos: null,
          }
        }
      }

      for (let i = 0; i < this.sources.length; i++) {
        const id = this.sources[i]
        this.source[id] = {
          loading: false,
          page: 0,
          meta: null,
          photos: null,
        }
      }
    },
    async search() {
      if (this.loading) return
      this.loading = true

      await this.searchUnsplash()
      await this.searchLummi()
      await this.searchPexels()
      await this.searchPixabay()
      await this.searchShutterstock()
      // this.initADMedia()

      this.loading = false
    },
    async searchDebounce(callback, ms) {
      const time = ms ? ms : 1000
      clearTimeout(this.timeout)

      if (!this.inputSearch) {
        this.reset()
        this.init = false
        return
      }

      this.timeout = setTimeout(() => {
        if (!this.init) this.init = true
        this.reset()
        callback()
      }, time)
    },

    // Sources
    async searchUnsplash() {
      if (this.source.unsplash.loading) return
      if (this.inputSearch === null) {
        this.reset()
        return
      }
      this.source.unsplash.page += 1
      this.source.unsplash.loading = true

      const apiKeys = [
        "9jeGorNJiyHItxo_XyARQJyh6w2lLa2ULia67iYHQKE",
        "OQ8_eg2Fi6t5wW0JS5kTDuoV04PfGsTv0_Yhb0XZWbg",
      ]
      let path = "search/photos"
      const url = `https://api.unsplash.com/${path}?query=${this.inputSearch}&page=${this.source.unsplash.page}&per_page=${this.filters.perPage}`

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Client-ID ${apiKeys[1]}`,
          },
        })

        console.log("Unsplash Photos ::: ", res)

        if (res) {
          // Set Photos
          if (this.source.unsplash.page === 1) {
            this.source.unsplash.photos = res.results
          } else {
            for (let i = 0; i < res.results.length; i++) {
              this.source.unsplash.photos.push(res.results[i])
            }
          }

          // Set Meta
          this.source.unsplash.meta = {
            total: res.total,
            totalPages: res.total_pages,
            hasMore: false,
          }
          if (res.total_pages > this.source.unsplash.page) {
            this.source.unsplash.meta.hasMore = true
          }
        }

        this.source.unsplash.loading = false
      } catch (err) {
        console.log("Search error ::: ", err.message)
        this.source.unsplash.loading = false
      }
    },
    async searchLummi() {
      if (this.source.lummi.loading) return
      if (this.inputSearch === null) {
        this.reset()
        return
      }
      this.source.lummi.page += 1
      this.source.lummi.loading = true

      const apiKey = `lummi-1af09c25c5fc67b0d6dd43e83f66d391b14b1818d4f12c8e753e1cbca2f6ab21`
      let path = `images/search`
      const url = `https://api.lummi.ai/v1/${path}?query=${this.inputSearch}&imageType=photo&page=${this.source.lummi.page}&perPage=${this.filters.perPage}`

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })

        if (res) {
          console.log("Lummi Photos ::: ", res)

          // Set Photos
          if (this.source.lummi.page === 1) {
            this.source.lummi.photos = res.data
          } else {
            for (let i = 0; i < res.data.length; i++) {
              this.source.lummi.photos.push(res.data[i])
            }
          }

          // Set Meta
          let totalPages = 0

          if (res.meta.totalCount <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.meta.totalCount / this.filters.perPage)
          }

          this.source.lummi.meta = {
            total: res.meta.totalCount,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.lummi.photos) {
            if (this.source.lummi.photos.length < res.meta.totalCount) {
              this.source.lummi.meta.hasMore = true
            }
          }
        }

        this.source.lummi.loading = false
      } catch (err) {
        console.log("Search error ::: ", err.message)
        this.source.lummi.loading = false
      }
    },
    async searchPexels() {
      if (this.source.pexels.loading) return
      if (this.inputSearch === null) {
        this.reset()
        return
      }
      this.source.pexels.page += 1
      this.source.pexels.loading = true

      const apiKey = "LlZtqUE0gOy2lPYeMIhiolM1CjtJ61ghFqhJelVO00pGvM9FWzYIoYjx"
      let path = "search"
      const url = `https://api.pexels.com/v1/${path}?query=${this.inputSearch}&page=${this.source.pexels.page}&per_page=${this.filters.perPage}`

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Authorization: `${apiKey}`,
          },
        })

        if (res) {
          console.log("Pexels Photos ::: ", res)

          // Set Photos
          if (this.source.pexels.page === 1) {
            this.source.pexels.photos = res.photos
          } else {
            for (let i = 0; i < res.photos.length; i++) {
              this.source.pexels.photos.push(res.photos[i])
            }
          }

          // Set Meta
          let totalPages = 0
          if (res.total_results <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.total_results / this.filters.perPage)
          }
          this.source.pexels.meta = {
            total: res.total_results,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.pexels.photos) {
            if (this.source.pexels.photos.length < res.total_results) {
              this.source.pexels.meta.hasMore = true
            }
          }
        }

        this.source.pexels.loading = false
      } catch (err) {
        console.log("Search error ::: ", err.message)
        this.source.pexels.loading = false
      }
    },
    async searchShutterstock() {
      if (this.source.shutterstock.loading) return
      if (this.inputSearch === null) {
        this.reset()
        return
      }
      this.source.shutterstock.page += 1
      this.source.shutterstock.loading = true

      const apikey =
        "v2/NGlYMWlOc1hIYkFtakFlYU1PVUVUMDgxbG1GV0xVRjkvNDY1NDMzNTAxL2N1c3RvbWVyLzQvSE5PSmJPbHhubUlwdFBoSDhMaUV6bFVPRV9aY0dud2ZNU2JOUUFvUWJOdjdwdzNrS3U5V2NMUmltWURzUFBWbFBDemdhVWFCUjdBazBWWER5SzRCT0xZWk5oUjRsRnFjWXZXQzRyeENQM0N1akxzTUl4M2l5ME90MkpSb3VFNW1PUTVITVlVcENPd212ODdLUGhycnBiWjhmNUtudGNZcDl5c0cxemZpQkV6NHRNczFzd2h4NTVqY3p2YXc4VDdoS3ZDZmVBWUhCUHY2cnpOb3g1c1M0dy9Sc2ozSkRXMVdxRjBHVk1kamZnelNR"
      let path = "images/search"
      const url = `https://api.shutterstock.com/v2/${path}?query=${this.inputSearch}&image_type=photo&page=${this.source.shutterstock.page}&per_page=${this.filters.perPage}`

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apikey}`,
          },
        })

        if (res) {
          console.log("Shutterstock Photos ::: ", res)

          // Set Photos
          if (this.source.shutterstock.page === 1) {
            this.source.shutterstock.photos = res.data
          } else {
            for (let i = 0; i < res.data.length; i++) {
              this.source.shutterstock.photos.push(res.data[i])
            }
          }

          // Set Meta
          let totalPages = 0
          if (res.total_count <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.total_count / this.filters.perPage)
          }
          this.source.shutterstock.meta = {
            total: res.total_count,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.shutterstock.photos) {
            if (this.source.shutterstock.photos.length < res.total_count) {
              this.source.shutterstock.meta.hasMore = true
            }
          }
        }

        this.source.shutterstock.loading = false
      } catch (err) {
        console.log("Search error ::: ", err.message)
        this.source.shutterstock.loading = false
      }
    },
    async searchPixabay() {
      if (this.source.pixabay.loading) return
      if (this.inputSearch === null) {
        this.reset()
        return
      }
      this.source.pixabay.page += 1
      this.source.pixabay.loading = true

      const apiKey = "49892491-24016cbf90d03e35045d74cb4"
      let path = ""
      const url = `https://pixabay.com/api/${path}?key=${apiKey}&q=${encodeURIComponent(this.inputSearch)}&image_type=photo&page=${this.source.pixabay.page}&per_page=${this.filters.perPage}`

      try {
        const res = await $fetch(url, {
          method: "GET",
        })

        if (res) {
          console.log("Pixabay Photos ::: ", res)

          // Set Photos
          if (this.source.pixabay.page === 1) {
            this.source.pixabay.photos = res.hits
          } else {
            for (let i = 0; i < res.data.length; i++) {
              this.source.pixabay.photos.push(res.hits[i])
            }
          }

          // Set Meta
          let totalPages = 0
          if (res.total <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.total / this.filters.perPage)
          }
          this.source.pixabay.meta = {
            total: res.total,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.pixabay.photos) {
            if (this.source.pixabay.photos.length < res.total) {
              this.source.pixabay.meta.hasMore = true
            }
          }
        }

        this.source.pixabay.loading = false
      } catch (err) {
        console.log("Search error ::: ", err.message)
        this.source.pixabay.loading = false
      }
    },

    // Prismic
    async searchPrismic() {
      if (this.source.prismic.loading) return
      this.source.prismic.page += 1
      this.source.prismic.loading = true

      const apiKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6ImJldHRpbmthLXBpbGF0ZXMtYzJhN2FkYTAtODg3Ni00YjUyLWJlZGUtNmNkODIzOWRlMzk0XzUiLCJkYXRlIjoxNzQ1NTAwOTMyLCJkb21haW4iOiJiZXR0aW5rYS1waWxhdGVzIiwiYXBwTmFtZSI6IkFEIE1lZGlhIiwiaWF0IjoxNzQ1NTAwOTMyfQ.aizIV0NdyVTDzvh3rArD_CsOVsj4RkIaJ1q4gfSFT3k`
      const repo = features().prismic

      let url = `https://asset-api.prismic.io/assets?assetType=image&limit=${this.filters.perPage}`
      let cursor = this.source.prismic.cursor
      if (cursor) {
        url += `&cursor=${cursor}`
      }

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            repository: repo,
          },
        })

        console.log("Prismic Photos ::: ", res)

        if (res) {
          // Set Photos
          if (this.source.prismic.page === 1) {
            this.source.prismic.photos = res.items
          } else {
            for (let i = 0; i < res.items.length; i++) {
              this.source.prismic.photos.push(res.items[i])
            }
          }

          // Set Cursor
          if (
            this.source.prismic.photos &&
            this.source.prismic.photos.length > 0
          ) {
            this.source.prismic.cursor =
              this.source.prismic.photos[
                this.source.prismic.photos.length - 1
              ].id
          }

          // Set Meta
          let totalPages = 0
          if (res.total <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.total / this.filters.perPage)
          }
          this.source.prismic.meta = {
            total: res.total,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.prismic.photos) {
            if (this.source.prismic.photos.length < res.total) {
              this.source.prismic.meta.hasMore = true
            }
          }
        }

        this.source.prismic.loading = false
      } catch (err) {
        console.log("Prismic Search error ::: ", err.message)
        this.source.prismic.loading = false
      }
    },
    async uploadPrismic(e) {
      // https://prismic.io/docs/asset-api-technical-reference

      try {
        const file = e.files[0]

        console.log("File ::: ", file)

        const apiKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6ImJldHRpbmthLXBpbGF0ZXMtYzJhN2FkYTAtODg3Ni00YjUyLWJlZGUtNmNkODIzOWRlMzk0XzUiLCJkYXRlIjoxNzQ1NTAwOTMyLCJkb21haW4iOiJiZXR0aW5rYS1waWxhdGVzIiwiYXBwTmFtZSI6IkFEIE1lZGlhIiwiaWF0IjoxNzQ1NTAwOTMyfQ.aizIV0NdyVTDzvh3rArD_CsOVsj4RkIaJ1q4gfSFT3k`
        const repo = features().prismic

        const formData = new FormData()
        formData.append("file", file)

        const res = await this.uploadImage({
          url: "https://asset-api.prismic.io/assets",
          file: file,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "x-api-key": apiKey,
            "Content-Type": "multipart/form-data",
            repository: repo,
            Accept: "application/json",
          },
          formData: formData,
        })

        console.log("Upload Prismic ::: ", res)
      } catch (err) {
        console.log("[Prismic] ::: Upload error :: ", err.message)
      }
    },

    // UploadCare
    async searchUploadCare() {
      // https://uploadcare.com/api-refs/rest-api/v0.7.0/#tag/File/operation/filesList

      const apiKey = "41748b520a3ef57c16d9"
      const apiSecret = "9612cedf185b378b1fa0"

      if (this.source.uploadcare.loading) return
      this.source.uploadcare.page += 1
      this.source.uploadcare.loading = true

      let url = `https://api.uploadcare.com/files/?limit=${this.filters.perPage}&stored=true&ordering=-datetime_uploaded`

      try {
        const res = await $fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: `Uploadcare.Simple ${apiKey}:${apiSecret}`,
          },
        })

        console.log("UploadCare Photos ::: ", res)

        if (res) {
          // Set Photos
          if (this.source.uploadcare.page === 1) {
            this.source.uploadcare.photos = res.results.map((i) => {
              let newImage = i
              newImage.cdnUrl = `https://ucarecdn.com/${newImage.uuid}/`
              return newImage
            })
          } else {
            for (let i = 0; i < res.results.length; i++) {
              let newImage = res.results[i]
              newImage.cdnUrl = `https://ucarecdn.com/${newImage.uuid}/`
              this.source.uploadcare.photos.push(newImage)
            }
          }

          // Set Meta
          let totalPages = 0
          if (res.total <= this.filters.perPage) {
            totalPages = 1
          } else {
            totalPages = Math.ceil(res.total / this.filters.perPage)
          }
          this.source.uploadcare.meta = {
            total: res.total,
            totalPages: totalPages,
            hasMore: false,
          }
          if (this.source.uploadcare.photos) {
            if (this.source.uploadcare.photos.length < res.total) {
              this.source.uploadcare.meta.hasMore = true
            }
          }
        }

        this.source.uploadcare.loading = false
      } catch (err) {
        console.log("UploadCare Search error ::: ", err.message)
        this.source.uploadcare.loading = false
      }
    },
    async uploadCare(e) {
      // https://uploadcare.com/blog/how-to-upload-files-using-js/
      // https://uploadcare.com/api-refs/upload-api/#tag/Upload/operation/baseUpload

      try {
        const file = e.files[0]
        const apiKey = "41748b520a3ef57c16d9"

        const formData = new FormData()
        formData.append("file", file)
        formData.append("UPLOADCARE_PUB_KEY", apiKey)
        formData.append("UPLOADCARE_STORE", "auto")

        const res = await this.uploadImage({
          url: `https://upload.uploadcare.com/base/`,
          file: file,
          formData: formData,
        })

        console.log("Upload Care Success ::: ", res)

        await this.searchUploadCare()

        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Success",
          detail: "Uploaded all images.",
        })
      } catch (err) {
        console.log("Upload Care Error ::: ", err.message)
      }
    },

    // Uploader
    async getImageBlob(url) {
      return new Promise(async (resolve) => {
        const res = await $fetch(url)
        const blob = await res.blob()
        resolve(blob)
      })
    },
    blobToFile(blob, filename) {
      return new File([blob], filename, { type: blob.type })
    },
    createFormData(file) {
      const formData = new FormData()
      formData.append("image", file)
      return formData
    },
    async uploadImage(data) {
      return new Promise(async (resolve) => {
        try {
          let options = {
            method: "POST",
          }
          if (data.formData) {
            options.body = data.formData
          }
          if (data.method) {
            options.method = data.method
          }
          if (data.headers) {
            options.headers = data.headers
          }
          const res = await $fetch(data.url, options)

          resolve(res)
        } catch (err) {
          console.log("Upload Error ::: ", err.message)
          resolve(null)
        }
      })
    },

    // AD Media
    async initADMedia() {
      const images = localStorage.getItem("savedImages")

      if (images) {
        const imagesData = JSON.parse(images)
        const allImages = imagesData.photos
        const chunkSize = this.filters.perPage
        const chunkImages = []

        for (let i = 0; i < imagesData.meta.totalPages; i++) {
          let start = chunkSize * i
          let end = start + chunkSize

          const chunk = allImages.slice(start, end)
          chunkImages.push(chunk)
        }

        this.adMedia = {
          allPhotos: allImages,
          photos: chunkImages,
          meta: imagesData.meta,
        }

        this.source.ad_media.photos = this.adMedia.photos[0]
        this.source.ad_media.page = 1
        this.source.ad_media.meta = {
          total: imagesData.meta.total,
          totalPages: imagesData.meta.totalPages,
          hasMore: this.source.ad_media.page < imagesData.meta.totalPages,
        }
      }

      console.log("All Media ::: ", this.adMedia)
    },
    async searchADMedia(more) {
      this.source.ad_media.page += 1
      this.source.ad_media.loading = true

      let chunkCount = this.source.ad_media.page - 1
      const photos = this.adMedia.photos[chunkCount]

      if (photos) {
        if (this.source.ad_media.page === 1) {
          this.source.ad_media.photos = photos
        } else {
          for (let i = 0; i < photos.length; i++) {
            this.source.ad_media.photos.push(photos[i])
          }
        }

        this.source.ad_media.meta.hasMore =
          this.source.ad_media.page < this.source.ad_media.meta.totalPages
      }

      this.source.ad_media.loading = false
    },
    async savePhoto(url) {
      let photoItem = {
        url: url,
        timestamp: this.$utils.moment().valueOf(),
      }
      let savedImagesObject = {}

      if (this.adMedia && this.adMedia.photos) {
        savedImagesObject.photos = this.adMedia.allPhotos
        let findPhotoItem = this.adMedia.allPhotos.find((i) => i.url === url)

        if (!findPhotoItem) {
          savedImagesObject.photos.push(photoItem)

          if (savedImagesObject.photos.length > 1) {
            savedImagesObject.photos = savedImagesObject.photos.sort((a, b) =>
              a.timestamp < b.timestamp ? 1 : -1
            )
          }
        }
      } else {
        savedImagesObject.photos = [photoItem]
      }

      savedImagesObject.meta = {
        total: savedImagesObject.photos.length,
        totalPages: 0,
      }
      if (savedImagesObject.photos.length <= this.filters.perPage) {
        savedImagesObject.meta.totalPages = 1
      } else {
        savedImagesObject.meta.totalPages = Math.ceil(
          savedImagesObject.photos.length / this.filters.perPage
        )
      }
      localStorage.setItem("savedImages", JSON.stringify(savedImagesObject))

      this.key += 1
      this.$bus.$emit("toast", {
        severity: "success",
        summary: "Success",
        detail: "Photo saved to AD Media.",
      })

      this.initADMedia()
    },
    async removePhoto(url) {
      if (this.adMedia && this.adMedia.allPhotos) {
        let savedImagesObject = {}
        savedImagesObject.photos = this.adMedia.allPhotos.filter(
          (i) => i.url !== url
        )
        if (savedImagesObject.photos.length > 1) {
          savedImagesObject.photos = savedImagesObject.photos.sort((a, b) =>
            a.timestamp < b.timestamp ? 1 : -1
          )
        }

        savedImagesObject.meta = {
          total: savedImagesObject.photos.length,
          totalPages: 0,
        }
        if (savedImagesObject.photos.length <= this.filters.perPage) {
          savedImagesObject.meta.totalPages = 1
        } else {
          savedImagesObject.meta.totalPages = Math.ceil(
            savedImagesObject.photos.length / this.filters.perPage
          )
        }

        localStorage.setItem("savedImages", JSON.stringify(savedImagesObject))

        this.key += 1
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Success",
          detail: "Photo removed from AD Media.",
        })
      }

      this.initADMedia()
    },
    isSaved(url) {
      if (this.adMedia && this.adMedia.allPhotos) {
        let findPhotoItem = this.adMedia.allPhotos.find((i) => i.url === url)
        if (findPhotoItem) {
          return true
        }
      }
      return false
    },

    // Utils
    selectPhoto(url) {
      this.imagePreview = {
        active: true,
        url: url,
      }
    },
    copyPhotoUrl(url) {
      this.$utils.copyToClipboard(url)

      this.$bus.$emit("toast", {
        summary: "Success",
        detail: "Copied photo url to clipboard.",
      })
    },
  },
}
</script>

<style lang="scss">
.imageSelect {
  border: 2px solid #f4f4f4;
  cursor: pointer;
  transition: all 0.4s ease;
  aspect-ratio: 4/4;

  &:hover {
    border: 2px solid rgba(0, 0, 0, 0.4);
    opacity: 0.85;
  }
}
</style>
