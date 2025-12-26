'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const sports = [
  { id: 'all', name: 'All', icon: '🏆' },
  { id: 'golf', name: 'Golf', icon: '🏌️' },
  { id: 'pickleball', name: 'Pickleball', icon: '🏓' },
  { id: 'bowling', name: 'Bowling', icon: '🎳' },
  { id: 'softball', name: 'Softball', icon: '⚾' },
  { id: 'chess', name: 'Chess', icon: '♟️' },
  { id: 'checkers', name: 'Checkers', icon: '🔴' },
  { id: 'connect_four', name: 'Connect 4', icon: '🔵' },
  { id: 'battleship', name: 'Battleship', icon: '🚢' },
];

const mockEvents = [
  {
    id: 1,
    title: "Phoenix Summer Golf Championship",
    sport: "golf",
    icon: "🏌️",
    status: "live",
    participants: 142,
    prizePool: "$5,000",
    leaders: [
      { name: "Mike Chen", chance: 28, score: "-8" },
      { name: "Sarah Williams", chance: 22, score: "-7" }
    ],
    volume: "$42k",
    trending: true
  },
  {
    id: 2,
    title: "Metro Pickleball Ladder Finals",
    sport: "pickleball",
    icon: "🏓",
    status: "live",
    participants: 64,
    prizePool: "$2,500",
    leaders: [
      { name: "Team Martinez/Johnson", chance: 45, score: "12-8" },
      { name: "Team Davis/Lee", chance: 35, score: "10-10" }
    ],
    volume: "$18k",
    trending: true
  },
  {
    id: 3,
    title: "Thursday Night Bowling League",
    sport: "bowling",
    icon: "🎳",
    status: "live",
    participants: 96,
    prizePool: "$3,200",
    leaders: [
      { name: "Strike Force", chance: 38, score: "14-2" },
      { name: "Pin Crushers", chance: 31, score: "13-3" }
    ],
    volume: "$28k",
    breaking: true
  },
  {
    id: 4,
    title: "Citywide Softball Championship",
    sport: "softball",
    icon: "⚾",
    status: "upcoming",
    participants: 128,
    prizePool: "$4,800",
    leaders: [
      { name: "Red Sox Elite", chance: 32, score: "15-3" },
      { name: "Diamond Kings", chance: 28, score: "14-4" }
    ],
    volume: "$35k",
    new: true,
    startTime: "Tomorrow 6:00 PM"
  },
  {
    id: 5,
    title: "Chess Grand Masters Cup",
    sport: "chess",
    icon: "♟️",
    status: "live",
    participants: 32,
    prizePool: "$1,500",
    leaders: [
      { name: "Alex Petrov", chance: 42, score: "8-1" },
      { name: "Nina Roberts", chance: 36, score: "7-2" }
    ],
    volume: "$15k",
    trending: true
  },
  {
    id: 6,
    title: "Connect 4 Speed Tournament",
    sport: "connect_four",
    icon: "🔵",
    status: "registering",
    participants: 48,
    prizePool: "$800",
    leaders: [
      { name: "FastDrop", chance: 35, registrations: 24 },
      { name: "FourInRow", chance: 28, registrations: 18 }
    ],
    volume: "$8k",
    new: true,
    startTime: "Dec 28, 3:00 PM"
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [liveGames, setLiveGames] = useState<OnlineGame[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
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

  const filteredEvents = mockEvents.filter(event => {
    if (selectedSport !== 'all' && event.sport !== selectedSport) return false;
    if (activeTab === 'trending' && !event.trending) return false;
    if (activeTab === 'breaking' && !event.breaking) return false;
    if (activeTab === 'new' && !event.new) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-blue-500';
      case 'registering': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'live': return 'LIVE';
      case 'upcoming': return 'Upcoming';
      case 'registering': return 'Open';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 border-b border-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'all' 
              ? 'bg-accent/10 text-accent' 
              : 'text-muted hover:text-foreground hover:bg-card'
          }`}
        >
          <span>🔥</span>
          <span>All Events</span>
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'trending' 
              ? 'bg-accent/10 text-accent' 
              : 'text-muted hover:text-foreground hover:bg-card'
          }`}
        >
          <span>📈</span>
          <span>Trending</span>
        </button>
        <button
          onClick={() => setActiveTab('breaking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'breaking' 
              ? 'bg-accent/10 text-accent' 
              : 'text-muted hover:text-foreground hover:bg-card'
          }`}
        >
          <span>⚡</span>
          <span>Breaking</span>
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === 'new' 
              ? 'bg-accent/10 text-accent' 
              : 'text-muted hover:text-foreground hover:bg-card'
          }`}
        >
          <span>✨</span>
          <span>New</span>
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {sports.map(sport => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg min-w-[70px] transition-colors ${
              selectedSport === sport.id
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-card'
            }`}
          >
            <span className="text-2xl">{sport.icon}</span>
            <span className="text-xs font-medium whitespace-nowrap">{sport.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map(event => (
          <Link 
            key={event.id}
            href={`/events/${event.id}`}
            className="bg-card rounded-xl border border-border overflow-hidden hover:border-accent transition-all group"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{event.icon}</div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight group-hover:text-accent transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`${getStatusColor(event.status)} text-white text-xs px-2 py-0.5 rounded font-medium`}>
                        {getStatusText(event.status)}
                      </span>
                      {event.startTime && (
                        <span className="text-xs text-muted">
                          {event.startTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{event.participants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>💰</span>
                    <span>{event.prizePool}</span>
                  </div>
                </div>
                <div className="text-accent font-medium">{event.volume} vol</div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {event.leaders.map((leader, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-card-hover transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{leader.name}</div>
                    <div className="text-xs text-muted">
                      {'score' in leader ? `Score: ${leader.score}` : `${leader.registrations} registered`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${idx === 0 ? 'text-accent' : 'text-muted'}`}>
                      {leader.chance}%
                    </div>
                    <div className="text-xs text-muted">chance</div>
                  </div>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-muted">
          No events found for this filter. Try a different category.
        </div>
      )}

      {liveGames.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Live Games Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveGames.slice(0, 4).map(game => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="p-4 rounded-xl bg-card border border-border hover:border-accent transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-500 font-medium">LIVE</span>
                </div>
                <div className="text-lg capitalize">{game.game_type.replace('_', ' ')}</div>
                <div className="text-xs text-muted mt-1">Game #{game.id}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tournaments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Active Tournaments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.slice(0, 6).map(tournament => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="p-4 rounded-xl bg-card border border-border hover:border-accent transition-all"
              >
                <h3 className="font-semibold mb-2">{tournament.name}</h3>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span className="capitalize">{tournament.game_type.replace('_', ' ')}</span>
                  <span>{tournament.current_participants}/{tournament.max_participants} players</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
