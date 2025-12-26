'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Gamepad2, Trophy, Users, Zap, ChevronRight, Eye, Clock, Crown } from 'lucide-react';
import { api } from '@/lib/api';

interface OnlineGame {
  id: number;
  game_type: string;
  status: string;
  player1_id: number;
  player2_id: number | null;
  created_at: string;
}

interface Tournament {
  id: number;
  name: string;
  game_type: string;
  status: string;
  max_participants: number;
}

const gameTypes = [
  { id: 'chess', name: 'Chess', emoji: '♟️', description: 'Classic strategy game', color: 'bg-amber-100 text-amber-700' },
  { id: 'checkers', name: 'Checkers', emoji: '🏁', description: 'Jump and capture', color: 'bg-red-100 text-red-700' },
  { id: 'connect_four', name: 'Connect 4', emoji: '🔴', description: 'Line up four in a row', color: 'bg-blue-100 text-blue-700' },
  { id: 'battleship', name: 'Battleship', emoji: '🚢', description: 'Naval combat strategy', color: 'bg-cyan-100 text-cyan-700' },
];

export default function PlayPage() {
  const { user } = useAuth();
  const [liveGames, setLiveGames] = useState<OnlineGame[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gamesRes, tournamentsRes] = await Promise.all([
        api.get<{ items: OnlineGame[] }>('/online-games?status=in_progress&limit=10').catch(() => ({ items: [] })),
        api.get<{ items: Tournament[] }>('/tournaments?status=registration&limit=5').catch(() => ({ items: [] })),
      ]);
      setLiveGames(gamesRes.items || []);
      setTournaments(tournamentsRes.items || []);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Play Online</h1>
          </div>
          <p className="text-purple-200 text-lg max-w-2xl">
            Challenge players worldwide in classic strategy games. Quick matches, ranked play, and tournaments await.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Play
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gameTypes.map((game) => (
                  <Link
                    key={game.id}
                    href={user ? `/games?create=${game.id}` : '/login'}
                    className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:shadow-lg hover:border-purple-300 transition-all text-center group"
                  >
                    <span className="text-4xl block mb-2">{game.emoji}</span>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">{game.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{game.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {liveGames.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Live Games
                </h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {liveGames.slice(0, 6).map((game) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {game.game_type === 'chess' ? '♟️' : 
                             game.game_type === 'checkers' ? '🏁' :
                             game.game_type === 'connect_four' ? '🔴' :
                             game.game_type === 'battleship' ? '🚢' : '🎮'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {game.game_type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Player {game.player1_id} vs Player {game.player2_id || '...'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">Watch</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Open Tournaments</h3>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="p-6 text-center">
                  <Trophy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No open tournaments</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tournaments.map((tournament) => (
                    <Link
                      key={tournament.id}
                      href={`/tournaments/${tournament.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{tournament.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{tournament.game_type?.replace('_', ' ')}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900">Leaderboard</h3>
              </div>
              <Link
                href="/channels/online-games"
                className="block text-center py-3 text-purple-600 font-medium text-sm hover:text-purple-700"
              >
                View Rankings
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Create a Tournament</h3>
              <p className="text-purple-200 text-sm mb-4">
                Organize your own competition and invite players.
              </p>
              <Link
                href={user ? '/tournaments/create' : '/login'}
                className="block text-center py-2 bg-white text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
