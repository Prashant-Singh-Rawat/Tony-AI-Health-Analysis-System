import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: 'nm-1', name: 'Aspirin 75mg', genericName: 'Acetylsalicylic Acid', strength: '75mg', packSize: '14 tablets', prescriptionRequired: false, category: 'Cardiac', price: 15, manufacturer: 'Bayer', emoji: '❤️', providerId: 'netmeds' },
  { id: 'nm-2', name: 'Rabeprazole 20mg', genericName: 'Rabeprazole Sodium', strength: '20mg', packSize: '15 tablets', prescriptionRequired: false, category: 'Gastric', price: 42, manufacturer: 'Eisai', emoji: '🫁', providerId: 'netmeds' },
  { id: 'nm-3', name: 'Telmisartan 40mg', genericName: 'Telmisartan', strength: '40mg', packSize: '14 tablets', prescriptionRequired: true, category: 'Blood Pressure', price: 88, manufacturer: 'Boehringer', emoji: '💊', providerId: 'netmeds' },
  { id: 'nm-4', name: 'Sitagliptin 100mg', genericName: 'Sitagliptin Phosphate', strength: '100mg', packSize: '14 tablets', prescriptionRequired: true, category: 'Diabetes', price: 340, manufacturer: 'MSD', emoji: '🩺', providerId: 'netmeds' },
  { id: 'nm-5', name: 'Calcium + Vitamin D3', genericName: 'Calcium Carbonate + Cholecalciferol', strength: '500mg+250IU', packSize: '60 tablets', prescriptionRequired: false, category: 'Vitamins', price: 145, manufacturer: 'Cadila', emoji: '🦴', providerId: 'netmeds' },
];

export class NetmedsProvider extends PharmacyProvider {
  getProviderInfo() {
    return {
      id: 'netmeds',
      name: 'Netmeds',
      tagline: 'India ki pharmacy',
      color: '#00A78E',
      bgColor: '#E8FBF8',
      emoji: '🟢',
      baseUrl: 'https://api.netmeds.com/v1',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 310));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 410));
    return [
      { id: 'nm-p1', name: 'Netmeds Partner — Karol Bagh', distance: 1.8, rating: 4.4, deliveryTime: 180, deliveryFee: 49, isOpen: true, is24Hour: false, emoji: '🟢', address: 'Karol Bagh, New Delhi', providerId: 'netmeds' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 850));
    return { orderId: `NM-${Date.now()}`, status: 'confirmed', provider: 'netmeds', estimatedTime: 180 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'confirmed', provider: 'netmeds' };
  }
}
