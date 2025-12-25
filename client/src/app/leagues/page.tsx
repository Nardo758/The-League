'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leagues, sports, League, Sport } from '@/lib/api';

export default function LeaguesPage() {
  const [leagueList, setLeagueList] = useState<League[]>([]);
  const [sportList, setSportList] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [leaguesRes, sportsRes] = await Promise.all([
        leagues.list(),
        sports.list(),
      ]);
      setLeagueList(leaguesRes.items);
      setSportList(sportsRes.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leagues');
    } finally {
      setLoading(false);
    }
  };

  const getSportName = (sportId: number) => {
    const sport = sportList.find((s) => s.id === sportId);
    return sport?.name || 'Unknown Sport';
  };

  const sportIcon: Record<string, string> = {
    Golf: '⛳',
    Pickleball: '🏓',
    Softball: '⚾',
    Bowling: '🎳',
    Chess: '♟️',
    Checkers: '🔴',
    Tennis: '🎾',
    default: '🏆',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leagues</h1>
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
      ) : leagueList.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No leagues available yet. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagueList.map((league) => {
            const sportName = getSportName(league.sport_id);
            return (
              <Link
                key={league.id}
                href={`/leagues/${league.id}`}
                className="p-6 rounded-xl bg-card border border-border hover:bg-card-hover hover:border-accent transition-all group"
              >
                <div className="text-3xl mb-3">
                  {sportIcon[sportName] || sportIcon.default}
                </div>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-accent transition-colors">
                  {league.name}
                </h3>
                <p className="text-sm text-muted mb-2">{sportName}</p>
                {league.description && (
                  <p className="text-sm text-muted line-clamp-2">
                    {league.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
