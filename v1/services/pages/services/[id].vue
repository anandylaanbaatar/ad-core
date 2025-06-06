<template>
  <AppLayout type="regular">
    <div class="c-page customPage">
      <Loader v-if="loading"></Loader>

      <div v-else>
        <div v-if="product" class="c-classes mt-6">
          <div class="container">
            <div class="row">
              <div class="col-xs-12 col-md-3">
                <div class="c-item first">
                  <Tag rounded class="c-custom-tag inverted mb-4">Classes</Tag>
                  <h2 class="mb-2">{{ product.name }}</h2>
                  <h4>
                    {{ product.currency.toUpperCase() }}
                    {{ product.amount_formatted }} /
                    {{ getClassInterval(product.interval) }}
                  </h4>

                  <div class="bottom">
                    <div v-if="product.instructors">
                      <h4>Instructors:</h4>
                      <br />
                      <h4
                        v-for="userUid in product.instructors"
                        :key="`instructor_${userUid}`"
                        class="w-full"
                      >
                        {{ getUserById(userUid).displayName }}
                      </h4>
                    </div>
                  </div>
                </div>

                <h3 v-if="isFinished" class="w-full opacity-60 text-sm">
                  Class has ended. Registrations closed.
                </h3>
                <template v-else>
                  <template v-if="isSubscribed">
                    <Button
                      class="w-full mb-3"
                      block
                      @click="
                        $bus.$emit('sidebarGlobal', {
                          id: 'payments',
                          data: {
                            id: subscription.id,
                          },
                        })
                      "
                    >
                      Manage Subscription
                    </Button>
                  </template>
                  <Button
                    v-else
                    class="w-full mb-3"
                    block
                    @click="goTo(`/services/book?id=${product.id}`)"
                    >Subscribe to Class</Button
                  >
                </template>

                <Message v-if="product.interval !== 'one_off'" severity="warn"
                  >This is a {{ getClassInterval(product.interval) }} recurring
                  class starting on <br />
                  <span v-if="product.results && product.results.start"
                    >{{ product.results.start }} and ending on
                    {{ product.results.end }}</span
                  >
                </Message>
              </div>

              <div class="col-xs-12 col-md-6">
                <div
                  class="c-block c-image size-md mb-3"
                  :style="$utils.setBackImage(product.image)"
                ></div>

                <p v-if="product.description" class="mb-2">
                  {{ product.description }}
                </p>

                <p class="mb-2">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.
                </p>

                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.
                </p>
              </div>

              <div v-if="product.results" class="col-xs-12 col-md-3">
                <h3 class="mb-3">Classes</h3>

                <Message v-if="product.interval === 'one_off'" class="mb-3"
                  >This class is a One Time class.</Message
                >

                <ProductsListItem
                  :product="product"
                  :price="false"
                ></ProductsListItem>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
    }
  },

  computed: {
    product() {
      if (!this.$route.params.id) return
      return getProductById(this.$route.params.id)
    },
    user() {
      return useAuthStore().user
    },
    subscriptions() {
      return useServicesStore().subscriptions
    },
    subscription() {
      if (this.subscriptions && this.product) {
        const subscription = this.subscriptions.find(
          (i) => i.plan.product === this.product.id
        )
        if (subscription) {
          if (subscription.status === "active") {
            return subscription
          }
        }
      }
      return
    },

    isFinished() {
      if (this.product) {
        const currentDate = this.$utils.moment()
        const endDate = this.$utils.moment(this.product.end_date_time)

        if (currentDate.isAfter(endDate)) {
          return true
        }
      }
      return false
    },
    isSubscribed() {
      if (this.user && this.subscription) {
        return true
      }
      return false
    },
  },
}
</script>
