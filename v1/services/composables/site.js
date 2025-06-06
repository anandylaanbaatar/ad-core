/**
 * Utility
 * Servies and Classes
 */
export const getClasses = (product) => {
  if (!product.interval) return
  if (!product.start_date_time) return
  if (!product.duration) return

  const timezone = useAppConfig().theme.timezone
  const format = "MMM DD, YYYY - h:mm a"
  const formatDay = "MMM DD, YYYY"
  const formatTime = "h:mm a"
  const nuxtApp = useNuxtApp()

  let startDate = nuxtApp.$utils.moment(product.start_date_time).tz(timezone)
  let endDate = null
  let interval = product.interval
  let intervalCount = `${interval}s`
  let count = 1
  let classes = []
  let comingUpSet = false

  const getStatus = (dateStart, dateEnd) => {
    let current = nuxtApp.$utils.moment().tz(timezone)
    let status = "Not Started"

    if (current.isAfter(dateStart) && current.isBefore(dateEnd)) {
      status = "In Progress"
    } else if (current.isBetween(dateStart, dateEnd)) {
      status = "In Progress"
    } else if (current.isAfter(dateEnd)) {
      status = "Finished"
    }

    return status
  }
  const endDateFormat = (dateStart, dateEnd) => {
    let dateFormatted = dateEnd.format(formatTime)
    if (dateStart.format(formatDay) !== dateEnd.format(formatDay)) {
      dateFormatted = dateEnd.format(format)
    }
    return dateFormatted
  }
  const dateByDuration = (date, duration) => {
    return nuxtApp.$utils.moment(date).tz(timezone).add("minutes", duration)
  }
  const getClassDates = (classId, dateStart, dateEnd) => {
    if (product.classes) {
      if (product.classes[classId]) {
        if (
          product.classes[classId].startDate &&
          product.classes[classId].endDate
        ) {
          const classOverrideItem = product.classes[classId]
          const overrideDateStart = nuxtApp.$utils
            .moment(classOverrideItem.startDate)
            .tz(timezone)
          const overrideDateEnd = nuxtApp.$utils
            .moment(classOverrideItem.endDate)
            .tz(timezone)
          let result = {}

          if (overrideDateStart.format(format) !== dateStart.format(format)) {
            result.dateStart = overrideDateStart
          }
          if (overrideDateEnd.format(format) !== dateEnd.format(format)) {
            result.dateEnd = overrideDateEnd
          }

          if (Object.keys(result).length === 0) {
            return
          } else {
            return result
          }
        }
      }
    }
    return
  }
  const getClassUsers = (classId) => {
    let classUsers = []

    if (product.classes) {
      if (product.classes[classId]) {
        if (product.classes[classId].users) {
          classUsers = product.classes[classId].users

          if (product.classes[classId].users.length > 1) {
            classUsers = classUsers.sort((a, b) =>
              a.timestamp < b.timestamp ? 1 : -1
            )
          }
        }
      }
    }

    return classUsers
  }
  const getClassItem = (dateStart, duration) => {
    const classId = `${product.id}_${dateStart.valueOf()}`

    // Start and End Dates
    let currentDateStart = nuxtApp.$utils.moment(dateStart).tz(timezone)
    let currentDateEnd = dateByDuration(currentDateStart, duration)

    // Check if classes available
    let classUsers = getClassUsers(classId)
    let newDates = getClassDates(classId, currentDateStart, currentDateEnd)
    if (newDates) {
      if (newDates.dateStart) {
        currentDateStart = newDates.dateStart
      }
      if (newDates.dateEnd) {
        currentDateEnd = newDates.dateEnd
      }
    }

    // Status and Coming Up
    let status = getStatus(currentDateStart, currentDateEnd)
    let comingUpDays = null

    // Check if it's coming up
    if (product.interval !== "one_off") {
      if (!comingUpSet) {
        let now = nuxtApp.$utils.moment().tz(timezone)
        let countDays = currentDateStart.diff(now, "days")

        if (status === "Not Started") {
          comingUpDays =
            countDays < 8 ? currentDateStart.calendar() : `in ${countDays} days`
          comingUpSet = true
        }
      }
    }

    // Calculate Slots
    const classSlotsTotal = product.slots
    let classSlotsLeft = product.slots
    if (classUsers && classUsers.length > 0) {
      classSlotsLeft = classSlotsTotal - classUsers.length
    }

    return {
      id: classId,
      date: currentDateStart,
      dateEnd: currentDateEnd,
      formatted: `${currentDateStart.format(format)} to ${endDateFormat(currentDateStart, currentDateEnd)}`,
      status: status,
      comingUp: comingUpDays,
      users: classUsers,
      slotsLeft: classSlotsLeft,
      slotsTotal: classSlotsTotal,
    }
  }

  // One Time or Recurring
  if (interval === "one_off") {
    endDate = startDate.add("minutes", product.duration)
  } else {
    endDate = nuxtApp.$utils.moment(product.end_date_time).tz(timezone)
    count = endDate.diff(startDate, intervalCount)
  }

  let result = {
    start: startDate.format(format),
    end: endDate.format(format),
    count: {
      total: count,
    },
  }

  // Add First Date to Classes
  classes.push(getClassItem(startDate, product.duration))

  // All Other Classes
  if (interval !== "one_off") {
    for (let i = 0; i < count; i++) {
      let newStartDate = nuxtApp.$utils
        .moment(startDate)
        .tz(timezone)
        .add(intervalCount, i + 1)

      classes.push(getClassItem(newStartDate, product.duration))
    }
  }

  // Add Classes to Result
  result.classes = classes

  // Set Counts
  if (classes.length > 0) {
    result.count.total = classes.length
    result.count.finished = classes.filter(
      (i) => i.status === "Finished"
    ).length
    result.count.in_progress = classes.filter(
      (i) => i.status === "In Progress"
    ).length
    result.count.not_started = classes.filter(
      (i) => i.status === "Not Started"
    ).length
  }

  return result
}

