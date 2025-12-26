'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Flame, Sparkles, Trophy, Users, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Tournament {
  id: number;
  name: string;
  game_type: string;
  status: string;
  max_participants: number;
  current_participants: number;
}

interface OnlineGame {
  id: number;
  game_type: string;
  status: string;
  player1_id: number;
  player2_id: number | null;
  created_at: string;
}

const mockTournaments = [
  {
    id: 1,
    title: "Phoenix Summer Golf Championship",
    sport: "golf",
    venue: "Desert Ridge Golf Club",
    status: "live",
    participants: 142,
    prizePool: "$5,000",
    leaders: [
      { name: "Mike Chen", chance: 28, score: "-8" },
      { name: "Sarah Williams", chance: 22, score: "-7" }
    ],
    volume: "$42k",
    trending: true,
    distance: "4.2 mi"
  },
  {
    id: 2,
    title: "Metro Pickleball Ladder Finals",
    sport: "pickleball",
    venue: "Metro Pickleball Center",
    status: "live",
    participants: 64,
    prizePool: "$2,500",
    leaders: [
      { name: "Martinez/Johnson", chance: 45, score: "12-8" },
      { name: "Davis/Lee", chance: 35, score: "10-10" }
    ],
    volume: "$18k",
    trending: true,
    distance: "2.8 mi"
  },
  {
    id: 3,
    title: "Thursday Night Bowling League",
    sport: "bowling",
    venue: "Sunset Lanes",
    status: "live",
    participants: 96,
    prizePool: "$3,200",
    leaders: [
      { name: "Strike Force", chance: 38, score: "14-2" },
      { name: "Pin Crushers", chance: 31, score: "13-3" }
    ],
    volume: "$28k",
    breaking: true,
    distance: "5.1 mi"
  },
  {
    id: 4,
    title: "Citywide Softball Championship",
    sport: "softball",
    venue: "Westside Sports Complex",
    status: "upcoming",
    participants: 128,
    prizePool: "$4,800",
    leaders: [
      { name: "Red Sox Elite", chance: 32, score: "15-3" },
      { name: "Diamond Kings", chance: 28, score: "14-4" }
    ],
    volume: "$35k",
    new: true,
    startTime: "Tomorrow 6:00 PM",
    distance: "3.5 mi"
  },
  {
    id: 5,
    title: "Weekend Tennis Doubles Ladder",
    sport: "tennis",
    venue: "Phoenix Tennis Center",
    status: "live",
    participants: 48,
    prizePool: "$1,800",
    leaders: [
      { name: "Anderson/Brooks", chance: 42, score: "8-1" },
      { name: "Garcia/Thompson", chance: 36, score: "7-2" }
    ],
    volume: "$15k",
    trending: true,
    distance: "6.1 mi"
  },
  {
    id: 6,
    title: "Indoor Soccer League Finals",
    sport: "soccer",
    venue: "Valley Sports Arena",
    status: "upcoming",
    participants: 88,
    prizePool: "$6,000",
    leaders: [
      { name: "FC Phoenix", chance: 44, score: "12-2-1" },
      { name: "United SC", chance: 39, score: "11-3-1" }
    ],
    volume: "$52k",
    breaking: true,
    startTime: "Dec 26, 7:00 PM",
    distance: "8.3 mi"
  }
];

const sports = [
  { id: 'all', name: 'All Sports', emoji: '🏆', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'golf', name: 'Golf', emoji: '🏌️', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'pickleball', name: 'Pickleball', emoji: '🏓', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'bowling', name: 'Bowling', emoji: '🎳', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'softball', name: 'Softball', emoji: '⚾', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', color: 'bg-lime-50 text-lime-700 border-lime-200' },
  { id: 'soccer', name: 'Soccer', emoji: '⚽', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [liveGames, setLiveGames] = useState<OnlineGame[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    try {
      const [gamesRes, tournamentsRes] = await Promise.all([
        api.get<{ items: OnlineGame[] }>('/online-games?status=in_progress&limit=10').catch(() => ({ items: [] })),
        api.get<{ items: Tournament[] }>('/tournaments?limit=10').catch(() => ({ items: [] })),
      ]);
      setLiveGames(gamesRes.items || []);
      setTournaments(tournamentsRes.items || []);
    } catch (e) {
      console.error('Failed to load live data', e);
    }
  };

  const filteredTournaments = mockTournaments.filter(t => {
    if (selectedSport !== 'all' && t.sport !== selectedSport) return false;
    if (activeTab === 'trending' && !t.trending) return false;
    if (activeTab === 'breaking' && !t.breaking) return false;
    if (activeTab === 'new' && !t.new) return false;
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
                  {liveGames.length > 0 ? `${liveGames.length} Live Games` : '23 Live Events'}
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
                <div className="text-sm text-blue-100 mb-1">Leagues Running</div>
                <div className="text-3xl font-bold">{tournaments.length > 0 ? tournaments.length : 847}</div>
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
                onClick={() => setSelectedSport(sport.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div 
              key={tournament.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {tournament.status === 'live' && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                          <span className="text-xs font-bold uppercase tracking-wide">Live</span>
                        </span>
                      )}
                      {tournament.status === 'upcoming' && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wide">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">
                      {tournament.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-600 gap-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{tournament.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{tournament.participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{tournament.prizePool}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{tournament.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 space-y-2">
                {tournament.leaders.map((leader, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {leader.name}
                      </div>
                      {leader.score && (
                        <div className="text-xs text-gray-600 mt-0.5 font-mono">
                          {leader.score}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-2xl font-bold text-blue-600 font-mono">
                        {leader.chance}%
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        chance
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">{tournament.volume}</span>
                  <span>Vol.</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs uppercase tracking-wide flex items-center gap-1 transition-colors">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-gray-500 text-lg font-semibold mb-1">No tournaments found</div>
            <div className="text-gray-400 text-sm">Try selecting a different tab or sport</div>
          </div>
        )}

        {liveGames.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Games Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveGames.slice(0, 4).map(game => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="p-4 rounded-xl bg-white border-2 border-green-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-600 font-bold uppercase">LIVE</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{game.game_type.replace('_', ' ')}</div>
                  <div className="text-xs text-gray-500 mt-1">Game #{game.id}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {tournaments.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.slice(0, 6).map(tournament => (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="capitalize">{tournament.game_type.replace('_', ' ')}</span>
                    <span>{tournament.current_participants}/{tournament.max_participants} players</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Active Leagues:</span>
                <span className="font-bold text-gray-900">{tournaments.length > 0 ? tournaments.length : 847}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Games:</span>
                <span className="font-bold text-gray-900">{liveGames.length > 0 ? liveGames.length : 23}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-600">Players Online:</span>
                <span className="font-bold text-green-600">12,482</span>
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
