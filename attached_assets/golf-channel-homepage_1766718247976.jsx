import React, { useState } from 'react';
import { Play, Calendar, Trophy, TrendingUp, Users, MapPin, MessageSquare, BookOpen, Bell, Star, ChevronRight, Clock, DollarSign, Filter, Video, Image as ImageIcon, Award } from 'lucide-react';

const GolfChannelHomepage = () => {
  const [activeTab, setActiveTab] = useState('live');

  // Mock data for Golf Channel
  const channelStats = {
    sport: 'Golf',
    emoji: '🏌️',
    liveEvents: 5,
    thisWeek: 18,
    members: 2847,
    color: 'green'
  };

  const liveEvents = [
    {
      id: 1,
      name: 'Phoenix Summer Championship',
      venue: 'Desert Ridge Golf Club',
      status: 'Round 2 - Hole 14',
      leaders: [
        { name: 'Mike Chen', score: -8, through: 14 },
        { name: 'Sarah Williams', score: -7, through: 14 },
        { name: 'James Rodriguez', score: -6, through: 13 }
      ],
      viewers: 142,
      distance: '4.2 mi'
    },
    {
      id: 2,
      name: 'Monday Night League',
      venue: 'Papago Golf Course',
      status: 'Back Nine',
      leaders: [
        { name: 'Team Eagle', score: -12, through: 15 },
        { name: 'Team Birdie', score: -10, through: 16 }
      ],
      viewers: 68,
      distance: '5.7 mi'
    }
  ];

  const upcomingEvents = [
    {
      day: 'Monday',
      events: [
        { time: '5:30 PM', name: 'Monday Night League', venue: 'Desert Ridge', spots: '2/32' },
        { time: '6:00 PM', name: 'Twilight Scramble', venue: 'Papago', spots: '12/48' }
      ]
    },
    {
      day: 'Wednesday',
      events: [
        { time: '3:00 PM', name: 'Senior League', venue: 'Dobson Ranch', spots: 'Full' },
        { time: '5:00 PM', name: 'Wednesday Scramble', venue: 'Desert Ridge', spots: '8/48' }
      ]
    },
    {
      day: 'Friday',
      events: [
        { time: '4:00 PM', name: 'Couples League', venue: 'Talking Stick', spots: '6/32' }
      ]
    },
    {
      day: 'Saturday',
      events: [
        { time: '8:00 AM', name: 'Weekend Tournament', venue: 'TPC Scottsdale', spots: '18/64' },
        { time: '1:00 PM', name: 'Afternoon Scramble', venue: 'Papago', spots: '24/48' }
      ]
    }
  ];

  const recentResults = [
    {
      id: 1,
      tournament: 'Holiday Classic Championship',
      winner: 'Mike Chen',
      score: 'Net 68 (-4)',
      date: 'Dec 22',
      venue: 'Desert Ridge',
      image: '🏆',
      highlights: 'Eagle on 18 to win by 1 stroke'
    },
    {
      id: 2,
      tournament: 'Tuesday Night League - Week 12',
      winner: 'Team Birdie',
      score: '15-3 Record',
      date: 'Dec 21',
      venue: 'Papago',
      image: '⭐',
      highlights: 'Perfect season in flight B'
    }
  ];

  const featuredPlayer = {
    name: 'Sarah Williams',
    handicap: 8.2,
    memberSince: '2023',
    achievements: [
      'Champion - Summer Series 2024',
      '3 Hole-in-ones this season',
      'Lowest handicap improvement (-4.2)'
    ],
    bio: "Started playing golf 2 years ago and fell in love with the competitive league scene. Love the Monday night format at Desert Ridge!",
    stats: {
      rounds: 48,
      avgScore: 82,
      bestRound: 74
    }
  };

  const featuredVenue = {
    name: 'Desert Ridge Golf Club',
    rating: 4.8,
    activeLeagues: 4,
    image: '🏌️',
    description: 'Premier championship course in North Phoenix. Home to multiple weekly leagues and monthly tournaments.',
    amenities: ['Practice Range', 'Pro Shop', 'Restaurant', 'Cart GPS'],
    upcomingEvents: 3
  };

  const newsItems = [
    {
      id: 1,
      type: 'breaking',
      title: 'New Tournament Series Announced for Spring 2025',
      summary: '$10,000 prize pool across 4-event series',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'featured',
      title: 'TPC Scottsdale Joins Platform',
      summary: 'Championship venue now hosting weekly leagues',
      timestamp: '1 day ago'
    },
    {
      id: 3,
      type: 'update',
      title: 'Handicap System Update',
      summary: 'New GHIN integration for automatic posting',
      timestamp: '3 days ago'
    }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Best courses for beginners in Phoenix area?',
      author: 'John_Golfer',
      replies: 24,
      lastActivity: '15 min ago',
      isHot: true
    },
    {
      id: 2,
      title: 'Looking for a partner for Saturday tournament',
      author: 'Mike_Chen_Golf',
      replies: 8,
      lastActivity: '1 hour ago',
      isHot: false
    },
    {
      id: 3,
      title: 'Tips for playing in desert wind?',
      author: 'SarahW',
      replies: 42,
      lastActivity: '3 hours ago',
      isHot: true
    }
  ];

  const tabs = [
    { id: 'live', name: 'Live', icon: Play, badge: liveEvents.length },
    { id: 'schedule', name: 'Schedule', icon: Calendar, badge: null },
    { id: 'results', name: 'Results', icon: Trophy, badge: null },
    { id: 'players', name: 'Players', icon: Users, badge: null },
    { id: 'venues', name: 'Venues', icon: MapPin, badge: null },
    { id: 'learn', name: 'Learn', icon: BookOpen, badge: null },
    { id: 'community', name: 'Community', icon: MessageSquare, badge: discussions.filter(d => d.isHot).length },
    { id: 'news', name: 'News', icon: Bell, badge: 2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Channel Header */}
      <div className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="text-6xl">{channelStats.emoji}</div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">The Golf Channel</h1>
                  <p className="text-green-100 text-lg">Your hub for all things golf</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-100">Live Events:</span>
                  <span className="font-bold">{channelStats.liveEvents}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-300" />
                  <span className="text-green-100">This Week:</span>
                  <span className="font-bold">{channelStats.thisWeek}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-300" />
                  <span className="text-green-100">Members:</span>
                  <span className="font-bold">{channelStats.members.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="px-6 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 shadow-lg flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Follow Channel</span>
              </button>
              <button className="px-6 py-3 border-2 border-green-400 text-white rounded-lg font-semibold hover:bg-green-600">
                Customize Feed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="ml-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Events Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span>Live Now</span>
                </h2>
                <button className="text-green-600 font-semibold text-sm hover:text-green-700">
                  View All Live →
                </button>
              </div>

              <div className="space-y-4">
                {liveEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-xl border-2 border-red-500 p-6 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase">Live</span>
                          </span>
                          <span className="text-sm text-gray-600">{event.status}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.venue}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.viewers} watching</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>Watch</span>
                      </button>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="text-xs font-semibold text-gray-600 uppercase mb-3">Leaderboard</div>
                      {event.leaders.map((leader, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className={`text-sm font-bold ${idx === 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{leader.name}</div>
                              <div className="text-xs text-gray-500">Through {leader.through}</div>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold font-mono ${
                            leader.score < 0 ? 'text-green-600' : leader.score > 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {leader.score > 0 ? '+' : ''}{leader.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming This Week */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <span>Upcoming This Week</span>
                </h2>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {upcomingEvents.map((day, idx) => (
                  <div key={idx} className={`${idx !== 0 ? 'border-t border-gray-200' : ''}`}>
                    <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-900">
                      {day.day}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {day.events.map((event, eventIdx) => (
                        <div key={eventIdx} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-semibold text-gray-900 w-20">
                                {event.time}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{event.name}</div>
                                <div className="text-sm text-gray-600">{event.venue}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-sm font-semibold ${
                                event.spots === 'Full' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {event.spots}
                              </span>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Results */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  <span>Recent Results</span>
                </h2>
                <button className="text-green-600 font-semibold text-sm hover:text-green-700">
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {recentResults.map(result => (
                  <div key={result.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl">{result.image}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{result.tournament}</h3>
                        <div className="text-sm text-gray-600 mb-2">{result.venue} • {result.date}</div>
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Winner: </span>
                            <span className="font-semibold text-gray-900">{result.winner}</span>
                          </div>
                          <div className="text-green-600 font-bold font-mono">{result.score}</div>
                        </div>
                        <div className="text-sm text-gray-700 italic">{result.highlights}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Player Spotlight */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900">Player Spotlight</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  SW
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{featuredPlayer.name}</h4>
                <div className="text-sm text-gray-600">Handicap: {featuredPlayer.handicap}</div>
              </div>

              <div className="space-y-2 mb-4">
                {featuredPlayer.achievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <Award className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-700 italic">"{featuredPlayer.bio}"</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Rounds</div>
                  <div className="text-lg font-bold text-gray-900">{featuredPlayer.stats.rounds}</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Avg</div>
                  <div className="text-lg font-bold text-gray-900">{featuredPlayer.stats.avgScore}</div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Best</div>
                  <div className="text-lg font-bold text-green-600">{featuredPlayer.stats.bestRound}</div>
                </div>
              </div>
            </div>

            {/* Featured Venue */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Featured Venue</h3>
              </div>

              <div className="mb-4">
                <div className="text-4xl mb-3">{featuredVenue.image}</div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{featuredVenue.name}</h4>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.floor(featuredVenue.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{featuredVenue.rating}</span>
                </div>
                <p className="text-sm text-gray-700 mb-4">{featuredVenue.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                {featuredVenue.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-600">Active Leagues</div>
                  <div className="text-lg font-bold text-gray-900">{featuredVenue.activeLeagues}</div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-sm">
                  View Venue
                </button>
              </div>
            </div>

            {/* News Feed */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Latest News</h3>
              </div>

              <div className="space-y-3">
                {newsItems.map(item => (
                  <div key={item.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-start space-x-2 mb-1">
                      {item.type === 'breaking' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold uppercase">
                          Breaking
                        </span>
                      )}
                      {item.type === 'featured' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">{item.summary}</p>
                    <div className="text-xs text-gray-500">{item.timestamp}</div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-green-600 font-semibold text-sm hover:text-green-700">
                View All News →
              </button>
            </div>

            {/* Community Discussions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">Hot Discussions</h3>
              </div>

              <div className="space-y-3">
                {discussions.map(disc => (
                  <div key={disc.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm flex-1">{disc.title}</h4>
                      {disc.isHot && (
                        <Flame className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>by {disc.author}</span>
                      <span>•</span>
                      <span>{disc.replies} replies</span>
                      <span>•</span>
                      <span>{disc.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-purple-600 font-semibold text-sm hover:text-purple-700">
                Join Discussion →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GolfChannelHomepage;
