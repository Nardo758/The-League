'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Home, Search, Gamepad2, Trophy, User, ChevronDown, Settings, Bell, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import LocationBar from './LocationBar';

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/', label: 'Discover', icon: Home },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/play', label: 'Play', icon: Gamepad2 },
    { href: '/my-leagues', label: 'My Leagues', icon: Trophy },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/discover';
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-[#2a2a2a] bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-emerald-500 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>The League</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LocationBar />
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-[#1a1a1a] rounded" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.full_name || user.email}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] rounded-xl shadow-lg border border-[#2a2a2a] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#2a2a2a]">
                      <p className="text-sm font-medium text-white">{user.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/settings/locations"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <Link
                      href="/profile/notifications"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a]"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Bell className="w-4 h-4" />
                      Notifications
                    </Link>
                    <div className="border-t border-[#2a2a2a] mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-lg border border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-[#2a2a2a] z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                  active ? 'text-emerald-500' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              pathname.startsWith('/profile') ? 'text-emerald-500' : 'text-gray-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
