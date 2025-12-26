'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Users, Calendar, DollarSign, Filter, Trophy, Building2, Swords, UserCircle, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface League {
  id: number;
  name: string;
  sport_id: number;
  venue_id: number;
}

interface Venue {
  id: number;
  name: string;
  venue_type: string;
  city: string;
  state: string;
}

interface Tournament {
  id: number;
  name: string;
  game_type: string;
  status: string;
  max_participants: number;
}

const tabs = [
  { id: 'leagues', label: 'Leagues', icon: Trophy },
  { id: 'venues', label: 'Venues', icon: Building2 },
  { id: 'tournaments', label: 'Tournaments', icon: Swords },
  { id: 'players', label: 'Players', icon: UserCircle },
];

const sports = [
  { id: 'all', name: 'All Sports', emoji: '🏆' },
  { id: 'golf', name: 'Golf', emoji: '🏌️' },
  { id: 'pickleball', name: 'Pickleball', emoji: '🏓' },
  { id: 'bowling', name: 'Bowling', emoji: '🎳' },
  { id: 'softball', name: 'Softball', emoji: '⚾' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'soccer', name: 'Soccer', emoji: '⚽' },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'leagues');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'leagues') {
        const data = await api.get<{ items: League[] }>('/leagues?limit=20');
        setLeagues(data.items || []);
      } else if (activeTab === 'venues') {
        const data = await api.get<{ items: Venue[] }>('/venues?limit=20');
        setVenues(data.items || []);
      } else if (activeTab === 'tournaments') {
        const data = await api.get<{ items: Tournament[] }>('/tournaments?limit=20');
        setTournaments(data.items || []);
      }
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/search?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Filters</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sport</label>
                  <div className="space-y-1">
                    {sports.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => setSelectedSport(sport.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedSport === sport.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{sport.emoji}</span>
                        <span>{sport.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter location..."
                      className="flex-1 text-sm outline-none"
                    />
                  </div>
                </div>

                {activeTab === 'leagues' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Day of Week</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>Any Day</option>
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Skill Level</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>All Levels</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>Any Price</option>
                        <option>Free</option>
                        <option>Under $50</option>
                        <option>$50 - $100</option>
                        <option>$100 - $200</option>
                        <option>$200+</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'venues' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Venue Type</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>All Types</option>
                        <option>Golf Course</option>
                        <option>Sports Complex</option>
                        <option>Bowling Alley</option>
                        <option>Recreation Center</option>
                        <option>Esports Arena</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Amenities</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Pro Shop
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Restaurant
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Equipment Rental
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'tournaments' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>All Formats</option>
                        <option>Single Elimination</option>
                        <option>Double Elimination</option>
                        <option>Round Robin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Entry Fee</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>Any Fee</option>
                        <option>Free</option>
                        <option>Under $25</option>
                        <option>$25 - $50</option>
                        <option>$50+</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Skill Level</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>All Levels</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'players' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Looking For</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>Any</option>
                        <option>Teammates</option>
                        <option>Opponents</option>
                        <option>Practice Partners</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Skill Level</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option>All Levels</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Availability</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Weekdays
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Weekends
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Evenings
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {activeTab === 'leagues' && (
                  <div className="space-y-4">
                    {leagues.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No leagues found</p>
                      </div>
                    ) : (
                      leagues.map((league) => (
                        <Link
                          key={league.id}
                          href={`/leagues/${league.id}`}
                          className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{league.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  Venue #{league.venue_id}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'venues' && (
                  <div className="space-y-4">
                    {venues.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No venues found</p>
                      </div>
                    ) : (
                      venues.map((venue) => (
                        <Link
                          key={venue.id}
                          href={`/venues/${venue.id}`}
                          className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {venue.city}, {venue.state}
                                </span>
                                <span className="capitalize">{venue.venue_type?.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'tournaments' && (
                  <div className="space-y-4">
                    {tournaments.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Swords className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No tournaments found</p>
                      </div>
                    ) : (
                      tournaments.map((tournament) => (
                        <Link
                          key={tournament.id}
                          href={`/tournaments/${tournament.id}`}
                          className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{tournament.name}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="capitalize">{tournament.game_type?.replace('_', ' ')}</span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {tournament.max_participants} players max
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  tournament.status === 'registration' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {tournament.status}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'players' && (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Player search coming soon</p>
                    <p className="text-sm text-gray-400 mt-1">Find teammates and opponents</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
