'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Calendar, Trophy, Users, DollarSign, Star, Clock,
  Share2, Heart, CheckCircle2, Flame, AlertTriangle, Search, ArrowUpDown,
  Phone, Mail, ExternalLink, Navigation, ChevronRight, Award, Target
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
  battleship: '🚢',
  default: '🏆'
};

const demoTournament = {
  id: 1,
  name: 'Spring Championship',
  sport: 'golf',
  sportName: 'Golf',
  format: '4-Person Scramble',
  isOnline: false,
  venue: {
    id: 1,
    name: 'Desert Ridge Golf Club',
    course: 'Championship Course',
    address: '5594 E Clubhouse Dr, Phoenix, AZ 85054',
    par: 72,
    length: '7,002 yards',
    rating: '73.8',
    slope: 142
  },
  date: 'Saturday, March 15, 2025',
  time: '7:00 AM',
  status: 'registration_open',
  registeredTeams: 16,
  maxTeams: 32,
  registeredPlayers: 64,
  maxPlayers: 128,
  price: 500,
  earlyBirdPrice: 450,
  earlyBirdDeadline: 'Feb 15',
  prizePool: 5000,
  skillLevel: 'Open to all skill levels',
  followers: 342,
  registrationDeadline: 'March 10',
  description: `Join us for the Spring Championship, our premier annual golf tournament!

This 4-person scramble tournament brings together the best amateur golfers in the Phoenix area for a day of competitive fun.`,
  formatDetails: [
    '4-person scramble',
    '18 holes, shotgun start',
    'Championship Course',
    'Net scoring with handicaps'
  ],
  whatsIncluded: [
    '18 holes with cart',
    'Breakfast before round',
    'Lunch after play',
    'Range balls',
    'Goodie bag',
    'Awards ceremony',
    'Prizes for top 5 teams',
    'Contest prizes (closest to pin, long drive, hole-in-one)'
  ],
  prizes: [
    { place: '1st', amount: 2000, emoji: '🥇' },
    { place: '2nd', amount: 1200, emoji: '🥈' },
    { place: '3rd', amount: 800, emoji: '🥉' },
    { place: '4th', amount: 500, emoji: '' },
    { place: '5th', amount: 300, emoji: '' }
  ],
  requirements: [
    'Teams of 4 players',
    'All skill levels welcome',
    'Valid handicap recommended',
    'Age 18+'
  ],
  schedule: [
    { time: '6:00 AM', event: 'Registration & check-in opens' },
    { time: '6:30 AM', event: 'Breakfast service begins' },
    { time: '6:45 AM', event: 'Rules meeting & team photos' },
    { time: '7:00 AM', event: 'Shotgun start (all teams tee off)' },
    { time: '11:30 AM', event: 'Expected finish time' },
    { time: '12:00 PM', event: 'Lunch service begins' },
    { time: '12:30 PM', event: 'Awards ceremony' },
    { time: '1:30 PM', event: 'Event concludes' }
  ],
  organizer: {
    name: 'Sarah Chen',
    title: 'Head Golf Professional',
    organization: 'Desert Ridge Golf Club',
    email: 'sarah.chen@desertridge.com',
    phone: '(480) 333-3335'
  },
  cancellationPolicy: [
    'Full refund until Feb 28',
    '50% refund until Mar 7',
    'No refunds after Mar 7',
    'Weather cancellation: full refund'
  ],
  registrationSteps: [
    'Team captain creates team profile',
    'Add 3 additional team members (min 4, max 4)',
    'Submit team handicaps (optional but recommended)',
    'Complete payment ($500 or $450 early bird)',
    'Sign waiver and tournament rules agreement'
  ],
  pastTournaments: [
    { name: 'Spring 2024', teams: 32, winningScore: '-18' },
    { name: 'Fall 2023', teams: 28, winningScore: '-16' },
    { name: 'Spring 2023', teams: 30, winningScore: '-19' }
  ],
  rules: [
    'USGA Rules of Golf apply',
    'Local rules posted at pro shop',
    'All players must have established handicap or play scratch',
    'Best ball format: each shot from best position',
    'All players must tee off',
    'Minimum 2 drives per player required',
    'Gimme putts within 2 feet',
    'Ball must be marked before moving',
    'No mulligans unless purchased',
    'Range finders permitted (no slope)',
    'Cart path only where marked',
    'Ready golf encouraged - max 40 seconds per shot'
  ]
};

