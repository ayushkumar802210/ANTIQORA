/**
 * AppleStoreProvider
 * 
 * Interacts with the official Apple iTunes Search API for real-time,
 * non-rate-limited dynamic discovery of iOS apps across global and Indian markets.
 * No API key required; official Apple public discovery service.
 */

export interface AppleStoreItem {
  trackId: number;
  trackName: string;
  artistName: string;
  sellerUrl?: string;
  artworkUrl100: string;
  artworkUrl512?: string;
  trackViewUrl: string;
  primaryGenreName: string;
  genres: string[];
  description: string;
  averageUserRating?: number;
  userRatingCount?: number;
  price?: number;
  formattedPrice?: string;
  bundleId?: string;
  supportedDevices?: string[];
  currentVersionReleaseDate?: string;
  languageCodesISO2A?: string[];
}

export class AppleStoreProvider {
  /**
   * Search Apple App Store dynamically
   */
  public static async search(query: string, country: string = 'in', limit: number = 20): Promise<AppleStoreItem[]> {
    if (!query.trim()) return [];

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=${limit}&country=${country}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return (data.results || []) as AppleStoreItem[];
    } catch (err) {
      // Network timeout or offline fallback
      return [];
    }
  }

  /**
   * Lookup a specific app by Apple Track ID
   */
  public static async lookup(trackId: string | number, country: string = 'in'): Promise<AppleStoreItem | null> {
    try {
      const url = `https://itunes.apple.com/lookup?id=${trackId}&country=${country}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          return data.results[0] as AppleStoreItem;
        }
      }
    } catch {}
    return null;
  }
}
