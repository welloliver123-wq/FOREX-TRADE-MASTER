
export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface Account {
  id: string;
  name: string;
  propFirm: string;
  size: number;
  splitPercent: number; // The % the FIRM takes (e.g. 25%)
  startDate: string;
  status: 'Ativa' | 'Inativa';
  notes?: string;
}

export interface Trade {
  id: string;
  accountId: string;
  date: string; // ISO String
  asset: string;
  type: TradeType;
  points: number;
  valuePerPoint: number;
  lots: number;
  notes?: string;
  profitUSD: number;
}

export interface WeeklyPlan {
  id: string;
  accountId: string;
  weekStart: string; // YYYY-MM-DD
  goalUSD: number;
  goalPoints: number;
  scheduledDays: string[]; // ["Seg", "Ter", etc]
  maxTradesPerDay: number;
  strategy: string;
  startTime: string;
  endTime: string;
}

export interface AppConfig {
  usdToBrlRate: number;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  notifications: {
    goalReached: boolean;
    lossStreak: number;
    maxTradesExceeded: boolean;
  };
}

export interface AppState {
  accounts: Account[];
  trades: Trade[];
  weeklyPlans: WeeklyPlan[];
  config: AppConfig;
}

export type TabType = 'dashboard' | 'planning' | 'accounts' | 'settings';
