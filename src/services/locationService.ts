/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Live Location & Geolocation Service
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface LiveLocationData {
  coords: GeoCoordinate;
  accuracy: number; // meters
  altitude?: number | null; // meters
  altitudeAccuracy?: number | null;
  heading?: number | null; // degrees (0-360)
  speed?: number | null; // m/s
  timestamp: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  neighbourhood?: string;
  displayName?: string;
  isLiveTracking?: boolean;
}

export interface SearchedLocationItem {
  id: string;
  name: string;
  displayName: string;
  coords: GeoCoordinate;
  type: string;
  category?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  importance?: number;
}

export interface SavedLocationPin {
  id: string;
  label: string;
  name: string;
  coords: GeoCoordinate;
  address: string;
  category: 'self' | 'family' | 'friend' | 'home' | 'work' | 'custom';
  savedAt: string;
  notes?: string;
}

export interface DistanceInfo {
  distanceKm: number;
  distanceMiles: number;
  walkingMins: number;
  drivingMins: number;
  bikingMins: number;
}

// Popular quick location presets for fast lookup
export const POPULAR_LOCATIONS: SearchedLocationItem[] = [
  {
    id: 'loc_delhi',
    name: 'New Delhi, India',
    displayName: 'New Delhi, Delhi, India',
    coords: { lat: 28.6139, lng: 77.2090 },
    type: 'capital'
  },
  {
    id: 'loc_mumbai',
    name: 'Mumbai, Maharashtra',
    displayName: 'Mumbai, Maharashtra, India',
    coords: { lat: 19.0760, lng: 72.8777 },
    type: 'metropolis'
  },
  {
    id: 'loc_bengaluru',
    name: 'Bengaluru, Karnataka',
    displayName: 'Bengaluru, Karnataka, India',
    coords: { lat: 12.9716, lng: 77.5946 },
    type: 'tech_hub'
  },
  {
    id: 'loc_patna',
    name: 'Patna, Bihar',
    displayName: 'Patna, Bihar, India',
    coords: { lat: 25.5941, lng: 85.1376 },
    type: 'city'
  },
  {
    id: 'loc_lucknow',
    name: 'Lucknow, Uttar Pradesh',
    displayName: 'Lucknow, Uttar Pradesh, India',
    coords: { lat: 26.8467, lng: 80.9462 },
    type: 'city'
  },
  {
    id: 'loc_kolkata',
    name: 'Kolkata, West Bengal',
    displayName: 'Kolkata, West Bengal, India',
    coords: { lat: 22.5726, lng: 88.3639 },
    type: 'metropolis'
  },
  {
    id: 'loc_dubai',
    name: 'Dubai, UAE',
    displayName: 'Dubai, United Arab Emirates',
    coords: { lat: 25.2048, lng: 55.2708 },
    type: 'international'
  },
  {
    id: 'loc_london',
    name: 'London, UK',
    displayName: 'London, Greater London, England, United Kingdom',
    coords: { lat: 51.5074, lng: -0.1278 },
    type: 'international'
  },
  {
    id: 'loc_newyork',
    name: 'New York, USA',
    displayName: 'New York, NY, United States',
    coords: { lat: 40.7128, lng: -74.0060 },
    type: 'international'
  },
  {
    id: 'loc_tokyo',
    name: 'Tokyo, Japan',
    displayName: 'Tokyo, Japan',
    coords: { lat: 35.6762, lng: 139.6503 },
    type: 'international'
  }
];

class LocationService {
  private savedPinsKey = 'antiqora_saved_location_pins';
  private reverseGeocodeCache = new Map<string, any>();

  // Haversine formula to compute great-circle distance
  public calculateDistance(from: GeoCoordinate, to: GeoCoordinate): DistanceInfo {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLon = this.deg2rad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(from.lat)) *
        Math.cos(this.deg2rad(to.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMiles = distanceKm * 0.621371;

    // Speeds: walking ~5km/h, biking ~15km/h, driving ~45km/h
    const walkingMins = Math.round((distanceKm / 5) * 60);
    const bikingMins = Math.round((distanceKm / 15) * 60);
    const drivingMins = Math.round((distanceKm / 45) * 60);

    return {
      distanceKm: Math.round(distanceKm * 100) / 100,
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      walkingMins,
      drivingMins,
      bikingMins
    };
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Reverse Geocode coordinates to human-readable address
   */
  public async reverseGeocode(lat: number, lng: number): Promise<{
    displayName: string;
    city?: string;
    state?: string;
    country?: string;
    road?: string;
    postcode?: string;
    neighbourhood?: string;
  }> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (this.reverseGeocodeCache.has(cacheKey)) {
      return this.reverseGeocodeCache.get(cacheKey);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en,hi',
            'User-Agent': 'ANTIQORASearchEngine/2.6 (Browser Client)'
          }
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const result = {
          displayName: data.display_name || `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`,
          city: addr.city || addr.town || addr.village || addr.county || addr.state_district,
          state: addr.state,
          country: addr.country,
          road: addr.road || addr.pedestrian || addr.footway,
          postcode: addr.postcode,
          neighbourhood: addr.neighbourhood || addr.suburb || addr.residential
        };
        this.reverseGeocodeCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      // Fallback
    }

    const fallback = {
      displayName: `Coordinates: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`,
      city: 'Detected Coordinates',
      country: 'Global'
    };
    return fallback;
  }

