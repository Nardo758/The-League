'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, Check, CheckCheck, Trash2, Trophy, Calendar, Star, MessageSquare, Users, AlertCircle, ChevronRight } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  registration_approved: <Check className="w-5 h-5 text-green-600" />,
  registration_rejected: <AlertCircle className="w-5 h-5 text-red-600" />,
  game_scheduled: <Calendar className="w-5 h-5 text-blue-600" />,
  score_verified: <Trophy className="w-5 h-5 text-yellow-600" />,
  game_result: <Star className="w-5 h-5 text-purple-600" />,
  new_post: <MessageSquare className="w-5 h-5 text-cyan-600" />,
  comment_reply: <MessageSquare className="w-5 h-5 text-teal-600" />,
  prediction_resolved: <Trophy className="w-5 h-5 text-orange-600" />,
  new_league: <Users className="w-5 h-5 text-indigo-600" />,
  mention: <MessageSquare className="w-5 h-5 text-pink-600" />,
  registration_deadline: <AlertCircle className="w-5 h-5 text-amber-600" />,
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?page_size=50');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
              <Bell className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to view notifications</h1>
            <p className="text-gray-500 mb-6">
              Stay updated on your leagues, games, and more.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! Check back later."
                : 'When you have updates, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {notificationIcons[notification.type] || <Bell className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  {notification.link && (
                    <Link
                      href={notification.link}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                    >
                      View details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
