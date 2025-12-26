'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Flame, Sparkles, Trophy, Users, MapPin, DollarSign, ChevronRight, Play, Eye, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface FeaturedEvent {
  id: number;
  event_type: string;
  title: string;
  subtitle: string | null;
  sport_slug: string;
  sport_name: string;
  sport_emoji: string;
  venue_name: string | null;
  location: string | null;
  status: string;
  starts_at: string | null;
  participants: number | null;
  is_featured: boolean;
}

interface FeaturedEventsResponse {
  live: FeaturedEvent[];
  upcoming: FeaturedEvent[];
  total_live: number;
  total_upcoming: number;
}

const sports = [
  { id: 'all', name: 'All Sports', emoji: '🏆', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'golf', name: 'Golf', emoji: '🏌️', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'pickleball', name: 'Pickleball', emoji: '🏓', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'bowling', name: 'Bowling', emoji: '🎳', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'softball', name: 'Softball', emoji: '⚾', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', color: 'bg-lime-50 text-lime-700 border-lime-200' },
  { id: 'soccer', name: 'Soccer', emoji: '⚽', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'online-games', name: 'Online Games', emoji: '🎮', color: 'bg-purple-50 text-purple-700 border-purple-200' }
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEventsResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadFeaturedEvents();
  }, []);

  const handleSportClick = (sportId: string) => {
    if (sportId === 'all') {
      setSelectedSport('all');
    } else {
      router.push(`/channels/${sportId}`);
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      const data = await api.get<FeaturedEventsResponse>('/channels/featured/events?limit=10');
      setFeaturedEvents(data);
    } catch (e) {
      console.error('Failed to load featured events', e);
    } finally {
      setLoading(false);
    }
  };

  const allEvents = [
    ...(featuredEvents?.live || []),
    ...(featuredEvents?.upcoming || []),
  ];
  
  const filteredEvents = allEvents.filter(event => {
    if (selectedSport !== 'all' && event.sport_slug !== selectedSport) return false;
    if (activeTab === 'trending' && !event.is_featured) return false;
    if (activeTab === 'breaking' && event.status !== 'live') return false;
    if (activeTab === 'new' && event.status === 'live') return false;
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 rounded-full mb-4 border border-blue-400/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {featuredEvents?.total_live ? `${featuredEvents.total_live} Live Events` : 'Live Events'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                Discover Leagues.<br/>Join the Action.
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                Find recreational sports leagues and tournaments near you. From golf to soccer, connect with your community and compete.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/leagues" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2">
                  <span>Explore Leagues</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link href="/venue-admin" className="px-6 py-3 border-2 border-blue-400 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all">
                  For Venues
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-sm text-blue-100 mb-1">Active Players</div>
                <div className="text-3xl font-bold">12,482</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="text-sm text-blue-100 mb-1">Upcoming Events</div>
                <div className="text-3xl font-bold">{featuredEvents?.total_upcoming || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>All Events</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'trending' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setActiveTab('breaking')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'breaking' 
                  ? 'bg-orange-50 text-orange-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Breaking</span>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'new' 
                  ? 'bg-purple-50 text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-4">
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => handleSportClick(sport.id)}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl min-w-[90px] border-2 transition-all ${
                  selectedSport === sport.id
                    ? `${sport.color} shadow-md transform scale-105`
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-3xl">{sport.emoji}</span>
                <span className="text-xs font-semibold whitespace-nowrap">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {featuredEvents && featuredEvents.live.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <h2 className="text-2xl font-bold text-gray-900">Live Now</h2>
                  </div>
                  <span className="text-sm text-gray-500">({featuredEvents.total_live} events)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredEvents.live.slice(0, 8).map(event => (
                    <Link
                      key={`${event.event_type}-${event.id}`}
                      href={event.event_type === 'online_game' ? `/games/${event.id}` : `/channels/${event.sport_slug}`}
                      className="bg-white rounded-xl border-2 border-green-400 overflow-hidden hover:shadow-xl hover:border-green-500 transition-all duration-300 group"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{event.sport_emoji}</span>
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                            LIVE
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-green-600 transition-colors">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-xs text-gray-500 mb-2">{event.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{event.sport_name}</span>
                          <span className="flex items-center gap-1 text-green-600">
                            <Eye className="w-3 h-3" />
                            Watch
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {featuredEvents && featuredEvents.upcoming.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  <span className="text-sm text-gray-500">({featuredEvents.total_upcoming} events)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredEvents.upcoming.map(event => (
                    <Link
                      key={`${event.event_type}-${event.id}`}
                      href={event.event_type === 'tournament' ? `/tournaments` : `/channels/${event.sport_slug}`}
                      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-4xl">{event.sport_emoji}</span>
                          <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                            {event.event_type === 'tournament' ? 'Tournament' : 'Registration Open'}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-sm text-gray-500 mb-3">{event.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{event.sport_name}</span>
                          {event.participants !== null && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Users className="w-4 h-4" />
                              {event.participants} joined
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                        <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-gray-400" />
                </div>
                <div className="text-gray-500 text-lg font-semibold mb-1">No events found</div>
                <div className="text-gray-400 text-sm">Check back soon for live games and tournaments!</div>
              </div>
            )}
          </>
        )}
      </main>

      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Upcoming Events:</span>
                <span className="font-bold text-gray-900">{featuredEvents?.total_upcoming || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Now:</span>
                <span className="font-bold text-gray-900">{featuredEvents?.total_live || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-600">Total Events:</span>
                <span className="font-bold text-green-600">{(featuredEvents?.total_live || 0) + (featuredEvents?.total_upcoming || 0)}</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              The League Platform © 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
