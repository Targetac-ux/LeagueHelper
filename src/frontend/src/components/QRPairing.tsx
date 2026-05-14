import { useEffect, useState } from 'react';

interface QrData {
  url: string;
  qrSvg: string;
  expiresAt: number;
}

export function QRPairing() {
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);

  const fetchQr = () => {
    setError(null);
    setQrData(null);
    fetch('/api/session/qr')
      .then((r) => r.json())
      .then((data) => {
        setQrData(data as QrData);
        setTimeLeft(Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000)));
      })
      .catch(() => setError('Failed to generate QR code'));
  };

  useEffect(() => {
    fetchQr();
  }, []);

  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          fetchQr();
          return 300;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
      <h2 style={{ margin: '0 0 8px', color: '#f1f5f9', fontSize: 18 }}>LeagueHelper</h2>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
        Scan this QR code with your phone to control champion select
      </p>

      {qrData && (
        <div
          style={{ padding: 12, background: '#fff', borderRadius: 12 }}
          dangerouslySetInnerHTML={{ __html: qrData.qrSvg }}
        />
      )}

      {timeLeft > 0 && !error && (
        <p style={{ margin: 0, color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      )}

      {qrData && !error && (
        <a
          href={qrData.url}
          style={{ color: '#3b82f6', fontSize: 12, wordBreak: 'break-all', textAlign: 'center' }}
        >
          {qrData.url}
        </a>
      )}

      {error && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 12px', padding: 12, borderRadius: 8, background: '#ef444410', color: '#ef4444', fontSize: 13 }}>
            {error}
          </p>
          <button
            onClick={fetchQr}
            style={{
              padding: '8px 24px', borderRadius: 8, border: 'none',
              background: '#3b82f6', color: '#fff', fontSize: 14, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
