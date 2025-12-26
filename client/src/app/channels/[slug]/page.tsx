'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { channels, ChannelDetail, ChannelFeedEntry, ScheduleEvent, ResultItem, VenueInfo } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function ChannelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [channelData, setChannelData] = useState<ChannelDetail | null>(null);
  const [feedEntries, setFeedEntries] = useState<ChannelFeedEntry[]>([]);
  const [schedule, setSchedule] = useState<Record<string, ScheduleEvent[]>>({});
  const [results, setResults] = useState<ResultItem[]>([]);
  const [venues, setVenues] = useState<VenueInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'schedule' | 'results' | 'players' | 'venues' | 'community' | 'news'>('live');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchChannel = async () => {
      try {
        const [data, feed, scheduleData, resultsData, venuesData] = await Promise.all([
          channels.get(slug),
          channels.getFeed(slug),
          channels.getSchedule(slug),
          channels.getResults(slug),
          channels.getVenues(slug)
        ]);
        setChannelData(data);
        setFeedEntries(feed.items);
        setSchedule(scheduleData.days);
        setResults(resultsData.items);
        setVenues(venuesData.items);
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
    { id: 'schedule', label: 'Schedule', icon: '📅', badge: Object.values(schedule).flat().length || upcoming_events.length },
    { id: 'results', label: 'Results', icon: '🏆', badge: results.length > 0 ? results.length : null },
    { id: 'players', label: 'Players', icon: '👤', badge: null },
    { id: 'venues', label: 'Venues', icon: '🏟️', badge: venues.length > 0 ? venues.length : stats.total_venues },
    { id: 'community', label: 'Community', icon: '💬', badge: null },
    { id: 'news', label: 'News', icon: '📰', badge: feedEntries.length > 0 ? feedEntries.length : null },
  ];

  const mockDiscussions = [
    { id: 1, author: 'SportsFan2024', avatar: '👤', content: 'Anyone else playing in the weekend tournament? Looking for practice partners!', likes: 12, replies: 8, time: '15m ago', isHot: true },
    { id: 2, author: 'SarahW', avatar: '👩', content: 'Just had my best game today! Thanks to everyone for the tips.', likes: 45, replies: 15, time: '1h ago', isHot: true },
    { id: 3, author: 'MikeChen', avatar: '👨', content: 'What are your go-to strategies for improvement?', likes: 8, replies: 22, time: '2h ago', isHot: false },
    { id: 4, author: 'TeamEagle', avatar: '🦅', content: 'League standings are getting tight! Only 2 points separate the top 4 teams.', likes: 23, replies: 6, time: '3h ago', isHot: false },
  ];

  const mockLeaderboard = [
    { rank: 1, name: 'Mike Chen', score: -8, through: 14, trend: 'up' },
    { rank: 2, name: 'Sarah Williams', score: -7, through: 14, trend: 'same' },
    { rank: 3, name: 'James Rodriguez', score: -6, through: 13, trend: 'down' },
    { rank: 4, name: 'Tom Bradley', score: -5, through: 14, trend: 'up' },
  ];

  const mockPlayers = [
    { id: 1, name: 'Sarah Williams', handicap: 8.2, rounds: 48, avgScore: 82, trend: 'improving' },
    { id: 2, name: 'Mike Chen', handicap: 5.1, rounds: 62, avgScore: 78, trend: 'improving' },
    { id: 3, name: 'James Rodriguez', handicap: 12.4, rounds: 35, avgScore: 88, trend: 'stable' },
  ];

  const scheduleKeys = Object.keys(schedule);
  const hasRealSchedule = scheduleKeys.length > 0;
  const hasRealResults = results.length > 0;
  const hasRealVenues = venues.length > 0;

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
                {hasRealSchedule ? (
                  <div className="space-y-6">
                    {scheduleKeys.map((day) => (
                      <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="font-bold text-gray-900">{day}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {schedule[day].map((event) => (
                            <div key={`${event.event_type}-${event.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="text-center min-w-[80px]">
                                  <div className="text-sm font-bold text-gray-900">{event.time_label}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{event.title}</div>
                                  {event.venue_name && <div className="text-sm text-gray-500">{event.venue_name}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {event.spots_status && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    {event.spots_status}
                                  </span>
                                )}
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  event.status === 'registration_open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {event.event_type === 'season' ? 'Register' : 'View'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcoming_events.length > 0 ? (
                  <div className="space-y-4">
                    {upcoming_events.map((event) => (
                      <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        {event.venue_name && <p className="text-sm text-gray-500">{event.venue_name}</p>}
                        {event.starts_at && <p className="text-sm text-gray-400">{new Date(event.starts_at).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <span className="text-5xl mb-4 block">📅</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                    <p className="text-gray-500">Check back soon for new events</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'results' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏆</span> Recent Results
                </h2>
                {hasRealResults ? (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <div key={result.id} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{result.title}</h3>
                            <div className="text-sm text-gray-500">{result.venue_name} • {result.date_label}</div>
                          </div>
                          <span className="text-3xl">🏆</span>
                        </div>
                        {result.winner_name && (
                          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-3">
                            <div className="text-sm text-yellow-700 font-medium">Winner</div>
                            <div className="text-xl font-bold text-gray-900">{result.winner_name}</div>
                            {result.final_score && <div className="text-lg font-mono text-green-600">{result.final_score}</div>}
                          </div>
                        )}
                        {result.highlight && <div className="text-sm text-gray-600 italic">"{result.highlight}"</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <span className="text-5xl mb-4 block">🏆</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Results Yet</h3>
                    <p className="text-gray-500">Results will appear here after games are completed</p>
                  </div>
                )}
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
                {hasRealVenues ? (
                  <div className="space-y-4">
                    {venues.map((venue) => (
                      <div key={venue.id} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-500">★</span>
                              <span className="font-medium">{venue.rating}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{venue.active_leagues} active league{venue.active_leagues !== 1 ? 's' : ''}</span>
                            </div>
                            {venue.city && venue.state && (
                              <div className="text-sm text-gray-500 mt-1">{venue.city}, {venue.state}</div>
                            )}
                          </div>
                          <Link href="/venues" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 text-sm">
                            View Details
                          </Link>
                        </div>
                        {venue.next_event && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                            <span className="font-medium">Next Event:</span> {venue.next_event}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <span className="text-5xl mb-4 block">🏟️</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No Venues Yet</h3>
                    <p className="text-gray-500">Venues hosting this sport will appear here</p>
                  </div>
                )}
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
                {feedEntries.length > 0 ? (
                  <div className="space-y-4">
                    {feedEntries.map((entry) => (
                      <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            entry.is_pinned ? 'bg-yellow-100 text-yellow-700' :
                            entry.is_featured ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {entry.content_type.replace('_', ' ')}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{entry.title}</h3>
                            {entry.subtitle && <p className="text-gray-600 text-sm mb-2">{entry.subtitle}</p>}
                            {entry.body && <p className="text-gray-500 text-sm">{entry.body}</p>}
                            <span className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <span className="text-5xl mb-4 block">📰</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No News Yet</h3>
                    <p className="text-gray-500">News and updates will appear here</p>
                  </div>
                )}
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
                  <span>⭐</span> Most Improved Player
                </div>
              </div>
            </div>

            {hasRealVenues && venues[0] && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{channel.emoji}</span> Featured Venue
                </h3>
                <div className="mb-3">
                  <h4 className="font-bold text-gray-900">{venues[0].name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="text-yellow-500">★ {venues[0].rating}</span>
                    <span>•</span>
                    <span>{venues[0].active_leagues} active league{venues[0].active_leagues !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {venues[0].city && venues[0].state && (
                  <p className="text-sm text-gray-600 mb-3">
                    Located in {venues[0].city}, {venues[0].state}
                  </p>
                )}
                <Link href="/venues" className="block w-full text-center py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm">
                  View Venue
                </Link>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔥</span> Trending Topics
              </h3>
              <div className="space-y-3">
                {['#WeekendTournament', '#LocalLeagues', '#GameDay', '#PlayerOfTheWeek'].map((tag) => (
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
                Connect with local players, find leagues, and improve your game.
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
