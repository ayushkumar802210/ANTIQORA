import React, { useState } from 'react';
import { PlaceResultItem } from '../services/api';
import { MapPin, Star, Phone, Globe, Navigation, Search, Clock, AlertCircle, X } from 'lucide-react';

interface PlacesViewProps {
  places: PlaceResultItem[];
  isLoading?: boolean;
}

export const PlacesView: React.FC<PlacesViewProps> = ({ places }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDirectionsPlace, setActiveDirectionsPlace] = useState<PlaceResultItem | null>(null);

  const filteredPlaces = places.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Places & Local Discovery</span>
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Verified Map Index
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Local business listings, geographical coordinates, and route mapping.
          </p>
        </div>

        <div className="w-full sm:w-auto relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search places or businesses..."
            className="w-full sm:w-72 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 pl-9 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Places Cards */}
        <div className="lg:col-span-2 space-y-4">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-cyan-500/40 transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      {place.category}
                    </span>
                  </div>

                  {/* Place name */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {place.name}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location: {place.address}</span>
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{place.rating}</span>
                </div>
              </div>

              {/* Status & Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                {/* Opening status */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {place.hours || "Open Now"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{place.phone || "+1 (555) 019-2831"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{place.website || "www.verified-listing.org"}</span>
                </div>
              </div>

              {/* Directions Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Map coordinates verified</span>
                <button
                  onClick={() => setActiveDirectionsPlace(place)}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Spatial Map Visual Widget */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spatial Map Engine</h3>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">VECTOR READY</span>
          </div>

          <div className="relative h-64 rounded-xl bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4 text-center">
            {/* Abstract radar/grid graphics */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="relative z-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/40 animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-200">Interactive Map Canvas</p>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Real-time geospatial vector mapping, interactive pins, and turn-by-turn routing.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            ANTIQORA's geospatial engine organizes local queries with privacy-preserving geolocation.
          </div>
        </div>

      </div>

      {/* Directions Modal */}
      {activeDirectionsPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                Navigation & Route
              </span>
              <button
                onClick={() => setActiveDirectionsPlace(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Directions to {activeDirectionsPlace.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Destination: {activeDirectionsPlace.address}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Estimated Drive: 14 mins</span>
                <span>4.2 miles</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                1. Head North toward Innovation Blvd (0.8 mi)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                2. Merge onto Quantum Parkway (2.4 mi)
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                3. Arrive at destination on right
              </p>
            </div>

            <button
              onClick={() => setActiveDirectionsPlace(null)}
              className="w-full rounded-xl bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              Close Directions
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
