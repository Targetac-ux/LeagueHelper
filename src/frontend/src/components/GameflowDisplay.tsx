import type { GameflowPhase } from '../hooks/useGameflow';

interface Props {
  phase: GameflowPhase;
}

const PHASE_LABELS: Partial<Record<GameflowPhase, string>> = {
  None: 'Idle',
  Lobby: 'In Lobby',
  Matchmaking: 'Searching for Match',
  ReadyCheck: 'Ready Check!',
  ChampSelect: 'Champion Select',
  GameStart: 'Game Starting',
  InProgress: 'In Game',
  Reconnect: 'Reconnecting',
  PreEndOfGame: 'Game Over',
  EndOfGame: 'End of Game',
  WaitingForStats: 'Waiting for Stats',
};

const PHASE_COLORS: Partial<Record<GameflowPhase, string>> = {
  ReadyCheck: '#eab308',
  ChampSelect: '#3b82f6',
  InProgress: '#22c55e',
  Matchmaking: '#a855f7',
};

export function GameflowDisplay({ phase }: Props) {
  const label = PHASE_LABELS[phase] || phase;
  const color = PHASE_COLORS[phase] || '#64748b';

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 8,
        backgroundColor: color + '20',
        border: `1px solid ${color}40`,
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color }}>{label}</p>
    </div>
  );
}
