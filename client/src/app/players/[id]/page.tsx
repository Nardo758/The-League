'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Star, Trophy, Users, Calendar, TrendingUp,
  Share2, Heart, MessageSquare, Flame, Award, Clock, Target,
  ChevronRight, Camera, CheckCircle2, Medal, Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const sportEmojis: Record<string, string> = {
  golf: '⛳',
  pickleball: '🏓',
  bowling: '🎳',
  softball: '🥎',
  tennis: '🎾',
  soccer: '⚽',
  connect4: '🔴',
  chess: '♟️',
  checkers: '⬛',
  battleship: '🚢'
};

const demoPlayer = {
  id: 1,
  name: 'Alex Martinez',
  username: 'alexm',
  location: 'Phoenix, AZ',
  level: 12,
  xp: 542,
  followers: 234,
  following: 189,
  bio: 'Weekend warrior. Always up for a round. Let\'s play!',
  memberSince: 'January 2022',
  lastActive: '2 hours ago',
  sports: ['golf', 'pickleball', 'bowling'],
  quickStats: {
    totalLeagues: 15,
    activeLeagues: 3,
    eventsPlayed: 42,
    upcomingEvents: 8,
    winRate: 68,
    record: { wins: 156, losses: 72, ties: 12 },
    currentStreak: 5
  },
  sportStats: {
    golf: {
      handicap: 8.2,
      rounds: 124,
      bestScore: 76,
      avgScore: 84,
      improving: true
    },
    pickleball: {
      rating: 3.5,
      matches: 87,
      winRate: 64,
      wins: 56,
      losses: 31
    },
    bowling: {
      average: 178,
      games: 216,
      highGame: 257,
      highSeries: 689
    }
  }
};

const demoActivities = [
  { id: 1, type: 'placement', emoji: '🏆', text: 'Placed 1st in Monday Night Golf League', time: '2 days ago' },
  { id: 2, type: 'achievement', emoji: '⭐', text: 'Achieved "Eagle Eye" badge', time: '5 days ago' },
  { id: 3, type: 'score', emoji: '🎯', text: 'Posted score of 82 in Monday Night Golf League', time: '1 week ago' },
  { id: 4, type: 'joined', emoji: '🏅', text: 'Joined Wednesday Evening Scramble', time: '2 weeks ago' },
  { id: 5, type: 'win', emoji: '🎳', text: 'Won team match in Thursday Bowling League', time: '3 weeks ago' },
  { id: 6, type: 'advance', emoji: '🏓', text: 'Advanced to Round 3 in Pickleball Ladder', time: '3 weeks ago' }
];

const demoLeagues = {
  active: [
    { id: 1, sport: 'golf', name: 'Monday Night Golf League', venue: 'Desert Ridge Golf Club', season: 'Spring 2025', week: '8 of 12', standing: '3rd of 32 players (Flight A)', record: '6-2', avgNet: 72.3 },
    { id: 2, sport: 'pickleball', name: 'Weekend Pickleball Ladder', venue: 'Metro Pickleball Center', season: 'Winter 2025', week: '6 of 12', standing: '7th of 24 players', record: '18-12', winRate: 60 },
    { id: 3, sport: 'bowling', name: 'Thursday Night Bowling', venue: 'Sunset Lanes', season: 'Winter 2024-25', week: '14 of 20', standing: '2nd of 12 teams', team: 'Strike Force', avg: 182 }
  ],
  completed: [
    { id: 4, sport: 'golf', name: 'Fall 2024 Golf League', venue: 'Desert Ridge', place: '1st', placeEmoji: '🥇', details: 'Flight A • 10-2 record' },
    { id: 5, sport: 'bowling', name: 'Summer 2024 Bowling League', venue: 'Sunset Lanes', place: '2nd', placeEmoji: '🥈', details: 'Team • 178 avg' },
    { id: 6, sport: 'golf', name: 'Spring 2024 Golf League', venue: 'Desert Ridge', place: '4th', placeEmoji: '', details: 'Flight B • 8-4 record' }
  ]
};

