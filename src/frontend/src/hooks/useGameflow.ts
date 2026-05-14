import { useState, useEffect } from 'react';
import { useWebSocket, type ConnectionState } from './useWebSocket';

export interface Summoner {
  displayName: string;
  puuid: string;
  summonerId: number;
  summonerLevel: number;
  profileIconId: number;
}

export type GameflowPhase =
  | 'None' | 'Lobby' | 'Matchmaking' | 'ReadyCheck' | 'ChampSelect'
  | 'GameStart' | 'InProgress' | 'Reconnect' | 'PreEndOfGame'
  | 'EndOfGame' | 'WaitingForStats';

export interface GameflowState {
  connectionState: ConnectionState;
  summoner: Summoner | null;
  phase: GameflowPhase;
  champSelectData: unknown;
}

export function useGameflow(): GameflowState {
  const { connectionState, lastMessage } = useWebSocket();
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [phase, setPhase] = useState<GameflowPhase>('None');
  const [champSelectData, setChampSelectData] = useState<unknown>(null);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'bridge:connected':
        setSummoner(lastMessage.summoner as Summoner);
        break;
      case 'bridge:disconnected':
        setSummoner(null);
        setPhase('None');
        break;
      case 'gameflow:phase':
        setPhase(lastMessage.phase as GameflowPhase);
        break;
      case 'champ-select:update':
        setChampSelectData(lastMessage.data);
        break;
      case 'bridge:state':
        {
          const state = lastMessage.state as { summoner: Summoner | null; phase: GameflowPhase };
          if (state.summoner) setSummoner(state.summoner);
          setPhase(state.phase);
        }
        break;
    }
  }, [lastMessage]);

  return { connectionState, summoner, phase, champSelectData };
}
