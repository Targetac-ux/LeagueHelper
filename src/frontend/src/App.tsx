import { useState } from 'react';
import { QRPairing } from './components/QRPairing';
import { VerifyScreen } from './components/VerifyScreen';
import { MainPanel } from './components/MainPanel';

type AuthState =
  | { status: 'pairing' }
  | { status: 'verifying'; token: string }
  | { status: 'paired'; sessionToken: string };

function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('sessionToken');
    if (stored) return { status: 'paired' as const, sessionToken: stored };
    const token = getTokenFromUrl();
    if (token) return { status: 'verifying' as const, token };
    return { status: 'pairing' as const };
  });

  const handlePair = (sessionToken: string) => {
    sessionStorage.setItem('sessionToken', sessionToken);
    window.history.replaceState({}, '', window.location.pathname);
    setAuth({ status: 'paired', sessionToken });
  };

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      {auth.status === 'pairing' && <QRPairing />}
      {auth.status === 'verifying' && <VerifyScreen token={auth.token} onPair={handlePair} />}
      {auth.status === 'paired' && <MainPanel sessionToken={auth.sessionToken} />}
    </main>
  );
}

export default App;
