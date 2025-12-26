'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Navigation, Settings, X } from 'lucide-react';
import { useLocation, UserLocation } from '@/contexts/LocationContext';

export default function LocationBar() {
  const { location, savedLocations, switchToSavedLocation, detectLocation, setLocation } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLocation = location.city 
    ? `${location.city}, ${location.state}` 
    : 'Set Location';
  
  const shortLocation = location.city
    ? `${location.city.substring(0, 3).toUpperCase()} ${location.radius_miles}mi`
    : 'Location';

  const handleRadiusChange = (radius: number) => {
    setLocation({ radius_miles: radius });
  };

  const radiusOptions = [10, 25, 50, 100, 200];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg text-sm transition-colors border border-[#2a2a2a]"
      >
        <MapPin className="w-4 h-4 text-emerald-500" />
        <span className="text-gray-300 hidden sm:inline">{displayLocation}</span>
        <span className="text-gray-300 sm:hidden">{shortLocation}</span>
        <span className="text-gray-500 hidden sm:inline">({location.radius_miles}mi)</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Current Location</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <span className="text-white font-medium">
                {location.city ? `${location.city}, ${location.state}` : 'Not set'}
              </span>
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500 block mb-1">Search radius</label>
              <div className="flex gap-2">
                {radiusOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRadiusChange(r)}
                    className={`px-2 py-1 text-xs rounded ${
                      location.radius_miles === r
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
                    }`}
                  >
                    {r}mi
                  </button>
                ))}
              </div>
            </div>
          </div>

          {savedLocations.length > 0 && (
            <div className="p-3 border-b border-[#2a2a2a]">
              <span className="text-xs text-gray-500 block mb-2">Quick Switch</span>
              <div className="space-y-1">
                {savedLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      switchToSavedLocation(loc);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                      location.city === loc.city && location.state === loc.state
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'hover:bg-[#2a2a2a] text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{loc.label === 'Home' ? '🏠' : loc.label === 'Work' ? '💼' : '📍'}</span>
                    <div>
                      <div className="font-medium">{loc.city}, {loc.state}</div>
                      <div className="text-xs text-gray-500">{loc.label} ({loc.radius_miles}mi)</div>
                    </div>
                    {loc.is_primary && (
                      <span className="ml-auto text-xs bg-emerald-600/20 text-emerald-400 px-1.5 py-0.5 rounded">Primary</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-b border-[#2a2a2a]">
            <span className="text-xs text-gray-500 block mb-2">Search Location</span>
            <input
              type="text"
              placeholder="Enter city or zip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 space-y-2">
            <button
              onClick={() => {
                detectLocation();
                setIsOpen(false);
              }}
              disabled={location.isDetecting}
              className="w-full flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              {location.isDetecting ? 'Detecting...' : 'Auto-detect my location'}
            </button>
            <a
              href="/settings/locations"
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#2a2a2a] rounded-lg text-sm text-gray-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Manage Saved Locations
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
