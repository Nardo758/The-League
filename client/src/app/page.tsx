'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const gameTypes = [
  { id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy game' },
  { id: 'checkers', name: 'Checkers', icon: '🔴', description: 'Jump and capture' },
  { id: 'connect_four', name: 'Connect 4', icon: '🔵', description: 'Four in a row' },
  { id: 'battleship', name: 'Battleship', icon: '🚢', description: 'Sink the fleet' },
];

const features = [
  { title: 'Find Venues', description: 'Discover sports venues near you', href: '/venues', icon: '📍' },
  { title: 'Join Leagues', description: 'Compete in recreational leagues', href: '/leagues', icon: '🏆' },
  { title: 'Tournaments', description: 'Enter bracket competitions', href: '/tournaments', icon: '🎯' },
  { title: 'Predictions', description: 'Make picks and climb the leaderboard', href: '/predictions', icon: '📊' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-accent">The League</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          Your destination for recreational sports leagues, online games, and competitive gaming.
          Find venues, join leagues, challenge friends, and climb the rankings.
        </p>
        {!user && (
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-card-hover transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Play Online Games</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gameTypes.map((game) => (
            <Link
              key={game.id}
              href={`/games?type=${game.id}`}
              className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all group"
            >
              <div className="text-4xl mb-3">{game.icon}</div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                {game.name}
              </h3>
              <p className="text-sm text-muted">{game.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Explore Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all group"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {user && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/games/new"
              className="px-6 py-3 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors"
            >
              Start a Game
            </Link>
            <Link
              href="/games?my_games=true"
              className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-card-hover transition-colors"
            >
              My Games
            </Link>
            <Link
              href="/games/challenges"
              className="px-6 py-3 rounded-lg border border-border font-medium hover:bg-card-hover transition-colors"
            >
              View Challenges
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
