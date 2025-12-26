'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { channels, Channel } from '@/lib/api';

export default function ChannelsPage() {
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const data = await channels.list();
        setChannelList(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load channels');
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sport Channels</h1>
          <p className="text-gray-400">
            Tune into your favorite sport for live events, upcoming schedules, and community content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channelList.map((channel) => (
            <Link
              key={channel.id}
              href={`/channels/${channel.slug}`}
              className="group bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:transform hover:scale-[1.02]"
            >
              <div
                className="h-32 flex items-center justify-center"
                style={{ backgroundColor: channel.primary_color || '#1a1a1a' }}
              >
                <span className="text-6xl">{channel.emoji}</span>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#0066FF] transition-colors">
                  {channel.title}
                </h2>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {channel.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Subscribers:</span>
                    <span className="text-white font-medium">{channel.subscriber_count.toLocaleString()}</span>
                  </div>
                  {channel.live_events_count > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-red-400 font-medium">{channel.live_events_count} Live</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
