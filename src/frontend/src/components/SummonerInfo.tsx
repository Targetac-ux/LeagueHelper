import type { Summoner } from '../hooks/useGameflow';

interface Props {
  summoner: Summoner | null;
}

export function SummonerInfo({ summoner }: Props) {
  if (!summoner) {
    return <p style={{ color: '#94a3b8', fontSize: 14 }}>Waiting for League Client...</p>;
  }
  return (
    <div>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>{summoner.displayName}</h2>
      <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Level {summoner.summonerLevel}</p>
    </div>
  );
}
