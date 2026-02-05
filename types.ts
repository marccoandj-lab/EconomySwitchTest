
export type BoardType = 'ECONOMY' | 'SUSTAINABILITY';

export enum TileType {
  START = 'START',
  PROFIT = 'PROFIT',
  TAX = 'TAX',
  INVESTMENT = 'INVESTMENT',
  QUESTION = 'QUESTION',
  ENUM = 'ENUM',
  SWITCH = 'SWITCH',
  PRISON = 'PRISON'
}

export interface TileData {
  id: number;
  type: TileType;
  label: string;
  amount?: number;
  description?: string;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: number;
  balance: number;
  isPrisoned: boolean;
  prisonTurns: number;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  boardType: BoardType;
  diceValue: number;
  isMoving: boolean;
  gameStatus: 'SETUP' | 'PLAYING' | 'WON';
  winner: Player | null;
  logs: string[];
}

export interface AIQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: BoardType;
  reward: number;
}

export interface AIEnumeration {
  theme: string;
  expectedTerms: string[];
  reward: number;
  category: string;
}
