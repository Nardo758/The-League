'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface UserLocation {
  id: number;
  label: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  radius_miles: number;
  is_primary: boolean;
}

export interface LocationState {
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_miles: number;
  isDetecting: boolean;
  hasLocationSetup: boolean;
}

interface LocationContextType {
  location: LocationState;
  savedLocations: UserLocation[];
  setLocation: (location: Partial<LocationState>, syncToBackend?: boolean) => void;
  detectLocation: () => Promise<void>;
  switchToSavedLocation: (loc: UserLocation) => void;
  refreshSavedLocations: () => Promise<void>;
  clearLocation: () => void;
  getLocationParams: () => { latitude?: number; longitude?: number; radius_miles?: number };
}

const defaultLocation: LocationState = {
  city: null,
  state: null,
  latitude: null,
  longitude: null,
  radius_miles: 25,
  isDetecting: false,
  hasLocationSetup: false,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>(defaultLocation);
  const [savedLocations, setSavedLocations] = useState<UserLocation[]>([]);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const syncToBackend = useCallback(async (loc: Partial<LocationState>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: loc.latitude,
          longitude: loc.longitude,
          city: loc.city,
          state: loc.state,
          search_radius_miles: loc.radius_miles,
          location_setup_complete: true,
        }),
      });
    } catch (err) {
      console.error('Failed to sync location to backend:', err);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocationState(prev => ({ ...prev, ...parsed, hasLocationSetup: true }));
      } catch {}
    }
    
    const fetchUserLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          if (user.latitude && user.longitude && user.city) {
            setLocationState(prev => ({
              ...prev,
              city: user.city,
              state: user.state,
              latitude: user.latitude,
              longitude: user.longitude,
              radius_miles: user.search_radius_miles || 25,
              hasLocationSetup: user.location_setup_complete || false,
            }));
          }
        }
      } catch {}
    };
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (location.hasLocationSetup && location.city) {
      localStorage.setItem('userLocation', JSON.stringify({
        city: location.city,
        state: location.state,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_miles: location.radius_miles,
      }));
    }
  }, [location]);

  const refreshSavedLocations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('/api/users/me/locations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedLocations(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    refreshSavedLocations();
  }, [refreshSavedLocations]);

  const detectLocation = useCallback(async () => {
    setLocationState(prev => ({ ...prev, isDetecting: true }));
    
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const data = await res.json();
        
        const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
        const state = data.address?.state || '';
        
        const newLocation = {
          city,
          state,
          latitude,
          longitude,
          radius_miles: location.radius_miles,
        };
        
        setLocationState(prev => ({
          ...prev,
          ...newLocation,
          isDetecting: false,
          hasLocationSetup: true,
        }));
        
        syncToBackend(newLocation);
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationState(prev => ({ ...prev, isDetecting: false }));
    }
  }, [location.radius_miles, syncToBackend]);

  const setLocation = useCallback((newLocation: Partial<LocationState>, shouldSyncToBackend = true) => {
    setLocationState(prev => {
      const updated = { ...prev, ...newLocation, hasLocationSetup: true };
      if (shouldSyncToBackend && (newLocation.latitude || newLocation.radius_miles)) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncToBackend(updated);
        }, 500);
      }
      return updated;
    });
  }, [syncToBackend]);

  const switchToSavedLocation = useCallback((loc: UserLocation) => {
    const newLocation = {
      city: loc.city,
      state: loc.state,
      latitude: loc.latitude,
      longitude: loc.longitude,
      radius_miles: loc.radius_miles,
    };
    setLocationState(prev => ({
      ...prev,
      ...newLocation,
      hasLocationSetup: true,
    }));
    syncToBackend(newLocation);
  }, [syncToBackend]);

  const clearLocation = useCallback(() => {
    setLocationState(defaultLocation);
    localStorage.removeItem('userLocation');
  }, []);

  const getLocationParams = useCallback(() => {
    if (location.latitude && location.longitude) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        radius_miles: location.radius_miles,
      };
    }
    return {};
  }, [location.latitude, location.longitude, location.radius_miles]);

  return (
    <LocationContext.Provider
      value={{
        location,
        savedLocations,
        setLocation,
        detectLocation,
        switchToSavedLocation,
        refreshSavedLocations,
        clearLocation,
        getLocationParams,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
