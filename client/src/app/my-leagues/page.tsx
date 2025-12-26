'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Trophy, Calendar, BarChart3, ChevronRight, Plus, Gamepad2, History, MapPin, Clock, Users, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

interface LeagueItem {
  id: number;
  name: string;
  season_id?: number;
  season_name?: string;
  role: string;
  status?: string;
  venue_id?: number;
  type?: string;
}

interface ScheduleItem {
  id: number;
  game_type: string;
  opponent_id: number | null;
  status: string;
  created_at: string | null;
}

interface StatsData {
  total_games: number;
  wins: number;
  losses: number;
  win_rate: number;
  online_games_played: number;
  leagues_joined: number;
}

interface OnlineGame {
  id: number;
  game_type: string;
  status: string;
  winner_id: number | null;
  player1_id: number;
  player2_id: number | null;
}

const sportEmojis: Record<string, string> = {
  golf: '⛳',
  pickleball: '🏓',
  bowling: '🎳',
  softball: '🥎',
  tennis: '🎾',
  soccer: '⚽',
};

const demoBuddiesPlaying = [
  {
    id: 1,
    player: { id: 2, name: 'Sarah Williams', avatar: 'SW' },
    sport: 'golf',
    title: 'Casual Saturday Round',
    venue: 'Desert Ridge Golf Club',
    date: 'Sat, Jan 11',
    time: '7:00 AM',
    openSpots: 2,
    totalSpots: 4,
    participants: ['Sarah Williams', 'Mike Chen'],
    note: 'Looking for 2 more to fill the foursome!'
  },
  {
    id: 2,
    player: { id: 3, name: 'Mike Johnson', avatar: 'MJ' },
    sport: 'pickleball',
    title: 'Open Play Session',
    venue: 'Metro Pickleball Center',
    date: 'Sun, Jan 12',
    time: '3:00 PM',
    openSpots: 3,
    totalSpots: 4,
    participants: ['Mike Johnson'],
    note: 'All skill levels welcome!'
  },
  {
    id: 3,
    player: { id: 4, name: 'Jennifer Moore', avatar: 'JM' },
    sport: 'bowling',
    title: 'Friday Night Bowling',
    venue: 'Sunset Lanes',
    date: 'Fri, Jan 10',
    time: '8:00 PM',
    openSpots: 4,
    totalSpots: 6,
    participants: ['Jennifer Moore', 'Tom Davis'],
    note: 'Cosmic bowling night!'
  }
];

const tabs = [
  { id: 'active', label: 'Active Leagues', icon: Trophy },
  { id: 'schedule', label: 'My Schedule', icon: Calendar },
  { id: 'stats', label: 'My Stats', icon: BarChart3 },
  { id: 'history', label: 'History', icon: History },
];