const demoTeams = [
  { id: 1, name: 'Desert Eagles', captain: 'Mike Johnson', avgHandicap: 12.5, registeredDate: 'Jan 5, 2025', players: ['Mike Johnson', 'Dave Smith', 'Tom Wilson', 'Chris Brown'] },
  { id: 2, name: 'Fairway Flyers', captain: 'Sarah Williams', avgHandicap: 15.2, registeredDate: 'Jan 8, 2025', players: ['Sarah Williams', 'Lisa Chen', 'Amy Davis', 'Kim Lee'] },
  { id: 3, name: 'The Bogey Boys', captain: 'Robert Taylor', avgHandicap: 18.0, registeredDate: 'Jan 10, 2025', players: ['Robert Taylor', 'James Miller', 'John Davis', 'Steve Anderson'] },
  { id: 4, name: 'Birdie Brigade', captain: 'Jennifer Moore', avgHandicap: 10.8, registeredDate: 'Jan 12, 2025', players: ['Jennifer Moore', 'Michelle Garcia', 'Patricia Martinez', 'Elizabeth Robinson'] }
];

const demoBracket = {
  rounds: [
    { name: 'Quarterfinals', matches: [
      { id: 1, seed1: 1, team1: '#1 Seed', score1: null, seed2: 8, team2: '#8 Seed', score2: null, winner: null },
      { id: 2, seed1: 4, team1: '#4 Seed', score1: null, seed2: 5, team2: '#5 Seed', score2: null, winner: null },
      { id: 3, seed1: 2, team1: '#2 Seed', score1: null, seed2: 7, team2: '#7 Seed', score2: null, winner: null },
      { id: 4, seed1: 3, team1: '#3 Seed', score1: null, seed2: 6, team2: '#6 Seed', score2: null, winner: null }
    ]},
    { name: 'Semifinals', matches: [
      { id: 5, team1: 'TBD', team2: 'TBD', winner: null },
      { id: 6, team1: 'TBD', team2: 'TBD', winner: null }
    ]},
    { name: 'Final', matches: [
      { id: 7, team1: 'TBD', team2: 'TBD', winner: null }
    ]}
  ]
};

const demoResults = [
  { rank: 1, team: 'Desert Eagles', score: -18, players: 'Johnson, Smith, Wilson, Brown' },
  { rank: 2, team: 'Birdie Brigade', score: -16, players: 'Moore, Garcia, Martinez, Robinson' },
  { rank: 3, team: 'Fairway Flyers', score: -15, players: 'Williams, Chen, Davis, Lee' },
  { rank: 4, team: 'The Bogey Boys', score: -12, players: 'Taylor, Miller, Davis, Anderson' }
];

type TabType = 'overview' | 'bracket' | 'participants' | 'schedule' | 'rules' | 'results';

