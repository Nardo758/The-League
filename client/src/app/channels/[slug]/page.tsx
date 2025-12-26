'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { channels, ChannelDetail, ChannelFeedEntry } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ChannelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [channelData, setChannelData] = useState<ChannelDetail | null>(null);
  const [feedEntries, setFeedEntries] = useState<ChannelFeedEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'schedule' | 'results' | 'players' | 'venues' | 'community' | 'news'>('live');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchChannel = async () => {
      try {
        const [data, feed] = await Promise.all([
          channels.get(slug),
          channels.getFeed(slug)
        ]);
        setChannelData(data);
        setFeedEntries(feed.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channel');
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [slug]);

  const handleSubscribe = async () => {
    if (!user || !channelData || !slug) return;
    setSubscribing(true);
    try {
      if (channelData.channel.is_subscribed) {
        await channels.unsubscribe(slug);
      } else {
        await channels.subscribe(slug);
      }
      const data = await channels.get(slug);
      setChannelData(data);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !channelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Channel not found'}</div>
          <Link href="/channels" className="text-green-600 hover:underline">
            Back to Channels
          </Link>
        </div>
      </div>
    );
  }

  const { channel, stats, live_events, upcoming_events } = channelData;

  const tabs = [
    { id: 'live', label: 'Live', icon: '🔴', badge: live_events.length },
    { id: 'schedule', label: 'Schedule', icon: '📅', badge: null },
    { id: 'results', label: 'Results', icon: '🏆', badge: null },
    { id: 'players', label: 'Players', icon: '👤', badge: null },
    { id: 'venues', label: 'Venues', icon: '🏟️', badge: stats.total_venues },
    { id: 'community', label: 'Community', icon: '💬', badge: null },
    { id: 'news', label: 'News', icon: '📰', badge: feedEntries.length > 0 ? feedEntries.length : null },
  ];

  const mockDiscussions = [
    { id: 1, author: 'GolfPro2024', avatar: '👤', content: 'Anyone else playing in the weekend tournament? Looking for practice partners!', likes: 12, replies: 8, time: '15m ago', isHot: true },
    { id: 2, author: 'SarahW', avatar: '👩', content: 'Just shot my personal best today! Thanks to everyone at Desert Ridge for the tips.', likes: 45, replies: 15, time: '1h ago', isHot: true },
    { id: 3, author: 'MikeChen', avatar: '👨', content: 'Tips for playing in windy conditions? The forecast looks rough for Saturday.', likes: 8, replies: 22, time: '2h ago', isHot: false },
    { id: 4, author: 'TeamEagle', avatar: '🦅', content: 'League standings are getting tight! Only 2 points separate the top 4 teams.', likes: 23, replies: 6, time: '3h ago', isHot: false },
  ];

  const mockNews = [
    { id: 1, type: 'breaking', title: 'New Tournament Series Announced for Spring 2025', summary: '$10,000 prize pool across 4-event series', time: '2 hours ago' },
    { id: 2, type: 'featured', title: 'TPC Scottsdale Joins Platform', summary: 'Championship venue now hosting weekly leagues', time: '1 day ago' },
    { id: 3, type: 'update', title: 'Handicap System Update', summary: 'New GHIN integration for automatic posting', time: '3 days ago' },
  ];

  const mockLeaderboard = [
    { rank: 1, name: 'Mike Chen', score: -8, through: 14, trend: 'up' },
    { rank: 2, name: 'Sarah Williams', score: -7, through: 14, trend: 'same' },
    { rank: 3, name: 'James Rodriguez', score: -6, through: 13, trend: 'down' },
    { rank: 4, name: 'Tom Bradley', score: -5, through: 14, trend: 'up' },
  ];

  const mockSchedule = [
    { day: 'Today', events: [
      { time: '5:30 PM', name: 'Monday Night League', venue: 'Desert Ridge', spots: '2/32', status: 'filling' },
      { time: '6:00 PM', name: 'Twilight Scramble', venue: 'Papago', spots: '12/48', status: 'open' },
    ]},
    { day: 'Wednesday', events: [
      { time: '3:00 PM', name: 'Senior League', venue: 'Dobson Ranch', spots: 'Full', status: 'full' },
      { time: '5:00 PM', name: 'Wednesday Scramble', venue: 'Desert Ridge', spots: '8/48', status: 'open' },
    ]},
    { day: 'Saturday', events: [
      { time: '8:00 AM', name: 'Weekend Tournament', venue: 'TPC Scottsdale', spots: '18/64', status: 'filling' },
      { time: '1:00 PM', name: 'Afternoon Scramble', venue: 'Papago', spots: '24/48', status: 'open' },
    ]},
  ];

  const mockResults = [
    { id: 1, name: 'Holiday Classic Championship', winner: 'Mike Chen', score: 'Net 68 (-4)', date: 'Dec 22', venue: 'Desert Ridge', highlight: 'Eagle on 18 to win by 1 stroke' },
    { id: 2, name: 'Tuesday Night League - Week 12', winner: 'Team Birdie', score: '15-3 Record', date: 'Dec 21', venue: 'Papago', highlight: 'Perfect season in flight B' },
    { id: 3, name: 'Winter Invitational', winner: 'Sarah Williams', score: 'Gross 74', date: 'Dec 18', venue: 'TPC Scottsdale', highlight: 'Course record for women\'s division' },
  ];

  const mockPlayers = [
    { id: 1, name: 'Sarah Williams', handicap: 8.2, rounds: 48, avgScore: 82, trend: 'improving' },
    { id: 2, name: 'Mike Chen', handicap: 5.1, rounds: 62, avgScore: 78, trend: 'improving' },
    { id: 3, name: 'James Rodriguez', handicap: 12.4, rounds: 35, avgScore: 88, trend: 'stable' },
  ];

  const mockVenues = [
    { id: 1, name: 'Desert Ridge Golf Club', rating: 4.8, leagues: 4, nextEvent: 'Tonight 5:30 PM' },
    { id: 2, name: 'Papago Golf Course', rating: 4.6, leagues: 3, nextEvent: 'Tomorrow 6:00 PM' },
    { id: 3, name: 'TPC Scottsdale', rating: 4.9, leagues: 2, nextEvent: 'Saturday 8:00 AM' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="text-white"
        style={{ background: `linear-gradient(135deg, ${channel.primary_color || '#166534'} 0%, ${channel.primary_color || '#166534'}dd 50%, ${channel.primary_color || '#166534'}99 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-6xl">{channel.emoji}</span>
                <div>
                  <h1 className="text-4xl font-bold mb-1">{channel.title}</h1>
                  <p className="text-white/80 text-lg">{channel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white/70">Live Events:</span>
                  <span className="font-bold">{stats.live_events_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span className="text-white/70">This Week:</span>
                  <span className="font-bold">{stats.upcoming_events_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="text-white/70">Members:</span>
                  <span className="font-bold">{stats.subscriber_count.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {user ? (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-colors ${
                    channel.is_subscribed
                      ? 'bg-white/20 text-white border-2 border-white/40 hover:bg-white/30'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span>🔔</span>
                  <span>{subscribing ? 'Loading...' : channel.is_subscribed ? 'Following' : 'Follow Channel'}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-3 bg-white text-gray-800 rounded-lg font-semibold shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <span>🔔</span>
                  <span>Login to Follow</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    tab.id === 'live' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'live' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                    Live Now
                  </h2>
                </div>

                {live_events.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <span className="text-5xl mb-4 block">📺</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Live Events</h3>
                    <p className="text-gray-500">Check the schedule for upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {live_events.map((event) => (
                      <div key={event.id} className="bg-white rounded-xl border-2 border-red-500 p-6 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5 animate-pulse"></span>
                                <span className="text-xs font-bold uppercase">Live</span>
                              </span>
                              <span className="text-sm text-gray-600">{event.status}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                            {event.venue_name && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <span>📍</span>
                                <span>{event.venue_name}</span>
                              </div>
                            )}
                          </div>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2">
                            <span>▶️</span>
                            <span>Watch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏆</span> Sample Leaderboard
                  </h3>
                  <div className="space-y-2">
                    {mockLeaderboard.map((player) => (
                      <div key={player.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            player.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            player.rank === 2 ? 'bg-gray-200 text-gray-600' :
                            player.rank === 3 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {player.rank}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">{player.name}</div>
                            <div className="text-xs text-gray-500">Through {player.through}</div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${
                          player.score < 0 ? 'text-green-600' : player.score > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {player.score > 0 ? '+' : ''}{player.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'schedule' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📅</span> Upcoming Events
                </h2>
                <div className="space-y-6">
                  {mockSchedule.map((day) => (
                    <div key={day.day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">{day.day}</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {day.events.map((event, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-[60px]">
                                <div className="text-sm font-bold text-gray-900">{event.time}</div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{event.name}</div>
                                <div className="text-sm text-gray-500">{event.venue}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.status === 'full' ? 'bg-red-100 text-red-700' :
                                event.status === 'filling' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {event.spots}
                              </span>
                              {event.status !== 'full' && (
                                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700">
                                  Register
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'results' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏆</span> Recent Results
                </h2>
                <div className="space-y-4">
                  {mockResults.map((result) => (
                    <div key={result.id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{result.name}</h3>
                          <div className="text-sm text-gray-500">{result.venue} • {result.date}</div>
                        </div>
                        <span className="text-3xl">🏆</span>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-3">
                        <div className="text-sm text-yellow-700 font-medium">Winner</div>
                        <div className="text-xl font-bold text-gray-900">{result.winner}</div>
                        <div className="text-lg font-mono text-green-600">{result.score}</div>
                      </div>
                      <div className="text-sm text-gray-600 italic">"{result.highlight}"</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'players' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>👤</span> Top Players
                </h2>
                <div className="space-y-4">
                  {mockPlayers.map((player, idx) => (
                    <div key={player.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                          idx === 0 ? 'bg-yellow-100' : idx === 1 ? 'bg-gray-100' : 'bg-orange-50'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{player.name}</div>
                          <div className="text-sm text-gray-500">Handicap: {player.handicap} • {player.rounds} rounds</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{player.avgScore}</div>
                        <div className="text-sm text-gray-500">avg score</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          player.trend === 'improving' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {player.trend === 'improving' ? '📈 Improving' : '➡️ Stable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'venues' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏟️</span> Venues
                </h2>
                <div className="space-y-4">
                  {mockVenues.map((venue) => (
                    <div key={venue.id} className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{venue.rating}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">{venue.leagues} active leagues</span>
                          </div>
                        </div>
                        <Link href="/venues" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm">
                          View Details
                        </Link>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                        <span className="font-medium">Next Event:</span> {venue.nextEvent}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'community' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>💬</span> Community
                  </h2>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm">
                    + New Post
                  </button>
                </div>
                <div className="space-y-4">
                  {mockDiscussions.map((post) => (
                    <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                          {post.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">{post.author}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">{post.time}</span>
                            {post.isHot && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">🔥 Hot</span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3">{post.content}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                              <span>❤️</span>
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                              <span>💬</span>
                              <span>{post.replies} replies</span>
                            </button>
                            <button className="hover:text-green-500 transition-colors">
                              <span>🔄 Repost</span>
                            </button>
                            <button className="hover:text-blue-500 transition-colors">
                              <span>📤 Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'news' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📰</span> News & Updates
                </h2>
                <div className="space-y-4">
                  {mockNews.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          item.type === 'breaking' ? 'bg-red-100 text-red-700' :
                          item.type === 'featured' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.type}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{item.summary}</p>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {feedEntries.length > 0 && (
                    <>
                      <h3 className="text-lg font-bold text-gray-900 mt-8">Channel Feed</h3>
                      {feedEntries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                              {entry.content_type.replace('_', ' ')}
                            </span>
                            {entry.is_pinned && <span className="text-yellow-500 text-xs">📌 Pinned</span>}
                          </div>
                          <h4 className="font-bold text-gray-900">{entry.title}</h4>
                          {entry.subtitle && <p className="text-gray-600 text-sm">{entry.subtitle}</p>}
                          {entry.body && <p className="text-gray-500 text-sm mt-2">{entry.body}</p>}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⭐</span> Player Spotlight
              </h3>
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white">
                  👩
                </div>
                <h4 className="font-bold text-lg text-gray-900">Sarah Williams</h4>
                <p className="text-sm text-gray-500">Handicap: 8.2 • Member since 2023</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-900">48</div>
                  <div className="text-xs text-gray-500">Rounds</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-900">82</div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-900">74</div>
                  <div className="text-xs text-gray-500">Best</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🏆</span> Champion - Summer Series 2024
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>⛳</span> 3 Hole-in-ones this season
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏌️</span> Featured Venue
              </h3>
              <div className="mb-3">
                <h4 className="font-bold text-gray-900">Desert Ridge Golf Club</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-yellow-500">★ 4.8</span>
                  <span>•</span>
                  <span>4 active leagues</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Premier championship course in North Phoenix. Home to multiple weekly leagues.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Practice Range', 'Pro Shop', 'Restaurant'].map((amenity) => (
                  <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
              </div>
              <Link href="/venues" className="block w-full text-center py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm">
                View Venue
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔥</span> Trending Topics
              </h3>
              <div className="space-y-3">
                {['#WeekendTournament', '#DesertRidge', '#GolfTips', '#WinterSeries'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-blue-600 font-medium hover:underline cursor-pointer">{tag}</span>
                    <span className="text-xs text-gray-400">24 posts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white">
              <h3 className="font-bold mb-2">Join the Community!</h3>
              <p className="text-sm text-green-100 mb-4">
                Connect with local golfers, find leagues, and improve your game.
              </p>
              <Link href="/register" className="block w-full text-center py-2 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 text-sm">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
