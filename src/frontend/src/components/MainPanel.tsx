import { useGameflow } from '../hooks/useGameflow';
import { ConnectionStatus } from './ConnectionStatus';
import { SummonerInfo } from './SummonerInfo';
import { GameflowDisplay } from './GameflowDisplay';
import { AcceptButton } from './AcceptButton';
import { ChampSelectPanel } from './ChampSelectPanel';

interface Props {
  sessionToken: string;
}

export function MainPanel({ sessionToken }: Props) {
  const { connectionState, summoner, phase, champSelectData } = useGameflow(sessionToken);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <SummonerInfo summoner={summoner} />
        <ConnectionStatus state={connectionState} />
      </header>

      <GameflowDisplay phase={phase} />

      {connectionState === 'disconnected' && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: '#ef444410',
            border: '1px solid #ef444430',
            textAlign: 'center',
            color: '#ef4444',
            fontSize: 14,
          }}
        >
          Connection lost. Reconnecting...
        </div>
      )}

      {connectionState === 'connected' && !summoner && phase === 'None' && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: '#1e293b',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Connected. Waiting for League Client...
        </div>
      )}

      {connectionState === 'connected' && phase === 'ReadyCheck' && (
        <AcceptButton sessionToken={sessionToken} />
      )}

      {connectionState === 'connected' && phase === 'ChampSelect' && (
        <ChampSelectPanel sessionToken={sessionToken} data={champSelectData} />
      )}

      {connectionState === 'connected' && summoner && !['ReadyCheck', 'ChampSelect'].includes(phase) && (
        <div
          style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: '#1e293b',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 14,
          }}
        >
          Waiting for game events...
        </div>
      )}
    </div>
  );
}