export default function TournamentDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('registration');

  const tournament = demoTournament;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'bracket', label: 'Bracket' },
    { id: 'participants', label: 'Participants' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'rules', label: 'Rules' },
    { id: 'results', label: 'Results' }
  ];

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'registration_open':
        return <span className="px-3 py-1 bg-red-600/20 text-red-400 text-sm font-medium rounded-full flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>REGISTRATION OPEN</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm font-medium rounded-full flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>IN PROGRESS</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-sm font-medium rounded-full">COMPLETED</span>;
      default:
        return null;
    }
  };

  const capacityPercentage = (tournament.registeredTeams / tournament.maxTeams) * 100;

  const filteredTeams = demoTeams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.captain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/search?tab=tournaments" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4">
            <span className="text-5xl">{sportEmojis[tournament.sport] || sportEmojis.default}</span>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-[#1a1a1a] rounded-b-2xl p-6 border-x border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{tournament.name}</h1>
                {getStatusBadge()}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">{sportEmojis[tournament.sport]}</span>
                  {tournament.sportName} &bull; {tournament.format}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                <Link href={`/venues/${tournament.venue.id}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {tournament.venue.name}
                </Link>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  {tournament.date} &bull; {tournament.time}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {tournament.registeredPlayers}/{tournament.maxPlayers} players ({tournament.registeredTeams}/{tournament.maxTeams} teams)
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  ${tournament.price}/team
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  ${tournament.prizePool.toLocaleString()} prize pool
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-emerald-500" />
                  {tournament.skillLevel}
                </span>
              </div>

              {tournament.earlyBirdPrice && (
                <div className="flex items-center gap-2 text-orange-400 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  Early bird pricing ends {tournament.earlyBirdDeadline} - Save ${tournament.price - tournament.earlyBirdPrice}!
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                Register Team
                <span className="text-emerald-200">${tournament.earlyBirdPrice || tournament.price}</span>
              </button>
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-pink-600/20 text-pink-400 border border-pink-600/30' 
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pink-400' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
                <span className="text-gray-500 text-sm">{tournament.followers}</span>
              </button>
              <button className="px-4 py-3 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Registration Deadline Banner */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-600/30">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Registration closes {tournament.registrationDeadline} or when full</span>
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Details & Quick Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-4">Tournament Details</h2>
                  <p className="text-gray-300 whitespace-pre-line mb-6">{tournament.description}</p>
                  
                  <h3 className="font-semibold text-white mb-3">Tournament Format</h3>
                  <ul className="space-y-2 mb-6">
                    {tournament.formatDetails.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-semibold text-white mb-3">What's Included</h3>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {tournament.whatsIncluded.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <h3 className="font-semibold text-white mb-3">Prize Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {tournament.prizes.map((prize) => (
                      <div key={prize.place} className="bg-[#252525] rounded-lg p-3 text-center">
                        <span className="text-lg">{prize.emoji}</span>
                        <p className="text-sm text-gray-400">{prize.place} Place</p>
                        <p className="text-white font-semibold">${prize.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-semibold text-white mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {tournament.requirements.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Status
                  </h3>
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Registration Open
                  </div>
                  <p className="text-sm text-gray-400">Closes: {tournament.registrationDeadline}</p>
                  <p className="text-sm text-gray-500">or when full</p>
                </div>

                {/* Capacity */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Capacity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Teams</span>
                      <span className="text-white">{tournament.registeredTeams}/{tournament.maxTeams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players</span>
                      <span className="text-white">{tournament.registeredPlayers}/{tournament.maxPlayers}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">{Math.round(capacityPercentage)}% Full</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${capacityPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Pricing
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Regular</span>
                      <span className="text-white">${tournament.price}/team</span>
                    </div>
                    {tournament.earlyBirdPrice && (
                      <div className="flex justify-between">
                        <span className="text-emerald-400">Early Bird</span>
                        <span className="text-emerald-400">${tournament.earlyBirdPrice}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">(until {tournament.earlyBirdDeadline})</p>
                    <p className="text-xs text-gray-500">= ${tournament.earlyBirdPrice ? tournament.earlyBirdPrice / 4 : tournament.price / 4}/player</p>
                    <p className="text-xs text-gray-500">Max 4 per team</p>
                  </div>
                </div>

                {/* Prize Pool */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Prize Pool
                  </h3>
                  <p className="text-2xl font-bold text-white">${tournament.prizePool.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Funded by entry fees + sponsors</p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Tournament Schedule
              </h2>
              <p className="text-gray-400 mb-4">{tournament.date}</p>
              <div className="space-y-3">
                {tournament.schedule.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="text-emerald-400 font-mono text-sm w-24 flex-shrink-0">{item.time}</span>
                    <span className="text-gray-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Venue Info */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Venue Information
              </h2>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">{tournament.venue.name}</p>
                  <p className="text-gray-400">{tournament.venue.course}</p>
                  <p className="text-gray-500 text-sm">{tournament.venue.address}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Par: {tournament.venue.par}</span>
                    <span>Length: {tournament.venue.length}</span>
                    <span>Rating: {tournament.venue.rating} / Slope: {tournament.venue.slope}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/venues/${tournament.venue.id}`}
                    className="px-4 py-2 bg-[#252525] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors border border-gray-700"
                  >
                    View Venue
                  </Link>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                Tournament Director
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-medium text-lg">
                  {tournament.organizer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">{tournament.organizer.name}</p>
                  <p className="text-gray-400 text-sm">{tournament.organizer.title}</p>
                  <p className="text-gray-500 text-sm">{tournament.organizer.organization}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                    <a href={`mailto:${tournament.organizer.email}`} className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-400">
                      <Mail className="w-4 h-4" />
                      {tournament.organizer.email}
                    </a>
                    <a href={`tel:${tournament.organizer.phone}`} className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-400">
                      <Phone className="w-4 h-4" />
                      {tournament.organizer.phone}
                    </a>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#252525] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors border border-gray-700">
                  Contact Organizer
                </button>
              </div>
            </div>

            {/* Registration Requirements */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Registration Requirements</h2>
              <p className="text-gray-400 mb-4">To register your team:</p>
              <ol className="space-y-2 mb-6">
                {tournament.registrationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="w-6 h-6 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {idx + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-gray-500 mb-4">Payment accepted via credit card (Stripe)</p>
              
              <h3 className="font-semibold text-white mb-3">Cancellation Policy</h3>
              <ul className="space-y-2">
                {tournament.cancellationPolicy.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Past Tournaments */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Past Tournaments</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tournament.pastTournaments.map((past) => (
                  <div key={past.name} className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                    <p className="text-white font-semibold">{past.name}</p>
                    <p className="text-gray-400 text-sm">{past.teams} teams</p>
                    <p className="text-emerald-400 text-sm">Winner: {past.winningScore}</p>
                    <button className="text-emerald-500 text-sm hover:underline mt-2">View Results</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bracket Tab */}
        {activeTab === 'bracket' && (
          <div className="space-y-8">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-2">Tournament Bracket</h2>
              <p className="text-gray-400 mb-4">Format: Single Elimination (after shotgun round)</p>
              <p className="text-gray-500 text-sm mb-6">Top 8 teams advance to playoff bracket</p>

              <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg mb-8">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Bracket will be available after shotgun round scoring is complete (approx. 12:00 PM on March 15)</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-4">Projected Bracket (Based on current registrations)</h3>
              
              {/* Bracket Visualization */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-4 gap-8">
                    {demoBracket.rounds.map((round, roundIdx) => (
                      <div key={round.name}>
                        <h4 className="text-sm font-medium text-gray-400 mb-4 text-center">{round.name}</h4>
                        <div className="space-y-4" style={{ marginTop: roundIdx === 1 ? '40px' : roundIdx === 2 ? '100px' : '0' }}>
                          {round.matches.map((match) => (
                            <div key={match.id} className="bg-[#252525] rounded-lg border border-gray-700 overflow-hidden">
                              <div className="px-3 py-2 border-b border-gray-700 flex justify-between items-center hover:bg-[#2a2a2a]">
                                <span className="text-gray-300 text-sm">{match.team1}</span>
                                <span className="text-gray-500 text-sm">{match.score1 ?? '-'}</span>
                              </div>
                              <div className="px-3 py-2 flex justify-between items-center hover:bg-[#2a2a2a]">
                                <span className="text-gray-300 text-sm">{match.team2}</span>
                                <span className="text-gray-500 text-sm">{match.score2 ?? '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-4 text-center">Champion</h4>
                      <div className="mt-[120px] bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-600/30 p-4 text-center">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-yellow-400 font-semibold">TBD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Phase 1: Shotgun Round (7:00 AM - 11:30 AM)</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      All 32 teams play 18 holes
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Net scoring with handicaps
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Teams ranked by net score
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Phase 2: Playoff Bracket (if applicable)</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Top 8 teams advance to playoffs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Match play format (hole-by-hole)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Championship determined by playoffs
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">If no playoffs: Winner determined by shotgun round</p>
            </div>
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Teams</h2>
                <p className="text-gray-400">{tournament.registeredTeams} Teams Registered &bull; {tournament.registeredPlayers} Players &bull; {tournament.maxTeams - tournament.registeredTeams} Spots Remaining</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="registration">Registration Date</option>
                  <option value="name">Team Name</option>
                  <option value="handicap">Avg Handicap</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTeams.map((team) => (
                <div key={team.id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm">Captain: {team.captain}</p>
                      <p className="text-gray-500 text-sm">Registered: {team.registeredDate}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{team.avgHandicap}</p>
                        <p className="text-xs text-gray-500">Avg Handicap</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{team.players.length}</p>
                        <p className="text-xs text-gray-500">Players</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">Players: {team.players.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Tournament Day Schedule</h2>
              <p className="text-gray-400 mb-6">{tournament.date}</p>
              
              <div className="relative">
                <div className="absolute left-[60px] top-0 bottom-0 w-0.5 bg-gray-700"></div>
                <div className="space-y-6">
                  {tournament.schedule.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-6">
                      <span className="text-emerald-400 font-mono text-sm w-[60px] flex-shrink-0 text-right">{item.time}</span>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 flex-shrink-0 relative z-10"></div>
                      <div className="bg-[#252525] rounded-lg p-4 flex-1 border border-gray-700">
                        <p className="text-white">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Important Dates</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Early Bird Deadline</p>
                  <p className="text-white font-semibold">{tournament.earlyBirdDeadline}</p>
                  <p className="text-emerald-400 text-sm">Save ${tournament.price - (tournament.earlyBirdPrice || tournament.price)}</p>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Registration Closes</p>
                  <p className="text-white font-semibold">{tournament.registrationDeadline}</p>
                  <p className="text-gray-500 text-sm">or when full</p>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm">Tournament Date</p>
                  <p className="text-white font-semibold">{tournament.date}</p>
                  <p className="text-gray-500 text-sm">{tournament.time} start</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-8">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Tournament Rules</h2>
              <div className="space-y-3">
                {tournament.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-600/20 text-emerald-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-gray-300">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Scoring Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">4-Person Scramble Format</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>All 4 players hit from the tee</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Team selects best shot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>All players hit from that spot</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Repeat until ball is holed</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Handicap Calculation</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Team handicap = 20% of combined handicaps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Net score = Gross score - Team handicap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>Lowest net score wins</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Contest Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Closest to Pin</h3>
                  <p className="text-gray-400 text-sm">Holes 4, 8, 12, 17 (par 3s)</p>
                  <p className="text-emerald-400 text-sm mt-2">$100 prize each</p>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Longest Drive</h3>
                  <p className="text-gray-400 text-sm">Hole 9 (must be in fairway)</p>
                  <p className="text-emerald-400 text-sm mt-2">$100 prize</p>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Hole-in-One</h3>
                  <p className="text-gray-400 text-sm">Any par 3</p>
                  <p className="text-emerald-400 text-sm mt-2">$10,000 prize (sponsored)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-8">
            <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="w-5 h-5" />
                <span>Results will be available after the tournament concludes on {tournament.date}</span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Leaderboard (Sample)</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Team</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Players</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoResults.map((result) => (
                      <tr key={result.rank} className="border-b border-gray-800 hover:bg-[#252525]">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {result.rank === 1 && <span className="text-lg">🥇</span>}
                            {result.rank === 2 && <span className="text-lg">🥈</span>}
                            {result.rank === 3 && <span className="text-lg">🥉</span>}
                            <span className={`font-medium ${result.rank <= 3 ? 'text-white' : 'text-gray-400'}`}>
                              {result.rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white font-medium">{result.team}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-400 text-sm">{result.players}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`font-bold ${result.score < 0 ? 'text-emerald-400' : 'text-white'}`}>
                            {result.score > 0 ? '+' : ''}{result.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Contest Winners (Sample)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Closest to Pin</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hole 4</span>
                      <span className="text-white">Mike Johnson - 3'4"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hole 8</span>
                      <span className="text-white">Sarah Williams - 5'2"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hole 12</span>
                      <span className="text-white">Tom Wilson - 2'8"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hole 17</span>
                      <span className="text-white">Lisa Chen - 4'1"</span>
                    </div>
                  </div>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Longest Drive</h3>
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-white">312 yards</p>
                    <p className="text-gray-400">Dave Smith</p>
                    <p className="text-emerald-400 text-sm">Hole 9</p>
                  </div>
                </div>
                <div className="bg-[#252525] rounded-lg p-4 border border-gray-700">
                  <h3 className="font-semibold text-white mb-2">Hole-in-One</h3>
                  <div className="text-center py-4">
                    <p className="text-2xl text-gray-500">None</p>
                    <p className="text-gray-500 text-sm mt-2">$10,000 carries over to next tournament</p>
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
