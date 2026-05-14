export type GameflowPhase =
  | 'None'
  | 'Lobby'
  | 'Matchmaking'
  | 'ReadyCheck'
  | 'ChampSelect'
  | 'GameStart'
  | 'InProgress'
  | 'Reconnect'
  | 'PreEndOfGame'
  | 'EndOfGame'
  | 'WaitingForStats';

export interface Summoner {
  displayName: string;
  puuid: string;
  summonerId: number;
  summonerLevel: number;
  profileIconId: number;
}

export interface SessionToken {
  token: string;
  expiresAt: number;
}
