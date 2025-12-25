'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { games } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface GameState {
  id: number;
  game_type: string;
  status: string;
  board_state: Record<string, unknown>;
  current_turn: number;
  player_number: number;
  valid_moves: Record<string, unknown>[];
  is_your_turn: boolean;
  winner_id: number | null;
}

const gameTypeLabels: Record<string, { name: string; icon: string }> = {
  chess: { name: 'Chess', icon: '♟️' },
  checkers: { name: 'Checkers', icon: '🔴' },
  connect_four: { name: 'Connect 4', icon: '🔵' },
  battleship: { name: 'Battleship', icon: '🚢' },
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const gameId = Number(params.id);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMove, setSelectedMove] = useState<Record<string, unknown> | null>(null);

  const loadGameState = useCallback(async () => {
    try {
      const state = await games.getState(gameId);
      setGameState(state);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadGameState();
    const interval = setInterval(loadGameState, 3000);
    return () => clearInterval(interval);
  }, [user, loadGameState, router]);

  const makeMove = async (move: Record<string, unknown>) => {
    try {
      await games.move(gameId, move);
      await loadGameState();
      setSelectedMove(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid move');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted">Loading game...</div>
      </div>
    );
  }

  if (error && !gameState) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">{error}</div>
        <Link
          href="/games"
          className="text-accent hover:underline"
        >
          Back to Games
        </Link>
      </div>
    );
  }

  if (!gameState) return null;

  const gameInfo = gameTypeLabels[gameState.game_type] || { name: 'Game', icon: '🎮' };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{gameInfo.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{gameInfo.name}</h1>
            <p className="text-sm text-muted capitalize">
              {gameState.status.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">You are Player {gameState.player_number}</div>
          {gameState.status === 'in_progress' && (
            <div className={`text-sm font-medium ${gameState.is_your_turn ? 'text-success' : 'text-muted'}`}>
              {gameState.is_your_turn ? 'Your turn!' : 'Waiting for opponent...'}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">
          {error}
        </div>
      )}

      {gameState.status === 'waiting' && (
        <div className="p-6 rounded-xl bg-card border border-border text-center">
          <div className="text-lg mb-2">Waiting for opponent to join...</div>
          <div className="text-sm text-muted">Share the game link with a friend</div>
        </div>
      )}

      {gameState.status === 'completed' && (
        <div className="p-6 rounded-xl bg-card border border-border text-center">
          <div className="text-2xl mb-2">
            {gameState.winner_id === null
              ? 'Draw!'
              : gameState.winner_id === user?.id
              ? '🎉 You Won!'
              : 'You Lost'}
          </div>
          <Link
            href="/games"
            className="text-accent hover:underline"
          >
            Play Again
          </Link>
        </div>
      )}

      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold mb-4">Game Board</h2>
        
        {gameState.game_type === 'connect_four' && (
          <Connect4Board
            board={(gameState.board_state as { board: number[][] }).board}
            validMoves={gameState.valid_moves as { column: number }[]}
            isYourTurn={gameState.is_your_turn}
            playerNumber={gameState.player_number}
            onMove={(col) => makeMove({ column: col })}
          />
        )}

        {gameState.game_type === 'checkers' && (
          <CheckersBoard
            board={(gameState.board_state as { board: (number | null)[][] }).board}
            validMoves={gameState.valid_moves}
            isYourTurn={gameState.is_your_turn}
            selectedMove={selectedMove}
            onSelectMove={setSelectedMove}
            onMove={makeMove}
          />
        )}

        {(gameState.game_type === 'chess' || gameState.game_type === 'battleship') && (
          <div className="text-center text-muted py-8">
            <pre className="text-left text-xs bg-background p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(gameState.board_state, null, 2)}
            </pre>
            {gameState.is_your_turn && gameState.valid_moves.length > 0 && (
              <div className="mt-4">
                <p className="mb-2">Available moves:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.valid_moves.slice(0, 10).map((move, i) => (
                    <button
                      key={i}
                      onClick={() => makeMove(move)}
                      className="px-3 py-1 bg-accent text-background rounded text-xs"
                    >
                      {JSON.stringify(move)}
                    </button>
                  ))}
                  {gameState.valid_moves.length > 10 && (
                    <span className="text-xs text-muted">+{gameState.valid_moves.length - 10} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Connect4Board({
  board,
  validMoves,
  isYourTurn,
  playerNumber,
  onMove,
}: {
  board: number[][];
  validMoves: { column: number }[];
  isYourTurn: boolean;
  playerNumber: number;
  onMove: (column: number) => void;
}) {
  const validColumns = new Set(validMoves.map((m) => m.column));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
          <button
            key={col}
            disabled={!isYourTurn || !validColumns.has(col)}
            onClick={() => onMove(col)}
            className={`w-10 h-8 rounded text-xs font-medium transition-colors ${
              isYourTurn && validColumns.has(col)
                ? 'bg-accent text-background hover:bg-accent-hover'
                : 'bg-card-hover text-muted cursor-not-allowed'
            }`}
          >
            ▼
          </button>
        ))}
      </div>
      <div className="bg-blue-900 p-2 rounded-lg">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((cell, colIdx) => (
              <div
                key={colIdx}
                className={`w-10 h-10 rounded-full border-2 border-blue-800 ${
                  cell === 1
                    ? 'bg-yellow-400'
                    : cell === 2
                    ? 'bg-red-500'
                    : 'bg-blue-950'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-sm text-muted">
        You are {playerNumber === 1 ? '🟡 Yellow' : '🔴 Red'}
      </div>
    </div>
  );
}

function CheckersBoard({
  board,
  validMoves,
  isYourTurn,
  selectedMove,
  onSelectMove,
  onMove,
}: {
  board: (number | null)[][];
  validMoves: Record<string, unknown>[];
  isYourTurn: boolean;
  selectedMove: Record<string, unknown> | null;
  onSelectMove: (move: Record<string, unknown> | null) => void;
  onMove: (move: Record<string, unknown>) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-8 gap-0 border-2 border-border">
        {board.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const isBlackSquare = (rowIdx + colIdx) % 2 === 1;
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`w-10 h-10 flex items-center justify-center ${
                  isBlackSquare ? 'bg-amber-900' : 'bg-amber-100'
                }`}
              >
                {cell !== null && cell !== 0 && (
                  <div
                    className={`w-8 h-8 rounded-full border-2 ${
                      cell === 1 || cell === 3
                        ? 'bg-red-600 border-red-800'
                        : 'bg-gray-800 border-gray-600'
                    } ${cell === 3 || cell === 4 ? 'ring-2 ring-yellow-400' : ''}`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {isYourTurn && validMoves.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {validMoves.map((move, i) => (
            <button
              key={i}
              onClick={() => onMove(move)}
              className="px-2 py-1 bg-accent text-background rounded text-xs"
            >
              Move {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
