'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, MapPin, Phone, Globe, Star, Users, Calendar, Trophy,
  Share2, Heart, Navigation, Clock, DollarSign, CheckCircle2, Flame,
  ChevronLeft, ChevronRight, Building2, Camera, MessageSquare, AlertTriangle,
  Filter, ArrowUpDown, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const venueTypeIcons: Record<string, string> = {
  golf_course: '⛳',
  bowling_alley: '🎳',
  sports_complex: '🏟️',
  tennis_club: '🎾',
  pickleball_center: '🏓',
  softball_complex: '🥎',
  esports_arena: '🎮',
  default: '🏢'
};

const demoVenue = {
  id: 1,
  name: 'Desert Ridge Golf Club',
  venueType: 'golf_course',
  venueTypeName: 'Golf Course',
  accessType: 'Public/Semi-Private',
  address: '5594 E Clubhouse Dr, Phoenix, AZ 85054',
  phone: '(480) 333-3333',
  email: 'info@desertridge.com',
  website: 'desertridge.com',
  rating: 4.8,
  reviewCount: 342,
  sport: 'Golf',
  distance: '4.2 miles away',
  activeLeagues: 8,
  totalMembers: 342,
  followers: 1234,
  description: `Welcome to Desert Ridge, Phoenix's premier golf destination. Our championship 36-hole facility offers exceptional playing conditions and world-class amenities.

Designed by legendary Tom Lehman, our courses provide challenging yet fair play for all skill levels.`,
  keyFeatures: [
    '36 championship holes',
    'Full driving range',
    'Practice greens',
    'Golf shop',
    'Restaurant & bar',
    'Banquet facilities',
    'PGA instruction'
  ],
  perfectFor: [
    'League play',
    'Corporate events',
    'Tournaments',
    'Private parties',
    'Wedding receptions'
  ],
  hours: {
    weekday: '6:00 AM - 8:00 PM',
    weekend: '5:30 AM - 8:30 PM',
    firstTeeTime: '6:30 AM'
  },
  pricing: {
    peak: 95,
    offPeak: 65,
    twilight: 45,
    cartIncluded: true,
    rangeBalls: 10
  },
  amenities: {
    golf: ['2 championship courses', 'Driving range (covered)', 'Putting greens (3)', 'Chipping area', 'Practice bunkers'],
    dining: ['Full-service restaurant', 'Bar & lounge', 'Patio dining', 'Private event rooms', 'Banquet hall (200 cap)'],
    services: ['PGA instruction', 'Club fitting', 'Golf school', 'Tournament hosting', 'Group outings'],
    equipment: ['Golf shop', 'Club rentals', 'GPS carts', 'Push carts', 'Club repair']
  },
  photos: [
    { id: 1, title: 'Championship Course', placeholder: true },
    { id: 2, title: 'Clubhouse', placeholder: true },
    { id: 3, title: 'Driving Range', placeholder: true },
    { id: 4, title: 'Restaurant', placeholder: true },
    { id: 5, title: 'Pro Shop', placeholder: true },
    { id: 6, title: 'Practice Facilities', placeholder: true }
  ]
};

const demoLeagues = [
  {
    id: 1,
    name: 'Monday Night Golf League',
    format: 'Individual Stroke Play',
    scoring: 'Net Scoring',
    day: 'Mondays',
    time: '5:30 PM',
    startDate: 'Feb 3 - Apr 21, 2025',
    duration: '12 weeks + playoffs',
    holes: '18 holes',
    registered: 28,
    capacity: 32,
    skillLevel: 'All skill levels (flights by hdcp)',
    price: 450,
    earlyBirdPrice: 400,
    earlyBirdDeadline: 'Jan 15',
    rating: 4.8,
    reviewCount: 124,
    spotsLeft: 4,
    status: 'open',
    whatsIncluded: ['12 weeks regular season', 'Playoff tournament', 'Online scoring & stats', 'Prizes for flight winners']
  },
  {
    id: 2,
    name: 'Wednesday Evening Scramble',
    format: '4-Person Scramble',
    scoring: 'Team Play',
    day: 'Wednesdays',
    time: '6:00 PM',
    startDate: 'In progress (Week 6 of 12)',
    duration: '12 weeks',
    holes: '9 holes',
    registered: 48,
    capacity: 48,
    skillLevel: 'Social/Fun',
    price: 200,
    rating: 4.9,
    reviewCount: 89,
    spotsLeft: 0,
    status: 'in_progress',
    seasonEnd: 'Mar 26, 2025',
    nextSeasonOpens: 'March 1'
  },
  {
    id: 3,
    name: 'Friday Couples League',
    format: 'Couples Best Ball',
    scoring: 'Team Play',
    day: 'Fridays',
    time: '4:00 PM',
    startDate: 'Starts Mar 7, 2025',
    duration: '10 weeks',
    holes: '18 holes',
    registered: 24,
    capacity: 32,
    skillLevel: 'All skill levels',
    price: 900,
    unit: 'couple',
    rating: 4.7,
    reviewCount: 56,
    spotsLeft: 8,
    status: 'upcoming',
    registrationOpens: 'Feb 1'
  }
];

