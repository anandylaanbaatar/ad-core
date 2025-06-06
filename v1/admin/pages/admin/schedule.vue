<template>
  <AdminLayout padding="none">
    <div class="w-full flex align-items-center p-4 pb-2">
      <h2>Schedule</h2>
    </div>

    <div
      id="calendar"
      class="c-calendar"
      :style="`height:${this.height}px;`"
    ></div>
  </AdminLayout>
</template>

<script>
export default {
  data() {
    return {
      height: 0,
    }
  },

  computed: {
    timezone() {
      return theme().timezone
    },
    products() {
      return useServicesStore().products
    },
    classes() {
      if (this.products) {
        let allClasses = []

        for (let i = 0; i < this.products.length; i++) {
          const product = this.products[i]
          const timezone = product.timezone
          const format = "MMM DD, YYYY - h:mm a"

          const getClassItem = (dateStart, dateEnd, classId) => {
            let newClassItem = {
              id: classId,
              title: `${product.name} (${getClassInterval(product.interval)})`,
              start: dateStart.toDate(),
              end: dateEnd.toDate(),
              extendedProps: {
                productId: product.id,
                duration: product.duration,
                formatted: `${dateStart.format(format)} to ${dateEnd.format(format)}`,
              },
            }
            if (product.collection) {
              newClassItem.extendedProps.collection = product.collection
            }
            return newClassItem
          }

          for (let j = 0; j < product.results.classes.length; j++) {
            const classItem = product.results.classes[j]
            const classId = classItem.id
            const startDate = this.$utils.moment(classItem.date).tz(timezone)
            const endDate = this.$utils.moment(classItem.dateEnd).tz(timezone)
            const newClassItem = getClassItem(startDate, endDate, classId)

            allClasses.push(newClassItem)
          }
        }

        return allClasses
      }
      return []
    },
  },

  async mounted() {
    await this.setEventCalendar()
  },

  methods: {
    async setFullCalendar() {
      if (FullCalendar) {
        //https://fullcalendar.io/demos

        this.height = window.innerHeight - 110
        let calendarEl = document.getElementById("calendar")

        let calendar = new FullCalendar.Calendar(calendarEl, {
          timeZone: "local",
          // slotMinTime: "08:00",
          // slotMaxTime: "20:00",
          expandRows: true,
          dayMaxEvents: true,
          // height: "100%",
          initialView: "dayGridMonth",
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          },
          events: this.classes,
          dateClick: (arg) => {
            console.log("Date Click ::: ", arg.date)
          },
          eventClick: (info) => {
            console.log("Event Click ::: ", info)
          },
        })

        calendar.render()
      }
    },
    async setEventCalendar() {
      if (EventCalendar) {
        // https://github.com/vkurko/calendar?tab=readme-ov-file#standalone-bundle

        this.height = window.innerHeight - 110
        let calendarEl = document.getElementById("calendar")
        let calendarOptions = {
          timeZone: "local",
          view: "dayGridMonth",
          headerToolbar: {
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
          },
          nowIndicator: true,
          events: this.classes,
          eventDrop: this.changeDate,
          eventResize: this.changeTime,
          eventClick: this.selectClass,
        }
        let ec = EventCalendar.create(calendarEl, calendarOptions)
      }
    },

    // Actions
    async changeDate(info) {
      const id = info.event.id
      const productId = info.event.extendedProps.productId
      const startDate = info.event.start
      const endDate = info.event.end

      try {
        await this.$fire.actions.update(
          `${tenantPath()}/products/${productId}/classes/${id}`,
          {
            id: id,
            startDate: startDate,
            endDate: endDate,
          }
        )
        this.$bus.$emit("toast", {
          severity: "success",
          summary: "Success",
          detail: "Changed class date.",
        })
        await useServicesStore().setProducts()
      } catch (err) {
        console.log("Date change error ::: ", err.message)

        this.$bus.$emit("toast", {
          severity: "error",
          summary: "Error",
          detail: "Error changing class date.",
        })
      }
    },
    async changeTime(info) {
      await this.changeDate(info)
    },
    async selectClass(info) {
      const id = info.event.id
      const productId = info.event.extendedProps.productId

      this.$bus.$emit("sidebarAdmin", {
        id: "productClass",
        data: {
          id: id,
          productId: productId,
          admin: true,
        },
      })
    },
  },
}
</script>
