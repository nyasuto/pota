// Geocoding utilities using OpenStreetMap Nominatim API

export interface GeocodingResult {
  id: string;
  displayName: string;
  latitude: number;
  longitude: number;
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  address?: {
    city?: string;
    prefecture?: string;
    country?: string;
    postcode?: string;
    district?: string;
    neighbourhood?: string;
  };
  importance: number;
  type: string;
  category: string;
}

export interface ReverseGeocodingResult {
  displayName: string;
  address: {
    city?: string;
    prefecture?: string;
    country?: string;
    postcode?: string;
    district?: string;
    neighbourhood?: string;
    road?: string;
    houseNumber?: string;
  };
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Search for locations using address or place name
 */
export async function searchLocations(
  query: string,
  options: {
    limit?: number;
    countryCode?: string;
    bounded?: boolean;
    viewbox?: string;
  } = {}
): Promise<GeocodingResult[]> {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    limit: (options.limit || 5).toString(),
    'accept-language': 'ja,en',
  });

  // Default to Japan for better results
  if (options.countryCode || query.includes('日本') || /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query)) {
    params.append('countrycodes', options.countryCode || 'jp');
  }

  if (options.bounded && options.viewbox) {
    params.append('bounded', '1');
    params.append('viewbox', options.viewbox);
  }

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'Potarin-App/2.0 (walking-cycling-route-app)',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      id: `${item.place_id}`,
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      boundingBox: item.boundingbox ? {
        north: parseFloat(item.boundingbox[1]),
        south: parseFloat(item.boundingbox[0]),
        east: parseFloat(item.boundingbox[3]),
        west: parseFloat(item.boundingbox[2]),
      } : undefined,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        prefecture: item.address?.state || item.address?.prefecture,
        country: item.address?.country,
        postcode: item.address?.postcode,
        district: item.address?.city_district || item.address?.suburb,
        neighbourhood: item.address?.neighbourhood,
      },
      importance: parseFloat(item.importance || '0'),
      type: item.type || 'place',
      category: item.class || 'place',
    }));
  } catch (error) {
    console.error('Geocoding search failed:', error);
    throw new Error('住所の検索に失敗しました。もう一度お試しください。');
  }
}

/**
 * Reverse geocoding - get address from coordinates
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodingResult | null> {
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'ja,en',
    zoom: '18',
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'Potarin-App/2.0 (walking-cycling-route-app)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error || !data.display_name) {
      return null;
    }

    return {
      displayName: data.display_name,
      address: {
        city: data.address?.city || data.address?.town || data.address?.village,
        prefecture: data.address?.state || data.address?.prefecture,
        country: data.address?.country,
        postcode: data.address?.postcode,
        district: data.address?.city_district || data.address?.suburb,
        neighbourhood: data.address?.neighbourhood,
        road: data.address?.road,
        houseNumber: data.address?.house_number,
      },
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

/**
 * Search for places near a specific location
 */
export async function searchNearby(
  latitude: number,
  longitude: number,
  radius: number = 1000, // meters
  query?: string
): Promise<GeocodingResult[]> {
  // Create viewbox for bounded search (approximate)
  const radiusInDegrees = radius / 111320; // rough conversion from meters to degrees
  const viewbox = [
    longitude - radiusInDegrees,
    latitude + radiusInDegrees,
    longitude + radiusInDegrees,
    latitude - radiusInDegrees,
  ].join(',');

  const searchQuery = query || '駅,公園,商業施設,観光地';

  return searchLocations(searchQuery, {
    bounded: true,
    viewbox,
    limit: 10,
    countryCode: 'jp',
  });
}

/**
 * Get suggestions for autocomplete
 */
export async function getLocationSuggestions(
  input: string,
  currentLocation?: { latitude: number; longitude: number }
): Promise<GeocodingResult[]> {
  if (input.length < 2) {
    return [];
  }

  const options: Parameters<typeof searchLocations>[1] = {
    limit: 8,
  };

  // If we have current location, bias results nearby
  if (currentLocation) {
    const radiusInDegrees = 0.1; // roughly 10km
    options.viewbox = [
      currentLocation.longitude - radiusInDegrees,
      currentLocation.latitude + radiusInDegrees,
      currentLocation.longitude + radiusInDegrees,
      currentLocation.latitude - radiusInDegrees,
    ].join(',');
  }

  try {
    const results = await searchLocations(input, options);
    
    // Filter and sort results by relevance
    return results
      .filter(result => result.importance > 0.1) // Filter low importance results
      .sort((a, b) => {
        // Prioritize results with higher importance
        if (b.importance !== a.importance) {
          return b.importance - a.importance;
        }
        
        // Prioritize Japanese locations
        if (a.address?.country === '日本' && b.address?.country !== '日本') {
          return -1;
        }
        if (b.address?.country === '日本' && a.address?.country !== '日本') {
          return 1;
        }
        
        return 0;
      })
      .slice(0, 5); // Limit to top 5 results
  } catch (error) {
    console.error('Failed to get location suggestions:', error);
    return [];
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: ReverseGeocodingResult['address']): string {
  const parts: string[] = [];

  if (address.prefecture) parts.push(address.prefecture);
  if (address.city) parts.push(address.city);
  if (address.district) parts.push(address.district);
  if (address.neighbourhood) parts.push(address.neighbourhood);
  if (address.road) parts.push(address.road);
  if (address.houseNumber) parts.push(address.houseNumber);

  return parts.join(' ');
}

/**
 * Format display name for Japanese addresses
 */
export function formatDisplayName(displayName: string): string {
  // Remove redundant country information for Japanese addresses
  return displayName
    .replace(/, 日本$/, '')
    .replace(/, Japan$/, '')
    // Clean up common formatting issues
    .replace(/,\s*,/g, ',')
    .trim();
}

/**
 * Check if location is in Japan
 */
export function isInJapan(result: GeocodingResult): boolean {
  return result.address?.country === '日本' || 
         result.address?.country === 'Japan' ||
         (result.latitude >= 24 && result.latitude <= 46 &&
          result.longitude >= 123 && result.longitude <= 146);
}

/**
 * Create a bounding box around a point
 */
export function createBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number
): string {
  const radiusInDegrees = radiusKm / 111.32; // rough conversion
  return [
    longitude - radiusInDegrees,
    latitude + radiusInDegrees,
    longitude + radiusInDegrees,
    latitude - radiusInDegrees,
  ].join(',');
}