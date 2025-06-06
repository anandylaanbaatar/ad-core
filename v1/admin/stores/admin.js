import { defineStore } from "pinia"

export const useAdminStore = defineStore("admin", {
  id: "admin-store",

  state: () => ({
    loading: false,
  }),

  actions: {
    set(key, data) {
      this[key] = data
    },
  },
})
