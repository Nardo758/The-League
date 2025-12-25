'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Tournament {
  id: number;
  name: string;
  description: string | null;
  game_type: string;
  format: string;
  status: string;
  max_participants: number;
  current_participants: number;
  organizer_id: number;
}

const gameTypeLabels: Record<string, { name: string; icon: string }> = {
  chess: { name: 'Chess', icon: '♟️' },
  checkers: { name: 'Checkers', icon: '🔴' },
  connect_four: { name: 'Connect 4', icon: '🔵' },
  battleship: { name: 'Battleship', icon: '🚢' },
};

const statusColors: Record<string, string> = {
  registration: 'bg-success/10 text-success',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-muted/10 text-muted',
};

export default function TournamentsPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get<{ items: Tournament[] }>('/tournaments');
      setTournaments(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Sign in to view tournaments</h2>
        <p className="text-muted mb-6">Create an account to join and create tournaments</p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <Link
          href="/tournaments/new"
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Create Tournament
        </Link>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No tournaments yet. Be the first to create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/tournaments/${tournament.id}`}
              className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">
                  {gameTypeLabels[tournament.game_type]?.icon || '🎮'}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs capitalize ${
                    statusColors[tournament.status] || statusColors.completed
                  }`}
                >
                  {tournament.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                {tournament.name}
              </h3>
              <p className="text-sm text-muted mb-2">
                {gameTypeLabels[tournament.game_type]?.name || tournament.game_type}
              </p>
              <p className="text-sm text-muted">
                {tournament.current_participants || 0} / {tournament.max_participants} players
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
