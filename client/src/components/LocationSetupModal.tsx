'use client';

import { useState } from 'react';
import { MapPin, Navigation, X, ChevronDown } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

interface LocationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const RADIUS_OPTIONS = [5, 10, 25, 50, 100];

export default function LocationSetupModal({ isOpen, onClose, onComplete }: LocationSetupModalProps) {
  const { location, setLocation, detectLocation } = useLocation();
  const [step, setStep] = useState<'welcome' | 'detecting' | 'confirm' | 'manual'>('welcome');
  const [selectedRadius, setSelectedRadius] = useState(25);
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
    setStep('detecting');
    setError(null);
    
    try {
      await detectLocation();
      setStep('confirm');
    } catch (err) {
      setError('Could not detect your location. Please enter it manually.');
      setStep('manual');
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCity.trim()) {
      setError('Please enter a city name');
      return;
    }

    setStep('detecting');
    setError(null);

    try {
      const searchQuery = manualState 
        ? `${manualCity}, ${manualState}, USA` 
        : `${manualCity}, USA`;
      
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await res.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setLocation({
          city: manualCity,
          state: manualState || result.display_name?.split(', ').slice(-3, -2)[0] || '',
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          radius_miles: selectedRadius,
        });
        setStep('confirm');
      } else {
        setError('Could not find that location. Please try a different city name.');
        setStep('manual');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStep('manual');
    }
  };

  const handleConfirm = () => {
    setLocation({ 
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      radius_miles: selectedRadius,
      hasLocationSetup: true,
    });
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {step === 'welcome' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Find Leagues Near You</h2>
              <p className="text-gray-400 mb-6">
                Set your location to discover recreational sports leagues, venues, and tournaments in your area.
              </p>

              <button
                onClick={handleAutoDetect}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors mb-3"
              >
                <Navigation className="w-5 h-5" />
                Use My Current Location
              </button>

              <button
                onClick={() => setStep('manual')}
                className="w-full px-4 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Enter Location Manually
              </button>

              <button
                onClick={handleSkip}
                className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {step === 'detecting' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Navigation className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Detecting Your Location...</h2>
              <p className="text-gray-400">Please allow location access when prompted.</p>
            </div>
          )}

          {step === 'manual' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 text-center">Enter Your Location</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="e.g., Austin"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State (optional)</label>
                  <input
                    type="text"
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    placeholder="e.g., Texas"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Search Radius</label>
                  <div className="relative">
                    <select
                      value={selectedRadius}
                      onChange={(e) => setSelectedRadius(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-emerald-500"
                    >
                      {RADIUS_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r} miles</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('welcome')}
                  className="flex-1 px-4 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleManualSubmit}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Find Leagues
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Location Set!</h2>
              <p className="text-gray-400 mb-2">
                {location.city}{location.state ? `, ${location.state}` : ''}
              </p>

              <div className="mt-4 mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Radius</label>
                <div className="flex justify-center gap-2 flex-wrap">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadius(r)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedRadius === r
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {r} mi
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                Start Exploring
              </button>

              <button
                onClick={() => setStep('manual')}
                className="mt-3 text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Change location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
