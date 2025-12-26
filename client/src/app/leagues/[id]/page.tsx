'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Calendar, Users, Star, DollarSign, Target, Clock,
  Share2, Heart, MessageSquare, AlertTriangle, CheckCircle2, Trophy,
  ChevronRight, ChevronLeft, Flame, User, Shield, CreditCard, CalendarPlus, Navigation,
  Phone, Mail, Globe, Wifi, Car, Coffee, Search, TrendingUp, TrendingDown,
  Minus, ThumbsUp, ThumbsDown, BadgeCheck, Filter
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LeagueDetail {
  id: number;
  name: string;
  description: string | null;
  venue_id: number;
  sport_id: number;
  is_active: boolean;
}

const sportEmojis: Record<string, string> = {
  golf: '⛳',
  pickleball: '🏓',
  bowling: '🎳',
  softball: '🥎',
  tennis: '🎾',
  soccer: '⚽',
  chess: '♟️',
  default: '🏆'
};

const demoLeague = {
  id: 1,
  name: 'Monday Night Golf League',
  sport: 'golf',
  sportName: 'Golf',
  venue: {
    id: 1,
    name: 'Desert Ridge Golf Club',
    address: '5502 E Marriott Dr, Phoenix, AZ 85054',
    phone: '(480) 293-3000',
    email: 'leagues@desertridgegolf.com',
    website: 'desertridgegolf.com',
    amenities: ['Pro Shop', 'Practice Range', 'Club Rentals', 'Restaurant & Bar', 'Locker Rooms', 'Cart Included']
  },
  dayOfWeek: 'Mondays',
  time: '5:30 PM',
  format: '18 Holes',
  registered: 28,
  capacity: 32,
  waitlist: 3,
  rating: 4.8,
  reviewCount: 124,
  price: 450,
  earlyBirdPrice: 400,
  earlyBirdDeadline: 'Jan 15, 2025',
  skillLevel: 'All skill levels',
  seasonWeeks: 12,
  currentWeek: 8,
  startDate: 'Feb 3, 2025',
  endDate: 'Apr 21, 2025',
  registrationOpens: 'Dec 1, 2024',
  registrationCloses: 'Jan 30, 2025',
  description: 'Join our friendly Monday night league for 12 weeks of competitive stroke play. Handicaps welcome. Flights by skill level ensure fair competition for everyone from beginners to scratch golfers.',
  whatsIncluded: [
    '12 weeks of play',
    'Handicap integration (GHIN)',
    'Prizes for flight winners',
    'End-of-season tournament',
    'Online scoring & stats'
  ],
  formatDetails: [
    'Individual stroke play',
    '18 holes',
    'Net scoring (handicaps)',
    '4 flights by handicap'
  ],
  requirements: [
    'Valid GHIN handicap',
    'Club membership or green fee payment',
    'Commitment to play all 12 weeks'
  ],
  organizer: {
    name: 'Sarah Chen',
    title: 'League Director',
    memberSince: 2019,
    leaguesOrganized: 15,
    avatar: 'SC'
  },
  cancellationPolicy: [
    { deadline: 'Jan 20', refund: '100%' },
    { deadline: 'Feb 1', refund: '50%' },
    { deadline: 'After season starts', refund: '0%' }
  ],
  paymentOptions: [
    'Credit/Debit Card (Stripe)',
    'Full payment upfront',
    'Payment plan available (3 installments)'
  ],
  pastSeasons: [
    { name: 'Fall 2024', players: 32, rating: 4.9 },
    { name: 'Summer 2024', players: 28, rating: 4.8 },
    { name: 'Spring 2024', players: 30, rating: 4.7 }
  ],
  photos: ['/placeholder1.jpg', '/placeholder2.jpg', '/placeholder3.jpg', '/placeholder4.jpg']
};

const demoSchedule = [
  { week: 1, date: 'Mon, Feb 3, 2025', time: '5:30 PM', title: 'Opening Round', status: 'upcoming' },
  { week: 2, date: 'Mon, Feb 10, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 3, date: 'Mon, Feb 17, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 4, date: 'Mon, Feb 24, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 5, date: 'Mon, Mar 3, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 6, date: 'Mon, Mar 10, 2025', time: '5:30 PM', title: 'Mid-Season Social', status: 'upcoming' },
  { week: 7, date: 'Mon, Mar 17, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 8, date: 'Mon, Mar 24, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 9, date: 'Mon, Mar 31, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 10, date: 'Mon, Apr 7, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 11, date: 'Mon, Apr 14, 2025', time: '5:30 PM', title: 'Regular Play', status: 'upcoming' },
  { week: 12, date: 'Mon, Apr 21, 2025', time: '5:30 PM', title: 'Championship Round', status: 'upcoming' }
];

