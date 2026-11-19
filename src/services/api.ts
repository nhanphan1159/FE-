import axios from 'axios';
import { Todo, CreateTodoInput } from '@/types/todo';
import { FinancialSummary, AllocateIncomeInput, CreateExpenseInput, Transaction, Jar, JarCode, PeriodComparison, Investment, AiPortfolioAnalysis } from '@/types/finance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === TODOS API ===
export const todoApi = {
  getTodos: async (params?: { date?: string; month?: string; range?: 'today' | 'past' | 'future' | 'all' }) => {
    const res = await api.get<Todo[]>('/todos', { params });
    return res.data;
  },

  createTodo: async (data: CreateTodoInput) => {
    const res = await api.post<Todo>('/todos', data);
    return res.data;
  },

  updateTodo: async (id: string, data: Partial<CreateTodoInput>) => {
    const res = await api.patch<Todo>(`/todos/${id}`, data);
    return res.data;
  },

  deleteTodo: async (id: string) => {
    const res = await api.delete(`/todos/${id}`);
    return res.data;
  },

  addSubTask: async (todoId: string, title: string) => {
    const res = await api.post(`/todos/${todoId}/subtasks`, { title });
    return res.data;
  },

  toggleSubTask: async (subTaskId: string) => {
    const res = await api.patch(`/todos/subtasks/${subTaskId}/toggle`);
    return res.data;
  },

  deleteSubTask: async (subTaskId: string) => {
    const res = await api.delete(`/todos/subtasks/${subTaskId}`);
    return res.data;
  },
};

// === FINANCE API ===
export const financeApi = {
  getSummary: async () => {
    const res = await api.get<FinancialSummary>('/finance/summary');
    return res.data;
  },

  getJars: async () => {
    const res = await api.get<Jar[]>('/finance/jars');
    return res.data;
  },

  allocateIncome: async (data: AllocateIncomeInput) => {
    const res = await api.post('/finance/income/allocate', data);
    return res.data;
  },

  createExpense: async (data: CreateExpenseInput) => {
    const res = await api.post('/finance/expense', data);
    return res.data;
  },

  updateExpense: async (id: string, data: CreateExpenseInput) => {
    const res = await api.patch<Transaction>(`/finance/expense/${id}`, data);
    return res.data;
  },

  getTransactionHistory: async (id: string) => {
    const res = await api.get<import('@/types/finance').TransactionEdit[]>(`/finance/transactions/${id}/history`);
    return res.data;
  },

  getTransactions: async (params?: { jarType?: JarCode; limit?: number; month?: string; year?: string }) => {
    const res = await api.get<Transaction[]>('/finance/transactions', { params });
    return res.data;
  },

  getPeriodComparison: async (params: { groupBy: 'month' | 'year'; year?: string; period?: string }) => {
    const res = await api.get<PeriodComparison[]>('/finance/period-comparison', { params });
    return res.data;
  },

  getInvestments: async () => {
    const res = await api.get<Investment[]>('/finance/investments');
    return res.data;
  },

  createInvestment: async (data: Omit<Investment, 'id' | 'costBasis' | 'marketValue' | 'profit' | 'profitPercentage' | 'targetDifference' | 'upsidePercentage' | 'analysis'>) => {
    const res = await api.post<Investment>('/finance/investments', data);
    return res.data;
  },

  updateInvestment: async (id: string, data: Omit<Investment, 'id' | 'costBasis' | 'marketValue' | 'profit' | 'profitPercentage' | 'targetDifference' | 'upsidePercentage' | 'analysis'>) => {
    const res = await api.patch<Investment>(`/finance/investments/${id}`, data);
    return res.data;
  },

  deleteInvestment: async (id: string) => {
    const res = await api.delete(`/finance/investments/${id}`);
    return res.data;
  },

  analyzeInvestments: async (symbols?: string[]) => {
    const res = await api.post<AiPortfolioAnalysis>('/finance/ai/analyze', { symbols });
    return res.data;
  },
};
