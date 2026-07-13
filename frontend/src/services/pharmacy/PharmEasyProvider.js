import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: 'pe-1', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', strength: '400mg', packSize: '10 tablets', prescriptionRequired: false, category: 'Pain Relief', price: 20, manufacturer: 'Abbott', emoji: '💊', providerId: 'pharmeasy' },
  { id: 'pe-2', name: 'Doxycycline 100mg', genericName: 'Doxycycline Hyclate', strength: '100mg', packSize: '10 capsules', prescriptionRequired: true, category: 'Antibiotic', price: 58, manufacturer: 'Pfizer', emoji: '🧬', providerId: 'pharmeasy' },
  { id: 'pe-3', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', strength: '5mg', packSize: '30 tablets', prescriptionRequired: true, category: 'Blood Pressure', price: 65, manufacturer: 'Torrent', emoji: '❤️', providerId: 'pharmeasy' },
  { id: 'pe-4', name: 'Insulin Glargine 100U/mL', genericName: 'Insulin Glargine', strength: '100 U/mL', packSize: '3mL vial', prescriptionRequired: true, category: 'Diabetes', price: 780, manufacturer: 'Sanofi', emoji: '💉', providerId: 'pharmeasy' },
  { id: 'pe-5', name: 'Multivitamin Tablet', genericName: 'Multivitamins', strength: 'Standard', packSize: '30 tablets', prescriptionRequired: false, category: 'Vitamins', price: 95, manufacturer: 'Himalaya', emoji: '🌈', providerId: 'pharmeasy' },
];

export class PharmEasyProvider extends PharmacyProvider {
  getProviderInfo() {
    return {
      id: 'pharmeasy',
      name: 'PharmEasy',
      tagline: 'Flat 25% off on medicines',
      color: '#5340FF',
      bgColor: '#F0EEFF',
      emoji: '💜',
      baseUrl: 'https://api.pharmeasy.in/v1',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 320));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 420));
    return [
      { id: 'pe-p1', name: 'PharmEasy Hub — Vasant Kunj', distance: 2.3, rating: 4.5, deliveryTime: 120, deliveryFee: 0, isOpen: true, is24Hour: false, emoji: '💜', address: 'Vasant Kunj, New Delhi', providerId: 'pharmeasy' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 900));
    return { orderId: `PE-${Date.now()}`, status: 'confirmed', provider: 'pharmeasy', estimatedTime: 120 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'confirmed', provider: 'pharmeasy' };
  }
}
