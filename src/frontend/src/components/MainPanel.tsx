import { useState } from 'react';
import { useGameflow } from '../hooks/useGameflow';
import { ConnectionStatus } from './ConnectionStatus';
import { SummonerInfo } from './SummonerInfo';
import { GameflowDisplay } from './GameflowDisplay';
import { AcceptButton } from './AcceptButton';
import { ChampSelectPanel } from './ChampSelectPanel';
import { RunePanel } from './RunePanel';
import { SuggestionsPanel } from './SuggestionsPanel';

interface Props {
  sessionToken: string;
}

export function MainPanel({ sessionToken }: Props) {
  const { connectionState, summoner, phase, champSelectData } = useGameflow(sessionToken);
  const [champSelectTab, setChampSelectTab] = useState<'pick' | 'runes' | 'suggestions'>('pick');

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
            <TabButton label="Pick" active={champSelectTab === 'pick'} onClick={() => setChampSelectTab('pick')} />
            <TabButton label="Runes" active={champSelectTab === 'runes'} onClick={() => setChampSelectTab('runes')} />
            <TabButton label="Suggestions" active={champSelectTab === 'suggestions'} onClick={() => setChampSelectTab('suggestions')} />
          </div>
          {champSelectTab === 'runes' && <RunePanel sessionToken={sessionToken} />}
          {champSelectTab === 'suggestions' && <SuggestionsPanel sessionToken={sessionToken} onSelect={(id) => console.log('Suggested pick:', id)} />}
          {champSelectTab === 'pick' && <ChampSelectPanel sessionToken={sessionToken} data={champSelectData} />}
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

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 0',
        borderRadius: 6,
        border: 'none',
        background: active ? '#3b82f6' : '#1e293b',
        color: '#f1f5f9',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
