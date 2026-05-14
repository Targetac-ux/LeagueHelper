import { useEffect, useState } from 'react';

interface Props {
  sessionToken: string;
  activeProfileId: number | null;
  currentAutoMode: boolean;
  onModeChange: () => void;
}

export function ModeToggle({ sessionToken, activeProfileId, currentAutoMode, onModeChange }: Props) {
  const [autoMode, setAutoMode] = useState(currentAutoMode);

  useEffect(() => {
    setAutoMode(currentAutoMode);
  }, [currentAutoMode]);

  const toggle = async () => {
    const newMode = !autoMode;
    setAutoMode(newMode);
    if (activeProfileId !== null) {
      await fetch(`/api/profiles/${activeProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
        body: JSON.stringify({ autoMode: newMode }),
      });
      onModeChange();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: 8,
        background: '#1e293b',
        border: '1px solid #334155',
      }}
    >
      <div>
        <p style={{ margin: 0, color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>
          Auto Mode
        </p>
        <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 11 }}>
          {autoMode ? 'Automatically accepts and picks' : 'Manual confirmation required'}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={activeProfileId === null}
        style={{
          width: 52,
          height: 28,
          borderRadius: 14,
          border: 'none',
          background: autoMode ? '#22c55e' : '#475569',
          cursor: activeProfileId === null ? 'default' : 'pointer',
          position: 'relative',
          transition: 'background 0.2s',
          opacity: activeProfileId === null ? 0.5 : 1,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: autoMode ? 27 : 3,
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}
