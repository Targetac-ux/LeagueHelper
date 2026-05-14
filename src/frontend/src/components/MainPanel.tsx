import { useState } from 'react';
import { useGameflow } from '../hooks/useGameflow';
import { ConnectionStatus } from './ConnectionStatus';
import { SummonerInfo } from './SummonerInfo';
import { GameflowDisplay } from './GameflowDisplay';
import { AcceptButton } from './AcceptButton';
import { ChampSelectPanel } from './ChampSelectPanel';
import { RunePanel } from './RunePanel';

interface Props {
  sessionToken: string;
}

export function MainPanel({ sessionToken }: Props) {
  const { connectionState, summoner, phase, champSelectData } = useGameflow(sessionToken);
  const [showRunes, setShowRunes] = useState(false);

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
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowRunes(false)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                background: !showRunes ? '#3b82f6' : '#1e293b',
                color: '#f1f5f9',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Champ Select
            </button>
            <button
              onClick={() => setShowRunes(true)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                background: showRunes ? '#3b82f6' : '#1e293b',
                color: '#f1f5f9',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Runes
            </button>
          </div>
          {showRunes ? (
            <RunePanel sessionToken={sessionToken} />
          ) : (
            <ChampSelectPanel sessionToken={sessionToken} data={champSelectData} />
          )}
        </>
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