const demoEvents = [
  {
    id: 1,
    name: 'Spring Championship',
    emoji: '🏆',
    date: 'Saturday, Mar 15',
    time: '7:00 AM shotgun start',
    price: 125,
    format: '4-person scramble',
    spotsLeft: 12
  },
  {
    id: 2,
    name: 'Junior Golf Clinic',
    emoji: '⛳',
    date: 'Saturdays in March',
    time: '9:00 AM - 11:00 AM',
    price: 50,
    format: 'Ages 8-16',
    unit: 'session'
  },
  {
    id: 3,
    name: 'Sunset Series',
    emoji: '🍴',
    date: 'Every Thursday in April',
    time: '5:30 PM',
    price: 65,
    format: '9 holes + dinner'
  }
];

const demoReviews = [
  {
    author: 'Mark S.',
    rating: 5,
    title: 'Best course in Phoenix!',
    content: 'Course conditions are always perfect. Staff is friendly and professional. Great value for the quality.',
    date: '3 days ago'
  },
  {
    author: 'Lisa M.',
    rating: 5,
    title: 'Love the Monday league',
    content: 'Been playing in the Monday league for 3 years. Well organized and competitive. Highly recommend!',
    date: '1 week ago'
  },
  {
    author: 'David K.',
    rating: 4,
    title: 'Great facilities',
    content: 'Beautiful course with excellent amenities. Only downside is it can get crowded on weekends.',
    date: '2 weeks ago'
  },
  {
    author: 'Sarah T.',
    rating: 5,
    title: 'Perfect for leagues',
    content: 'The staff really cares about making league play a great experience. Scoring system works flawlessly.',
    date: '3 weeks ago'
  }
];

type TabType = 'overview' | 'leagues' | 'events' | 'about' | 'reviews' | 'photos';