const demoAchievements = [
  { id: 1, name: 'Eagle Eye', emoji: '🦅', description: 'Score an eagle in a league round', earned: true, date: '5 days ago' },
  { id: 2, name: 'Hot Streak', emoji: '🔥', description: 'Win 5 matches in a row', earned: true, date: '2 weeks ago' },
  { id: 3, name: 'Century Club', emoji: '💯', description: 'Play in 100 league events', earned: true, date: '1 month ago' },
  { id: 4, name: 'Multi-Sport', emoji: '🏆', description: 'Compete in 3+ different sports', earned: true, date: '6 months ago' },
  { id: 5, name: 'Perfect Game', emoji: '🎳', description: 'Bowl a 300 game', earned: false, progress: 85 },
  { id: 6, name: 'Hole in One', emoji: '🕳️', description: 'Make a hole-in-one in league play', earned: false, progress: 0 }
];

const demoRecentRounds = [
  { date: 'Dec 23', course: 'Desert Ridge', score: 82, diff: '+10.5', notes: 'League match' },
  { date: 'Dec 16', course: 'Papago', score: 88, diff: '+13.2', notes: 'Casual round' },
  { date: 'Dec 9', course: 'Desert Ridge', score: 79, diff: '+8.9', notes: 'Personal best!' },
  { date: 'Dec 2', course: 'Wildfire East', score: 85, diff: '+11.8', notes: 'Tournament' },
  { date: 'Nov 25', course: 'Desert Ridge', score: 84, diff: '+10.8', notes: 'League match' }
];

const demoConnections = [
  { id: 1, name: 'Sarah Williams', mutual: 12, sports: ['golf', 'pickleball'] },
  { id: 2, name: 'Mike Johnson', mutual: 8, sports: ['golf'] },
  { id: 3, name: 'Jennifer Moore', mutual: 5, sports: ['pickleball', 'bowling'] }
];

type TabType = 'activity' | 'stats' | 'leagues' | 'achievements' | 'about';