export default function MyLeaguesPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [leagues, setLeagues] = useState<LeagueItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [onlineGames, setOnlineGames] = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaguesRes, scheduleRes, statsRes, gamesRes] = await Promise.all([
        api.get<{ items: LeagueItem[] }>('/users/me/leagues').catch(() => ({ items: [] })),
        api.get<{ items: ScheduleItem[] }>('/users/me/schedule').catch(() => ({ items: [] })),
        api.get<StatsData>('/users/me/stats').catch(() => null),
        api.get<{ items: OnlineGame[] }>('/online-games?limit=10').catch(() => ({ items: [] })),
      ]);
      setLeagues(leaguesRes.items || []);
      setSchedule(scheduleRes.items || []);
      setStats(statsRes);
      setOnlineGames(gamesRes.items || []);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  };

  const activeLeagues = leagues.filter(l => l.type !== 'venue_membership' && l.role === 'participant');
  const venueMemberships = leagues.filter(l => l.type === 'venue_membership');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to view your leagues</h1>
            <p className="text-gray-500 mb-6">
              Track your leagues, schedule, and stats all in one place.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Leagues</h1>
              <p className="text-gray-500 mt-1">Track your leagues, schedule, and performance</p>
            </div>
            <Link
              href="/search?tab=leagues"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Join League
            </Link>
          </div>

          <div className="flex items-center gap-1 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {activeTab === 'active' && (
              <div className="space-y-6">
                {activeLeagues.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        My Leagues ({activeLeagues.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {activeLeagues.map((league) => (
                        <Link
                          key={league.id}
                          href={`/leagues/${league.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{league.name}</p>
                            <p className="text-sm text-gray-500">
                              {league.season_name} - {league.role}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {venueMemberships.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        Venue Memberships ({venueMemberships.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {venueMemberships.map((membership) => (
                        <Link
                          key={membership.venue_id}
                          href={`/venues/${membership.venue_id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">Venue #{membership.venue_id}</p>
                            <p className="text-sm text-gray-500 capitalize">{membership.role}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buddies Playing Section */}
                {demoBuddiesPlaying.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Friends Looking to Play
                      </h2>
                      <span className="text-sm text-gray-500">{demoBuddiesPlaying.length} open invites</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {demoBuddiesPlaying.map((game) => (
                        <div key={game.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{sportEmojis[game.sport] || '🏆'}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{game.title}</p>
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                                    {game.openSpots} spots open
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-0.5">{game.venue}</p>
                                <p className="text-sm text-gray-500">{game.date} at {game.time}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Link href={`/players/${game.player.id}`} className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                      {game.player.avatar}
                                    </div>
                                    <span className="text-sm text-blue-600 hover:underline">{game.player.name}</span>
                                  </Link>
                                  {game.participants.length > 1 && (
                                      <span className="text-gray-400 text-xs">+{game.participants.length - 1} going</span>
                                    )}
                                </div>
                                {game.note && (
                                  <p className="text-sm text-gray-500 mt-2 italic">"{game.note}"</p>
                                )}
                              </div>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                              <UserPlus className="w-4 h-4" />
                              Request to Join
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-green-600" />
                      Online Games
                    </h2>
                    <Link href="/play" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All
                    </Link>
                  </div>
                  {onlineGames.length === 0 ? (
                    <div className="p-8 text-center">
                      <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No active online games</p>
                      <Link href="/play" className="text-blue-600 text-sm font-medium mt-2 inline-block">
                        Start a game
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {onlineGames.slice(0, 5).map((game) => (
                        <Link
                          key={game.id}
                          href={`/games/${game.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {game.game_type === 'chess' ? '♟️' : 
                               game.game_type === 'checkers' ? '🏁' :
                               game.game_type === 'battleship' ? '🚢' : '🎮'}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {game.game_type.replace('_', ' ')} Match
                              </p>
                              <p className="text-sm text-gray-500">Game #{game.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.status === 'in_progress' 
                                ? 'bg-green-100 text-green-700' 
                                : game.status === 'completed'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {game.status.replace('_', ' ')}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {activeLeagues.length === 0 && venueMemberships.length === 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Active Leagues</h3>
                    <p className="text-gray-500 mb-4">Join a league to start competing!</p>
                    <Link
                      href="/search?tab=leagues"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Find Leagues
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                {schedule.length > 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Upcoming Games ({schedule.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {schedule.map((item) => (
                        <Link
                          key={item.id}
                          href={`/games/${item.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {item.game_type === 'chess' ? '♟️' : 
                               item.game_type === 'checkers' ? '🏁' :
                               item.game_type === 'battleship' ? '🚢' : '🎮'}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {item.game_type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Pending'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">No Upcoming Games</h3>
                    <p className="text-gray-500">Your schedule will appear here once you join leagues or start games</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Wins</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.wins || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Games Played</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.total_games || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Win Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.win_rate || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Online Games</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Games Played</span>
                        <span className="font-medium text-gray-900">{stats?.online_games_played || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Wins</span>
                        <span className="font-medium text-green-600">{stats?.wins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Losses</span>
                        <span className="font-medium text-red-600">{stats?.losses || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">League Participation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Leagues Joined</span>
                        <span className="font-medium text-gray-900">{stats?.leagues_joined || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Active Leagues</span>
                        <span className="font-medium text-gray-900">{activeLeagues.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Venue Memberships</span>
                        <span className="font-medium text-gray-900">{venueMemberships.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">No History Yet</h3>
                <p className="text-gray-500">Your past seasons and completed games will appear here</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
