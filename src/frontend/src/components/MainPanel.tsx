import { useState, useEffect } from 'react';
import { useGameflow } from '../hooks/useGameflow';
import { ConnectionStatus } from './ConnectionStatus';
import { SummonerInfo } from './SummonerInfo';
import { GameflowDisplay } from './GameflowDisplay';
import { AcceptButton } from './AcceptButton';
import { ChampSelectPanel } from './ChampSelectPanel';
import { RunePanel } from './RunePanel';
import { SuggestionsPanel } from './SuggestionsPanel';
import { ProfileManager } from './ProfileManager';
import { ModeToggle } from './ModeToggle';

const APP_VERSION = '1.0.0';

interface Profile {
  id: number;
  autoMode: boolean;
  name: string;
}

interface Props {
  sessionToken: string;
}

export function MainPanel({ sessionToken }: Props) {
  const { connectionState, summoner, phase, champSelectData } = useGameflow(sessionToken);
  const [champSelectTab, setChampSelectTab] = useState<'pick' | 'runes' | 'suggestions'>('pick');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profileKey, setProfileKey] = useState(0);

  const reloadProfile = () => {
    fetch('/api/profiles/active', { headers: { 'x-session-token': sessionToken } })
      .then((r) => r.json())
      .then((data) => setActiveProfile(data?.id ? (data as Profile) : null));
  };

  useEffect(reloadProfile, [sessionToken, profileKey]);

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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ModeToggle
          sessionToken={sessionToken}
          activeProfileId={activeProfile?.id ?? null}
          currentAutoMode={activeProfile?.autoMode ?? false}
          onModeChange={() => setProfileKey((k) => k + 1)}
        />
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #334155',
            background: showSettings ? '#3b82f620' : '#1e293b',
            color: '#f1f5f9',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {showSettings ? 'Close' : 'Profiles'}
        </button>
      </div>

      {showSettings && (
        <ProfileManager
          sessionToken={sessionToken}
          onProfileChange={() => setProfileKey((k) => k + 1)}
        />
      )}

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
        activeProfile?.autoMode ? (
          <div style={{ padding: 16, borderRadius: 8, background: '#22c55e20', border: '1px solid #22c55e30', textAlign: 'center', color: '#22c55e', fontSize: 14 }}>
            Auto-accepting match...
          </div>
        ) : (
          <AcceptButton sessionToken={sessionToken} />
        )
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

      <footer style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #1e293b', marginTop: 8 }}>
        {showAbout && (
          <div
            style={{
              position: 'fixed', inset: 0, background: '#00000080', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
            }}
            onClick={() => setShowAbout(false)}
          >
            <div
              style={{
                background: '#1e293b', borderRadius: 12, padding: 24, maxWidth: 320, width: '100%',
                border: '1px solid #334155', color: '#f1f5f9', fontSize: 14,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>LeagueHelper</h3>
              <p style={{ margin: '4px 0', color: '#94a3b8' }}>v{APP_VERSION}</p>
              <p style={{ margin: '12px 0', color: '#cbd5e1', lineHeight: 1.5 }}>
                Controla la selección de campeones de League of Legends desde tu teléfono.
              </p>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: 12 }}>
                {new URL('/api/health', window.location.origin).host}
              </p>
              <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 12 }}>
                MIT License &mdash; <a href="https://github.com/Targetac-ux/LeagueHelper" target="_blank" rel="noopener" style={{ color: '#3b82f6' }}>GitHub</a>
              </p>
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  marginTop: 16, width: '100%', padding: '8px 0', borderRadius: 6,
                  border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9',
                  fontSize: 13, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
        <button onClick={() => setShowAbout(true)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
          About LeagueHelper
        </button>
      </footer>
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
