export type JarCode = 'NEC' | 'FFA' | 'LTSS' | 'EDU' | 'PLAY' | 'GIVE';

export interface Jar {
  id: string;
  type: JarCode;
  name: string;
  targetPercentage: number;
  balance: number;
  color: string;
  description: string;
  _count?: {
    transactions: number;
  };
}

export interface TransactionEdit {
  id: string;
  snapshot: { jarId: string; amount: number; category?: string | null; note?: string | null; transactionDate: string };
  editedAt: string;
}

export interface Transaction {
  id: string;
  jarId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  note?: string;
  transactionDate: string;
  jar: {
    name: string;
    type: JarCode;
    color: string;
  };
}

export interface FinancialSummary {
  totalBalance: number;
  investmentAndSavings: number;
  babylonAsset: number;
  jars: Jar[];
}

export interface AllocateIncomeInput {
  totalAmount: number;
  note?: string;
  customAllocations?: Record<string, number>;
  transactionDate?: string;
}

export interface PeriodComparison {
  label: string;
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface CreateExpenseInput {
  jarType: JarCode;
  amount: number;
  category?: string;
  note?: string;
  transactionDate?: string;
}

export interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  targetPrice?: number | null;
  market: string;
  sector?: string | null;
  note?: string | null;
  costBasis: number;
  marketValue: number;
  profit: number;
  profitPercentage: number;
  targetDifference?: number | null;
  upsidePercentage?: number | null;
  analysis: string;
}

export interface AiStockRecommendation {
  symbol: string;
  action: 'BUY' | 'HOLD' | 'WATCH' | 'AVOID';
  confidence: number;
  trend: 'UP' | 'SIDEWAYS' | 'DOWN';
  horizon: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  estimatedChangePercentLow: number;
  estimatedChangePercentHigh: number;
  reasoning: string;
  risks: string[];
  isHeld: boolean;
}

export interface AiPortfolioAnalysis {
  summary: string;
  recommendations: AiStockRecommendation[];
  marketContext?: string;
}
