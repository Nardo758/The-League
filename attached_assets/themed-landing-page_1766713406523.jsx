import React, { useState } from 'react';
import { Search, TrendingUp, Flame, Sparkles, Trophy, Users, MapPin, Clock, DollarSign, ChevronRight, Star, CheckCircle } from 'lucide-react';

const ThemedLandingPage = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [selectedSport, setSelectedSport] = useState('all');

  // Mock tournaments/leagues data
  const tournaments = [
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

  const filteredTournaments = tournaments.filter(t => {
    if (selectedSport !== 'all' && t.sport !== selectedSport) return false;
    if (activeTab === 'trending' && !t.trending) return false;
    if (activeTab === 'breaking' && !t.breaking) return false;
    if (activeTab === 'new' && !t.new) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">League Platform</div>
                <div className="text-xs text-gray-500 -mt-1">Find Your Game</div>
              </div>
            </div>
            
            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2.5 w-96 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search leagues, tournaments, sports..."
                className="bg-transparent outline-none text-sm w-full placeholder-gray-500"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-mono text-gray-500 bg-white border border-gray-200 rounded">
                /
              </kbd>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                Browse
              </button>
              <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5">
                Join League
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-blue-500 bg-opacity-30 rounded-full mb-4 border border-blue-400 border-opacity-30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wide">23 Live Events</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                Discover Leagues.<br/>Join the Action.
              </h1>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                Find recreational sports leagues and tournaments near you. From golf to soccer, connect with your community and compete.
              </p>
              <div className="flex items-center space-x-4">
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center space-x-2">
                  <span>Explore Leagues</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 border-2 border-blue-400 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all">
                  For Venues
                </button>
              </div>
            </div>
            <div className="hidden lg:flex flex-col space-y-3">
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-sm text-blue-100 mb-1">Active Players</div>
                <div className="text-3xl font-bold">12,482</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
                <div className="text-sm text-blue-100 mb-1">Leagues Running</div>
                <div className="text-3xl font-bold">847</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-4">
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
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
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
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
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
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

      {/* Sports Categories */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 overflow-x-auto py-4">
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex flex-col items-center space-y-1.5 px-4 py-3 rounded-xl min-w-[90px] border-2 transition-all ${
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

      {/* Main Content - Tournament Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(tournament => (
            <div 
              key={tournament.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              {/* Tournament Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
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
                    <div className="flex items-center text-xs text-gray-600 space-x-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{tournament.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{tournament.participants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{tournament.prizePool}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{tournament.distance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaders */}
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

              {/* Footer */}
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">{tournament.volume}</span>
                  <span>Vol.</span>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold text-xs uppercase tracking-wide flex items-center space-x-1 transition-colors">
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
      </main>

      {/* Bottom Stats Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-600">Active Leagues:</span>
                <span className="font-bold text-gray-900">847</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Tournaments:</span>
                <span className="font-bold text-gray-900">23</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-gray-600">Players Online:</span>
                <span className="font-bold text-green-600">12,482</span>
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              League Platform © 2025
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemedLandingPage;
