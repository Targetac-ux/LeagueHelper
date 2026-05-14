import { useEffect, useState } from 'react';

interface Props {
  onPair: (sessionToken: string) => void;
}

interface QrData {
  url: string;
  qrSvg: string;
  expiresAt: number;
}

export function QRPairing({ onPair }: Props) {
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    fetch('/api/session/qr')
      .then((r) => r.json())
      .then((data) => {
        setQrData(data as QrData);
        setTimeLeft(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)));
      })
      .catch(() => setError('Failed to generate QR code'));
  }, []);

  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/session/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: qrData.url.split('token=')[1] }),
        });
        if (res.ok) {
          const data = (await res.json()) as { sessionToken: string };
          onPair(data.sessionToken);
          return;
        }
      } catch {
        // continue polling
      }
      setTimeLeft((prev) => {
        const next = prev - 2;
        if (next <= 0) {
          setError('QR code expired. Refresh the page.');
          return 0;
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [qrData, onPair]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
      <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 18 }}>Scan QR Code</h2>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
        Open your phone browser and scan this QR code, or open the URL below
      </p>

      {qrData && (
        <div
          style={{ padding: 12, background: '#fff', borderRadius: 12 }}
          dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
        />
      )}

      {timeLeft > 0 && (
        <p style={{ margin: 0, color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      )}

      {qrData && (
        <a
          href={qrData.url}
          style={{ color: '#3b82f6', fontSize: 12, wordBreak: 'break-all', textAlign: 'center' }}
        >
          {qrData.url}
        </a>
      )}

      {error && (
        <p style={{ margin: 0, padding: 12, borderRadius: 8, background: '#ef444410', color: '#ef4444', fontSize: 13 }}>
          {error}
        </p>
      )}
    </div>
  );
}
