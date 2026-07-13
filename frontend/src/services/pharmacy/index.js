import { BlinkitProvider } from './BlinkitProvider';
import { Apollo247Provider } from './Apollo247Provider';
import { Tata1mgProvider } from './Tata1mgProvider';
import { PharmEasyProvider } from './PharmEasyProvider';
import { NetmedsProvider } from './NetmedsProvider';
import { AmazonPharmacyProvider } from './AmazonPharmacyProvider';

const providers = [
  new BlinkitProvider(),
  new Apollo247Provider(),
  new Tata1mgProvider(),
  new PharmEasyProvider(),
  new NetmedsProvider(),
  new AmazonPharmacyProvider(),
];

export function getProviders() {
  return providers;
}

export function getProviderByName(id) {
  return providers.find((p) => p.getProviderInfo().id === id) || null;
}

export async function searchAllProviders(query) {
  const allResults = await Promise.all(
    providers.map((p) =>
      p.searchMedicines(query).catch((e) => {
        console.error(`Provider ${p.getProviderInfo().name} search error:`, e);
        return [];
      })
    )
  );
  // Flatten and group results by medicine name to deduplicate
  const flat = allResults.flat();
  const seen = new Set();
  const deduped = [];
  for (const item of flat) {
    const key = `${item.name.toLowerCase()}-${item.providerId}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  return deduped;
}

export async function getNearbyPharmaciesFromAll(lat, lon) {
  const allPharmacies = await Promise.all(
    providers.map((p) =>
      p.getNearbyPharmacies(lat, lon).catch((e) => {
        console.error(`Provider ${p.getProviderInfo().name} pharmacies error:`, e);
        return [];
      })
    )
  );
  return allPharmacies.flat().sort((a, b) => a.distance - b.distance);
}
