/**
 * Leaflet/Nominatim Address Parsing Composable
 *
 * Re-exports parseNominatimPlace from useAddressParsing.js for convenience.
 * This file exists for backward compatibility and organizational clarity.
 */

import { parseNominatimPlace } from './useAddressParsing.js'

/**
 * Composable wrapper for use in Vue components
 */
export const useLeafletParsing = () => {
  return {
    parseNominatimPlace
  }
}

export { parseNominatimPlace }

export default useLeafletParsing
