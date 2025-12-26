'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Calendar, Trophy, Users, Gamepad2, Swords, Play, Eye, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface OnlineGame {
  id: number;
  game_type: string;
  status: string;
  player1_id: number;
  player2_id: number | null;
  winner_id: number | null;
  is_ranked: boolean;
  time_limit_seconds: number | null;
  created_at: string;
}

interface Tournament {
  id: number;
  name: string;
  game_type: string;
  status: string;
  max_participants: number;
  current_participants: number;
  entry_fee: number | null;
  prize_pool: number | null;
  created_at: string;
}

const gameTypeEmojis: Record<string, string> = {
  connect4: '🔴',
  checkers: '🏁',
  chess: '♟️',
  battleship: '🚢',
};

const gameTypeNames: Record<string, string> = {
  connect4: 'Connect 4',
  checkers: 'Checkers',
  chess: 'Chess',
  battleship: 'Battleship',
};

export default function OnlineGamesChannelPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'live' | 'lobby' | 'tournaments' | 'leaderboard'>('live');
  const [liveGames, setLiveGames] = useState<OnlineGame[]>([]);
  const [lobbyGames, setLobbyGames] = useState<OnlineGame[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [liveRes, lobbyRes, tournamentRes] = await Promise.all([
        api.get<{ items: OnlineGame[] }>('/online-games?status=in_progress&limit=20').catch(() => ({ items: [] })),
        api.get<{ items: OnlineGame[] }>('/online-games?status=waiting&limit=20').catch(() => ({ items: [] })),
        api.get<{ items: Tournament[] }>('/tournaments?limit=20').catch(() => ({ items: [] })),
      ]);
      setLiveGames(liveRes.items || []);
      setLobbyGames(lobbyRes.items || []);
      setTournaments(tournamentRes.items || []);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'live', label: 'Live Games', icon: <Play className="w-4 h-4" />, count: liveGames.length },
    { id: 'lobby', label: 'Game Lobby', icon: <Gamepad2 className="w-4 h-4" />, count: lobbyGames.length },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy className="w-4 h-4" />, count: tournaments.length },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Swords className="w-4 h-4" /> },
  ];

  const channelStats = {
    liveEvents: liveGames.length,
    thisWeek: tournaments.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    members: 1247,
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl">
                🎮
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Online Games Arena</h1>
                <p className="text-purple-100 text-lg">
                  Play Chess, Checkers, Connect 4, and Battleship with players worldwide
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Live Games: {channelStats.liveEvents}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tournaments: {channelStats.thisWeek}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Members: {channelStats.members.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {user ? (
                <button
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                    isSubscribed
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  <Bell className={`w-5 h-5 ${isSubscribed ? 'fill-current' : ''}`} />
                  {isSubscribed ? 'Following' : 'Follow Channel'}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-all"
                >
                  <Bell className="w-5 h-5" />
                  Login to Follow
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-purple-200' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'live' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                    Live Games
                  </h2>
                  <Link
                    href="/games"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View All Games →
                  </Link>
                </div>

                {liveGames.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Live Games</h3>
                    <p className="text-gray-600 mb-6">Be the first to start a game!</p>
                    <Link
                      href="/games"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                    >
                      <Gamepad2 className="w-5 h-5" />
                      Start Playing
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveGames.map((game) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{gameTypeEmojis[game.game_type] || '🎮'}</span>
                            <span className="font-semibold text-gray-900">
                              {gameTypeNames[game.game_type] || game.game_type}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Player {game.player1_id} vs Player {game.player2_id}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Watch</span>
                          </div>
                        </div>
                        {game.is_ranked && (
                          <div className="mt-2">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              Ranked Match
                            </span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'lobby' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Game Lobby</h2>
                  <Link
                    href="/games"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                  >
                    Create Game
                  </Link>
                </div>

                {lobbyGames.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Games</h3>
                    <p className="text-gray-600 mb-6">Create a game and wait for an opponent!</p>
                    <Link
                      href="/games"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                    >
                      <Gamepad2 className="w-5 h-5" />
                      Create Game
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lobbyGames.map((game) => (
                      <div
                        key={game.id}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{gameTypeEmojis[game.game_type] || '🎮'}</span>
                            <span className="font-semibold text-gray-900">
                              {gameTypeNames[game.game_type] || game.game_type}
                            </span>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            Open
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <span>Created by Player {game.player1_id}</span>
                        </div>
                        {game.time_limit_seconds && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                            <Clock className="w-4 h-4" />
                            <span>{Math.floor(game.time_limit_seconds / 60)} min per player</span>
                          </div>
                        )}
                        <Link
                          href={`/games/${game.id}`}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                        >
                          <Play className="w-4 h-4" />
                          Join Game
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tournaments</h2>
                  <Link
                    href="/tournaments"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View All →
                  </Link>
                </div>

                {tournaments.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tournaments</h3>
                    <p className="text-gray-600">Check back soon for upcoming tournaments!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournaments.map((tournament) => (
                      <Link
                        key={tournament.id}
                        href={`/tournaments/${tournament.id}`}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{gameTypeEmojis[tournament.game_type] || '🎮'}</span>
                            <span className="font-bold text-gray-900">{tournament.name}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            tournament.status === 'open'
                              ? 'bg-green-100 text-green-700'
                              : tournament.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tournament.status === 'open' ? 'Open' : 
                             tournament.status === 'in_progress' ? 'In Progress' : 
                             tournament.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{tournament.current_participants}/{tournament.max_participants}</span>
                          </div>
                          {tournament.prize_pool && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <Trophy className="w-4 h-4" />
                              <span>${tournament.prize_pool}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Global Leaderboard</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                    <div>Rank</div>
                    <div>Player</div>
                    <div className="text-center">ELO Rating</div>
                    <div className="text-center">Win Rate</div>
                  </div>
                  {[
                    { rank: 1, name: 'ChessMaster99', elo: 1847, winRate: 72 },
                    { rank: 2, name: 'StrategyKing', elo: 1798, winRate: 68 },
                    { rank: 3, name: 'GameWizard', elo: 1756, winRate: 65 },
                    { rank: 4, name: 'TacticalPro', elo: 1723, winRate: 63 },
                    { rank: 5, name: 'MindGamer', elo: 1701, winRate: 61 },
                  ].map((player) => (
                    <div key={player.rank} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 items-center">
                      <div className="flex items-center gap-2">
                        {player.rank <= 3 ? (
                          <span className="text-xl">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-gray-500 font-medium">#{player.rank}</span>
                        )}
                      </div>
                      <div className="font-medium text-gray-900">{player.name}</div>
                      <div className="text-center font-semibold text-purple-600">{player.elo}</div>
                      <div className="text-center text-gray-600">{player.winRate}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
