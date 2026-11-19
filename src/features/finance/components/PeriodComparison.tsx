import { type FC } from 'react';
import { Button, Card, Segmented } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PeriodComparison as PeriodComparisonData } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface PeriodComparisonProps {
  data: PeriodComparisonData[];
  groupBy: 'month' | 'year';
  year: number;
  onGroupByChange: (value: 'month' | 'year') => void;
  onYearChange: (value: number) => void;
}

export const PeriodComparison: FC<PeriodComparisonProps> = ({
  data,
  groupBy,
  year,
  onGroupByChange,
  onYearChange,
}) => {
  const totals = data.reduce(
    (acc, item) => ({
      income: acc.income + item.income,
      expense: acc.expense + item.expense,
    }),
    { income: 0, expense: 0 },
  );

  return (
    <Card
      title={<span className="font-bold text-gray-700">Income vs Expense Comparison</span>}
      extra={
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {groupBy === 'year' && (
            <>
              <Button size="small" icon={<LeftOutlined />} aria-label="Previous year" onClick={() => onYearChange(year - 1)} />
              <span className="text-xs font-semibold text-gray-600">{year}</span>
              <Button size="small" icon={<RightOutlined />} aria-label="Next year" onClick={() => onYearChange(year + 1)} />
            </>
          )}
          <Segmented
            size="small"
            value={groupBy}
            onChange={(value) => onGroupByChange(value as 'month' | 'year')}
            options={[
              { label: 'By Month', value: 'month' },
              { label: 'By Year', value: 'year' },
            ]}
          />
        </div>
      }
      className="mb-6 rounded-2xl border border-slate-200 shadow-sm"
      bodyStyle={{ padding: '16px' }}
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase text-emerald-600">Total Income</div>
          <div className="mt-1 text-xl font-black text-emerald-700">{formatCurrency(totals.income)}</div>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase text-rose-600">Total Expense</div>
          <div className="mt-1 text-xl font-black text-rose-700">{formatCurrency(totals.expense)}</div>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="text-xs font-semibold uppercase text-blue-600">Net Difference</div>
          <div className={`mt-1 text-xl font-black ${totals.income - totals.expense >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
            {formatCurrency(totals.income - totals.expense)}
          </div>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'income' ? 'Income' : 'Expense']}
              contentStyle={{ borderRadius: 10, fontSize: 13 }}
            />
            <Bar dataKey="income" name="income" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
