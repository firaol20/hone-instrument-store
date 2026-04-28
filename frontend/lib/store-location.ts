/** Hone showroom — single source for pickup / directions UI */
export const HONE_SHOWROOM = {
  id: 'hone-megenagna',
  lat: 9.019865918869868,
  lng: 38.80055158441099,
  name: 'Hone Showroom',
  street: '2nd Floor, Bethelem Building, Megenagna',
  city: 'Addis Ababa',
  state: 'Megenagna',
  zip: '1000',
  country: 'ET',
  phone: '+251 98 261 6263',
  phoneTel: '+251982616263',
  /** Estimated hours until order is ready for in-person pickup */
  // pickupReadyHours: 2,
} as const;

export function getDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
