/**
 * Address Parsing Composable
 *
 * Parses Google Places API address_components into a standardized address format.
 * Optimized for Mongolia addresses with full international support.
 */

/**
 * Extract a component value by type from address_components
 * @param {Array} components - Google address_components array
 * @param {string|string[]} types - Type(s) to search for
 * @param {string} format - 'long_name' or 'short_name'
 * @returns {string|null}
 */
const getComponent = (components, types, format = "long_name") => {
  const typeArray = Array.isArray(types) ? types : [types]

  for (const type of typeArray) {
    const component = components.find((c) => c.types.includes(type))
    if (component) {
      return component[format]
    }
  }
  return null
}

/**
 * Parse Mongolia-specific address from Google Place
 * Uses sublocality for districts/khoroo, handles plus_code and premise
 */
const parseMongoliaAddress = (components) => {
  let province = null
  let street = null

  // Province: sublocality_level_1 (district), fallback to administrative_area_level_2
  province = getComponent(components, "sublocality_level_1")
  if (!province) {
    province = getComponent(components, "administrative_area_level_2")
  }

  // Street: Try multiple sources common in Mongolia
  const streetNumber = getComponent(components, "street_number")
  const route = getComponent(components, "route", "short_name")

  if (streetNumber) {
    street = streetNumber
    if (route) {
      street += " " + route
    }
  } else if (route) {
    street = route
  }

  // Fallback to plus_code or premise (common in Mongolia)
  if (!street) {
    street = getComponent(components, "plus_code")
  }
  if (!street) {
    street = getComponent(components, "premise")
  }

  return { province, street }
}

/**
 * Parse international address from Google Place
 * Uses standard administrative_area_level_1 for state/province
 */
const parseInternationalAddress = (components) => {
  let province = null
  let street = null

  // Province/State: administrative_area_level_1
  province = getComponent(components, "administrative_area_level_1")

  // Street: street_number + route
  const streetNumber = getComponent(components, "street_number")
  const route = getComponent(components, "route", "short_name")

  if (streetNumber && route) {
    street = streetNumber + " " + route
  } else if (route) {
    street = route
  } else if (streetNumber) {
    street = streetNumber
  }

  // Fallback to premise/subpremise for building details
  if (!street) {
    const premise = getComponent(components, "premise")
    const subpremise = getComponent(components, "subpremise")

    if (premise) {
      street = premise
      if (subpremise) {
        street += ", " + subpremise
      }
    }
  }

  return { province, street }
}

/**
 * Parse Google Place object into standardized address format
 * @param {Object} place - Google Places API place object
 * @returns {Object} Standardized address object
 */
export const parseGooglePlace = (place) => {
  if (!place || !place.address_components) {
    return {
      address1: "",
      address2: "",
      street: "",
      city: "",
      province: "",
      zip: "",
      country: "",
      location: null,
      formatted_address: place?.formatted_address || "",
    }
  }

  const components = place.address_components

  // Extract common fields
  const country = getComponent(components, "country") || ""
  const zip = getComponent(components, "postal_code") || ""
  const city = getComponent(components, "locality") || ""

  // Route to country-specific parsing
  const isMongolia = country === "Mongolia" || country === "Монгол"
  const { province, street } = isMongolia
    ? parseMongoliaAddress(components)
    : parseInternationalAddress(components)

  // Extract location coordinates
  let location = null
  if (place.geometry && place.geometry.location) {
    // Handle both google.maps.LatLng objects and plain objects
    const loc = place.geometry.location
    location = {
      lat: typeof loc.lat === "function" ? loc.lat() : loc.lat,
      lng: typeof loc.lng === "function" ? loc.lng() : loc.lng,
    }
  }

  // Extract building/premise information for address2
  let address2 = ""
  const premise = getComponent(components, "premise")
  const subpremise = getComponent(components, "subpremise")

  // Build address2 from premise and subpremise
  const buildingParts = []
  if (premise) {
    buildingParts.push(premise)
  }
  if (subpremise) {
    buildingParts.push(subpremise)
  }
  if (buildingParts.length > 0) {
    address2 = buildingParts.join(", ")
  }

  // Build standardized output
  const formData = {
    address1: street || "", // Street address
    address2: address2, // Building/unit/place name
    street: street || "",
    city: city,
    province: province || "",
    zip: zip,
    country: country,
    location: location,
    formatted_address: place.formatted_address || "",
  }

  return formData
}