const demoStandings = [
  { rank: 1, name: 'Mike Thompson', handicap: 8.2, rounds: 8, avgNet: 71.2, points: 24, change: 0, lastScore: 68 },
  { rank: 2, name: 'Sarah Chen', handicap: 9.5, rounds: 8, avgNet: 72.8, points: 22, change: 1, lastScore: 69 },
  { rank: 3, name: 'John Martinez', handicap: 7.8, rounds: 7, avgNet: 73.1, points: 20, change: -1, lastScore: 74 },
  { rank: 4, name: 'Lisa Anderson', handicap: 10.1, rounds: 8, avgNet: 74.5, points: 18, change: 2, lastScore: 71 },
  { rank: 5, name: 'David Park', handicap: 8.9, rounds: 8, avgNet: 75.0, points: 16, change: -1, lastScore: 76 },
  { rank: 6, name: 'Jennifer Wu', handicap: 9.2, rounds: 7, avgNet: 75.8, points: 14, change: 0, lastScore: 75 },
  { rank: 7, name: 'Robert Lee', handicap: 8.5, rounds: 8, avgNet: 76.2, points: 12, change: -2, lastScore: 78 },
  { rank: 8, name: 'Maria Garcia', handicap: 9.8, rounds: 7, avgNet: 77.1, points: 10, change: 1, lastScore: 73 }
];

const demoSeasonStats = {
  lowestRound: { player: 'Mike Thompson', score: 68, date: 'Mar 24' },
  mostImproved: { player: 'Lisa Anderson', improvement: '+2.1 strokes' },
  longestStreak: { player: 'Sarah Chen', streak: 5 },
  avgScore: 74.2,
  totalRounds: 58
};

const ratingDistribution = [
  { stars: 5, count: 89, percentage: 72 },
  { stars: 4, count: 25, percentage: 20 },
  { stars: 3, count: 7, percentage: 6 },
  { stars: 2, count: 2, percentage: 1.5 },
  { stars: 1, count: 1, percentage: 0.5 }
];

const demoRoster = {
  'Flight A (0-9)': [
    { name: 'Mike Thompson', handicap: 8.2, joinedDate: 'Dec 5, 2024', isMutual: true, verified: true },
    { name: 'Sarah Chen', handicap: 9.5, joinedDate: 'Dec 3, 2024', isMutual: false, verified: true },
    { name: 'John Martinez', handicap: 7.8, joinedDate: 'Dec 8, 2024', isMutual: true, verified: true },
    { name: 'Lisa Anderson', handicap: 10.1, joinedDate: 'Dec 10, 2024', isMutual: false, verified: false }
  ],
  'Flight B (10-18)': [
    { name: 'David Park', handicap: 12.4, joinedDate: 'Dec 12, 2024', isMutual: false, verified: true },
    { name: 'Jennifer Wu', handicap: 14.2, joinedDate: 'Dec 15, 2024', isMutual: true, verified: true },
    { name: 'Robert Lee', handicap: 11.8, joinedDate: 'Dec 18, 2024', isMutual: false, verified: false },
    { name: 'Maria Garcia', handicap: 15.5, joinedDate: 'Dec 20, 2024', isMutual: false, verified: true }
  ],
  'Flight C (19-27)': [
    { name: 'Chris Wilson', handicap: 22.1, joinedDate: 'Dec 22, 2024', isMutual: false, verified: false },
    { name: 'Amanda Brown', handicap: 19.8, joinedDate: 'Dec 25, 2024', isMutual: true, verified: true },
    { name: 'Kevin Davis', handicap: 24.5, joinedDate: 'Dec 28, 2024', isMutual: false, verified: false }
  ]
};

