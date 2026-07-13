import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: 'ap-1', name: 'Paracetamol 650mg', genericName: 'Acetaminophen', strength: '650mg', packSize: '15 tablets', prescriptionRequired: false, category: 'Pain Relief', price: 25, manufacturer: 'GSK', emoji: '💊', providerId: 'apollo247' },
  { id: 'ap-2', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', strength: '500mg', packSize: '10 capsules', prescriptionRequired: true, category: 'Antibiotic', price: 76, manufacturer: 'Alembic', emoji: '🧬', providerId: 'apollo247' },
  { id: 'ap-3', name: 'Omeprazole 20mg', genericName: 'Omeprazole', strength: '20mg', packSize: '14 capsules', prescriptionRequired: false, category: 'Gastric', price: 32, manufacturer: 'Cipla', emoji: '🫁', providerId: 'apollo247' },
  { id: 'ap-4', name: 'Losartan 50mg', genericName: 'Losartan Potassium', strength: '50mg', packSize: '30 tablets', prescriptionRequired: true, category: 'Blood Pressure', price: 120, manufacturer: 'Glenmark', emoji: '❤️', providerId: 'apollo247' },
  { id: 'ap-5', name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', strength: '60000 IU', packSize: '4 capsules', prescriptionRequired: false, category: 'Vitamins', price: 55, manufacturer: 'Abbott', emoji: '☀️', providerId: 'apollo247' },
];

export class Apollo247Provider extends PharmacyProvider {
  // API_BASE_URL = 'https://apollo247.com/api/v1'; // wire when ready

  getProviderInfo() {
    return {
      id: 'apollo247',
      name: 'Apollo 24/7',
      tagline: '2-hour express delivery',
      color: '#0055A5',
      bgColor: '#EBF4FF',
      emoji: '🏥',
      baseUrl: 'https://apollo247.com/api/v1',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 350));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 450));
    return [
      { id: 'ap-p1', name: 'Apollo Pharmacy — Safdarjung', distance: 0.8, rating: 4.9, deliveryTime: 30, deliveryFee: 20, isOpen: true, is24Hour: true, emoji: '🏥', address: 'Safdarjung, New Delhi', providerId: 'apollo247' },
      { id: 'ap-p2', name: 'Apollo Pharmacy — GK-1', distance: 2.1, rating: 4.8, deliveryTime: 45, deliveryFee: 20, isOpen: true, is24Hour: false, emoji: '🏥', address: 'Greater Kailash, New Delhi', providerId: 'apollo247' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 700));
    return { orderId: `AP-${Date.now()}`, status: 'confirmed', provider: 'apollo247', estimatedTime: 30 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'preparing', provider: 'apollo247' };
  }
}