/**
 * Parse a formatted address string into components
 * Used as fallback when address_components are incomplete
 * @param {string} formatted - Formatted address string
 * @param {string} country - Country name for country-specific parsing
 * @returns {Object} Parsed address components
 */
export const parseFormattedAddress = (formatted, country = null) => {
  if (!formatted) {
    return {
      address1: "",
      address2: "",
      city: "",
      province: "",
      country: "",
      zipcode: "",
    }
  }

  const parts = formatted.split(",").map((p) => p.trim())

  // Default international parsing (most common format)
  // Format: "Street Address, City, State ZIP, Country"
  const detectedCountry = parts.pop() || ""

  // Check if this is Mongolia
  const isMongolia =
    country === "Mongolia" ||
    country === "Монгол" ||
    detectedCountry === "Mongolia" ||
    detectedCountry === "Монгол"

  if (isMongolia) {
    // Mongolia format examples:
    // "Ц.Жигжиджавын гудамж, Chingeltei, Ulaanbaatar, 15160, Mongolia"
    // "УБ хотын банк, Картын төв, Peace Avenue, Baga Toirog, Sükhbaatar, Ulaanbaatar, 15160, Mongolia"
    // Strategy: Work backwards - city+zip, province, address1, then address2 is leftovers

    // Remove zip if it's a separate part at the end
    let zipcode = ""
    if (parts.length > 0 && /^\d+$/.test(parts[parts.length - 1])) {
      zipcode = parts.pop() || ""
    }

    // Next is city (or city+zip combined)
    let city = ""
    if (parts.length > 0) {
      const cityPart = parts.pop() || ""
      // Check if city contains zip (e.g., "Ulaanbaatar 15160")
      const cityZipMatch = cityPart.match(/^(.+?)\s+(\d+)$/)
      if (cityZipMatch) {
        city = cityZipMatch[1]
        if (!zipcode) zipcode = cityZipMatch[2]
      } else {
        city = cityPart
      }
    }

    // Next is province/district
    const province = parts.length > 0 ? parts.pop() || "" : ""

    // Next is address1 (street)
    const address1 = parts.length > 0 ? parts.pop() || "" : ""

    // Everything remaining is address2 (building, place name, etc.)
    const address2 = parts.length > 0 ? parts.join(", ") : ""

    return {
      address1,
      address2,
      city,
      province,
      country: detectedCountry,
      zipcode,
    }
  } else {
    // International format: "Street, City, State ZIP, Country"
    const stateZip = parts.pop() || ""
    const city = parts.pop() || ""
    const address1 = parts.join(", ")

    // Split state + zip (handle "CA 90210" or "California 90210")
    const stateZipParts = stateZip.split(" ")
    const zipcode = stateZipParts.pop() || ""
    const province = stateZipParts.join(" ")

    return {
      address1,
      address2: "",
      city,
      province,
      country: detectedCountry,
      zipcode,
    }
  }
}

/**
 * Parse Nominatim result into standardized address format
 * @param {Object} result - Nominatim API result object
 * @returns {Object} Standardized address object
 */
