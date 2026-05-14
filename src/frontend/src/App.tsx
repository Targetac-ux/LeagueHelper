import { MainPanel } from './components/MainPanel';

function App() {
  return (
    <div style={container}>
      <header style={headerBar}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>LeagueHelper</h1>
      </header>
      <main style={main}>
        <MainPanel />
      </main>
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: '100dvh',
  backgroundColor: '#0a0a0f',
  color: '#f1f5f9',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const headerBar: React.CSSProperties = {
  padding: '16px 16px 0',
};

const main: React.CSSProperties = {
  padding: 16,
  maxWidth: 480,
  margin: '0 auto',
};

export default App;