  /**
   * Forward Geocode: Search for any location by address, city, coordinate or landmark
   */
  public async searchLocations(query: string): Promise<SearchedLocationItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Check if query is direct coordinates (e.g., "28.6139, 77.2090" or "28.6139 77.2090")
    const coordMatch = trimmed.match(/^([-+]?\d{1,3}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const rev = await this.reverseGeocode(lat, lng);
        return [
          {
            id: `coord_${lat}_${lng}`,
            name: `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`,
            displayName: rev.displayName,
            coords: { lat, lng },
            type: 'coordinates',
            address: {
              road: rev.road,
              city: rev.city,
              state: rev.state,
              country: rev.country,
              postcode: rev.postcode
            }
          }
        ];
      }
    }

    // Check preset matches
    const presetMatches = POPULAR_LOCATIONS.filter(
      p =>
        p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        p.displayName.toLowerCase().includes(trimmed.toLowerCase())
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=6&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en,hi',
            'User-Agent': 'ANTIQORASearchEngine/2.6 (Browser Client)'
          }
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const list: any[] = await res.json();
        if (list && list.length > 0) {
          const apiResults: SearchedLocationItem[] = list.map((item, idx) => ({
            id: `osm_${item.place_id || idx}_${Date.now()}`,
            name: item.name || item.display_name.split(',')[0],
            displayName: item.display_name,
            coords: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            },
            type: item.type || item.class || 'place',
            address: item.address,
            importance: item.importance
          }));
          return apiResults;
        }
      }
    } catch (err) {
      // Return preset matches if network failed
    }

    return presetMatches.length > 0 ? presetMatches : [];
  }

  /**
   * Saved Locations Storage Management
   */
  public getSavedPins(): SavedLocationPin[] {
    try {
      const saved = localStorage.getItem(this.savedPinsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  }

  public savePin(pin: Omit<SavedLocationPin, 'id' | 'savedAt'>): SavedLocationPin {
    const list = this.getSavedPins();
    const newPin: SavedLocationPin = {
      ...pin,
      id: `pin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      savedAt: new Date().toISOString()
    };
    const updated = [newPin, ...list.filter(p => p.label !== pin.label)];
    localStorage.setItem(this.savedPinsKey, JSON.stringify(updated));
    return newPin;
  }

  public removePin(id: string): void {
    const list = this.getSavedPins();
    const updated = list.filter(p => p.id !== id);
    localStorage.setItem(this.savedPinsKey, JSON.stringify(updated));
  }

  /**
   * Share Links Generator
   */
  public getGoogleMapsUrl(coords: GeoCoordinate, label?: string): string {
    const query = encodeURIComponent(label ? `${coords.lat},${coords.lng} (${label})` : `${coords.lat},${coords.lng}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  public getOpenStreetMapUrl(coords: GeoCoordinate, zoom = 16): string {
    return `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=${zoom}/${coords.lat}/${coords.lng}`;
  }

  public getWhatsAppShareUrl(coords: GeoCoordinate, label?: string, address?: string): string {
    const mapsLink = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
    const text = encodeURIComponent(
      `📍 *${label || 'Live Location'}* via ANTIQORA\n${address ? address + '\n' : ''}Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}\nMap: ${mapsLink}`
    );
    return `https://wa.me/?text=${text}`;
  }

  public formatSpeed(metersPerSec?: number | null): string {
    if (metersPerSec == null || isNaN(metersPerSec) || metersPerSec < 0.1) {
      return '0.0 km/h (Stationary)';
    }
    const kmh = metersPerSec * 3.6;
    return `${kmh.toFixed(1)} km/h (${(kmh * 0.621371).toFixed(1)} mph)`;
  }

  public formatHeading(headingDeg?: number | null): string {
    if (headingDeg == null || isNaN(headingDeg)) return 'Facing North';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(headingDeg / 45) % 8;
    return `${headingDeg.toFixed(0)}° (${directions[index]})`;
  }
}

export const locationService = new LocationService();
