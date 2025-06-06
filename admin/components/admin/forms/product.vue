<template>
  <div class="row mt-4">
    <!--Form-->
    <div class="col-xs-12 col-md-6 col-lg-4">
      <div class="d-block px-4 py-6 w-full">
        <div class="c-form row w-full mr-0 ml-0">
          <div class="col-xs-12">
            <h3>1. Details</h3>
          </div>

          <!--Collection-->
          <div class="c-field col-xs-12">
            <label for="collection" class="flex"
              >Collection (Optional)
              <span
                class="ml-auto flex align-items-center c-link"
                @click="
                  $bus.$emit('sidebar', { id: 'collections', item: null })
                "
                ><i class="pi pi-plus mr-2"></i> Add collection</span
              ></label
            >

            <div class="flex align-items-center">
              <Select
                v-model="formOptional.collection"
                :options="collectionOptions"
                optionLabel="name"
                placeholder="Collection"
                class="w-full"
              ></Select>
            </div>
          </div>

          <!--Title-->
          <div class="c-field col-xs-12">
            <label for="name">Title</label>
            <InputText
              id="name"
              v-model="form.name"
              placeholder="Product Title"
              :invalid="validations.errors.name"
            ></InputText>
            <small v-if="validations.errors.name" class="error">{{
              validations.errors.name
            }}</small>
          </div>

          <!--Image-->
          <div class="c-field col-xs-12">
            <label for="image">Image</label>
            <InputText
              id="image"
              v-model="form.image"
              placeholder="Product Image Url"
              :invalid="validations.errors.image"
            ></InputText>
            <small v-if="validations.errors.image" class="error">{{
              validations.errors.image
            }}</small>
          </div>

          <!--Description-->
          <div class="c-field col-xs-12">
            <label for="description">Description (Optional)</label>
            <Textarea
              id="description"
              placeholder="Description"
              v-model="formOptional.description"
            ></Textarea>
          </div>

          <div class="c-divider my-4"></div>

          <div class="col-xs-12">
            <h3>2. Pricing</h3>
          </div>

          <!--Price-->
          <div class="c-field col-xs-12">
            <label for="price">Currency & Price</label>

            <div class="flex align-items-center">
              <Select
                v-model="form.currency"
                :options="currencyOptions"
                optionLabel="name"
                placeholder="Currency"
                :invalid="validations.errors.currency"
                class="mr-2"
              ></Select>

              <InputNumber
                v-model="form.price"
                placeholder="($) Price"
                :invalid="validations.errors.price"
                class="w-full"
                :minFractionDigits="2"
                :maxFractionDigits="5"
                fluid
              ></InputNumber>
            </div>

            <small v-if="validations.errors.price" class="error mt-1">{{
              validations.errors.price
            }}</small>
          </div>

          <!--Interval-->
          <div class="c-field col-xs-12">
            <label for="price">Recurring</label>
            <Select
              v-model="form.interval"
              :options="intervalOptions"
              optionLabel="name"
              placeholder="Price Interval"
              :invalid="validations.errors.interval"
              class="mr-2 w-full"
            ></Select>
            <small v-if="validations.errors.interval" class="error">{{
              validations.errors.interval
            }}</small>
          </div>

          <div class="c-divider my-4"></div>

          <div class="col-xs-12 mb-3">
            <h3>3. Class</h3>
          </div>

          <!--Duration-->
          <div class="c-field col-xs-6">
            <label for="duration">Duration (Mins)</label>
            <InputNumber
              v-model="form.duration"
              inputId="duration"
              :min="1"
              :max="300"
              fluid
              :invalid="validations.errors.duration"
              placeholder="Minutes"
            />
            <small v-if="validations.errors.duration" class="error">{{
              validations.errors.duration
            }}</small>
          </div>

          <!--Slots-->
          <div class="c-field col-xs-6">
            <label for="slots">Slots (People)</label>
            <InputNumber
              v-model="form.slots"
              inputId="slots"
              :min="1"
              :max="100"
              fluid
              :invalid="validations.errors.slots"
              placeholder="Slots"
            />
            <small v-if="validations.errors.slots" class="error">{{
              validations.errors.slots
            }}</small>
          </div>

          <!--Timezone-->
          <div class="c-field col-xs-12">
            <label for="timezone">Timezone</label>
            <Select
              v-model="form.timezone"
              :options="timezoneOptions"
              optionLabel="name"
              placeholder="Timezone"
              :invalid="validations.errors.timezone"
              class="w-full"
            ></Select>
            <small v-if="validations.errors.timezone" class="error">
              {{ validations.errors.timezone }}
            </small>
          </div>

          <!--Start Date Time-->
          <div class="c-field col-xs-6">
            <label for="start_date_time">Start Date Time</label>
            <DatePicker
              id="start_date_time"
              class="w-full"
              placeholder="Start Date"
              v-model="form.start_date_time"
              dateFormat="M dd, yy -"
              hourFormat="12"
              showTime
              showButtonBar
              :stepMinute="15"
              :invalid="validations.errors.start_date_time"
            ></DatePicker>
            <small v-if="validations.errors.start_date_time" class="error">{{
              validations.errors.start_date_time
            }}</small>
          </div>

          <!--End Date Time-->
          <div
            v-if="form.start_date_time && form.interval"
            class="c-field col-xs-6"
          >
            <label for="end_date_time">End Date Time</label>
            <DatePicker
              id="end_date_time"
              class="w-full"
              placeholder="End Date"
              v-model="form.end_date_time"
              dateFormat="M dd, yy -"
              hourFormat="12"
              showTime
              showButtonBar
              :stepMinute="15"
              :invalid="validations.errors.end_date_time"
              :disabled="form.interval.value === 'one_off'"
            ></DatePicker>
            <small v-if="validations.errors.end_date_time" class="error">{{
              validations.errors.end_date_time
            }}</small>
          </div>

          <!--Instructors-->
          <div class="c-field col-xs-12">
            <label for="instructors">Instructors</label>
            <MultiSelect
              v-model="form.instructors"
              display="chip"
              :options="userOptions"
              optionLabel="name"
              placeholder="Select Instructors"
              class="w-full"
              :invalid="validations.errors.instructors"
            ></MultiSelect>
            <small v-if="validations.errors.instructors" class="error">{{
              validations.errors.instructors
            }}</small>
          </div>

          <!--Submit Button-->
          <div class="c-field col-xs-12">
            <Message
              v-if="occurrences && occurrences.count < 1"
              severity="error"
              class="mb-3"
              >Occurrence has to be at least 1 times.</Message
            >
            <template v-else>
              <Loader v-if="loading" type="none"></Loader>
              <Button
                v-else
                primary
                class="w-full"
                @click="createOrEditProduct"
                :disabled="!validations.isValid"
              >
                <template v-if="editMode">Update</template>
                <template v-else>Create</template>
              </Button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!--Preview Product-->
    <div class="col-xs-12 col-md-6 col-lg-4">
      <div class="c-classes row">
        <div class="col-xs-12">
          <template v-if="form.image">
            <Message v-if="!form.image" severity="warn" class="mb-2"
              >Ps: Using sample product image for previewing only. Please change
              product image.</Message
            >
            <div
              class="c-item c-image mb-3"
              :style="$utils.setBackImage(productImage)"
            >
              <div class="top">
                <Tag
                  v-if="formOptional.collection && formOptional.collection.name"
                  severity="warn"
                  class="ml-1"
                  >{{ formOptional.collection.name }}</Tag
                >
              </div>

              <div class="bottom">
                <div>
                  <h3 class="flex align-items-center text-white w-full mb-1">
                    <span v-if="form.name">{{ form.name }}</span>

                    <i v-if="form.name" class="pi pi-arrow-right"></i>
                  </h3>

                  <h4 v-if="form.price">
                    <span v-if="form.currency">
                      {{ form.currency.value + " " }}
                    </span>
                    <span v-if="form.price">
                      {{ form.price }}
                      <span v-if="form.interval"
                        >/ {{ getClassInterval(form.interval.value) }}</span
                      ></span
                    >
                  </h4>
                  <p v-if="formOptional.description" class="text-white pr-4">
                    {{ $utils.addDots(formOptional.description, 100) }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <div v-if="occurrences" class="d-block">
            <h3 class="mb-3">Scheduling</h3>

            <div class="w-full mb-3">
              <span v-if="form.duration"
                ><Tag severity="warn">{{ form.duration }}</Tag> minutes long
              </span>
              <span v-if="occurrences && occurrences.count.total"
                >total
                <Tag severity="warn">{{ occurrences.count.total }}</Tag> times
              </span>
              <span v-if="form.interval">
                <Tag severity="warn">{{
                  getClassInterval(form.interval.value)
                }}</Tag>
                bases
              </span>
              <span v-if="form.slots">
                maximum <Tag severity="warn">{{ form.slots }}</Tag> people
              </span>
              <span v-if="form.price"
                >at
                <Tag v-if="form.currency" severity="warn">
                  {{ form.currency.value.toUpperCase() }}
                  {{ form.price }}
                </Tag>
                per class
              </span>
              <br />
            </div>

            <template v-if="occurrences">
              <template v-if="occurrences.start">
                Starting on
                <Tag severity="warn">{{ occurrences.start }}</Tag>
              </template>
              <template v-if="occurrences.end">
                until
                <Tag severity="warn">{{ occurrences.end }}</Tag>
              </template>
            </template>
            <template v-else>
              <template v-if="form.start_date_time">
                Starting on
                <Tag severity="warn">{{
                  $utils.formatDateTime(form.start_date_time)
                }}</Tag>
              </template>
              <template v-if="form.end_date_time">
                until
                <Tag severity="warn">{{
                  $utils.formatDateTime(form.end_date_time)
                }}</Tag>
              </template>
            </template>

            <div v-if="occurrences" class="mt-2">
              <div
                v-for="(item, index) in occurrences.classes"
                :key="`item_${item.date}`"
              >
                {{ index + 1 }}. <Tag severity="warn">{{ item.formatted }}</Tag>

                <Tag
                  v-if="item.status && item.status === 'Not Started'"
                  severity="success"
                  class="ml-2"
                  >{{ item.status }}</Tag
                >
                <Tag
                  v-else-if="item.status && item.status === 'In Progress'"
                  severity="info"
                  class="ml-2"
                  >{{ item.status }}</Tag
                >
                <Tag
                  v-else-if="item.status && item.status === 'Finished'"
                  severity="danger"
                  class="ml-2"
                  >{{ item.status }}</Tag
                >
              </div>

              <Message
                v-if="!occurrences.classes || occurrences.classes.length === 0"
                severity="error"
                icon="pi pi-exclamation-circle"
                class="mt-3"
                >No classes happening during these dates. Update your dates or
                recurring interval.</Message
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--Calendar
    <div class="col-xs-12 col-md-6 col-lg-4">
      <DatePicker
        v-model="filter.date"
        inline
        showWeek
        showButtonBar
        class="w-full sm:w-[30rem] mb-2"
      />

      <ProductsListItem
        v-for="product in products"
        :key="`product_${product.id}`"
        :product="product"
      ></ProductsListItem>
    </div>
    -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: null,
        image: null,
        currency: null,
        price: null,
        interval: null,
        duration: null,
        slots: null,
        start_date_time: null,
        end_date_time: null,
        timezone: null,
        instructors: null,
      },
      formOptional: {
        description: null,
        collection: null,
      },
      loading: false,
      preview: true,
      filter: {
        date: null,
      },
    }
  },

  computed: {
    // Checks
    editMode() {
      if (this.$route.query.id) return true
      return false
    },

    // Options
    intervalOptions() {
      return [
        {
          name: "One Off",
          value: "one_off",
        },
        {
          name: "Daily",
          value: "day",
        },
        {
          name: "Weekly",
          value: "week",
        },
        {
          name: "Monthly",
          value: "month",
        },
        {
          name: "Yearly",
          value: "year",
        },
      ]
    },
    currencyOptions() {
      return [
        {
          name: "CAD",
          value: "CAD",
        },
      ]
    },
    collections() {
      return useServicesStore().collections
    },
    collectionOptions() {
      if (this.collections) {
        return this.collections.map((i) => {
          return {
            id: i.id,
            value: i.id,
            name: i.name,
          }
        })
      }
    },
    timezoneOptions() {
      let timezones = this.$utils.timezones()
      if (timezones) {
        return timezones.map((i) => {
          return {
            name: i,
            value: i,
          }
        })
      }
      return
    },
    userOptions() {
      if (this.users) {
        return this.users.map((i) => {
          return {
            name: i.displayName,
            value: i.uid,
            uid: i.uid,
          }
        })
      }
      return
    },

    // Data & Compute
    productImage() {
      if (this.form.image) {
        return this.form.image
      } else {
        return "https://images.prismic.io/bettinka-pilates/Z_o7GuvxEdbNO-E4_Group-3.png?auto=format,compress"
      }
    },
    defaultCurrency() {
      return useAppConfig().theme.currency
    },
    occurrences() {
      if (!this.form.start_date_time) return
      if (!this.form.interval) return
      if (!this.form.interval.value) return
      if (!this.form.duration) return

      let product = {
        start_date_time: this.form.start_date_time,
        end_date_time: this.form.end_date_time ? this.form.end_date_time : null,
        interval: this.form.interval.value,
        duration: this.form.duration,
      }

      return getClasses(product)
    },
    validations() {
      if (!this.$forms) {
        return {
          isValid: false,
          errors: {},
        }
      }
      // Custom Conditions
      // Add End Date from Duration and Start Date
      if (this.form.interval) {
        if (this.form.interval.value === "one_off") {
          if (this.form.start_date_time && this.form.duration) {
            if (this.form.timezone) {
              this.form.end_date_time = this.$utils
                .moment(this.form.start_date_time)
                .tz(this.form.timezone.value)
                .add("minutes", this.form.duration)
                .toDate()
            }
          }
        }
      }

      const validation = this.$forms.validateForm(this.form)

      let results = {
        isValid: validation.isValid || false,
        errors: validation.errors || {},
      }

      return results
    },
    defaultTimezone() {
      return useCoreStore().timezone
    },
    products() {
      return useServicesStore().products
    },
    users() {
      return useAuthStore().users
    },

    // Conditionals
    hideDateTime() {
      if (this.form.interval && this.form.interval.value === "one_off") {
        return true
      }
      return false
    },
  },

  async mounted() {
    if (this.$route.query.id) {
      await this.getProduct(this.$route.query.id)
    } else {
      this.form.currency = this.currencyOptions.find(
        (i) => i.value === this.defaultCurrency
      )
      this.form.timezone = this.timezoneOptions.find(
        (i) => i.value === this.defaultTimezone
      )
    }
  },

  methods: {
    // Actions
    async createOrEditProduct() {
      if (this.editMode) {
        await this.updateProduct()
      } else {
        await this.createProduct()
      }
    },
    async createProduct() {
      if (!integrations().stripe) {
        console.log("[Forms] ::: Stripe not setup!")
        return
      }
      if (!integrations().firebase) {
        console.log("[Forms] ::: Firebase not setup!")
        return
      }
      this.loading = true

      try {
        // Create Stripe Product
        let stripeForm = {
          name: this.form.name,
          amount: this.form.price * 100,
          interval: this.form.interval.value.toLowerCase(),
          currency: this.form.currency.value.toLowerCase(),
        }
        const res = await this.$stripe.product.create(stripeForm)

        // Create Firebase Product
        await this.updateFirebaseProduct(res)

        // Success Message
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Product",
          detail: "Successfully added product.",
        })
        this.loading = false

        // Update Products
        await useServicesStore().setProducts()

        // Redirect
        // goTo("/admin/products")
      } catch (err) {
        console.log("[Products] ::: Error creating product ::: ", err.message)

        this.$bus.$emit("toast", {
          severity: "danger",
          summary: "Product",
          detail: "Error creating product.",
        })
        this.loading = false
      }
    },
    async updateProduct() {
      if (!integrations().stripe) {
        console.log("[Forms] ::: Stripe not setup!")
        return
      }
      if (!integrations().firebase) {
        console.log("[Forms] ::: Firebase not setup!")
        return
      }

      this.loading = true
      let updateStripeProduct = false
      let updateFirebaseProduct = false

      // Check Stripe Fields
      if (this.form.name !== this.product.name) {
        updateStripeProduct = true
      }
      if (this.form.interval.value !== this.product.interval) {
        updateStripeProduct = true
      }
      if (this.form.currency.value !== this.product.currency) {
        updateStripeProduct = true
      }
      if (this.form.amount !== this.product.amount) {
        updateStripeProduct = true
      }
      // Check Firebase Fields
      if (this.form.image !== this.product.image) {
        updateFirebaseProduct = true
      }
      if (this.formOptional.description !== this.product.description) {
        updateFirebaseProduct = true
      }
      if (this.formOptional.collection) {
        if (this.formOptional.collection.value !== this.product.collection) {
          updateFirebaseProduct = true
        }
      }
      if (this.form.duration !== this.product.duration) {
        updateFirebaseProduct = true
      }
      if (this.form.slots !== this.product.slots) {
        updateFirebaseProduct = true
      }
      if (this.form.start_date_time !== this.product.start_date_time) {
        updateFirebaseProduct = true
      }
      if (this.form.end_date_time !== this.product.end_date_time) {
        updateFirebaseProduct = true
      }
      if (this.form.timezone.value !== this.product.timezone) {
        updateFirebaseProduct = true
      }
      if (this.form.instructors.value !== this.product.instructors) {
        updateFirebaseProduct = true
      }

      try {
        // Update Stripe Product
        if (updateStripeProduct) {
          let stripeForm = {
            id: this.product.id,
            priceId: this.product.priceId,
            name: this.form.name,
            amount: this.form.price * 100,
            interval: this.form.interval.value.toLowerCase(),
            currency: this.form.currency.value.toLowerCase(),
          }
          const res = await this.$stripe.product.update(stripeForm)

          // Create Firebase Product
          await this.updateFirebaseProduct(res)
        } else if (updateFirebaseProduct) {
          let form = {}

          if (this.form.image) {
            form.image = this.form.image
          }
          if (this.formOptional.description) {
            form.description = this.formOptional.description
          }
          if (this.formOptional.collection) {
            form.collection = this.formOptional.collection.value
          }
          if (this.form.duration) {
            form.duration = this.form.duration
          }
          if (this.form.slots) {
            form.slots = this.form.slots
          }
          if (this.form.start_date_time) {
            form.start_date_time = this.form.start_date_time
          }
          if (this.form.end_date_time) {
            form.end_date_time = this.form.end_date_time
          }
          if (this.form.timezone) {
            form.timezone = this.form.timezone.value
          }

          const res2 = await this.$fire.actions.update(
            `${tenantPath()}/producs/${this.product.id}`,
            form
          )

          console.log("[Firebase] ::: Product Updated :: ", res2)
        }

        // Success Message
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Product",
          detail: "Successfully updated product.",
        })
        this.loading = false

        // Update Products
        await useServicesStore().setProducts()

        // Redirect
        goTo("/admin/products")
      } catch (err) {
        console.log("[Products] ::: Error updating product ::: ", err.message)

        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Product",
          detail: "Error updating product.",
        })
        this.loading = false
      }
    },
    async updateFirebaseProduct(res) {
      let form = {
        id: res.id,
        name: res.name,
        type: res.type,
        active: res.active,
        created: res.created,
        updated: res.updated,
        priceId: res.default_price.id,
        amount: res.default_price.unit_amount,
        amount_decimal: res.default_price.unit_amount_decimal,
        amount_formatted: `${this.form.price}`,
        interval: this.form.interval.value.toLowerCase(),
        currency: res.default_price.currency,
        nickname: res.default_price.nickname,
        lookup_key: res.default_price.lookup_key,
        image: this.form.image,
      }

      if (res.default_price.recurring) {
        form.recurring = res.default_price.recurring
      }
      if (this.formOptional.description) {
        form.description = this.formOptional.description
      }
      if (this.formOptional.collection && this.formOptional.collection.value) {
        form.collection = this.formOptional.collection.value
      }
      if (this.form.duration) {
        form.duration = this.form.duration
      }
      if (this.form.slots) {
        form.slots = this.form.slots
      }
      if (this.form.start_date_time) {
        form.start_date_time = this.form.start_date_time
      }
      if (this.form.end_date_time) {
        form.end_date_time = this.form.end_date_time
      }
      if (this.form.timezone) {
        form.timezone = this.form.timezone.value
      }
      if (this.form.instructors) {
        form.instructors = this.form.instructors.map(
          (i) => this.userOptions.find((j) => j.uid === i.uid).uid
        )
      }

      const res2 = await this.$fire.actions.update(
        `${tenantPath()}/products/${res.id}`,
        form
      )

      console.log("[Firebase] ::: Product Create ::: ", res2)
    },

    // Data
    async getProduct(id) {
      const products = useServicesStore().products
      this.product = products.find((i) => i.id === id)
      this.fillForm(this.product)
    },

    // Utils
    fillForm(data) {
      this.form.name = data.name || null
      this.form.image = data.image || null
      this.form.price = parseFloat(data.amount_formatted) || null

      if (data.currency) {
        this.form.currency = this.currencyOptions.find(
          (i) => i.value.toLowerCase() === data.currency.toLowerCase()
        )
      }
      if (data.interval) {
        this.form.interval = this.intervalOptions.find(
          (i) => i.value.toLowerCase() === data.interval.toLowerCase()
        )
      }
      if (data.collection) {
        this.formOptional.collection = this.collectionOptions.find(
          (i) => i.value.toLowerCase() === data.collection.toLowerCase()
        )
      }
      if (data.duration) {
        this.form.duration = data.duration
      }
      if (data.slots) {
        this.form.slots = data.slots
      }
      if (data.timezone) {
        this.form.timezone = data.timezone
      }
      if (data.start_date_time) {
        this.form.start_date_time = data.start_date_time
      }
      if (data.end_date_time) {
        this.form.end_date_time = data.end_date_time
      }
      if (data.timezone) {
        this.form.timezone = this.timezoneOptions.find(
          (i) => i.value.toLowerCase() === data.timezone.toLowerCase()
        )
      }
      if (data.instructors) {
        this.form.instructors = data.instructors.map((i) =>
          this.userOptions.find((j) => j.uid === i)
        )
      }

      this.formOptional.description = data.description || null
    },
  },
}
</script>