const demoReviews = [
  { 
    author: 'Mike T.', 
    handicap: 14.2, 
    rating: 5, 
    title: 'Best league I\'ve joined!',
    content: 'Great competition, well-organized, friendly group. Sarah does an amazing job running this league.',
    date: '2 weeks ago',
    verified: true,
    helpful: 12,
    notHelpful: 1
  },
  { 
    author: 'Jennifer W.', 
    handicap: 18.5, 
    rating: 5, 
    title: 'Perfect for working professionals',
    content: 'Monday evening time works great for my schedule. Love the online scoring system.',
    date: '1 month ago',
    verified: true,
    helpful: 8,
    notHelpful: 0
  },
  { 
    author: 'David P.', 
    handicap: 9.8, 
    rating: 4, 
    title: 'Good value',
    content: 'Pricing is fair for what you get. Course is in great shape. Would recommend.',
    date: '1 month ago',
    verified: true,
    helpful: 5,
    notHelpful: 2
  },
  { 
    author: 'Lisa A.', 
    handicap: 22.3, 
    rating: 5, 
    title: 'Great for beginners',
    content: 'As a newer golfer, I was nervous joining a league but everyone was so welcoming. The flight system means I\'m competing against similar skill levels.',
    date: '2 months ago',
    verified: false,
    helpful: 15,
    notHelpful: 0
  }
];

type TabType = 'overview' | 'schedule' | 'standings' | 'roster' | 'venue' | 'reviews';

