import { useState } from 'react';

interface Props {
  sessionToken: string;
}

export function AcceptButton({ sessionToken }: Props) {
  const [status, setStatus] = useState<'idle' | 'accepting' | 'done'>('idle');

  const handleAccept = async () => {
    setStatus('accepting');
    try {
      const res = await fetch('/api/matchmaking/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-token': sessionToken },
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          backgroundColor: '#22c55e20',
          border: '1px solid #22c55e40',
          textAlign: 'center',
          color: '#22c55e',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Accepted!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
      <p style={{ margin: 0, color: '#eab308', fontSize: 16, fontWeight: 600 }}>Match Found!</p>
      <button
        onClick={handleAccept}
        disabled={status === 'accepting'}
        style={{
          width: '100%',
          padding: '16px 0',
          borderRadius: 12,
          border: 'none',
          background: status === 'accepting' ? '#16a34a' : '#22c55e',
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          cursor: status === 'accepting' ? 'default' : 'pointer',
          opacity: status === 'accepting' ? 0.7 : 1,
        }}
      >
        {status === 'accepting' ? 'Accepting...' : 'ACCEPT'}
      </button>
    </div>
  );
}
