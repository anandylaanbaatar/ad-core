<template>
  <div v-if="item">
    <div
      v-if="product.image"
      class="c-block c-image size-xs-9 mb-2"
      :style="$utils.setBackImage(product.image)"
    ></div>

    <div class="d-block p-6 text-center">
      <!--Title-->
      <h3 v-if="product.name" class="mb-1">
        {{ product.name }}
        <span v-if="product.interval"
          >({{ getClassInterval(product.interval) }})</span
        >
      </h3>

      <!--Time-->
      <p v-if="classItem && classItem.formatted" class="mb-1">
        {{ classItem.formatted }}
      </p>

      <!--Instructors-->
      <p v-if="product.instructors" class="mb-1">
        Instructors:
        <Tag
          v-for="userUid in product.instructors"
          :key="`instructor_${userUid}`"
          severity="warn"
          class="mr-1"
          >{{ getUserNameById(userUid) }}</Tag
        >
      </p>

      <!--Status & Slots-->
      <div v-if="classItem" class="w-full">
        <h4>
          <Tag v-if="classItem.comingUp" severity="success">{{
            classItem.comingUp
          }}</Tag>
          <Tag v-else-if="classItem.status === 'Finished'" severity="danger">{{
            classItem.status
          }}</Tag>
          <Tag v-else-if="classItem.status === 'In Progress'" severity="info">{{
            classItem.status
          }}</Tag>
          <Tag
            v-else-if="classItem.status === 'Not Started'"
            severity="success"
            >{{ classItem.status }}</Tag
          >
        </h4>
      </div>
    </div>

    <!--Class Users-->
    <div class="d-block mt-2 p-3">
      <h4 class="w-full display-flex align-items-center">
        <span class="mr-2">Members</span>

        <Tag v-if="classItem.slotsLeft" severity="warn" class="ml-auto"
          >{{ classItem.slotsLeft }} spots left</Tag
        >
      </h4>

      <div v-for="user in classItem.users" class="d-block w-full mt-2 p-2 pl-3">
        <div class="flex align-items-center">
          <h4>{{ getUserNameById(user.uid) }}</h4>
          <!-- <p v-if="user.timestamp" class="text-sm opacity-60">
            {{ $utils.utcToTime(user.timestamp) }}
          </p> -->

          <!--Admin--->
          <Button
            v-if="item.admin"
            icon="pi pi-minus"
            class="sm ml-auto"
            v-tooltip.left="'Remove Member'"
            @click="adminRemoveFromClass(product, classItem, user.uid)"
          ></Button>
        </div>
      </div>
    </div>

    <!--Admin-->
    <div v-if="item.admin" class="d-block mt-2 p-3">
      <div class="c-form relative w-full">
        <div class="c-field">
          <label for="instructors">Admin Manage Members</label>
        </div>

        <div
          v-for="user in users"
          :key="`admin_users_${user.uid}`"
          class="d-block w-full mt-2 p-2 pl-3"
        >
          <div class="flex align-items-center">
            <h4>{{ user.displayName }}</h4>
            <Button
              icon="pi pi-plus"
              class="sm ml-auto"
              v-tooltip.left="'Add Member'"
              @click="adminAddToClass(product, classItem, user.uid)"
            ></Button>
          </div>
        </div>
      </div>
    </div>

    <!--Action Buttons-->
    <div class="bottom">
      <Loader v-if="loading" type="none" class="mx-auto"></Loader>

      <p v-else-if="isFinished" class="w-full text-center opacity-60 text-sm">
        Class has ended. Registrations closed.
      </p>
      <p v-else-if="isClassFull" class="w-full text-center opacity-60 text-sm">
        Class is full. Registrations closed.
      </p>

      <div class="w-full" v-else-if="!isJoined && !isSubscribed">
        <p class="text-center opacity-60 text-sm">
          No active subscription found for this class. Subscribe to class first.
        </p>
        <Button
          class="w-full mt-2"
          @click="
            closeGoTo(`/services/book?id=${product.id}&class=${classItem.id}`)
          "
          >Subscribe to Class</Button
        >
      </div>

      <template v-else>
        <Button
          v-if="isJoined"
          class="w-full"
          @click="cancelClass(this.user.uid)"
          severity="danger"
          >Cannot attend? Remove myself from class.</Button
        >
        <Button v-else class="w-full" @click="joinClass">Join Class</Button>
      </template>
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
      loading: false,

      form: {
        users: null,
      },
    }
  },

  computed: {
    product() {
      if (this.item && this.item.productId) {
        return getProductById(this.item.productId)
      }
      return
    },
    classItem() {
      if (this.item) {
        if (this.product && this.item.id) {
          return this.product.results.classes.find((i) => i.id === this.item.id)
        }
      }
      return
    },
    users() {
      if (useAuthStore()) {
        let allUsers = useAuthStore().users

        if (allUsers) {
          if (this.classItem && this.classItem.users) {
            allUsers = allUsers.filter((i) => {
              const findUser = this.classItem.users.find((j) => j.uid === i.uid)

              if (!findUser) {
                return i
              }
            })
          }
        }

        return allUsers
      }
      return
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
      if (this.classItem && this.classItem.status) {
        return this.classItem.status === "Finished"
      }
      return false
    },
    isSubscribed() {
      if (this.user && this.subscription) {
        return true
      }
      return false
    },
    isClassFull() {
      if (this.classItem) {
        if (this.classItem.slotsLeft === 0) {
          return true
        }
      }
      return false
    },
    isJoined() {
      if (this.user && this.classItem) {
        const classItemUser = this.classItem.users.find(
          (i) => i.uid === this.user.uid
        )
        if (classItemUser) {
          return true
        }
      }
      return false
    },
  },

  methods: {
    async joinClass() {
      this.loading = true
      await joinClass(this.product, this.classItem, this.user.uid)
      this.loading = false
    },
    async cancelClass(uid) {
      if (!uid) return

      this.$bus.$emit("confirm", {
        header: "Cancel Class",
        message: "Are you sure you want to remove yourself from this class?",
        callback: async () => {
          this.loading = true
          await cancelClass(this.product, this.classItem, uid)
          this.loading = false
        },
      })
    },

    closeGoTo(url) {
      this.$bus.$emit("sidebarGlobalClose")
      goTo(url)
    },
  },
}
</script>
