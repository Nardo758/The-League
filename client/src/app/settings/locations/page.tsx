'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Star, Navigation, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocation, UserLocation } from '@/contexts/LocationContext';

interface LocationFormData {
  label: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  radius_miles: number;
  is_primary: boolean;
}

export default function LocationSettingsPage() {
  const { savedLocations, refreshSavedLocations, detectLocation, location } = useLocation();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    label: '',
    city: '',
    state: '',
    latitude: null,
    longitude: null,
    radius_miles: 25,
    is_primary: false,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
          });
        });
        
        const { latitude, longitude } = position.coords;
        
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
        );
        const data = await res.json();
        
        setFormData(prev => ({
          ...prev,
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          latitude,
          longitude,
        }));
      }
    } catch (err) {
      setError('Could not detect location');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.city || !formData.state || !formData.latitude || !formData.longitude) {
      setError('Please fill in all required fields or use auto-detect');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: formData.label || 'Saved',
          city: formData.city,
          state: formData.state,
          latitude: formData.latitude,
          longitude: formData.longitude,
          radius_miles: formData.radius_miles,
          is_primary: formData.is_primary,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to save location');
      }

      setSuccess('Location saved successfully');
      setIsAddingNew(false);
      setFormData({
        label: '',
        city: '',
        state: '',
        latitude: null,
        longitude: null,
        radius_miles: 25,
        is_primary: false,
      });
      refreshSavedLocations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/me/locations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');
      
      setSuccess('Location deleted');
      refreshSavedLocations();
    } catch (err) {
      setError('Failed to delete location');
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/me/locations/${id}/set-primary`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to set primary');
      
      setSuccess('Primary location updated');
      refreshSavedLocations();
    } catch (err) {
      setError('Failed to update primary location');
    }
  };

  const labelOptions = ['Home', 'Work', 'Gym', 'Club', 'Other'];

  return (
    <div className="min-h-screen bg-[#0d0d0d] py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 text-emerald-500" />
            Location Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your saved locations for quick switching and personalized results.
          </p>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-lg mb-6 ${error ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'}`}>
            {error || success}
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] mb-6">
          <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Saved Locations</h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>

          {savedLocations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved locations yet</p>
              <p className="text-sm mt-1">Add your first location to get personalized results</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2a]">
              {savedLocations.map((loc) => (
                <div key={loc.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-xl">
                      {loc.label === 'Home' ? '🏠' : loc.label === 'Work' ? '💼' : loc.label === 'Gym' ? '🏋️' : '📍'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{loc.city}, {loc.state}</span>
                        {loc.is_primary && (
                          <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{loc.label} ({loc.radius_miles} mi)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!loc.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(loc.id)}
                        className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                        title="Set as primary"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAddingNew && (
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add New Location</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Label</label>
                <div className="flex gap-2 flex-wrap">
                  {labelOptions.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, label }))}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        formData.label === label
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetect}
                disabled={isDetecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2a2a2a] hover:bg-[#333] rounded-lg text-gray-300 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                {isDetecting ? 'Detecting...' : 'Auto-detect my location'}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Phoenix"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="AZ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Search Radius</label>
                <select
                  value={formData.radius_miles}
                  onChange={(e) => setFormData(prev => ({ ...prev, radius_miles: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                  <option value={200}>200 miles</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0d0d0d] text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-300">Set as my primary location</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
