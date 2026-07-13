import { PharmacyProvider } from './PharmacyProvider';

const MOCK_MEDICINES = [
  { id: '1mg-1', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', strength: '40mg', packSize: '15 tablets', prescriptionRequired: false, category: 'Gastric', price: 38, manufacturer: 'Pfizer', emoji: '🫁', providerId: 'tata1mg' },
  { id: '1mg-2', name: 'Montelukast 10mg', genericName: 'Montelukast Sodium', strength: '10mg', packSize: '10 tablets', prescriptionRequired: true, category: 'Respiratory', price: 95, manufacturer: 'Torrent', emoji: '🌬️', providerId: 'tata1mg' },
  { id: '1mg-3', name: 'Clopidogrel 75mg', genericName: 'Clopidogrel', strength: '75mg', packSize: '14 tablets', prescriptionRequired: true, category: 'Cardiac', price: 62, manufacturer: 'Sun Pharma', emoji: '❤️', providerId: 'tata1mg' },
  { id: '1mg-4', name: 'Rosuvastatin 10mg', genericName: 'Rosuvastatin', strength: '10mg', packSize: '10 tablets', prescriptionRequired: true, category: 'Cholesterol', price: 78, manufacturer: 'AstraZeneca', emoji: '💊', providerId: 'tata1mg' },
  { id: '1mg-5', name: 'Levocetirizine 5mg', genericName: 'Levocetirizine HCl', strength: '5mg', packSize: '10 tablets', prescriptionRequired: false, category: 'Allergy', price: 22, manufacturer: 'UCB', emoji: '🌿', providerId: 'tata1mg' },
];

export class Tata1mgProvider extends PharmacyProvider {
  getProviderInfo() {
    return {
      id: 'tata1mg',
      name: 'Tata 1mg',
      tagline: 'Genuine medicines, best prices',
      color: '#E40000',
      bgColor: '#FFF0F0',
      emoji: '🔴',
      baseUrl: 'https://api.1mg.com/v2',
    };
  }

  async searchMedicines(query) {
    await new Promise((r) => setTimeout(r, 280));
    const q = query.toLowerCase();
    return MOCK_MEDICINES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  async getNearbyPharmacies(lat, lon) {
    await new Promise((r) => setTimeout(r, 380));
    return [
      { id: '1mg-p1', name: '1mg Partner Pharmacy — Rohini', distance: 1.5, rating: 4.7, deliveryTime: 60, deliveryFee: 0, isOpen: true, is24Hour: false, emoji: '🔴', address: 'Rohini, New Delhi', providerId: 'tata1mg' },
      { id: '1mg-p2', name: '1mg Partner Pharmacy — Dwarka', distance: 4.2, rating: 4.6, deliveryTime: 90, deliveryFee: 0, isOpen: false, is24Hour: false, emoji: '🔴', address: 'Dwarka, New Delhi', providerId: 'tata1mg' },
    ];
  }

  async placeOrder(items, deliveryAddress) {
    await new Promise((r) => setTimeout(r, 750));
    return { orderId: `1MG-${Date.now()}`, status: 'confirmed', provider: 'tata1mg', estimatedTime: 60 };
  }

  async trackOrder(orderId) {
    return { orderId, status: 'confirmed', provider: 'tata1mg' };
  }
}