export const getClassInterval = (interval) => {
  if (interval === "one_off") {
    return "One Time"
  } else if (interval === "day") {
    return "Daily"
  } else if (interval === "week") {
    return "Weekly"
  } else if (interval === "month") {
    return "Monthly"
  } else if (interval === "year") {
    return "Yearly"
  }
}

export const getProductById = (id) => {
  if (!id) return
  const products = useServicesStore().products
  if (!products) return

  const product = products.find((i) => i.id === id)

  if (product) {
    return product
  }

  return
}

export const getUserById = (id) => {
  if (!id) return
  const users = useAuthStore().users
  if (!users) return

  const user = users.find((i) => i.uid === id)

  if (user) {
    return user
  }

  return
}

export const getUserNameById = (id) => {
  if (!id) return
  const users = useAuthStore().users
  if (!users) return

  const user = users.find((i) => i.uid === id)

  if (user) {
    return user.displayName
  }

  return
}

export const getAvailableSlots = (id, slots) => {
  if (!id) return
  const allSubscriptions = useServicesStore().subscriptions

  if (allSubscriptions) {
    const activeSubscriptions = allSubscriptions.filter(
      (i) => i.plan.product === id
    )

    if (activeSubscriptions) {
      return slots - activeSubscriptions.length
    }
  }

  return slots
}

/**
 * Methods
 */

export const joinClass = async (product, classItem, userUid) => {
  if (!product) return
  if (!classItem) return
  if (!userUid) return

  const nuxtApp = useNuxtApp()
  const productId = product.id
  const classId = classItem.id

  // Set Class Users
  let classUsers = classItem.users ? classItem.users : []

  // Find and Add User in Class
  const findUserInClass = classUsers.find((i) => i.uid === userUid)
  if (!findUserInClass) {
    classUsers.push({
      uid: userUid,
      timestamp: nuxtApp.$utils.moment().valueOf(),
    })
  }

  // Update Class
  let updates = {
    classes: product.classes ? product.classes : {},
  }
  if (!updates.classes[classId]) {
    updates.classes[classId] = {}
  }

  updates.classes[classId].id = classId
  updates.classes[classId].users = classUsers

  await nuxtApp.$fire.actions.update(
    `${tenantPath()}/products/${productId}`,
    updates
  )
  await useServicesStore().setProducts()

  // Toast
  nuxtApp.$bus.$emit("toast", {
    severity: "success",
    summary: "Success",
    detail: "Successfully joined class.",
  })
}
export const cancelClass = async (product, classItem, userUid) => {
  if (!userUid) return
  if (!product) return
  if (!classItem) return

  const nuxtApp = useNuxtApp()
  const productId = product.id
  const classId = classItem.id
  const classUsers = classItem.users.filter((i) => i.uid !== userUid)

  let updates = {
    classes: product.classes ? product.classes : {},
  }
  if (!updates.classes[classId]) {
    updates.classes[classId] = {}
  }

  updates.classes[classId].id = classId
  updates.classes[classId].users = classUsers

  // Update DB
  await nuxtApp.$fire.actions.update(
    `${tenantPath()}/products/${productId}`,
    updates
  )

  // Update Products
  await useServicesStore().setProducts()

  // Toast
  nuxtApp.$bus.$emit("toast", {
    severity: "success",
    summary: "Success",
    detail: "Successfully removed member from class.",
  })
}
export const adminAddToClass = async (product, classItem, userUid) => {
  if (!product) return
  if (!classItem) return
  if (!userUid) return

  await joinClass(product, classItem, userUid)
}
export const adminRemoveFromClass = async (product, classItem, userUid) => {
  if (!product) return
  if (!classItem) return
  if (!userUid) return

  await cancelClass(product, classItem, userUid)
}
