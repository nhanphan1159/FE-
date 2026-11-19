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
