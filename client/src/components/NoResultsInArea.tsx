'use client';

import { MapPin, Search, ChevronRight } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

interface NoResultsInAreaProps {
  itemType?: string;
  onExpandRadius?: () => void;
  onClearLocation?: () => void;
  showSetLocation?: boolean;
  onSetLocation?: () => void;
}

const EXPAND_RADIUS_OPTIONS = [50, 100, 200];

export default function NoResultsInArea({ 
  itemType = 'leagues',
  onExpandRadius,
  onClearLocation,
  showSetLocation = false,
  onSetLocation
}: NoResultsInAreaProps) {
  const { location, setLocation } = useLocation();

  const handleExpandRadius = (newRadius: number) => {
    setLocation({ radius_miles: newRadius });
    onExpandRadius?.();
  };

  const handleClearLocation = () => {
    onClearLocation?.();
  };

  if (showSetLocation) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Set Your Location
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Set your location to find {itemType} near you.
        </p>
        <button
          onClick={onSetLocation}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
        >
          <MapPin className="w-5 h-5" />
          Set Location
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No {itemType} found within {location.radius_miles} miles
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {location.city 
          ? `We couldn't find any ${itemType} near ${location.city}${location.state ? `, ${location.state}` : ''} within your search radius.`
          : `We couldn't find any ${itemType} in your current search area.`
        }
      </p>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {EXPAND_RADIUS_OPTIONS.filter(r => r > (location.radius_miles || 25)).map(radius => (
          <button
            key={radius}
            onClick={() => handleExpandRadius(radius)}
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors border border-blue-200"
          >
            Expand to {radius} miles
            <ChevronRight className="w-4 h-4" />
          </button>
        ))}
      </div>

      <button
        onClick={handleClearLocation}
        className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
      >
        Search all locations instead
      </button>
    </div>
  );
}