export const parseNominatimPlace = (result) => {
  const emptyResult = {
    address1: "",
    address2: "",
    street: "",
    city: "",
    province: "",
    zip: "",
    country: "",
    location: null,
    formatted_address: result?.display_name || "",
  }

  if (!result) return emptyResult

  const addr = result.address || {}
  const displayName = result.display_name || ""

  // Extract basic fields from geocoding
  let country = addr.country || ""
  let zip = addr.postcode || ""
  let street = addr.road || ""

  // Extract location coordinates
  let location = null
  if (result.lat && result.lon) {
    location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
  }

  const isMongolia = country === "Mongolia" || country === "Монгол"

  // For Mongolia: Use full address parsing (more reliable than geocoding fields)
  if (isMongolia && displayName) {
    const parts = displayName.split(',').map(p => p.trim())

    // Work backwards from the end:
    // Format: "Place, Place2, Street, SubDistrict, District, City, Zip, Country"

    // Remove country
    if (parts.length > 0 && (parts[parts.length - 1] === 'Mongolia' || parts[parts.length - 1] === 'Монгол')) {
      parts.pop()
    }

    // Remove zip (if numeric)
    if (parts.length > 0 && /^\d+$/.test(parts[parts.length - 1])) {
      zip = parts.pop()
    }

    // City is next (Ulaanbaatar)
    let city = ""
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1]
      if (lastPart === 'Ulaanbaatar' || lastPart === 'Улаанбаатар' || lastPart.includes('Ulaanbaatar') || lastPart.includes('Улаанбаатар')) {
        city = parts.pop()
      }
    }

    // Known districts in Ulaanbaatar
    const knownDistricts = [
      'Sükhbaatar', 'Sukhbaatar', 'Сүхбаатар',
      'Chingeltei', 'Чингэлтэй',
      'Bayanzürkh', 'Bayanzurkh', 'Баянзүрх',
      'Khan-Uul', 'Хан-Уул',
      'Songinokhairkhan', 'Сонгинохайрхан',
      'Bayangol', 'Баянгол',
      'Nalaikh', 'Налайх',
      'Bagakhangai', 'Багахангай',
      'Baganuur', 'Багануур'
    ]

    // Helper to check if a string looks like a street
    const looksLikeStreet = (str) => {
      const lower = str.toLowerCase()
      return str.includes('гудамж') ||
             str.includes('өргөн чөлөө') ||
             str.includes('зам') ||
             lower.includes('street') ||
             lower.includes('avenue') ||
             lower.includes('road')
    }

    // Find and remove province (known district)
    let province = ""
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i]
      if (knownDistricts.some(d => part === d || part.includes(d))) {
        province = parts.splice(i, 1)[0]
        break
      }
    }

    // Find and remove address1 (street) - look for street patterns
    let address1 = ""
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i]
      if (looksLikeStreet(part)) {
        address1 = parts.splice(i, 1)[0]
        break
      }
    }

    // If no street pattern found, take the last part as address1
    if (!address1 && parts.length > 0) {
      address1 = parts.pop()
    }

    // If no known district found, take the last remaining part as province
    if (!province && parts.length > 0) {
      province = parts.pop()
    }

    // Address2 is everything remaining (place names, building names, etc.)
    let address2 = ""
    if (parts.length > 0) {
      address2 = parts.join(', ')
    }

    return {
      address1: address1,
      address2: address2,
      street: street || address1,
      city: city,
      province: province,
      zip: zip,
      country: country,
      location: location,
      formatted_address: displayName,
    }
  }

  // For international addresses: use geocoding fields
  let city = addr.city || addr.town || addr.village || ""
  let province = addr.state || addr.county || ""
  let address1 = ""
  let address2 = ""

  // Address1 from geocoding (street address)
  if (addr.house_number && addr.road) {
    address1 = `${addr.house_number} ${addr.road}`
  } else if (addr.road) {
    address1 = addr.road
  } else if (addr.house_number) {
    address1 = addr.house_number
  }

  // Address2 from geocoding (building/place name)
  const buildingParts = []
  if (addr.amenity) buildingParts.push(addr.amenity)
  else if (addr.shop) buildingParts.push(addr.shop)
  else if (addr.office) buildingParts.push(addr.office)
  else if (addr.tourism) buildingParts.push(addr.tourism)
  else if (addr.leisure) buildingParts.push(addr.leisure)

  if (addr.building && addr.building !== 'yes') buildingParts.push(addr.building)
  else if (addr.premise) buildingParts.push(addr.premise)

  if (addr.house_name) buildingParts.push(addr.house_name)

  if (buildingParts.length > 0) {
    address2 = buildingParts.join(", ")
  }

  // Build standardized output (matches Google Places format)
  return {
    address1: address1,
    address2: address2,
    street: street || address1,
    city: city,
    province: province,
    zip: zip,
    country: country,
    location: location,
    formatted_address: result.display_name || "",
  }
}

/**
 * Composable wrapper for use in Vue components
 */
export const useAddressParsing = () => {
  return {
    parseGooglePlace,
    parseFormattedAddress,
    parseNominatimPlace,
  }
}

export default useAddressParsing
