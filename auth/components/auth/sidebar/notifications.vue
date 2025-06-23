<template>
  <div class="sidebar accountSidebar" :class="{ 'h-full': !isActive }">
    <!--Enabled-->
    <div v-if="isActive">
      <div v-for="i in 7" :key="`notification_item_${i}`" class="d-block mb-3">
        <h3>Title</h3>
        <p>Notification Item</p>
      </div>
    </div>

    <!--Disabled-->
    <div v-else class="emptyArea">
      <div>
        <i class="pi pi-bell"></i>
        <h4>{{ $utils.t("Notifications") }}</h4>
        <p>
          Та мэдэгдэлд бүртгүүлснээр шинэ, хямдралтай барааны мэдээ болон
          захиалгын хүргэлтийн явцын мэдэдлийг хүлээн авах боломжтой болно.
        </p>

        <!-- <Button
          label="Enable Notifications"
          @click="enableNotifications"
        ></Button> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: false,
      notificationsActive: false,
    }
  },

  computed: {
    user() {
      return useAuthStore().user
    },
    isPermissionGranted() {
      if (Notification.permission === "granted") {
        return true
      } else {
        return false
      }
    },
    isActive() {
      if (this.user && this.user.fcmToken) {
        if (this.isPermissionGranted) {
          return true
        }
      }
      return false
    },
  },

  methods: {
    // async enableNotifications() {
    //   const enable = await this.$notifications.push.enable()
    //   if (enable) {
    //     this.notificationsActive = true
    //   }
    // },
  },
}
</script>
