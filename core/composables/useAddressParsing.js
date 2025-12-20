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
    // Mongolia format: "Building, Street, District, City ZIP, Mongolia"
    const cityZip = parts.pop() || ""
    const districtKhoroo = parts.pop() || ""
    const address2 = parts.shift() || ""
    const address1 = parts.join(", ")

    // Split city + zip
    const cityZipParts = cityZip.split(" ")
    const zipcode = cityZipParts.pop() || ""
    const city = cityZipParts.join(" ")

    return {
      address1,
      address2,
      city,
      province: districtKhoroo,
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
  if (!result || !result.address) {
    return {
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
  }

  const addr = result.address

  // Extract common fields
  const country = addr.country || ""
  const zip = addr.postcode || ""
  const city = addr.city || addr.town || addr.village || ""

  // Province/State: Handle Mongolia-specific vs international
  let province = ""
  const isMongolia = country === "Mongolia" || country === "Монгол"

  if (isMongolia) {
    // Mongolia: Use city_district/district/suburb/neighbourhood for district (e.g., "Chingeltei", "Sukhbaatar District")
    province = addr.city_district || addr.district || addr.suburb || addr.neighbourhood || addr.county || ""

    // Fallback: Parse district from display_name if not found in address fields
    // Format: "Street, District, City, Zip, Country"
    if (!province && result.display_name) {
      const parts = result.display_name.split(',').map(p => p.trim())
      // Find the part that comes before the city (Ulaanbaatar)
      const cityIndex = parts.findIndex(p => p === city || p === 'Ulaanbaatar' || p === 'Улаанбаатар')
      if (cityIndex > 1) {
        // District is typically the part right before the city
        province = parts[cityIndex - 1]
      }
    }
  } else {
    // International: Use state/county
    province = addr.state || addr.county || ""
  }

  // Build address components
  let address1 = "" // Street address with house number
  let address2 = "" // Building, unit, floor, or place name
  let street = ""

  // Address1: Street address (house_number + road)
  if (addr.house_number && addr.road) {
    address1 = `${addr.house_number} ${addr.road}`
    street = addr.road
  } else if (addr.road) {
    address1 = addr.road
    street = addr.road
  } else if (addr.house_number) {
    address1 = addr.house_number
  }

  // Address2: Building/unit/floor/place name details
  const buildingParts = []

  // Check for building name or premise
  if (addr.building) {
    buildingParts.push(addr.building)
  } else if (addr.premise) {
    buildingParts.push(addr.premise)
  }

  // Check for unit/apartment number
  if (addr.unit) {
    buildingParts.push(`Unit ${addr.unit}`)
  } else if (addr.apartment) {
    buildingParts.push(`Apt ${addr.apartment}`)
  }

  // Check for floor/level
  if (addr.floor) {
    buildingParts.push(`Floor ${addr.floor}`)
  } else if (addr.level) {
    buildingParts.push(`Level ${addr.level}`)
  }

  // Combine building parts into address2
  if (buildingParts.length > 0) {
    address2 = buildingParts.join(", ")
  }

  // Fallback: If no street address but have premise, use it as address1
  if (!address1 && addr.premise) {
    address1 = addr.premise
  }

  // Additional fallback: Parse display_name if address1 is still empty
  if (!address1 && result.display_name) {
    const parts = result.display_name.split(',').map(p => p.trim())
    if (parts.length > 0) {
      // First part is usually the most specific address
      const firstPart = parts[0]

      // If the first part looks like a building name (contains letters and is short)
      // and there's a second part that looks like a street, use accordingly
      if (parts.length > 1 && firstPart.length < 20 && /[A-Za-z]/.test(firstPart)) {
        const possibleStreet = parts[1]
        // Check if second part looks like a street (has numbers)
        if (/\d/.test(possibleStreet)) {
          address1 = possibleStreet // Street address
          address2 = firstPart // Building/place name
        } else {
          address1 = firstPart
        }
      } else {
        address1 = firstPart
      }
    }
  }

  // Extract location coordinates
  let location = null
  if (result.lat && result.lon) {
    location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
  }

  // Build standardized output (matches Google Places format)
  return {
    address1: address1, // Street address
    address2: address2, // Building/unit/place name
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
