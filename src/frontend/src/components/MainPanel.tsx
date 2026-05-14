import { useGameflow } from '../hooks/useGameflow';
import { ConnectionStatus } from './ConnectionStatus';
import { SummonerInfo } from './SummonerInfo';
import { GameflowDisplay } from './GameflowDisplay';

export function MainPanel() {
  const { connectionState, summoner, phase } = useGameflow();

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

      {!summoner && connectionState === 'disconnected' && (
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
          Could not connect to LeagueHelper server. Make sure the app is running on your PC.
        </div>
      )}

      {summoner && connectionState === 'connected' && (
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