export default function LeagueDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState('Flight A (0-9)');
  const [scheduleView, setScheduleView] = useState<'list' | 'calendar'>('list');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [rosterSearch, setRosterSearch] = useState('');
  
  const league = demoLeague;
  const spotsLeft = league.capacity - league.registered;
  const progressPercent = Math.round((league.currentWeek / league.seasonWeeks) * 100);
  const capacityPercent = Math.round((league.registered / league.capacity) * 100);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'standings', label: 'Standings' },
    { id: 'roster', label: 'Roster' },
    { id: 'venue', label: 'Venue' },
    { id: 'reviews', label: 'Reviews' }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/search?tab=leagues" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Search Results
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-2xl p-6 md:p-8 border border-gray-800">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-emerald-600/20 rounded-xl flex items-center justify-center text-2xl">
                  {sportEmojis[league.sport] || sportEmojis.default}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{league.name}</h1>
                  <p className="text-gray-400">{league.sportName}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {league.venue.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  {league.dayOfWeek} &bull; {league.time} &bull; {league.format}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {league.registered}/{league.capacity} players
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {league.rating} ({league.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  ${league.price}/season
                </span>
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  {league.skillLevel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link 
                  href={`/leagues/${league.id}/register`}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  Register Now
                  <span className="text-emerald-200">${league.price}</span>
                </Link>
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
                </button>
                <button className="px-4 py-3 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Urgency Indicators */}
            <div className="flex flex-col gap-3 md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm border border-yellow-600/30">
                <Clock className="w-4 h-4" />
                Early bird ends {league.earlyBirdDeadline} - Save $50!
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm border border-red-600/30">
                <Flame className="w-4 h-4" />
                Only {spotsLeft} spots remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-4 gap-2 h-32 md:h-48">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-lg flex items-center justify-center text-gray-600">
              <span className="text-sm">Photo {i}</span>
            </div>
          ))}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">About This League</h2>
                <p className="text-gray-300 mb-6">{league.description}</p>
                
                <h3 className="font-semibold text-white mb-3">What's Included</h3>
                <ul className="space-y-2 mb-6">
                  {league.whatsIncluded.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold text-white mb-3">Format</h3>
                <ul className="space-y-2 mb-6">
                  {league.formatDetails.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold text-white mb-3">Schedule</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                  <div>
                    <span className="text-gray-500">Start:</span> {league.startDate}
                  </div>
                  <div>
                    <span className="text-gray-500">Time:</span> {league.time} tee times
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span> {league.seasonWeeks} weeks
                  </div>
                  <div>
                    <span className="text-gray-500">End:</span> {league.endDate}
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {league.requirements.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organizer Info */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Organizer</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-lg">
                    {league.organizer.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{league.organizer.name}</h3>
                    <p className="text-gray-400 text-sm">{league.organizer.title}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Member since {league.organizer.memberSince} &bull; {league.organizer.leaguesOrganized} leagues organized
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message Organizer
                      </button>
                      <button className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                        <AlertTriangle className="w-4 h-4" />
                        Report Issue
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Registration Information</h2>
                
                <h3 className="font-semibold text-white mb-3">Timeline</h3>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Opens:</span>
                    <span className="text-gray-300">{league.registrationOpens}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Early Bird Ends:</span>
                    <span className="text-yellow-400">{league.earlyBirdDeadline}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Registration Closes:</span>
                    <span className="text-gray-300">{league.registrationCloses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Season Starts:</span>
                    <span className="text-gray-300">{league.startDate}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-3">Payment Options</h3>
                <ul className="space-y-2 mb-6">
                  {league.paymentOptions.map((option) => (
                    <li key={option} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {option}
                    </li>
                  ))}
                </ul>

                <h3 className="font-semibold text-white mb-3">Cancellation Policy</h3>
                <ul className="space-y-2">
                  {league.cancellationPolicy.map((policy) => (
                    <li key={policy.deadline} className="flex justify-between text-sm">
                      <span className="text-gray-400">Until {policy.deadline}:</span>
                      <span className={policy.refund === '100%' ? 'text-emerald-400' : policy.refund === '0%' ? 'text-red-400' : 'text-yellow-400'}>
                        {policy.refund} refund
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 bg-[#252525] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Waitlist:</strong> If the league is full, join the waitlist to be notified of openings.
                  </p>
                </div>
              </div>

              {/* Past Seasons */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Past Seasons</h2>
                <div className="grid grid-cols-3 gap-4">
                  {league.pastSeasons.map((season) => (
                    <div key={season.name} className="bg-[#252525] rounded-lg p-4 text-center border border-gray-700">
                      <h3 className="font-semibold text-white text-sm">{season.name}</h3>
                      <p className="text-gray-400 text-sm">{season.players} players</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-white">{season.rating}</span>
                      </div>
                      <button className="mt-3 text-emerald-500 text-sm hover:underline">View Results</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Preview */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">What Players Are Saying</h2>
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className="text-emerald-500 text-sm hover:underline"
                  >
                    View All {league.reviewCount} Reviews
                  </button>
                </div>
                <div className="space-y-4">
                  {demoReviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} 
                          />
                        ))}
                        <span className="ml-2 font-semibold text-white text-sm">"{review.title}"</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{review.content}</p>
                      <p className="text-gray-500 text-xs">
                        - {review.author} (Handicap {review.handicap}) &bull; {review.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Season Stats */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  Current Season
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Week {league.currentWeek} of {league.seasonWeeks}</span>
                      <span className="text-white">{progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Participants
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Registered:</span>
                    <span className="text-white">{league.registered}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacity:</span>
                    <span className="text-white">{league.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Waitlist:</span>
                    <span className="text-white">{league.waitlist}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{capacityPercent}% Full</span>
                    </div>
                    <div className="h-2 bg-[#252525] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full" 
                        style={{ width: `${capacityPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Regular:</span>
                    <span className="text-white">${league.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Early Bird:</span>
                    <span className="text-emerald-400">${league.earlyBirdPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500">(until {league.earlyBirdDeadline})</p>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Includes:</p>
                    <ul className="space-y-1">
                      <li className="text-sm text-gray-300">• League entry</li>
                      <li className="text-sm text-gray-300">• Prize pool</li>
                      <li className="text-sm text-gray-300">• Scoring system</li>
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Green fees paid separately to venue ($25/round)
                    </p>
                  </div>
                </div>
              </div>

              {/* Register CTA */}
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-xl p-6 border border-emerald-600/30">
                <h3 className="font-bold text-white mb-2">Ready to Join?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Secure your spot in the {league.name}
                </p>
                <Link 
                  href={`/leagues/${league.id}/register`}
                  className="block w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
                >
                  Register Now - ${league.price}
                </Link>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Only {spotsLeft} spots left!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">Season Schedule</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                  {(['all', 'upcoming', 'past'] as const).map((filter) => (
                    <button 
                      key={filter}
                      onClick={() => setScheduleFilter(filter)}
                      className={`px-3 py-1.5 rounded text-sm capitalize ${scheduleFilter === filter ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                  <button 
                    onClick={() => setScheduleView('list')}
                    className={`px-3 py-1.5 rounded text-sm ${scheduleView === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setScheduleView('calendar')}
                    className={`px-3 py-1.5 rounded text-sm ${scheduleView === 'calendar' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                  >
                    Calendar
                  </button>
                </div>
              </div>
            </div>

            {scheduleView === 'list' ? (
              <div className="space-y-4">
                {demoSchedule
                  .filter(week => {
                    if (scheduleFilter === 'all') return true;
                    if (scheduleFilter === 'upcoming') return week.week >= league.currentWeek;
                    if (scheduleFilter === 'past') return week.week < league.currentWeek;
                    return true;
                  })
                  .map((week) => (
                  <div key={week.week} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${week.week === league.currentWeek ? 'text-emerald-500' : week.week < league.currentWeek ? 'text-gray-500' : 'text-gray-400'}`}>
                            Week {week.week}
                            {week.week === league.currentWeek && ' (Current)'}
                            {week.week < league.currentWeek && ' (Completed)'}
                          </span>
                          <span className="text-gray-500">&bull;</span>
                          <span className="text-white font-semibold">{week.date}</span>
                          <span className="text-gray-500">&bull;</span>
                          <span className="text-gray-400">{week.time}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          {week.week === 12 && <Trophy className="w-5 h-5 text-yellow-500" />}
                          {week.title}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {league.venue.name} - Championship Course
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-[#252525] text-gray-300 rounded-lg text-sm hover:bg-[#333] transition-colors flex items-center gap-1 border border-gray-700">
                          <CalendarPlus className="w-4 h-4" />
                          Add to Calendar
                        </button>
                        <button className="px-3 py-2 bg-[#252525] text-gray-300 rounded-lg text-sm hover:bg-[#333] transition-colors flex items-center gap-1 border border-gray-700">
                          <Navigation className="w-4 h-4" />
                          Directions
                        </button>
                      </div>
                    </div>
                  {week.week === 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Flight A Pairings:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Mike Thompson (8.2) vs. Sarah Chen (9.5)</li>
                        <li>• John Martinez (7.8) vs. Lisa Anderson (10.1)</li>
                      </ul>
                      <button className="text-emerald-500 text-sm mt-2 hover:underline">View All Pairings</button>
                    </div>
                  )}
                  {week.week > 1 && week.week < 12 && (
                    <p className="mt-4 text-sm text-yellow-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pairings posted 48 hours before tee time
                    </p>
                  )}
                  {week.week === 12 && (
                      <p className="mt-4 text-sm text-gray-400">
                        Top 8 from each flight advance to match play playoffs
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Calendar View - Week-based layout showing scheduled rounds */
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-semibold text-white mb-2">Season Calendar</h3>
                  <p className="text-sm text-gray-400">12-week season • Mondays at 5:30 PM</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {demoSchedule
                    .filter(week => {
                      if (scheduleFilter === 'all') return true;
                      if (scheduleFilter === 'upcoming') return week.week >= league.currentWeek;
                      if (scheduleFilter === 'past') return week.week < league.currentWeek;
                      return true;
                    })
                    .map((week) => {
                      const isPast = week.week < league.currentWeek;
                      const isCurrent = week.week === league.currentWeek;
                      
                      return (
                        <div 
                          key={week.week} 
                          className={`grid grid-cols-12 gap-4 p-4 ${isCurrent ? 'bg-emerald-600/10' : ''} ${isPast ? 'opacity-60' : ''}`}
                        >
                          <div className="col-span-2">
                            <div className={`text-sm font-medium ${isCurrent ? 'text-emerald-400' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                              Week {week.week}
                            </div>
                            <div className="text-white font-semibold">{week.date}</div>
                            <div className="text-sm text-gray-500">{week.time}</div>
                          </div>
                          <div className="col-span-7">
                            <div className="flex items-center gap-2">
                              <span className="text-white">{week.title}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">This Week</span>
                              )}
                              {isPast && (
                                <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">Completed</span>
                              )}
                              {week.week === 12 && (
                                <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">{league.venue.name}</div>
                          </div>
                          <div className="col-span-3 flex items-center justify-end gap-2">
                            {!isPast && (
                              <>
                                <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-white border border-gray-700">
                                  <CalendarPlus className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-[#252525] text-gray-400 rounded-lg hover:text-white border border-gray-700">
                                  <Navigation className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white mb-4">Important Dates</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• <strong className="text-white">Feb 3:</strong> Season opener</li>
                <li>• <strong className="text-white">Mar 10:</strong> Mid-season social (optional)</li>
                <li>• <strong className="text-white">Apr 21:</strong> Regular season finale</li>
                <li>• <strong className="text-white">Apr 28 & May 5:</strong> Playoffs (if applicable)</li>
                <li>• <strong className="text-white">May 12:</strong> Awards ceremony</li>
              </ul>
            </div>
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === 'standings' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Standings</h2>
              <select 
                value={selectedFlight}
                onChange={(e) => setSelectedFlight(e.target.value)}
                className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-700"
              >
                <option>Flight A (0-9)</option>
                <option>Flight B (10-18)</option>
                <option>Flight C (19-27)</option>
                <option>Flight D (28+)</option>
                <option>Overall</option>
              </select>
            </div>

            {/* Season Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Low Round</p>
                <p className="text-xl font-bold text-white">{demoSeasonStats.lowestRound.score}</p>
                <p className="text-sm text-emerald-500">{demoSeasonStats.lowestRound.player}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Most Improved</p>
                <p className="text-xl font-bold text-white">{demoSeasonStats.mostImproved.improvement}</p>
                <p className="text-sm text-emerald-500">{demoSeasonStats.mostImproved.player}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Win Streak</p>
                <p className="text-xl font-bold text-white">{demoSeasonStats.longestStreak.streak} weeks</p>
                <p className="text-sm text-emerald-500">{demoSeasonStats.longestStreak.player}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">League Average</p>
                <p className="text-xl font-bold text-white">{demoSeasonStats.avgScore}</p>
                <p className="text-sm text-gray-500">{demoSeasonStats.totalRounds} rounds played</p>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">{selectedFlight}</h3>
                <p className="text-sm text-gray-400">After Week {league.currentWeek} of {league.seasonWeeks}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#252525]">
                    <tr className="text-left text-sm text-gray-400">
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Hdcp</th>
                      <th className="px-4 py-3">Rounds</th>
                      <th className="px-4 py-3">Avg Net</th>
                      <th className="px-4 py-3">Last</th>
                      <th className="px-4 py-3">Points</th>
                      <th className="px-4 py-3">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoStandings.map((player) => (
                      <tr key={player.rank} className="border-t border-gray-800 hover:bg-[#252525]">
                        <td className="px-4 py-3 text-white">
                          {player.rank === 1 && '🥇 '}
                          {player.rank === 2 && '🥈 '}
                          {player.rank === 3 && '🥉 '}
                          {player.rank}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">{player.name}</td>
                        <td className="px-4 py-3 text-gray-400">{player.handicap}</td>
                        <td className="px-4 py-3 text-gray-400">{player.rounds}</td>
                        <td className="px-4 py-3 text-emerald-400">{player.avgNet}</td>
                        <td className="px-4 py-3 text-gray-300">{player.lastScore}</td>
                        <td className="px-4 py-3 text-white font-semibold">{player.points}</td>
                        <td className="px-4 py-3">
                          {player.change > 0 && (
                            <span className="flex items-center gap-1 text-green-400">
                              <TrendingUp className="w-4 h-4" />
                              +{player.change}
                            </span>
                          )}
                          {player.change < 0 && (
                            <span className="flex items-center gap-1 text-red-400">
                              <TrendingDown className="w-4 h-4" />
                              {player.change}
                            </span>
                          )}
                          {player.change === 0 && (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Minus className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-800">
                <button className="text-emerald-500 text-sm hover:underline">View Full Standings</button>
              </div>
            </div>

            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white mb-4">Recent Results (Last 3 Rounds)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Week 8 - Mar 24</p>
                    <p className="text-sm text-gray-400">Low Net: Mike Thompson (68)</p>
                  </div>
                  <button className="text-emerald-500 text-sm hover:underline">View Scores</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Week 7 - Mar 17</p>
                    <p className="text-sm text-gray-400">Low Net: Sarah Chen (69)</p>
                  </div>
                  <button className="text-emerald-500 text-sm hover:underline">View Scores</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Week 6 - Mar 10</p>
                    <p className="text-sm text-gray-400">Low Net: John Martinez (70)</p>
                  </div>
                  <button className="text-emerald-500 text-sm hover:underline">View Scores</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">League Roster</h2>
                <p className="text-gray-400 text-sm">{league.registered} Players registered</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(demoRoster).map(([flight, players]) => {
                const filteredPlayers = players.filter(p => 
                  p.name.toLowerCase().includes(rosterSearch.toLowerCase())
                );
                if (filteredPlayers.length === 0 && rosterSearch) return null;
                
                return (
                  <div key={flight} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-800 bg-[#252525]">
                      <h3 className="font-semibold text-white">{flight}</h3>
                      <p className="text-sm text-gray-400">{filteredPlayers.length} players</p>
                    </div>
                    <div className="divide-y divide-gray-800">
                      {filteredPlayers.map((player) => (
                        <div key={player.name} className="p-4 flex items-center justify-between hover:bg-[#252525]">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-medium">
                                {player.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              {player.verified && (
                                <BadgeCheck className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-[#1a1a1a] rounded-full" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium">{player.name}</p>
                                {player.isMutual && (
                                  <span className="px-2 py-0.5 bg-emerald-600/20 text-emerald-400 text-xs rounded-full">
                                    Mutual
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">Handicap: {player.handicap}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Joined {player.joinedDate}</p>
                            <button className="text-emerald-500 text-xs hover:underline mt-1">View Profile</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {league.waitlist > 0 && (
              <div className="mt-6 bg-yellow-600/10 rounded-xl p-6 border border-yellow-600/30">
                <h3 className="font-semibold text-yellow-400 mb-2">Waitlist</h3>
                <p className="text-gray-300 text-sm">
                  {league.waitlist} players are currently on the waitlist. They will be notified if spots become available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Venue Tab */}
        {activeTab === 'venue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">{league.venue.name}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-white">{league.venue.address}</p>
                      <button className="text-emerald-500 text-sm hover:underline mt-1">Get Directions</button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <a href={`tel:${league.venue.phone}`} className="text-white hover:text-emerald-400">
                      {league.venue.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    <a href={`mailto:${league.venue.email}`} className="text-white hover:text-emerald-400">
                      {league.venue.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <a href={`https://${league.venue.website}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-emerald-400">
                      {league.venue.website}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {league.venue.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white">6:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saturday - Sunday</span>
                    <span className="text-white">5:30 AM - 8:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pro Shop</span>
                    <span className="text-white">6:00 AM - 7:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Map View</p>
                  <p className="text-sm">{league.venue.address}</p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </button>
                <button className="flex-1 py-3 bg-[#1a1a1a] text-gray-300 rounded-lg font-medium hover:bg-[#252525] transition-colors flex items-center justify-center gap-2 border border-gray-700">
                  <Phone className="w-4 h-4" />
                  Call Venue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Rating Summary */}
              <div className="lg:col-span-1 bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">{league.rating}</div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-400">{league.reviewCount} reviews</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-8">{item.stars} ★</span>
                      <div className="flex-1 h-2 bg-[#252525] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 w-8">{item.count}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Star className="w-4 h-4" />
                  Write a Review
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Only verified participants can review
                </p>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Player Reviews</h2>
                  <select className="bg-[#1a1a1a] text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 text-sm">
                    <option>Most Recent</option>
                    <option>Highest Rated</option>
                    <option>Lowest Rated</option>
                    <option>Most Helpful</option>
                  </select>
                </div>

                {demoReviews.map((review, idx) => (
                  <div key={idx} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-medium">
                            {review.author.split(' ').map(n => n[0]).join('')}
                          </div>
                          {review.verified && (
                            <BadgeCheck className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-[#1a1a1a] rounded-full" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{review.author}</p>
                            {review.verified && (
                              <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                                <BadgeCheck className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">Handicap {review.handicap}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} 
                        />
                      ))}
                      <span className="ml-2 font-semibold text-white">"{review.title}"</span>
                    </div>
                    <p className="text-gray-300 mb-4">{review.content}</p>
                    
                    {/* Helpful Voting */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
                      <span className="text-sm text-gray-500">Was this helpful?</span>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{review.helpful}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        <span className="text-sm">{review.notHelpful}</span>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button className="px-6 py-3 bg-[#1a1a1a] text-gray-300 rounded-lg font-medium hover:bg-[#252525] transition-colors border border-gray-700">
                    Load More Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-4 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">{league.name}</h3>
              <p className="text-gray-400 text-sm">${league.price} &bull; {spotsLeft} spots left</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/leagues/${league.id}/register`}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Register Now
              </Link>
              <button className="px-4 py-2.5 bg-[#252525] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors border border-gray-700">
                Add to Waitlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
