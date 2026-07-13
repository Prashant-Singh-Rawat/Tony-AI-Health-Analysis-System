import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: 'bk-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', strength: '500mg', packSize: '10 tablets', prescriptionRequired: false, category: 'Pain Relief', price: 12, manufacturer: 'Cipla', emoji: '💊', providerId: 'blinkit' },
  { id: 'bk-2', name: 'Azithromycin 500mg', genericName: 'Azithromycin', strength: '500mg', packSize: '5 tablets', prescriptionRequired: true, category: 'Antibiotic', price: 89, manufacturer: 'Sun Pharma', emoji: '🧬', providerId: 'blinkit' },
  { id: 'bk-3', name: 'Atorvastatin 10mg', genericName: 'Atorvastatin', strength: '10mg', packSize: '15 tablets', prescriptionRequired: true, category: 'Cholesterol', price: 45, manufacturer: 'Ranbaxy', emoji: '❤️', providerId: 'blinkit' },
  { id: 'bk-4', name: 'Metformin 500mg', genericName: 'Metformin HCl', strength: '500mg', packSize: '20 tablets', prescriptionRequired: true, category: 'Diabetes', price: 28, manufacturer: 'USV', emoji: '🩺', providerId: 'blinkit' },
  { id: 'bk-5', name: 'Cetirizine 10mg', genericName: 'Cetirizine HCl', strength: '10mg', packSize: '10 tablets', prescriptionRequired: false, category: 'Allergy', price: 18, manufacturer: 'Dr. Reddy\'s', emoji: '🌿', providerId: 'blinkit' },
];

export class BlinkitProvider extends PharmacyProvider {
  // API_BASE_URL = 'https://api.blinkit.com/v1'; // wire when ready

  getProviderInfo() {
    return {
      id: 'blinkit',
      name: 'Blinkit',
      tagline: '10-minute delivery',
      color: '#1CBD39',
      bgColor: '#F0FBF1',
      emoji: '⚡',
      baseUrl: 'https://api.blinkit.com/v1',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 300));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 400));
    return [
      { id: 'bk-p1', name: 'Blinkit Dark Store — Connaught Place', distance: 1.2, rating: 4.8, deliveryTime: 10, deliveryFee: 0, isOpen: true, is24Hour: true, emoji: '⚡', address: 'CP, New Delhi', providerId: 'blinkit' },
      { id: 'bk-p2', name: 'Blinkit Dark Store — Lajpat Nagar', distance: 3.4, rating: 4.7, deliveryTime: 12, deliveryFee: 0, isOpen: true, is24Hour: true, emoji: '⚡', address: 'Lajpat Nagar, New Delhi', providerId: 'blinkit' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 800));
    return { orderId: `BLK-${Date.now()}`, status: 'confirmed', provider: 'blinkit', estimatedTime: 10 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'out_for_delivery', provider: 'blinkit' };
  }
}
