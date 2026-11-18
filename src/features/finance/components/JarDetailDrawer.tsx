import type { FC } from 'react';
import { Drawer, Tag, Button, Table } from 'antd';
import { MinusCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined } from '@ant-design/icons';
import { Jar, Transaction, JarCode } from '@/types/finance';
import { formatCurrency, formatDateTime } from '@/utils/format';

interface JarDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  jar: Jar | null;
  transactions: Transaction[];
  onOpenExpense: (jarType: JarCode) => void;
  onEditExpense: (transaction: Transaction) => void;
}

export const JarDetailDrawer: FC<JarDetailDrawerProps> = ({
  open,
  onClose,
  jar,
  transactions,
  onOpenExpense,
  onEditExpense,
}) => {
  if (!jar) return null;

  const jarTransactions = transactions.filter((t) => t.jar.type === jar.type);
  const totalIncome = jarTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = jarTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const columns = [
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => (
        <span className="text-xs text-gray-500">{formatDateTime(date)}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: 'INCOME' | 'EXPENSE') =>
        type === 'INCOME' ? (
          <Tag color="green" icon={<ArrowUpOutlined />} className="text-xs rounded-full">
            Deposit
          </Tag>
        ) : (
          <Tag color="red" icon={<ArrowDownOutlined />} className="text-xs rounded-full">
            Expense
          </Tag>
        ),
    },
    {
      title: 'Category & Note',
      key: 'category',
      render: (_: unknown, record: Transaction) => (
        <div>
          <span className="text-xs font-semibold text-gray-800 block">
            {record.category || 'General'}
          </span>
          {record.note && <span className="text-xs text-gray-400">{record.note}</span>}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: Transaction) => (
        <span
          className={`font-bold text-xs ${
            record.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {record.type === 'INCOME' ? '+' : '-'} {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Transaction) => record.type === 'EXPENSE' ? (
        <Button
          size="small"
          icon={<EditOutlined />}
          aria-label={`Edit expense ${record.category || ''}`}
          title="Edit expense"
          onClick={() => onEditExpense(record)}
        />
      ) : null,
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: jar.color }} />
          <span>{jar.name}</span>
          <Tag color="blue" className="rounded-full text-xs">
            {jar.targetPercentage}%
          </Tag>
        </div>
      }
      placement="right"
      width={560}
      open={open}
      onClose={onClose}
      extra={
        <Button
          type="primary"
          danger
          size="small"
          icon={<MinusCircleOutlined />}
          onClick={() => onOpenExpense(jar.type)}
          className="rounded-lg text-xs"
        >
          Add Expense
        </Button>
      }
    >
      <div className="space-y-5">
        {/* Jar Description */}
        <p className="text-sm text-gray-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 m-0">
          {jar.description}
        </p>

        {/* Jar Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
              Current Balance
            </span>
            <div
              className={`text-lg font-black ${
                jar.balance < 0 ? 'text-red-500' : 'text-slate-800'
              }`}
            >
              {formatCurrency(jar.balance)}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-600 block mb-1">
              Total Deposits
            </span>
            <div className="text-lg font-bold text-emerald-600">
              +{formatCurrency(totalIncome)}
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-rose-500 block mb-1">
              Total Spent
            </span>
            <div className="text-lg font-bold text-rose-500">
              -{formatCurrency(totalExpense)}
            </div>
          </div>
        </div>

        {/* Specific Jar Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800 text-sm m-0">
              Transaction History ({jarTransactions.length})
            </h4>
            <span className="text-xs text-gray-400">Filtered for this jar</span>
          </div>

          <Table
            dataSource={jarTransactions}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 6, size: 'small' }}
            size="small"
            className="border rounded-xl overflow-hidden"
          />
        </div>
      </div>
    </Drawer>
  );
};
