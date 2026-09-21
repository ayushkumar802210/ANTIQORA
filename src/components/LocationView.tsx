/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Live Location & Geolocation Explorer View
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navigation,
  MapPin,
  Compass,
  Share2,
  Copy,
  Check,
  Search,
  Crosshair,
  Radio,
  Clock,
  Gauge,
  Layers,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  Car,
  Footprints,
  Shield,
  Send,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import {
  locationService,
  LiveLocationData,
  SearchedLocationItem,
  SavedLocationPin,
  GeoCoordinate,
  POPULAR_LOCATIONS
} from '../services/locationService';

interface LocationViewProps {
  initialSearchQuery?: string;
  onClose?: () => void;
}

export const LocationView: React.FC<LocationViewProps> = ({ initialSearchQuery, onClose }) => {
  // Live GPS State
  const [liveLocation, setLiveLocation] = useState<LiveLocationData | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Search / Anyone's Location State
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [searchResults, setSearchResults] = useState<SearchedLocationItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchedLocationItem | null>(null);

  // Map settings
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [mapLayer, setMapLayer] = useState<'standard' | 'dark' | 'satellite'>('standard');
  const [activeCenter, setActiveCenter] = useState<GeoCoordinate>({ lat: 28.6139, lng: 77.2090 }); // Default Delhi

  // Saved pins
  const [savedPins, setSavedPins] = useState<SavedLocationPin[]>([]);
  const [newPinLabel, setNewPinLabel] = useState<string>('');
  const [newPinCategory, setNewPinCategory] = useState<'self' | 'family' | 'friend' | 'home' | 'work' | 'custom'>('friend');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; subtitle?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (message: string, subtitle?: string) => {
    setToast({ message, subtitle });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, key: string, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied!', label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Load saved pins on mount
  useEffect(() => {
    setSavedPins(locationService.getSavedPins());
  }, []);

  // Fetch Live Location (One-shot)
  const fetchLiveLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        
        setActiveCenter(coords);
        setMapZoom(16);

        // Reverse geocode to address
        const addr = await locationService.reverseGeocode(latitude, longitude);

        const newLoc: LiveLocationData = {
          coords,
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : null,
          altitudeAccuracy: altitudeAccuracy ? Math.round(altitudeAccuracy) : null,
          heading,
          speed,
          timestamp: pos.timestamp,
          displayName: addr.displayName,
          road: addr.road,
          city: addr.city,
          state: addr.state,
          country: addr.country,
          postcode: addr.postcode,
          neighbourhood: addr.neighbourhood
        };

        setLiveLocation(newLoc);
        setIsLocating(false);
        showToast('Live Location Updated!', `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('antiqora:geolocation-updated', { detail: { state: 'granted', coords } }));
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Failed to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('antiqora:geolocation-updated', { detail: { state: 'denied' } }));
          }
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable from GPS.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Start initial live location on mount
  useEffect(() => {
    fetchLiveLocation();

    const handleGeoEvent = (e: any) => {
      if (e.detail?.state === 'granted') {
        fetchLiveLocation();
      }
    };
    window.addEventListener('antiqora:geolocation-updated', handleGeoEvent);
    return () => {
      window.removeEventListener('antiqora:geolocation-updated', handleGeoEvent);
    };
  }, [fetchLiveLocation]);

  // Continuous Live Tracking Toggle
  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveTracking(false);
      showToast('Live Tracking Paused');
    } else {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported.');
        return;
      }
      setIsLiveTracking(true);
      showToast('Live Tracking Enabled', 'Continuous GPS monitoring active');

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude, accuracy, altitude, heading, speed } = pos.coords;
          const coords = { lat: latitude, lng: longitude };
          
          setActiveCenter(coords);

          setLiveLocation((prev) => ({
            coords,
            accuracy: Math.round(accuracy),
            altitude: altitude ? Math.round(altitude) : prev?.altitude ?? null,
            altitudeAccuracy: null,
            heading,
            speed,
            timestamp: pos.timestamp,
            displayName: prev?.displayName || `${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`,
            city: prev?.city,
            state: prev?.state,
            country: prev?.country,
            isLiveTracking: true
          }));
        },
        (err) => {
          console.warn('Watch position error:', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 12000
        }
      );
    }
  };

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Search Location Handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const results = await locationService.searchLocations(query);
      setSearchResults(results);
      if (results.length > 0) {
        handleSelectLocation(results[0]);
      } else {
        showToast('Location not found', 'Try searching city name, pincode, or coordinates');
      }
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: SearchedLocationItem) => {
    setSelectedLocation(loc);
    setActiveCenter(loc.coords);
    setMapZoom(15);
    showToast(`Focused on ${loc.name}`, `${loc.coords.lat.toFixed(4)}°, ${loc.coords.lng.toFixed(4)}°`);
  };

  // Share Live Location
  const handleShareLiveLocation = async () => {
    if (!liveLocation) return;
    const { coords, displayName } = liveLocation;
    const mapsLink = locationService.getGoogleMapsUrl(coords, 'My Live Location');
    const shareText = `📍 Mera Live Location:\n${displayName || ''}\nCoordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}\nMap: ${mapsLink}`;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'Mera Live Location — ANTIQORA',
          text: shareText,
          url: mapsLink
        });
        showToast('Location Shared Successfully!');
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: Copy link
    copyToClipboard(mapsLink, 'live_share', 'Google Maps link copied to clipboard');
  };

  // Save current or selected location
  const handleSavePin = () => {
    const targetCoords = selectedLocation ? selectedLocation.coords : liveLocation?.coords;
    const targetName = selectedLocation ? selectedLocation.name : (liveLocation?.city || 'My Location');
    const targetAddr = selectedLocation ? selectedLocation.displayName : (liveLocation?.displayName || '');

    if (!targetCoords) return;

    const saved = locationService.savePin({
      label: newPinLabel.trim() || targetName,
      name: targetName,
      coords: targetCoords,
      address: targetAddr,
      category: newPinCategory
    });

    setSavedPins(locationService.getSavedPins());
    setShowSaveModal(false);
    setNewPinLabel('');
    showToast('Saved Location!', `Added ${saved.label} to your pinned locations`);
  };

  const handleDeletePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    locationService.removePin(id);
    setSavedPins(locationService.getSavedPins());
    showToast('Location Pin Removed');
  };

  // Distance Calculation between Live Location and Searched/Selected Location
  const distanceInfo =
    liveLocation && selectedLocation
      ? locationService.calculateDistance(liveLocation.coords, selectedLocation.coords)
      : null;

  // Compute map embed URL
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${activeCenter.lng - 0.015}%2C${activeCenter.lat - 0.01}%2C${activeCenter.lng + 0.015}%2C${activeCenter.lat + 0.01}&layer=${
    mapLayer === 'satellite' ? 'hot' : 'mapnik'
  }&marker=${activeCenter.lat}%2C${activeCenter.lng}`;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Live Location & GPS Navigator</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  REAL-TIME GPS
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apna live position dekho, share karo, ya kisi ka bhi location aur coordinates search karo.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchLiveLocation}
            disabled={isLocating}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting...' : 'My Live Location'}</span>
          </button>

          <button
            onClick={toggleLiveTracking}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              isLiveTracking
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 animate-pulse'
                : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-cyan-500/40'
            }`}
            title="Toggle Continuous GPS Tracking"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isLiveTracking ? 'Tracking Live ON' : 'Live Tracking'}</span>
          </button>

          {liveLocation && (
            <button
              onClick={handleShareLiveLocation}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 text-xs font-semibold transition"
              title="Share Live Location"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}
        </div>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Location Notice: </span>
            <span>{gpsError}</span>
          </div>
          <button
            onClick={fetchLiveLocation}
            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition text-[11px]"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* SEARCH / VIEW ANYONE'S LOCATION BAR */}
      <div className="space-y-2">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anyone's location, address, city, landmark, or coordinates (e.g. 28.6139, 77.2090)..."
              className="w-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-2.5 pl-10 pr-24 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 bottom-1.5 flex items-center gap-1.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            <span>{isSearching ? 'Finding...' : 'Find Place'}</span>
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-cyan-500" /> Quick Look:
          </span>
          {POPULAR_LOCATIONS.slice(0, 8).map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSearchQuery(p.name);
                handleSelectLocation(p);
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition text-[11px] flex-shrink-0"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT: MAP + TELEMETRY & PLACES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE MAP & TELEMETRY CARDS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Interactive Map Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
            
            {/* Map Header Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedLocation ? `Focus: ${selectedLocation.name}` : 'Live GPS View'}
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  [{activeCenter.lat.toFixed(4)}, {activeCenter.lng.toFixed(4)}]
                </span>
              </div>

              {/* Layer Controls & Zoom */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-0.5 text-[10px]">
                  <button
                    onClick={() => setMapLayer('standard')}
                    className={`px-2 py-0.5 rounded font-medium ${mapLayer === 'standard' ? 'bg-cyan-500 text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Map
                  </button>
                  <button
                    onClick={() => setMapLayer('satellite')}
                    className={`px-2 py-0.5 rounded font-medium ${mapLayer === 'satellite' ? 'bg-cyan-500 text-slate-950' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    Terrain
                  </button>
                </div>

                <a
                  href={locationService.getGoogleMapsUrl(activeCenter, selectedLocation?.name || 'ANTIQORA Pin')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition border border-slate-200 dark:border-slate-800"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Embedded Responsive Map */}
            <div className="relative h-80 sm:h-96 w-full bg-slate-950">
              <iframe
                title="Interactive Location Map"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />

              {/* Map Floating Actions */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 z-10">
                {liveLocation && (
                  <button
                    onClick={() => {
                      setActiveCenter(liveLocation.coords);
                      setMapZoom(16);
                      setSelectedLocation(null);
                      showToast('Centered to My Location');
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    title="Center to My Live Location"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live GPS Active Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-white text-[11px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GPS: {activeCenter.lat.toFixed(5)}°, {activeCenter.lng.toFixed(5)}°</span>
                </div>
              </div>
            </div>

            {/* Map Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(`${activeCenter.lat}, ${activeCenter.lng}`, 'map_coords', 'Coordinates copied')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 transition text-[11px] font-semibold"
                >
                  {copiedKey === 'map_coords' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Lat, Lng</span>
                </button>

                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-cyan-600 transition text-[11px] font-semibold"
                >
                  <Plus className="w-3 h-3 text-cyan-500" />
                  <span>Save Pin</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <a
                  href={`https://maps.google.com/?q=${activeCenter.lat},${activeCenter.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <a
                  href={locationService.getOpenStreetMapUrl(activeCenter)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <span>OpenStreetMap</span>
                </a>
              </div>
            </div>
          </div>

          {/* TELEMETRY & SENSORS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Accuracy */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Accuracy</span>
                <Crosshair className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {liveLocation ? `±${liveLocation.accuracy} m` : '—'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {liveLocation && liveLocation.accuracy < 25 ? 'High Precision' : 'GPS Active'}
              </p>
            </div>

            {/* Altitude */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Altitude</span>
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {liveLocation?.altitude != null ? `${liveLocation.altitude} m` : 'Sea Level'}
              </p>
              <p className="text-[10px] text-slate-400">Elevation MSL</p>
            </div>

            {/* Compass / Heading */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Heading</span>
                <Compass className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                {locationService.formatHeading(liveLocation?.heading)}
              </p>
              <p className="text-[10px] text-slate-400">Compass Bearing</p>
            </div>

            {/* Speed */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
                <Gauge className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                {liveLocation ? locationService.formatSpeed(liveLocation.speed) : '0.0 km/h'}
              </p>
              <p className="text-[10px] text-slate-400">Velocity GPS</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOCATION DETAILS, DISTANCE CALCULATOR, SAVED PINS (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* MY LIVE LOCATION CARD */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Mera Live Location</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {isLiveTracking ? 'Live Pulse' : 'GPS Detected'}
              </span>
            </div>

            {liveLocation ? (
              <div className="space-y-2.5">
                {/* Coordinates */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Coordinates:</span>
                    <button
                      onClick={() => copyToClipboard(`${liveLocation.coords.lat.toFixed(6)}, ${liveLocation.coords.lng.toFixed(6)}`, 'live_coords', 'Coordinates copied')}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      {copiedKey === 'live_coords' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{liveLocation.coords.lat.toFixed(5)}°, {liveLocation.coords.lng.toFixed(5)}°</span>
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Detected Address:</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {liveLocation.displayName || 'Detecting street and postal details...'}
                  </p>
                  {(liveLocation.city || liveLocation.state || liveLocation.country) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {liveLocation.city && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-semibold">
                          🏙️ {liveLocation.city}
                        </span>
                      )}
                      {liveLocation.state && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                          📍 {liveLocation.state}
                        </span>
                      )}
                      {liveLocation.country && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
                          🌍 {liveLocation.country}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Share Buttons */}
                <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleShareLiveLocation}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-xs transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Location</span>
                  </button>

                  <a
                    href={locationService.getWhatsAppShareUrl(liveLocation.coords, 'Mera Live Location', liveLocation.displayName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition"
                    title="Send via WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2 text-slate-400 text-xs">
                <Radio className="w-6 h-6 mx-auto animate-pulse text-cyan-500" />
                <p>Detecting your live position via GPS...</p>
                <button
                  onClick={fetchLiveLocation}
                  className="text-cyan-500 font-semibold hover:underline"
                >
                  Click to allow GPS Access
                </button>
              </div>
            )}
          </div>

          {/* DISTANCE & ROUTE COMPARISON (If place is selected) */}
          {distanceInfo && selectedLocation && (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Distance from My Location
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {distanceInfo.distanceKm} km
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-cyan-500/20 space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate">
                  To: {selectedLocation.name}
                </p>
                
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <Car className="w-3.5 h-3.5 mx-auto text-indigo-500 mb-1" />
                    <p className="text-[10px] text-slate-400">Drive</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ~{distanceInfo.drivingMins > 60 ? `${Math.round(distanceInfo.drivingMins / 60)}h` : `${distanceInfo.drivingMins}m`}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <Footprints className="w-3.5 h-3.5 mx-auto text-emerald-500 mb-1" />
                    <p className="text-[10px] text-slate-400">Walk</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ~{distanceInfo.walkingMins > 60 ? `${Math.round(distanceInfo.walkingMins / 60)}h` : `${distanceInfo.walkingMins}m`}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <Compass className="w-3.5 h-3.5 mx-auto text-cyan-500 mb-1" />
                    <p className="text-[10px] text-slate-400">Miles</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {distanceInfo.distanceMiles} mi
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation link */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${liveLocation?.coords.lat},${liveLocation?.coords.lng}&destination=${selectedLocation.coords.lat},${selectedLocation.coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Start Turn-by-Turn Navigation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* SAVED LOCATION PINS (Friends, Family, Home, Work) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Saved Pins (Family & Friends)
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Pin</span>
              </button>
            </div>

            {savedPins.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedPins.map((pin) => {
                  const dist = liveLocation
                    ? locationService.calculateDistance(liveLocation.coords, pin.coords)
                    : null;

                  return (
                    <div
                      key={pin.id}
                      onClick={() => {
                        setActiveCenter(pin.coords);
                        setSelectedLocation({
                          id: pin.id,
                          name: pin.label,
                          displayName: pin.address,
                          coords: pin.coords,
                          type: pin.category
                        });
                        showToast(`Focused on ${pin.label}`);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-cyan-500/40 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {pin.label}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {pin.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {pin.address || `${pin.coords.lat.toFixed(4)}, ${pin.coords.lng.toFixed(4)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {dist && (
                          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                            {dist.distanceKm} km
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeletePin(pin.id, e)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition"
                          title="Delete Pin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                Koi saved pin nahi hai. "Add Pin" click karke apna ghar, office, ya friend ka location save karo.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SAVE PIN MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              <span>Save Location Pin</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Pin Label / Name
                </label>
                <input
                  type="text"
                  value={newPinLabel}
                  onChange={(e) => setNewPinLabel(e.target.value)}
                  placeholder="e.g. Rahul's Home, Office, Family Village..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Category
                </label>
                <select
                  value={newPinCategory}
                  onChange={(e) => setNewPinCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="self">My Spot</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Target Coordinates:</p>
                <p className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                  {selectedLocation
                    ? `${selectedLocation.coords.lat.toFixed(5)}, ${selectedLocation.coords.lng.toFixed(5)} (${selectedLocation.name})`
                    : liveLocation
                    ? `${liveLocation.coords.lat.toFixed(5)}, ${liveLocation.coords.lng.toFixed(5)} (My Current Position)`
                    : 'Current Active Map Pin'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePin}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-cyan-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 shadow-xl text-xs animate-in fade-in slide-in-from-bottom-2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{toast.message}</p>
            {toast.subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400">{toast.subtitle}</p>}
          </div>
        </div>
      )}

    </div>
  );
};
