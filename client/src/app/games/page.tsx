'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { games, OnlineGame } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const gameTypeLabels: Record<string, { name: string; icon: string }> = {
  chess: { name: 'Chess', icon: '♟️' },
  checkers: { name: 'Checkers', icon: '🔴' },
  connect_four: { name: 'Connect 4', icon: '🔵' },
  battleship: { name: 'Battleship', icon: '🚢' },
};

function GamesContent() {
  const searchParams = useSearchParams();
  const gameType = searchParams.get('type');
  const myGames = searchParams.get('my_games') === 'true';
  const { user } = useAuth();

  const [availableGames, setAvailableGames] = useState<OnlineGame[]>([]);
  const [myGamesList, setMyGamesList] = useState<OnlineGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGames();
  }, [gameType, myGames, user]);

  const loadGames = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [available, mine] = await Promise.all([
        games.available(gameType || undefined),
        games.list({ game_type: gameType || undefined, my_games: true }),
      ]);
      setAvailableGames(available);
      setMyGamesList(mine.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (type: string) => {
    setCreating(true);
    setError('');
    try {
      await games.create(type);
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setCreating(false);
    }
  };

  const joinGame = async (id: number) => {
    setError('');
    try {
      await games.join(id);
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Sign in to play</h2>
        <p className="text-muted mb-6">Create an account to start playing online games</p>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {gameType ? gameTypeLabels[gameType]?.name || 'Games' : 'All Games'}
        </h1>
        <div className="flex gap-2">
          {Object.entries(gameTypeLabels).map(([type, { name, icon }]) => (
            <Link
              key={type}
              href={gameType === type ? '/games' : `/games?type=${type}`}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                gameType === type
                  ? 'bg-accent text-background'
                  : 'border border-border hover:bg-card-hover'
              }`}
            >
              {icon} {name}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Start a New Game</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(gameTypeLabels).map(([type, { name, icon }]) => (
            <button
              key={type}
              onClick={() => createGame(type)}
              disabled={creating}
              className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all text-left disabled:opacity-50"
            >
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-medium">{name}</div>
              <div className="text-xs text-muted mt-1">Create game</div>
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="space-y-4">
          <div className="h-8 w-48 bg-card animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {myGamesList.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">My Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGamesList.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="p-4 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {gameTypeLabels[game.game_type]?.icon || '🎮'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {gameTypeLabels[game.game_type]?.name || game.game_type}
                        </div>
                        <div className="text-sm text-muted capitalize">
                          {game.status.replace('_', ' ')}
                          {game.is_ranked && ' • Ranked'}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          game.status === 'in_progress'
                            ? 'bg-success/10 text-success'
                            : game.status === 'waiting'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted/10 text-muted'
                        }`}
                      >
                        {game.status === 'in_progress'
                          ? 'Playing'
                          : game.status === 'waiting'
                          ? 'Waiting'
                          : 'Finished'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {availableGames.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Join a Game</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {gameTypeLabels[game.game_type]?.icon || '🎮'}
                      </span>
                      <div>
                        <div className="font-medium">
                          {gameTypeLabels[game.game_type]?.name || game.game_type}
                        </div>
                        <div className="text-sm text-muted">
                          Player #{game.player1_id}
                          {game.is_ranked && ' • Ranked'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => joinGame(game.id)}
                      className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-card rounded-xl" />}>
      <GamesContent />
    </Suspense>
  );
}
