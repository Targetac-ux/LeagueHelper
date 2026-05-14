import { useState } from 'react';
import { QRPairing } from './components/QRPairing';
import { MainPanel } from './components/MainPanel';

type AuthState = { status: 'loading' } | { status: 'pairing' } | { status: 'paired'; sessionToken: string } | { status: 'error'; message: string };

function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('sessionToken');
    return stored ? { status: 'paired' as const, sessionToken: stored } : { status: 'pairing' as const };
  });

  const handlePair = (sessionToken: string) => {
    sessionStorage.setItem('sessionToken', sessionToken);
    setAuth({ status: 'paired', sessionToken });
  };

  return (
    <main style={{ padding: '1rem', fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      {auth.status === 'pairing' && <QRPairing onPair={handlePair} />}
      {auth.status === 'paired' && <MainPanel sessionToken={auth.sessionToken} />}
      {auth.status === 'error' && (
        <p style={{ color: '#ef4444', textAlign: 'center' }}>{auth.message}</p>
      )}
    </main>
  );
}

export default App;
