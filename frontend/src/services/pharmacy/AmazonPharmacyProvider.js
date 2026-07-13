import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: 'amz-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', strength: '500mg', packSize: '20 tablets', prescriptionRequired: false, category: 'Pain Relief', price: 18, manufacturer: 'Cipla', emoji: '💊', providerId: 'amazon_pharmacy' },
  { id: 'amz-2', name: 'Clonazepam 0.5mg', genericName: 'Clonazepam', strength: '0.5mg', packSize: '10 tablets', prescriptionRequired: true, category: 'Neurology', price: 48, manufacturer: 'Roche', emoji: '🧠', providerId: 'amazon_pharmacy' },
  { id: 'amz-3', name: 'Escitalopram 10mg', genericName: 'Escitalopram Oxalate', strength: '10mg', packSize: '10 tablets', prescriptionRequired: true, category: 'Mental Health', price: 120, manufacturer: 'Lundbeck', emoji: '🧬', providerId: 'amazon_pharmacy' },
  { id: 'amz-4', name: 'Folic Acid 5mg', genericName: 'Folic Acid', strength: '5mg', packSize: '30 tablets', prescriptionRequired: false, category: 'Vitamins', price: 35, manufacturer: 'GSK', emoji: '🍃', providerId: 'amazon_pharmacy' },
  { id: 'amz-5', name: 'Ondansetron 4mg', genericName: 'Ondansetron HCl', strength: '4mg', packSize: '10 tablets', prescriptionRequired: true, category: 'Antiemetic', price: 55, manufacturer: 'Cipla', emoji: '🤢', providerId: 'amazon_pharmacy' },
];

export class AmazonPharmacyProvider extends PharmacyProvider {
  getProviderInfo() {
    return {
      id: 'amazon_pharmacy',
      name: 'Amazon Pharmacy',
      tagline: 'Prime delivery on medicines',
      color: '#FF9900',
      bgColor: '#FFF8ED',
      emoji: '📦',
      baseUrl: 'https://pharmacy.amazon.in/api/v1',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 290));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 390));
    return [
      { id: 'amz-p1', name: 'Amazon Pharmacy Fulfillment — Gurgaon', distance: 5.2, rating: 4.6, deliveryTime: 240, deliveryFee: 0, isOpen: true, is24Hour: true, emoji: '📦', address: 'Gurgaon, Haryana', providerId: 'amazon_pharmacy' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 650));
    return { orderId: `AMZ-${Date.now()}`, status: 'confirmed', provider: 'amazon_pharmacy', estimatedTime: 240 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'confirmed', provider: 'amazon_pharmacy' };
  }
}
