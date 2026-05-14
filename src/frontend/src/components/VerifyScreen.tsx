import { useEffect, useState } from 'react';

interface Props {
  token: string;
  onPair: (sessionToken: string) => void;
}

export function VerifyScreen({ token, onPair }: Props) {
  const [status, setStatus] = useState<'verifying' | 'error' | 'expired'>('verifying');

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        try {
          const res = await fetch('/api/session/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          if (cancelled) return;
          if (res.ok) {
            const data = (await res.json()) as { sessionToken: string };
            onPair(data.sessionToken);
            return;
          }
          if (res.status === 403) {
            setStatus('expired');
            return;
          }
        } catch {
          // retry
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [token, onPair]);

  if (status === 'expired') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 600 }}>QR code expired</p>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Generate a new QR code on the PC and scan again.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#f1f5f9', fontSize: 15 }}>Connecting...</p>
    </div>
  );
}
