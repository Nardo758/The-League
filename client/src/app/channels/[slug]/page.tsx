'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { channels, ChannelDetail, ChannelFeedEntry } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface PageParams {
  slug: string;
}

export default function ChannelPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [channelData, setChannelData] = useState<ChannelDetail | null>(null);
  const [feedEntries, setFeedEntries] = useState<ChannelFeedEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'feed' | 'venues'>('live');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const [data, feed] = await Promise.all([
          channels.get(resolvedParams.slug),
          channels.getFeed(resolvedParams.slug)
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
  }, [resolvedParams.slug]);

  const handleSubscribe = async () => {
    if (!user || !channelData) return;
    setSubscribing(true);
    try {
      if (channelData.channel.is_subscribed) {
        await channels.unsubscribe(resolvedParams.slug);
      } else {
        await channels.subscribe(resolvedParams.slug);
      }
      const data = await channels.get(resolvedParams.slug);
      setChannelData(data);
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error || !channelData) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Channel not found'}</div>
          <Link href="/channels" className="text-[#0066FF] hover:underline">
            Back to Channels
          </Link>
        </div>
      </div>
    );
  }

  const { channel, stats, live_events, upcoming_events } = channelData;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div
        className="relative h-64 flex items-center"
        style={{ backgroundColor: channel.primary_color || '#1a1a1a' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-7xl">{channel.emoji}</span>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{channel.title}</h1>
                <p className="text-white/80">{channel.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              {user ? (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    channel.is_subscribed
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {subscribing ? 'Loading...' : channel.is_subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Login to Subscribe
                </Link>
              )}
              <span className="text-white/60 text-sm">
                {stats.subscriber_count.toLocaleString()} subscribers
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-gray-800">
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.live_events_count}</div>
            <div className="text-gray-400 text-sm">Live Now</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.upcoming_events_count}</div>
            <div className="text-gray-400 text-sm">Upcoming</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total_leagues}</div>
            <div className="text-gray-400 text-sm">Leagues</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total_venues}</div>
            <div className="text-gray-400 text-sm">Venues</div>
          </div>
        </div>

        <div className="flex gap-1 py-4 border-b border-gray-800 overflow-x-auto">
          {[
            { id: 'live', label: 'Live Now', icon: '🔴', count: live_events.length },
            { id: 'upcoming', label: 'Upcoming', icon: '📅', count: upcoming_events.length },
            { id: 'feed', label: 'Feed', icon: '📰', count: feedEntries.length },
            { id: 'venues', label: 'Venues', icon: '🏟️', count: stats.total_venues },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#0066FF] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'live' && (
            <div>
              {live_events.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📺</span>
                  <h3 className="text-xl font-medium text-white mb-2">No Live Events</h3>
                  <p className="text-gray-400">Check back later or browse upcoming events</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {live_events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-red-400 text-sm font-medium">LIVE</span>
                      </div>
                      <h3 className="text-white font-medium mb-1">{event.title}</h3>
                      {event.subtitle && (
                        <p className="text-gray-400 text-sm">{event.subtitle}</p>
                      )}
                      {event.venue_name && (
                        <p className="text-gray-500 text-sm mt-2">at {event.venue_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div>
              {upcoming_events.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📅</span>
                  <h3 className="text-xl font-medium text-white mb-2">No Upcoming Events</h3>
                  <p className="text-gray-400">Stay tuned for new events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming_events.map((event) => (
                    <div
                      key={`${event.event_type}-${event.id}`}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          {event.starts_at ? (
                            <>
                              <div className="text-gray-400 text-xs">
                                {new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              <div className="text-white text-xl font-bold">
                                {new Date(event.starts_at).getDate()}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 text-sm">TBD</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{event.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            {event.venue_name && <span>{event.venue_name}</span>}
                            {event.location && <span>• {event.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.registration_open && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Registration Open
                          </span>
                        )}
                        {event.spots_available && (
                          <span className="text-gray-500 text-sm">
                            {event.spots_available} spots
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'feed' && (
            <div>
              {feedEntries.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">📰</span>
                  <h3 className="text-xl font-medium text-white mb-2">No Feed Content Yet</h3>
                  <p className="text-gray-400">Posts and updates will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full capitalize">
                          {entry.content_type.replace('_', ' ')}
                        </span>
                        {entry.is_pinned && (
                          <span className="text-yellow-400 text-xs">📌 Pinned</span>
                        )}
                      </div>
                      <h3 className="text-white font-medium mb-1">{entry.title}</h3>
                      {entry.subtitle && (
                        <p className="text-gray-400 text-sm mb-2">{entry.subtitle}</p>
                      )}
                      {entry.body && (
                        <p className="text-gray-300 text-sm">{entry.body}</p>
                      )}
                      <div className="text-gray-500 text-xs mt-3">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'venues' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏟️</span>
              <h3 className="text-xl font-medium text-white mb-2">Venues Coming Soon</h3>
              <p className="text-gray-400 mb-4">
                Discover venues hosting {channel.title.replace('The ', '').replace(' Channel', '')} events
              </p>
              <Link
                href="/venues"
                className="text-[#0066FF] hover:underline"
              >
                Browse All Venues
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