export default function VenueDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [photoIndex, setPhotoIndex] = useState(0);
  
  const venue = demoVenue;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'leagues', label: 'Leagues' },
    { id: 'events', label: 'Events' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'photos', label: 'Photos' }
  ];

  const filteredLeagues = demoLeagues.filter(league => {
    if (leagueFilter === 'all') return true;
    return league.status === leagueFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded">OPEN</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded">IN PROGRESS</span>;
      case 'upcoming':
        return <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded">UPCOMING</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      {/* Back Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/search?tab=venues" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Venues
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Placeholder */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-[#1a1a1a] to-[#252525] rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-xl flex items-center justify-center text-3xl border border-emerald-600/30">
              {venueTypeIcons[venue.venueType] || venueTypeIcons.default}
            </div>
          </div>
        </div>

        {/* Venue Info */}
        <div className="bg-[#1a1a1a] rounded-b-2xl p-6 border-x border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{venue.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  {venue.address}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <a href={`tel:${venue.phone}`} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  {venue.phone}
                </a>
                <a href={`https://${venue.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  {venue.website}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {venue.rating} ({venue.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-lg">{venueTypeIcons[venue.venueType] || venueTypeIcons.default}</span>
                  {venue.sport}
                </span>
                <span className="text-gray-500">{venue.distance}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-500" />
                  {venue.activeLeagues} active leagues
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  {venue.totalMembers} total members
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isFollowing 
                    ? 'bg-pink-600/20 text-pink-400 border border-pink-600/30' 
                    : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFollowing ? 'fill-pink-400' : ''}`} />
                {isFollowing ? 'Following' : 'Follow'}
                <span className="text-gray-500 text-sm">{venue.followers.toLocaleString()}</span>
              </button>
              <button className="px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              <button className="px-4 py-2.5 bg-[#2a2a2a] text-gray-300 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-2 border border-gray-700">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Urgency Banner */}
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg border border-orange-600/30">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="font-medium">New league starting soon!</span>
              <span className="text-gray-300">Monday Night Golf - 4 spots left</span>
              <Link href="/leagues/1" className="ml-auto text-emerald-400 hover:underline text-sm">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {venue.photos.map((photo, idx) => (
              <div 
                key={photo.id} 
                className="flex-shrink-0 w-48 h-32 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-gray-500 text-sm border border-gray-800"
              >
                {photo.title}
              </div>
            ))}
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
            {/* About & Quick Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h2 className="text-xl font-bold text-white mb-4">About This Venue</h2>
                  <p className="text-gray-300 whitespace-pre-line mb-6">{venue.description}</p>
                  
                  <h3 className="font-semibold text-white mb-3">Key Features</h3>
                  <ul className="grid grid-cols-2 gap-2 mb-6">
                    {venue.keyFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-semibold text-white mb-3">Perfect For</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.perfectFor.map((item) => (
                      <span key={item} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] text-gray-300 rounded-lg text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Venue Type */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    Venue Type
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>{venue.venueTypeName}</li>
                    <li>{venue.accessType}</li>
                    <li>36 holes</li>
                  </ul>
                </div>

                {/* Hours */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    Hours
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Mon-Fri</span>
                      <span className="text-white">{venue.hours.weekday}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Sat-Sun</span>
                      <span className="text-white">{venue.hours.weekend}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">First tee time</span>
                      <span className="text-white">{venue.hours.firstTeeTime}</span>
                    </li>
                  </ul>
                </div>

                {/* Pricing */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Pricing
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">Green Fees:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-300">Peak</span>
                      <span className="text-white">${venue.pricing.peak}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-300">Off-peak</span>
                      <span className="text-white">${venue.pricing.offPeak}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-300">Twilight</span>
                      <span className="text-white">${venue.pricing.twilight}</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">Cart included. Range balls: ${venue.pricing.rangeBalls}</p>
                </div>
              </div>
            </div>

            {/* Featured Leagues */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  Featured Leagues at This Venue
                </h2>
                <button 
                  onClick={() => setActiveTab('leagues')}
                  className="text-emerald-500 text-sm hover:underline"
                >
                  View All {venue.activeLeagues} Leagues
                </button>
              </div>
              <div className="space-y-4">
                {demoLeagues.slice(0, 3).map((league) => (
                  <div key={league.id} className="bg-[#252525] rounded-xl p-5 border border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{league.name}</h3>
                          {getStatusBadge(league.status)}
                        </div>
                        <p className="text-sm text-gray-400">{league.format} &bull; {league.scoring}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Schedule</span>
                        <p className="text-gray-300">{league.day} &bull; {league.time}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration</span>
                        <p className="text-gray-300">{league.duration} &bull; {league.holes}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Players</span>
                        <p className="text-gray-300">{league.registered}/{league.capacity}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price</span>
                        <p className="text-gray-300">${league.price}{league.unit ? `/${league.unit}` : ''}/season</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {league.rating} ({league.reviewCount})
                        </span>
                        {league.spotsLeft > 0 && league.status === 'open' && (
                          <span className="flex items-center gap-1 text-red-400">
                            <Flame className="w-4 h-4" />
                            {league.spotsLeft} spots left
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/leagues/${league.id}`}
                          className="px-4 py-2 bg-[#333] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#3a3a3a] transition-colors"
                        >
                          View Details
                        </Link>
                        {league.status === 'open' && (
                          <Link 
                            href={`/leagues/${league.id}/register`}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                          >
                            Register Now
                          </Link>
                        )}
                        {league.status === 'in_progress' && (
                          <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-600/30">
                            Join Waitlist
                          </button>
                        )}
                        {league.status === 'upcoming' && (
                          <button className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-600/30">
                            Get Notified
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  Upcoming Events
                </h2>
                <button 
                  onClick={() => setActiveTab('events')}
                  className="text-emerald-500 text-sm hover:underline"
                >
                  View All Events
                </button>
              </div>
              <div className="space-y-4">
                {demoEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-[#252525] rounded-lg border border-gray-700">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{event.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-white">{event.name}</h3>
                        <p className="text-sm text-gray-400">{event.date} &bull; {event.time}</p>
                        <p className="text-sm text-gray-500">${event.price}{event.unit ? `/${event.unit}` : '/player'} &bull; {event.format}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                      Register
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500" />
                Amenities & Facilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Golf Facilities</h3>
                  <ul className="space-y-2">
                    {venue.amenities.golf.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Dining & Social</h3>
                  <ul className="space-y-2">
                    {venue.amenities.dining.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Services</h3>
                  <ul className="space-y-2">
                    {venue.amenities.services.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Equipment</h3>
                  <ul className="space-y-2">
                    {venue.amenities.equipment.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Recent Reviews
                </h2>
                <button 
                  onClick={() => setActiveTab('reviews')}
                  className="text-emerald-500 text-sm hover:underline"
                >
                  View All {venue.reviewCount} Reviews
                </button>
              </div>
              <div className="space-y-4">
                {demoReviews.slice(0, 2).map((review, idx) => (
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
                    <p className="text-gray-500 text-xs">- {review.author} &bull; {review.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leagues Tab */}
        {activeTab === 'leagues' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">All Leagues at {venue.name}</h2>
                <p className="text-gray-400">{venue.activeLeagues} Active Leagues &bull; {venue.totalMembers} Total Members</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-gray-800">
                  {['all', 'open', 'in_progress', 'upcoming'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLeagueFilter(filter)}
                      className={`px-3 py-1.5 rounded text-sm capitalize ${
                        leagueFilter === filter 
                          ? 'bg-emerald-600 text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter === 'in_progress' ? 'In Progress' : filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredLeagues.map((league) => (
                <div key={league.id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{league.name}</h3>
                        {getStatusBadge(league.status)}
                      </div>
                      <p className="text-gray-400">{league.format} &bull; {league.scoring}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500 block">Schedule</span>
                      <p className="text-gray-300">{league.day} &bull; {league.time}</p>
                      <p className="text-gray-400">{league.startDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Duration</span>
                      <p className="text-gray-300">{league.duration}</p>
                      <p className="text-gray-400">{league.holes}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Players</span>
                      <p className="text-gray-300">{league.registered}/{league.capacity}</p>
                      <p className="text-gray-400">{league.skillLevel}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Price</span>
                      <p className="text-gray-300">${league.price}{league.unit ? `/${league.unit}` : ''}/season</p>
                      {league.earlyBirdPrice && (
                        <p className="text-emerald-400">Early bird: ${league.earlyBirdPrice} until {league.earlyBirdDeadline}</p>
                      )}
                    </div>
                  </div>

                  {league.whatsIncluded && (
                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">What's Included:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {league.whatsIncluded.map((item) => (
                          <span key={item} className="text-xs px-2 py-1 bg-[#252525] text-gray-300 rounded">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {league.rating} ({league.reviewCount} reviews)
                      </span>
                      {league.spotsLeft > 0 && league.status === 'open' && (
                        <span className="flex items-center gap-1 text-red-400">
                          <Flame className="w-4 h-4" />
                          {league.spotsLeft} spots remaining
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/leagues/${league.id}`}
                        className="px-4 py-2 bg-[#252525] text-gray-300 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors border border-gray-700"
                      >
                        View Details
                      </Link>
                      {league.status === 'open' && (
                        <Link 
                          href={`/leagues/${league.id}/register`}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Register Now - ${league.price}
                        </Link>
                      )}
                      {league.status === 'in_progress' && (
                        <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-600/30">
                          Join Waitlist
                        </button>
                      )}
                      {league.status === 'upcoming' && (
                        <button className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium border border-purple-600/30">
                          Get Notified
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Upcoming Events</h2>
            <div className="space-y-4">
              {demoEvents.map((event) => (
                <div key={event.id} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{event.emoji}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                        <p className="text-gray-400">{event.date} &bull; {event.time}</p>
                        <p className="text-gray-500 mt-1">${event.price}{event.unit ? `/${event.unit}` : '/player'} &bull; {event.format}</p>
                        {event.spotsLeft && (
                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {event.spotsLeft} spots left
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                      Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">{venue.name}</h2>
                <p className="text-gray-300 whitespace-pre-line mb-6">{venue.description}</p>
                
                <h3 className="font-semibold text-white mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-300">{venue.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <a href={`tel:${venue.phone}`} className="text-gray-300 hover:text-emerald-400">
                      {venue.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    <a href={`https://${venue.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-400">
                      {venue.website}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Hours of Operation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white">{venue.hours.weekday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saturday - Sunday</span>
                    <span className="text-white">{venue.hours.weekend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">First Tee Time</span>
                    <span className="text-white">{venue.hours.firstTeeTime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peak Green Fee</span>
                    <span className="text-white">${venue.pricing.peak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Off-Peak Green Fee</span>
                    <span className="text-white">${venue.pricing.offPeak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Twilight Rate</span>
                    <span className="text-white">${venue.pricing.twilight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Range Balls</span>
                    <span className="text-white">${venue.pricing.rangeBalls}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Cart included with all green fees</p>
              </div>
            </div>

            <div>
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 h-80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Map View</p>
                  <p className="text-sm">{venue.address}</p>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Player Reviews</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="text-white font-semibold">{venue.rating}</span>
                  <span className="text-gray-400">({venue.reviewCount} reviews)</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Write a Review
              </button>
            </div>

            <div className="space-y-4">
              {demoReviews.map((review, idx) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center text-emerald-400 font-medium">
                        {review.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{review.author}</p>
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
                  <p className="text-gray-300">{review.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="px-6 py-3 bg-[#1a1a1a] text-gray-300 rounded-lg font-medium hover:bg-[#252525] transition-colors border border-gray-700">
                Load More Reviews
              </button>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {venue.photos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="aspect-video bg-[#1a1a1a] rounded-xl flex items-center justify-center text-gray-500 border border-gray-800 hover:border-emerald-600/50 transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{photo.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
