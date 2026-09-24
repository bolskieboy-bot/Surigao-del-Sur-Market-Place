// Surigao del Sur Highway Distance Mapping & Grab Philippines Fare Calculator

export interface DeliveryCalculation {
  distanceKm: number;
  baseFare: number;
  distanceFee: number;
  totalDeliveryFee: number;
  breakdownText: string;
  fulfillmentType: 'delivery' | 'pickup';
}

// Approximate coastal highway kilometer markers from North to South along Surigao del Sur
const MUNICIPALITY_KM_MARKERS: Record<string, number> = {
  'carrascal': 0,
  'cantilan': 14,
  'madrid': 28,
  'carmen': 36,
  'lanuza': 49,
  'cortes': 75,
  'tandag city': 98,
  'tago': 112,
  'san miguel': 126,
  'bayabas': 135,
  'cagwait': 145,
  'marihatag': 160,
  'san agustin': 180,
  'lianga': 198,
  'barobo': 225,
  'tagbina': 245,
  'hinatuan': 260,
  'bislig city': 295,
  'lingig': 330
};

/**
 * Calculates road distance in kilometers between two municipalities in Surigao del Sur.
 * For intra-municipality deliveries (same town), standard average travel distance is 3.0 km.
 */
export function getMunicipalDistance(origin: string, destination: string): number {
  if (!origin || !destination) return 3.0;

  const cleanOrigin = origin.trim().toLowerCase();
  const cleanDest = destination.trim().toLowerCase();

  if (cleanOrigin === cleanDest) {
    return 3.0; // Same town local barangay distance
  }

  const markA = MUNICIPALITY_KM_MARKERS[cleanOrigin];
  const markB = MUNICIPALITY_KM_MARKERS[cleanDest];

  if (markA !== undefined && markB !== undefined) {
    return Math.abs(markA - markB);
  }

  // Fallback default distance for adjacent or unlisted LGUs
  return 15.0;
}

/**
 * Grab Philippines Fare Rate Reference for Motorcycle Delivery:
 * - Base Fare: ₱49.00 (inclusive of first 2.0 km)
 * - Rate per km beyond 2 km: ₱10.00 / km
 * - Free for Customer Store Pickup
 */
export function calculateGrabDeliveryFee(
  originMunicipality: string,
  destinationMunicipality: string,
  fulfillmentType: 'delivery' | 'pickup' = 'delivery'
): DeliveryCalculation {
  if (fulfillmentType === 'pickup') {
    return {
      distanceKm: 0,
      baseFare: 0,
      distanceFee: 0,
      totalDeliveryFee: 0,
      breakdownText: 'Customer Store Pickup (Free - ₱0)',
      fulfillmentType: 'pickup'
    };
  }

  const distanceKm = getMunicipalDistance(originMunicipality, destinationMunicipality);
  const baseFare = 49;
  const extraKm = Math.max(0, distanceKm - 2);
  const distanceFee = Math.round(extraKm * 10);
  const totalDeliveryFee = baseFare + distanceFee;

  let breakdownText = '';
  if (distanceKm <= 2) {
    breakdownText = `₱${baseFare} Grab PH Base Fare (up to 2 km • ${distanceKm} km)`;
  } else {
    breakdownText = `₱${baseFare} Base (first 2 km) + ₱10/km × ${extraKm.toFixed(1)} km = ₱${totalDeliveryFee} (${distanceKm} km trip)`;
  }

  return {
    distanceKm,
    baseFare,
    distanceFee,
    totalDeliveryFee,
    breakdownText,
    fulfillmentType: 'delivery'
  };
}
