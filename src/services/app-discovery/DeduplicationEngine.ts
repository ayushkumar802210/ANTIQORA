/**
 * DeduplicationEngine
 * 
 * Merges multi-store duplicate listings (e.g., "WhatsApp", "WhatsApp Messenger",
 * "WhatsApp Web") into a unified canonical app record when published by the same developer.
 * Preserves distinct app entities when created by different developers.
 */

import { UniversalAppRecord } from './types';

export class DeduplicationEngine {
  /**
   * Normalizes app title for semantic clustering
   */
  public static normalizeAppName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(messenger|app|mobile|official|for android|for ios|free|lite|hd|pro|plus|client)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Normalizes developer company name
   */
  public static normalizeDeveloperName(dev: string): string {
    return dev
      .toLowerCase()
      .replace(/\b(llc|inc|incorporated|pvt|ltd|limited|corp|corporation|technologies|services|gmbh|co|co\.|company)\b/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  /**
   * Merges an array of discovered app records into deduplicated canonical records
   */
  public static deduplicate(records: UniversalAppRecord[]): UniversalAppRecord[] {
    const canonicalMap = new Map<string, UniversalAppRecord>();

    for (const record of records) {
      const normApp = this.normalizeAppName(record.name);
      const normDev = this.normalizeDeveloperName(record.developer);

      // Unique cluster key based on normalized app + normalized developer
      // This guarantees distinct apps by different developers are NOT merged!
      const clusterKey = `${normApp}___${normDev || 'unknown'}`;

      if (!canonicalMap.has(clusterKey)) {
        canonicalMap.set(clusterKey, {
          ...record,
          platforms: [...new Set(record.platforms)]
        });
      } else {
        // Merge into existing canonical record
        const existing = canonicalMap.get(clusterKey)!;

        // Merge platforms
        const combinedPlatforms = Array.from(new Set([...existing.platforms, ...record.platforms]));

        // Prefer highest-quality logo
        const logo = (record.logo && record.logo.startsWith('http') && !existing.logo) ? record.logo : existing.logo;

        // Merge store and web URLs
        const androidUrl = existing.androidUrl || record.androidUrl;
        const iosUrl = existing.iosUrl || record.iosUrl;
        const windowsUrl = existing.windowsUrl || record.windowsUrl;
        const webUrl = existing.webUrl || record.webUrl;
        const officialWebsite = existing.officialWebsite || record.officialWebsite;

        // Verification status: prefer 'verified'
        const verificationStatus = (existing.verificationStatus === 'verified' || record.verificationStatus === 'verified') 
          ? 'verified' 
          : existing.verificationStatus;

        // Combine country & languages
        const countryAvailability = Array.from(new Set([...(existing.countryAvailability || []), ...(record.countryAvailability || [])]));
        const languageSupport = Array.from(new Set([...(existing.languageSupport || []), ...(record.languageSupport || [])]));

        // Retain cleaner, shorter canonical name if existing is longer subtitle
        const name = existing.name.length <= record.name.length ? existing.name : record.name;

        canonicalMap.set(clusterKey, {
          ...existing,
          name,
          platforms: combinedPlatforms,
          logo,
          androidUrl,
          iosUrl,
          windowsUrl,
          webUrl,
          officialWebsite,
          verificationStatus,
          countryAvailability,
          languageSupport,
          rating: existing.rating || record.rating,
          downloads: existing.downloads || record.downloads,
          confidence: Math.max(existing.confidence || 0.5, record.confidence || 0.5)
        });
      }
    }

    return Array.from(canonicalMap.values());
  }
}
