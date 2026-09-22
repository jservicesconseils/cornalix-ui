export interface Organization {
  id: string;
  name: string;
  location: string;
  score: number;
}

export type NistFunctionKey = 'GOVERN' | 'IDENTIFY' | 'PROTECT' | 'DETECT' | 'RESPOND' | 'RECOVER';

export interface NistFunctionScore {
  key: NistFunctionKey;
  label: string;
  score: number;
}

export interface CisControlScore {
  number: number;
  label: string;
  score: number;
}

export interface DashboardSnapshot {
  organizationId: string;
  overallScore: number;
  scoreDelta: number;
  answeredQuestions: number;
  totalQuestions: number;
  nistDomains: number;
  cisControlsCovered: number;
  lastUpdated: string;
  nistFunctionScores: NistFunctionScore[];
  cisControlScores: CisControlScore[];
  sectorAverage: number;
}
