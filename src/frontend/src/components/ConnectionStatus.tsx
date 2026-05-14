import type { ConnectionState } from '../hooks/useWebSocket';

interface Props {
  state: ConnectionState;
}

const STATUS: Record<ConnectionState, { label: string; color: string }> = {
  connected: { label: 'Connected', color: '#22c55e' },
  connecting: { label: 'Connecting...', color: '#eab308' },
  disconnected: { label: 'Disconnected', color: '#ef4444' },
};

export function ConnectionStatus({ state }: Props) {
  const { label, color } = STATUS[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}
