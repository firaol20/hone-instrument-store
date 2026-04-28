/**
 * Utility for free Geocoding using OpenStreetMap (Nominatim)
 * This avoids the need for a Google Maps Billing Account.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'HoneStoreApp/1.0',
        },
      }
    );
    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    console.error('Nominatim Reverse Geocode Error:', error);
    return null;
  }
}

export async function forwardGeocode(address: string): Promise<GeocodeResult[]> {
  try {
    // Adding countrycodes=et to bias results to Ethiopia
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=et&limit=5`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'HoneStoreApp/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
      }));
    }
    return [];
  } catch (error) {
    console.error('Nominatim Forward Geocode Error:', error);
    return [];
  }
}
