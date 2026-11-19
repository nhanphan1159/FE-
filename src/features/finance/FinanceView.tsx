import { useState, type FC } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, message, Spin } from 'antd';
import { PlusCircleFilled, MinusCircleFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { financeApi } from '@/services/api';
import { JarCode, AllocateIncomeInput, CreateExpenseInput, Jar } from '@/types/finance';
import { BabylonCard } from '@/features/finance/components/BabylonCard';
import { JarsOverview } from '@/features/finance/components/JarsOverview';
import { AllocationModal } from '@/features/finance/components/AllocationModal';
import { ExpenseModal } from '@/features/finance/components/ExpenseModal';
import { FinanceCharts } from '@/features/finance/components/FinanceCharts';
import { TransactionTable } from '@/features/finance/components/TransactionTable';
import { JarDetailDrawer } from '@/features/finance/components/JarDetailDrawer';
import { formatCurrency } from '@/utils/format';
import { PeriodComparison } from '@/features/finance/components/PeriodComparison';

export const FinanceView: FC = () => {
  const queryClient = useQueryClient();
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedJarForExpense, setSelectedJarForExpense] = useState<JarCode | undefined>();
  const [selectedJarForDrawer, setSelectedJarForDrawer] = useState<Jar | null>(null);
  const [editingExpense, setEditingExpense] = useState<import('@/types/finance').Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'));
  const [comparisonGroup, setComparisonGroup] = useState<'month' | 'year'>('month');
  const [comparisonYear, setComparisonYear] = useState(dayjs().year());

  // Fetch summary & jars
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['financeSummary'],
    queryFn: () => financeApi.getSummary(),
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: isTxLoading } = useQuery({
    queryKey: ['financeTransactions', selectedMonth.format('YYYY-MM')],
    queryFn: () => financeApi.getTransactions({ limit: 500, month: selectedMonth.format('YYYY-MM') }),
  });

  const { data: periodComparison = [] } = useQuery({
    queryKey: ['financePeriodComparison', comparisonGroup, selectedMonth.format('YYYY-MM'), comparisonYear],
    queryFn: () => financeApi.getPeriodComparison({
      groupBy: comparisonGroup,
      period: comparisonGroup === 'month'
        ? selectedMonth.format('YYYY-MM')
        : String(comparisonYear),
    }),
  });

  // Mutations
  const incomeMutation = useMutation({
    mutationFn: (data: AllocateIncomeInput) => financeApi.allocateIncome(data),
    onSuccess: async () => {
      message.success('Income successfully distributed into the 6 jars!');
      await queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
      await queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
      await queryClient.invalidateQueries({ queryKey: ['financePeriodComparison'] });
      await queryClient.refetchQueries({ queryKey: ['financeSummary'] });
      await queryClient.refetchQueries({ queryKey: ['financeTransactions'] });
      await queryClient.refetchQueries({ queryKey: ['financePeriodComparison'] });
      setIsIncomeModalOpen(false);
    },
    onError: () => message.error('Failed to allocate income. Please try again!'),
  });

  const updateExpenseMutation = useMutation({
    mutationFn: (data: CreateExpenseInput) => financeApi.updateExpense(editingExpense!.id, data),
    onSuccess: async () => {
      message.success('Expense updated; previous values saved in edit history.');
      for (const key of [['financeSummary'], ['financeTransactions'], ['financePeriodComparison'], ['financeTransactionHistory']]) {
        await queryClient.invalidateQueries({ queryKey: key });
        await queryClient.refetchQueries({ queryKey: key });
      }
      setEditingExpense(null);
    },
    onError: () => message.error('Failed to update expense.'),
  });

  const expenseMutation = useMutation({
    mutationFn: (data: CreateExpenseInput) => financeApi.createExpense(data),
    onSuccess: async (res: { isOverspent?: boolean }) => {
      if (res?.isOverspent) {
        message.warning('Expense logged (Warning: This jar is now overdrawn!)');
      } else {
        message.success('Expense recorded successfully');
      }
      await queryClient.invalidateQueries({ queryKey: ['financeSummary'] });
      await queryClient.invalidateQueries({ queryKey: ['financeTransactions'] });
      await queryClient.invalidateQueries({ queryKey: ['financePeriodComparison'] });
      await queryClient.refetchQueries({ queryKey: ['financeSummary'] });
      await queryClient.refetchQueries({ queryKey: ['financeTransactions'] });
      await queryClient.refetchQueries({ queryKey: ['financePeriodComparison'] });
      setIsExpenseModalOpen(false);
    },
    onError: () => message.error('Failed to log expense.'),
  });

  const jars = summary?.jars || [];
  const totalBalance = summary?.totalBalance || 0;
  const ffaJar = jars.find((j: Jar) => j.type === 'FFA');
  const ffaBalance = ffaJar ? ffaJar.balance : 0;

  const handleOpenExpense = (jarType?: JarCode) => {
    setSelectedJarForExpense(jarType);
    setIsExpenseModalOpen(true);
  };

  const handleSelectJar = (jar: Jar) => {
    setSelectedJarForDrawer(jar);
  };

  if (isSummaryLoading) {
    return (
      <div className="py-24 text-center">
        <Spin size="large" />
        <p className="text-gray-400 mt-3 text-sm">Loading 6 Jars financial data...</p>
      </div>
    );
  }

  // Sync selected jar with latest data if updated
  const activeDrawerJar = selectedJarForDrawer
    ? jars.find((j) => j.id === selectedJarForDrawer.id) || selectedJarForDrawer
    : null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Top Banner Actions & Total Net Worth */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Total Net Worth in 6 Jars
          </span>
          <div className="text-3xl font-black text-gray-900 mt-0.5">
            {formatCurrency(totalBalance)}
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <Button
            type="primary"
            size="large"
            icon={<PlusCircleFilled />}
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 font-medium shadow hover:bg-emerald-700 sm:w-auto"
          >
            Allocate Income (+10% Babylon)
          </Button>

          <Button
            size="large"
            danger
            icon={<MinusCircleFilled />}
            onClick={() => handleOpenExpense()}
            className="flex w-full items-center justify-center rounded-xl font-medium sm:w-auto"
          >
            Record Expense
          </Button>
        </div>
      </div>

      {/* Babylon Principle Banner */}
      <BabylonCard ffaBalance={ffaBalance} totalAssets={totalBalance} />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="m-0 text-base font-bold text-gray-800">Monthly Income & Expense</h3>
          <span className="text-xs text-gray-500">
            Income entry resets for each month; balances in the 6 jars remain cumulative
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            icon={<LeftOutlined />}
            aria-label="Previous month"
            onClick={() => setSelectedMonth((current) => current.subtract(1, 'month'))}
          />
          <DatePicker
            picker="month"
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value || dayjs().startOf('month'))}
            format="MMMM YYYY"
            allowClear={false}
            className="rounded-lg"
          />
          <Button
            size="small"
            icon={<RightOutlined />}
            aria-label="Next month"
            onClick={() => setSelectedMonth((current) => current.add(1, 'month'))}
          />
        </div>
      </div>

      {(() => {
        const monthlyIncome = transactions
          .filter((transaction) => transaction.type === 'INCOME')
          .reduce((sum, transaction) => sum + transaction.amount, 0);
        const monthlyExpense = transactions
          .filter((transaction) => transaction.type === 'EXPENSE')
          .reduce((sum, transaction) => sum + transaction.amount, 0);

        return (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase text-emerald-600">
                Income Entered This Month
              </div>
              <div className="mt-1 text-xl font-black text-emerald-700">{formatCurrency(monthlyIncome)}</div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase text-rose-600">Expenses This Month</div>
              <div className="mt-1 text-xl font-black text-rose-700">{formatCurrency(monthlyExpense)}</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase text-blue-600">Monthly Net</div>
              <div className={`mt-1 text-xl font-black ${monthlyIncome - monthlyExpense >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                {formatCurrency(monthlyIncome - monthlyExpense)}
              </div>
            </div>
          </div>
        );
      })()}

      <PeriodComparison
        data={periodComparison}
        groupBy={comparisonGroup}
        year={comparisonYear}
        onGroupByChange={(group) => {
          setComparisonGroup(group);
          if (group === 'year') setComparisonYear(selectedMonth.year());
        }}
        onYearChange={setComparisonYear}
      />

      {/* 6 Jars Overview */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 m-0">The 6 Jars Financial System</h3>
          <span className="text-xs text-gray-500">
            Click on any jar to inspect its details and itemized history
          </span>
        </div>
      </div>

      <JarsOverview
        jars={jars}
        onOpenExpense={handleOpenExpense}
        onSelectJar={handleSelectJar}
      />

      {/* Financial Charts */}
      <FinanceCharts jars={jars} />

      {/* Transaction History Table with Jar Filter */}
      <TransactionTable transactions={transactions} jars={jars} loading={isTxLoading} onEdit={setEditingExpense} />

      {/* Jar Detail & History Drawer */}
      <JarDetailDrawer
        open={Boolean(selectedJarForDrawer)}
        onClose={() => setSelectedJarForDrawer(null)}
        jar={activeDrawerJar}
        transactions={transactions}
        onOpenExpense={handleOpenExpense}
        onEditExpense={setEditingExpense}
      />

      {/* Modals */}
      <AllocationModal
        open={isIncomeModalOpen}
        onCancel={() => setIsIncomeModalOpen(false)}
        onSubmit={(data) => incomeMutation.mutate(data)}
        jars={jars}
      />

      <ExpenseModal
        open={Boolean(editingExpense) || isExpenseModalOpen}
        onCancel={() => { setIsExpenseModalOpen(false); setEditingExpense(null); }}
        onSubmit={(data) => editingExpense ? updateExpenseMutation.mutate(data) : expenseMutation.mutate(data)}
        jars={jars}
        initialJarType={selectedJarForExpense}
        initialTransaction={editingExpense}
      />
    </div>
  );
};