export default function PlayerProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('golf');
  const [leagueFilter, setLeagueFilter] = useState('all');

  const player = demoPlayer;
  const isOwnProfile = false;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'activity', label: 'Activity' },
    { id: 'stats', label: 'Stats' },
    { id: 'leagues', label: 'Leagues' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'about', label: 'About' }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/search?tab=players" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Link>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cover Photo */}
        <div className="relative h-32 md:h-48 bg-gradient-to-br from-emerald-600/30 to-blue-600/30 rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full border-4 border-[#0d0d0d] flex items-center justify-center text-white text-3xl md:text-4xl font-bold">
              {player.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-[#1a1a1a] rounded-b-2xl p-6 pt-16 border-x border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{player.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                <span>@{player.username}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {player.location}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Level {player.level}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  {player.xp} XP
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-white">{player.followers}</span> followers
                </span>
                <span className="text-gray-500">
                  <span className="font-semibold text-white">{player.following}</span> following
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {player.sports.map(sport => (
                  <span key={sport} className="px-3 py-1 bg-[#252525] text-gray-300 rounded-full text-sm flex items-center gap-1.5">
                    <span>{sportEmojis[sport]}</span>
                    <span className="capitalize">{sport}</span>
                  </span>
                ))}
              </div>

              <p className="text-gray-300 italic mb-4">"{player.bio}"</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Member since: {player.memberSince}</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Last active: {player.lastActive}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-pink-600/20 text-pink-400 border border-pink-600/30' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pink-400' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button className="px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
          <h2 className="text-sm font-medium text-gray-400 mb-4">QUICK STATS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-400">Leagues</span>
              </div>
              <p className="text-2xl font-bold text-white">{player.quickStats.totalLeagues}</p>
              <p className="text-sm text-gray-500">{player.quickStats.activeLeagues} Active</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-400">Events</span>
              </div>
              <p className="text-2xl font-bold text-white">{player.quickStats.eventsPlayed}</p>
              <p className="text-sm text-gray-500">{player.quickStats.upcomingEvents} Upcoming</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-gray-400">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-white">{player.quickStats.winRate}%</p>
              <p className="text-sm text-gray-500">{player.quickStats.record.wins}-{player.quickStats.record.losses}-{player.quickStats.record.ties}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-400">Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{player.quickStats.currentStreak} wins</p>
              <p className="text-sm text-gray-500">Current</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 bg-[#0d0d0d] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-500 border-emerald-500'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {demoActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                      <span className="text-2xl">{activity.emoji}</span>
                      <div className="flex-1">
                        <p className="text-gray-300">{activity.text}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  Load More Activity
                </button>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  Recent Photos
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-[#252525] rounded-lg flex items-center justify-center text-gray-600">
                      <Camera className="w-6 h-6" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  View All Photos (142)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-400">SPORTS PLAYED</h2>
              
              {/* Golf Stats */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">{sportEmojis.golf}</span>
                  Golf
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Handicap</span>
                    <span className="text-white flex items-center gap-1">
                      {player.sportStats.golf.handicap}
                      {player.sportStats.golf.improving && <TrendingUp className="w-3 h-3 text-green-500" />}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rounds</span>
                    <span className="text-white">{player.sportStats.golf.rounds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best</span>
                    <span className="text-white">{player.sportStats.golf.bestScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg</span>
                    <span className="text-white">{player.sportStats.golf.avgScore}</span>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  View Golf Stats
                </button>
              </div>

              {/* Pickleball Stats */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">{sportEmojis.pickleball}</span>
                  Pickleball
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-white">{player.sportStats.pickleball.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Matches</span>
                    <span className="text-white">{player.sportStats.pickleball.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white">{player.sportStats.pickleball.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win/Loss</span>
                    <span className="text-white">{player.sportStats.pickleball.wins}-{player.sportStats.pickleball.losses}</span>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  View PB Stats
                </button>
              </div>

              {/* Bowling Stats */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="text-lg">{sportEmojis.bowling}</span>
                  Bowling
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Average</span>
                    <span className="text-white">{player.sportStats.bowling.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Games</span>
                    <span className="text-white">{player.sportStats.bowling.games}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Game</span>
                    <span className="text-white">{player.sportStats.bowling.highGame}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High Series</span>
                    <span className="text-white">{player.sportStats.bowling.highSeries}</span>
                  </div>
                </div>
                <button className="w-full mt-3 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  View Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="golf">Golf</option>
                <option value="pickleball">Pickleball</option>
                <option value="bowling">Bowling</option>
              </select>
              <select className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500">
                <option>All Time</option>
                <option>This Year</option>
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
              </select>
            </div>

            {selectedSport === 'golf' && (
              <>
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-2xl">{sportEmojis.golf}</span>
                    Golf Statistics
                  </h2>

                  <h3 className="font-semibold text-gray-400 mb-4">Overall Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Handicap</p>
                      <p className="text-2xl font-bold text-white">{player.sportStats.golf.handicap}</p>
                      <p className="text-xs text-green-400 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Improving
                      </p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Rounds</p>
                      <p className="text-2xl font-bold text-white">{player.sportStats.golf.rounds}</p>
                      <p className="text-xs text-gray-500">This year</p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Avg Score</p>
                      <p className="text-2xl font-bold text-white">{player.sportStats.golf.avgScore}</p>
                      <p className="text-xs text-gray-500">Last 20</p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Best</p>
                      <p className="text-2xl font-bold text-white">{player.sportStats.golf.bestScore}</p>
                      <p className="text-xs text-gray-500">Career</p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-400 mb-4">Scoring Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Eagles</p>
                      <p className="text-xl font-bold text-white">12</p>
                      <p className="text-xs text-gray-500">0.5%</p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Birdies</p>
                      <p className="text-xl font-bold text-white">287</p>
                      <p className="text-xs text-gray-500">13%</p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Pars</p>
                      <p className="text-xl font-bold text-white">892</p>
                      <p className="text-xs text-gray-500">40%</p>
                    </div>
                    <div className="bg-[#252525] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Bogeys+</p>
                      <p className="text-xl font-bold text-white">1,041</p>
                      <p className="text-xs text-gray-500">46.5%</p>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-400 mb-4">Course Management</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Fairways Hit</span>
                      <span className="text-white">68% (842/1,240)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">GIR</span>
                      <span className="text-white">52% (649/1,240)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Putts/Round</span>
                      <span className="text-white">32.4 average</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Sand Saves</span>
                      <span className="text-white">41% (123/300)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Up & Downs</span>
                      <span className="text-white">38% (285/750)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Performance Trends
                  </h2>
                  <div className="h-48 bg-[#252525] rounded-lg flex items-center justify-center text-gray-500">
                    [Handicap trend chart placeholder]
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-500" />
                    Recent Rounds (Last 5)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Course</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Score</th>
                          <th className="text-right py-3 px-4 text-gray-400 font-medium">Diff</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoRecentRounds.map((round, idx) => (
                          <tr key={idx} className="border-b border-gray-800 hover:bg-[#252525]">
                            <td className="py-3 px-4 text-gray-300">{round.date}</td>
                            <td className="py-3 px-4 text-white">{round.course}</td>
                            <td className="py-3 px-4 text-right text-white font-medium">{round.score}</td>
                            <td className="py-3 px-4 text-right text-gray-400">{round.diff}</td>
                            <td className="py-3 px-4 text-gray-500">{round.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button className="w-full mt-4 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                    View All Rounds (124)
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                {['all', 'active', 'completed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLeagueFilter(filter)}
                    className={`px-4 py-2 rounded text-sm capitalize ${
                      leagueFilter === filter 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {(leagueFilter === 'all' || leagueFilter === 'active') && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active Leagues ({demoLeagues.active.length})
                </h2>
                <div className="space-y-4">
                  {demoLeagues.active.map((league) => (
                    <div key={league.id} className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            <span>{sportEmojis[league.sport]}</span>
                            {league.name}
                          </h3>
                          <p className="text-sm text-gray-400">{league.venue}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div>
                          <span className="text-gray-500">Season</span>
                          <p className="text-gray-300">{league.season} &bull; Week {league.week}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Standing</span>
                          <p className="text-gray-300">{league.standing}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Record</span>
                          <p className="text-gray-300">{league.record}{league.winRate ? ` (${league.winRate}%)` : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{league.avgNet ? 'Avg Net' : league.avg ? 'Average' : ''}</span>
                          <p className="text-gray-300">{league.avgNet || league.avg || ''}</p>
                        </div>
                      </div>
                      <Link 
                        href={`/leagues/${league.id}`}
                        className="inline-block mt-3 text-emerald-500 text-sm hover:underline"
                      >
                        View League Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(leagueFilter === 'all' || leagueFilter === 'completed') && (
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-gray-500" />
                  Completed Leagues ({demoLeagues.completed.length})
                </h2>
                <div className="space-y-3">
                  {demoLeagues.completed.map((league) => (
                    <div key={league.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{sportEmojis[league.sport]}</span>
                        <div>
                          <p className="text-white font-medium">{league.name}</p>
                          <p className="text-sm text-gray-500">{league.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{league.placeEmoji}</span>
                        <span className="text-gray-300">{league.place} Place</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Achievements</h2>
                  <p className="text-gray-400 text-sm">{player.xp} Total XP &bull; Level {player.level} &bull; {demoAchievements.filter(a => a.earned).length} Badges Earned</p>
                </div>
              </div>

              <h3 className="font-semibold text-gray-400 mb-4">EARNED BADGES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {demoAchievements.filter(a => a.earned).map((achievement) => (
                  <div key={achievement.id} className="bg-[#252525] rounded-lg p-4 border border-gray-700 flex items-start gap-4">
                    <span className="text-3xl">{achievement.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-white">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Earned {achievement.date}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                  </div>
                ))}
              </div>

              <h3 className="font-semibold text-gray-400 mb-4">IN PROGRESS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoAchievements.filter(a => !a.earned).map((achievement) => (
                  <div key={achievement.id} className="bg-[#252525] rounded-lg p-4 border border-gray-700 flex items-start gap-4 opacity-70">
                    <span className="text-3xl grayscale">{achievement.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{achievement.name}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.progress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">{achievement.progress}% complete</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                XP Milestones
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <span className="text-gray-300">Level 10 - Competitor</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <span className="text-gray-300">500 XP - Half Century</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-600/10 rounded-lg border border-emerald-600/30">
                  <span className="text-white">Level 15 - Veteran (58 XP to go)</span>
                  <span className="text-emerald-400 text-sm">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">About {player.name}</h2>
                <p className="text-gray-300 mb-4">"{player.bio}"</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-300">{player.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-300">Member since {player.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-300">Last active {player.lastActive}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">Sports & Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {player.sports.map(sport => (
                    <span key={sport} className="px-4 py-2 bg-[#252525] text-gray-300 rounded-lg flex items-center gap-2">
                      <span className="text-lg">{sportEmojis[sport]}</span>
                      <span className="capitalize">{sport}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Mutual Connections
                </h2>
                <div className="space-y-3">
                  {demoConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-medium">
                          {connection.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white font-medium">{connection.name}</p>
                          <p className="text-xs text-gray-500">{connection.mutual} mutual connections</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {connection.sports.map(sport => (
                          <span key={sport} className="text-sm">{sportEmojis[sport]}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">
                  View All Connections
                </button>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">Shared Leagues</h2>
                <p className="text-gray-400 text-sm">You and {player.name.split(' ')[0]} are both in:</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-[#252525] rounded">
                    <span>{sportEmojis.golf}</span>
                    <span className="text-gray-300 text-sm">Monday Night Golf League</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
