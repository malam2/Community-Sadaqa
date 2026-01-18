/**
 * Geolocation Service
 *
 * Handles location-based operations including:
 * - Distance calculations between coordinates
 * - Geocoding (address to coordinates)
 * - Reverse geocoding (coordinates to address)
 * - Proximity filtering for posts
 */

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  unit: "miles" | "km" = "miles",
): number {
  const R = unit === "miles" ? 3959 : 6371; // Earth's radius

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a radius of another point
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusMiles: number,
): boolean {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusMiles;
}

/**
 * Calculate bounding box for efficient database queries
 * Returns min/max lat/lng that forms a square around the center point
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number,
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Approximate degrees per mile
  const latDegPerMile = 1 / 69;
  const lngDegPerMile = 1 / (69 * Math.cos(toRadians(lat)));

  return {
    minLat: lat - radiusMiles * latDegPerMile,
    maxLat: lat + radiusMiles * latDegPerMile,
    minLng: lng - radiusMiles * lngDegPerMile,
    maxLng: lng + radiusMiles * lngDegPerMile,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return "< 0.1 mi";
  }
  if (miles < 1) {
    return `${(miles * 10).toFixed(0)} mi`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * US State codes for validation and display
 */
export const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

/**
 * Validate US zip code format
 */
export function isValidZipCode(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Common radius options for user preference
 */
export const RADIUS_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
];

/**
 * Default radius in miles
 */
export const DEFAULT_RADIUS = 10;

/**
 * Geocoding via external API (placeholder - requires API key)
 * In production, use Google Maps Geocoding API, OpenStreetMap Nominatim, or similar
 *
 * For now, we'll use a simple zip code to approximate lat/lng approach
 * You should replace this with a real geocoding service
 */
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  formattedAddress?: string;
}

// Placeholder geocoding - in production, use a real service
export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  // This is a placeholder. In production, integrate with:
  // - Google Maps Geocoding API
  // - OpenStreetMap Nominatim
  // - Mapbox Geocoding API
  // - Census Geocoding API (free, US only)

  console.warn(
    "Geocoding not implemented. Please integrate with a geocoding service.",
  );
  return null;
}

/**
 * Reverse geocoding - get address from coordinates
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodingResult | null> {
  // Placeholder - integrate with geocoding service
  console.warn(
    "Reverse geocoding not implemented. Please integrate with a geocoding service.",
  );
  return null;
}

/**
 * Simple ZIP code to approximate location mapping for US
 * This is a fallback when full geocoding is not available
 * In production, use a zip code database or geocoding API
 */
export function getApproximateLocationFromZip(zipCode: string): {
  latitude: number;
  longitude: number;
  state: string;
} | null {
  // First 3 digits of US zip codes map to regions
  // This is a very rough approximation - use real geocoding in production
  const prefix = zipCode.substring(0, 3);
  const prefixNum = parseInt(prefix, 10);

  // Very rough US region mapping based on ZIP prefixes
  // In production, use a proper ZIP code database
  if (prefixNum >= 100 && prefixNum <= 149) {
    return { latitude: 42.4, longitude: -71.1, state: "MA" }; // New England
  }
  if (prefixNum >= 150 && prefixNum <= 196) {
    return { latitude: 40.0, longitude: -76.3, state: "PA" }; // Pennsylvania
  }
  if (prefixNum >= 200 && prefixNum <= 219) {
    return { latitude: 38.9, longitude: -77.0, state: "DC" }; // DC area
  }
  if (prefixNum >= 220 && prefixNum <= 246) {
    return { latitude: 37.5, longitude: -79.0, state: "VA" }; // Virginia
  }
  if (prefixNum >= 300 && prefixNum <= 319) {
    return { latitude: 33.75, longitude: -84.4, state: "GA" }; // Georgia
  }
  if (prefixNum >= 320 && prefixNum <= 339) {
    return { latitude: 28.5, longitude: -81.4, state: "FL" }; // Florida
  }
  if (prefixNum >= 400 && prefixNum <= 427) {
    return { latitude: 38.2, longitude: -85.8, state: "KY" }; // Kentucky
  }
  if (prefixNum >= 430 && prefixNum <= 459) {
    return { latitude: 40.0, longitude: -83.0, state: "OH" }; // Ohio
  }
  if (prefixNum >= 460 && prefixNum <= 479) {
    return { latitude: 39.8, longitude: -86.2, state: "IN" }; // Indiana
  }
  if (prefixNum >= 480 && prefixNum <= 499) {
    return { latitude: 42.4, longitude: -83.0, state: "MI" }; // Michigan
  }
  if (prefixNum >= 500 && prefixNum <= 528) {
    return { latitude: 41.6, longitude: -93.6, state: "IA" }; // Iowa
  }
  if (prefixNum >= 530 && prefixNum <= 549) {
    return { latitude: 43.1, longitude: -89.4, state: "WI" }; // Wisconsin
  }
  if (prefixNum >= 550 && prefixNum <= 567) {
    return { latitude: 45.0, longitude: -93.3, state: "MN" }; // Minnesota
  }
  if (prefixNum >= 600 && prefixNum <= 629) {
    return { latitude: 41.9, longitude: -87.6, state: "IL" }; // Illinois
  }
  if (prefixNum >= 630 && prefixNum <= 658) {
    return { latitude: 38.6, longitude: -90.2, state: "MO" }; // Missouri
  }
  if (prefixNum >= 700 && prefixNum <= 714) {
    return { latitude: 30.0, longitude: -90.1, state: "LA" }; // Louisiana
  }
  if (prefixNum >= 750 && prefixNum <= 799) {
    return { latitude: 32.8, longitude: -96.8, state: "TX" }; // Texas
  }
  if (prefixNum >= 800 && prefixNum <= 816) {
    return { latitude: 39.7, longitude: -105.0, state: "CO" }; // Colorado
  }
  if (prefixNum >= 850 && prefixNum <= 865) {
    return { latitude: 33.4, longitude: -112.0, state: "AZ" }; // Arizona
  }
  if (prefixNum >= 900 && prefixNum <= 961) {
    return { latitude: 34.0, longitude: -118.2, state: "CA" }; // California
  }
  if (prefixNum >= 970 && prefixNum <= 979) {
    return { latitude: 45.5, longitude: -122.7, state: "OR" }; // Oregon
  }
  if (prefixNum >= 980 && prefixNum <= 994) {
    return { latitude: 47.6, longitude: -122.3, state: "WA" }; // Washington
  }

  return null;
}
