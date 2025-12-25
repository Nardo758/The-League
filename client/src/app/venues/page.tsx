'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { venues, Venue } from '@/lib/api';

export default function VenuesPage() {
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadVenues();
  }, [location]);

  const loadVenues = async () => {
    setLoading(true);
    setError('');
    try {
      const params = location ? { ...location, radius_miles: 50 } : undefined;
      const response = await venues.list(params);
      setVenueList(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setUseLocation(true);
        },
        () => {
          setError('Unable to get your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setUseLocation(false);
  };

  const venueTypeIcon: Record<string, string> = {
    golf_course: '⛳',
    bowling_alley: '🎳',
    sports_complex: '🏟️',
    esports_arena: '🎮',
    tennis_club: '🎾',
    default: '📍',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Venues</h1>
        <div className="flex gap-2">
          {useLocation ? (
            <button
              onClick={clearLocation}
              className="px-4 py-2 rounded-lg border border-border hover:bg-card-hover transition-colors text-sm"
            >
              Clear Location
            </button>
          ) : (
            <button
              onClick={handleUseLocation}
              className="px-4 py-2 rounded-lg bg-accent text-background hover:bg-accent-hover transition-colors text-sm"
            >
              Use My Location
            </button>
          )}
        </div>
      </div>

      {useLocation && location && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent text-sm">
          Showing venues within 50 miles of your location
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : venueList.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No venues found. {useLocation && 'Try expanding your search area.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venueList.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all group"
            >
              <div className="text-3xl mb-3">
                {venueTypeIcon[venue.venue_type] || venueTypeIcon.default}
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                {venue.name}
              </h3>
              <p className="text-sm text-muted capitalize mb-2">
                {venue.venue_type.replace('_', ' ')}
              </p>
              <p className="text-sm text-muted">
                {venue.city}, {venue.state}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
