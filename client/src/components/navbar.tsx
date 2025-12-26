'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-accent">
              The League
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/channels" className="text-sm text-muted hover:text-foreground transition-colors">
                Channels
              </Link>
              <Link href="/venues" className="text-sm text-muted hover:text-foreground transition-colors">
                Venues
              </Link>
              <Link href="/leagues" className="text-sm text-muted hover:text-foreground transition-colors">
                Leagues
              </Link>
              <Link href="/games" className="text-sm text-muted hover:text-foreground transition-colors">
                Play
              </Link>
              <Link href="/tournaments" className="text-sm text-muted hover:text-foreground transition-colors">
                Tournaments
              </Link>
              <Link href="/announcements" className="text-sm text-muted hover:text-foreground transition-colors">
                News
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-8 w-20 animate-pulse bg-card-hover rounded" />
            ) : user ? (
              <>
                <span className="text-sm text-muted">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-card-hover transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
