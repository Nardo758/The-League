'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { User, Settings, Bell, Shield, HelpCircle, Trophy, Gamepad2, MapPin, Mail, Calendar, Edit2 } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

const sportsInterests = [
  { id: 'golf', name: 'Golf', emoji: '🏌️' },
  { id: 'pickleball', name: 'Pickleball', emoji: '🏓' },
  { id: 'bowling', name: 'Bowling', emoji: '🎳' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'soccer', name: 'Soccer', emoji: '⚽' },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedSports, setSelectedSports] = useState<string[]>(['golf', 'pickleball']);

  if (loading) {
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
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to view your profile</h1>
            <p className="text-gray-500 mb-6">
              Manage your account, preferences, and notifications.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev => 
      prev.includes(sportId) 
        ? prev.filter(s => s !== sportId)
        : [...prev, sportId]
    );
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>0 Leagues</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Gamepad2 className="w-4 h-4 text-green-500" />
                  <span>0 Games</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-[60vh]">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">About Me</h2>
                <textarea
                  placeholder="Tell others about yourself, your sports interests, and skill levels..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Sports Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {sportsInterests.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => toggleSport(sport.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSports.includes(sport.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{sport.emoji}</span>
                      <span className="text-sm font-medium">{sport.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Location</h2>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter your city..."
                    className="flex-1 p-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Stats Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">Dec 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Games</span>
                    <span className="text-sm font-medium text-gray-900">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Win Rate</span>
                    <span className="text-sm font-medium text-gray-900">0%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Help & Support</h2>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 py-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  FAQs
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 py-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    defaultValue={user.username}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { id: 'new_leagues', label: 'New leagues matching my interests' },
                  { id: 'registration', label: 'Registration deadlines' },
                  { id: 'game_reminders', label: 'Game reminders' },
                  { id: 'score_postings', label: 'Score postings' },
                  { id: 'announcements', label: 'League announcements' },
                  { id: 'challenges', label: 'Game challenges' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <button
                      className="relative w-10 h-6 rounded-full bg-blue-600 transition-colors"
                    >
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Profile Visibility</span>
                    <span className="text-xs text-gray-500">Who can see your profile</span>
                  </div>
                  <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                    <option>Everyone</option>
                    <option>League Members</option>
                    <option>Only Me</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Show Stats</span>
                    <span className="text-xs text-gray-500">Display your game statistics</span>
                  </div>
                  <button
                    className="relative w-10 h-6 rounded-full bg-blue-600 transition-colors"
                  >
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
