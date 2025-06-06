<template>
  <div class="c-filter week mb-3">
    <div class="calendarWeeks">
      <!--Filters-->
      <div class="flex align-items-center mb-2">
        <div v-if="!filters.showAll">
          <Button
            icon="pi pi-arrow-left"
            v-tooltip.top="'Previous Week'"
            class="sm mr-2"
            @click="changeWeek('previous')"
          ></Button>
          <Button
            icon="pi pi-calendar"
            v-tooltip.top="'This week'"
            class="sm mr-2"
            @click="changeWeek('current')"
          ></Button>
          <Button
            icon="pi pi-arrow-right"
            v-tooltip.top="'Next Week'"
            class="sm"
            @click="changeWeek('next')"
          ></Button>
        </div>

        <div class="ml-auto">
          <PopoverActions icon="pi pi-filter">
            <div class="flex align-items-center gap-2 capitalize c-link py-1">
              <Checkbox
                v-model="filters.showFinished"
                inputId="finished"
                name="finished"
                binary
              />
              <label for="finished">Show Finished</label>
            </div>
            <div class="flex align-items-center gap-2 capitalize c-link py-1">
              <Checkbox
                v-model="filters.showAll"
                inputId="all"
                name="all"
                binary
              />
              <label for="all">All Classes</label>
            </div>
          </PopoverActions>
        </div>
      </div>

      <!--Week Calendar-->
      <template v-if="!filters.showAll">
        <div v-for="week in weeks" :key="`date_${week.date}`" class="weekItem">
          <div
            class="week"
            :class="{
              today: week.isToday,
              selected: selectedFormatted === week.dateFormatted,
            }"
            @click="selectDate(week.date)"
          >
            <h4 class="name">{{ week.week }}</h4>
            <h4 class="day">{{ week.day }}</h4>
          </div>
          <div v-if="week.hasClasses" class="dot"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filters: {
      type: Object,
      default: null,
    },
    classes: {
      type: Array,
      default: null,
    },
  },

  data() {
    return {
      dateFormat: "MMM DD, YYYY",
      startDate: this.$utils.moment().startOf("week"),
      endDate: this.$utils.moment().endOf("week"),
    }
  },

  computed: {
    weeks() {
      const startDate = this.startDate
      const todayFormatted = this.$utils.moment().format(this.dateFormat)
      let days = []

      for (let i = 0; i <= 6; i++) {
        const day = this.$utils.moment(startDate).add(i, "days")
        const dayFormatted = day.format(this.dateFormat)
        const isToday = todayFormatted === dayFormatted ? true : false
        let hasClasses = false

        const findClasses = this.classes.filter(
          (i) =>
            this.$utils.moment(i.date).format(this.dateFormat) === dayFormatted
        )
        if (findClasses) {
          if (findClasses.length > 0) {
            hasClasses = true
          }
        }

        days.push({
          date: day,
          dateFormatted: dayFormatted,
          day: day.format("D"),
          week: day.format("ddd"),
          month: day.format("MMM"),
          year: day.format("year"),
          isToday: isToday,
          hasClasses: hasClasses,
        })
      }

      return days
    },
    selectedFormatted() {
      if (this.filters && this.filters.selected) {
        return this.$utils.moment(this.filters.selected).format(this.dateFormat)
      }
      return
    },
  },

  mounted() {
    this.selectDateWithClass("current")
  },

  methods: {
    changeWeek(type) {
      if (type === "previous") {
        this.startDate = this.$utils
          .moment(this.startDate)
          .subtract(7, "days")
          .startOf("week")
        this.endDate = this.$utils
          .moment(this.endDate)
          .subtract(7, "days")
          .endOf("week")
      } else if (type === "next") {
        this.startDate = this.$utils
          .moment(this.startDate)
          .add(7, "days")
          .startOf("week")
        this.endDate = this.$utils
          .moment(this.endDate)
          .add(7, "days")
          .endOf("week")
      } else if (type === "current") {
        this.startDate = this.$utils.moment().startOf("week")
        this.endDate = this.$utils.moment().endOf("week")

        // this.selectDate(today)
      }

      this.selectDateWithClass(type)
    },
    selectDateWithClass(type) {
      // Select Date with Classes
      if (this.weeks) {
        const dateWithClasses = this.weeks.filter((i) => i.hasClasses)

        if (dateWithClasses && dateWithClasses.length > 0) {
          this.selectDate(dateWithClasses[0].date)
        }
      }
    },
    selectDate(date) {
      this.$emit("updated", date)
    },
  },
}
</script>

<style lang="scss">
.calendarWeeks {
  .weekItem {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: calc(100% / 7);
    text-align: center;
    position: relative;

    .week {
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.08);
      border: 2px solid transparent;
      border-radius: 100%;
      cursor: pointer;
      transition: all 0.4s ease;

      .day {
        display: block;
        width: 100%;
      }
      .name {
        font-size: 10px;
        margin-bottom: -3px;
        margin-top: 7px;
      }

      &.today {
        border: 2px solid #000;
      }
      &.selected {
        border: 2px solid #000;
        background: #000;
        color: #fff;
      }
      &:hover {
        border: 2px solid rgba(0, 0, 0, 0.2);
      }
    }
    .dot {
      display: block;
      width: 5px;
      height: 5px;
      background-color: #000;
      border-radius: 100%;
      position: absolute;
      bottom: -7px;
    }
  }
}
</style>
