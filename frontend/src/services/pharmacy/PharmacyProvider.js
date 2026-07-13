/**
 * PharmacyProvider — Abstract interface for medicine delivery providers.
 *
 * All provider implementations MUST implement these methods.
 * This enables clean separation between UI and API logic —
 * swap or add providers without touching components.
 *
 * @interface
 */
export class PharmacyProvider {
  /**
   * Returns metadata about this provider (name, brand color, logo, etc.)
   * @returns {ProviderInfo}
   */
  getProviderInfo() {
    throw new Error('getProviderInfo() must be implemented');
  }

  /**
   * Search medicines by name/brand/generic
   * @param {string} query
   * @returns {Promise<Medicine[]>}
   */
  async searchMedicines(query) {
    throw new Error('searchMedicines() must be implemented');
  }

  /**
   * Get nearby pharmacies for this provider
   * @param {number} lat
   * @param {number} lon
   * @returns {Promise<Pharmacy[]>}
   */
  async getNearbyPharmacies(lat, lon) {
    throw new Error('getNearbyPharmacies() must be implemented');
  }

  /**
   * Place an order
   * @param {CartItem[]} items
   * @param {Address} deliveryAddress
   * @returns {Promise<Order>}
   */
  async placeOrder(items, deliveryAddress) {
    throw new Error('placeOrder() must be implemented');
  }

  /**
   * Track an order by ID
   * @param {string} orderId
   * @returns {Promise<OrderStatus>}
   */
  async trackOrder(orderId) {
    throw new Error('trackOrder() must be implemented');
  }
}

/**
 * @typedef {Object} ProviderInfo
 * @property {string} id         — unique slug, e.g. 'blinkit'
 * @property {string} name       — display name, e.g. 'Blinkit'
 * @property {string} tagline    — short description
 * @property {string} color      — brand hex color
 * @property {string} bgColor    — light background for cards
 * @property {string} emoji      — emoji icon
 * @property {string} baseUrl    — API base URL (set when ready)
 */

/**
 * @typedef {Object} Medicine
 * @property {string} id
 * @property {string} name
 * @property {string} genericName
 * @property {string} strength
 * @property {string} packSize
 * @property {boolean} prescriptionRequired
 * @property {string} category
 * @property {number} price
 * @property {string} manufacturer
 * @property {string} emoji
 * @property {string} providerId
 */

/**
 * @typedef {Object} Pharmacy
 * @property {string} id
 * @property {string} name
 * @property {number} distance     — in km
 * @property {number} rating
 * @property {number} deliveryTime — in minutes
 * @property {number} deliveryFee
 * @property {boolean} isOpen
 * @property {boolean} is24Hour
 * @property {string} emoji
 * @property {string} address
 * @property {string} providerId
 */
