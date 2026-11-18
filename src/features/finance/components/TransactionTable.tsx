import { useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from 'antd';
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { financeApi } from '@/services/api';
import { Card, Table, Tag, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, FilterOutlined } from '@ant-design/icons';
import { Transaction, JarCode, Jar, TransactionEdit } from '@/types/finance';
import { formatCurrency, formatDateTime } from '@/utils/format';

interface TransactionTableProps {
  transactions: Transaction[];
  jars: Jar[];
  loading?: boolean;
  onEdit: (transaction: Transaction) => void;
}

export const TransactionTable: FC<TransactionTableProps> = ({
  transactions,
  jars,
  loading,
  onEdit,
}) => {
  const [historyTransaction, setHistoryTransaction] = useState<Transaction | null>(null);
  const { data: editHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['financeTransactionHistory', historyTransaction?.id],
    queryFn: () => financeApi.getTransactionHistory(historyTransaction!.id),
    enabled: Boolean(historyTransaction),
  });
  const [selectedJarFilter, setSelectedJarFilter] = useState<JarCode | 'ALL'>('ALL');

  const filteredTransactions =
    selectedJarFilter === 'ALL'
      ? transactions
      : transactions.filter((t) => t.jar.type === selectedJarFilter);

  const columns = [
    {
      title: 'Date & Time',
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
            Income
          </Tag>
        ) : (
          <Tag color="red" icon={<ArrowDownOutlined />} className="text-xs rounded-full">
            Expense
          </Tag>
        ),
    },
    {
      title: 'Jar',
      dataIndex: 'jar',
      key: 'jar',
      render: (jar: Transaction['jar']) => (
        <span className="text-xs font-semibold" style={{ color: jar.color }}>
          {jar.name}
        </span>
      ),
    },
    {
      title: 'Category & Notes',
      key: 'category',
      render: (_: unknown, record: Transaction) => (
        <div>
          <span className="text-sm font-medium text-gray-800 block">
            {record.category || 'Uncategorized'}
          </span>
          {record.note && <span className="text-xs text-gray-400">{record.note}</span>}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Transaction) => record.type === 'EXPENSE' ? (
        <div className="flex gap-1">
          <Button size="small" icon={<EditOutlined />} aria-label="Edit expense" onClick={() => onEdit(record)} />
          <Button size="small" icon={<HistoryOutlined />} aria-label="View edit history" onClick={() => setHistoryTransaction(record)} />
        </div>
      ) : null,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number, record: Transaction) => (
        <span
          className={`font-bold text-sm ${
            record.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {record.type === 'INCOME' ? '+' : '-'} {formatCurrency(amount)}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Transaction History</span>
            <Tag color="default" className="text-xs rounded-full">
              {filteredTransactions.length} records
            </Tag>
          </div>

          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-400 text-xs" />
            <span className="text-xs text-gray-500 font-normal">Filter by Jar:</span>
            <Select
              size="small"
              value={selectedJarFilter}
              onChange={(val) => setSelectedJarFilter(val as JarCode | 'ALL')}
              className="w-48 text-xs"
              options={[
                { value: 'ALL', label: 'All Jars (Overview)' },
                ...jars.map((j) => ({
                  value: j.type,
                  label: `${j.type} - ${j.name}`,
                })),
              ]}
            />
          </div>
        </div>
      }
      className="rounded-2xl border border-slate-200 shadow-sm"
      bodyStyle={{ padding: 0 }}
    >
      {(() => {
        const grouped = filteredTransactions.filter((t) => t.type === 'EXPENSE').reduce<Record<string, number>>((acc, tx) => { const key = tx.category || 'Uncategorized'; acc[key] = (acc[key] || 0) + tx.amount; return acc; }, {});
        const groups = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
        return <div className="px-4 pt-4"><h3 className="text-sm font-semibold text-gray-700 mb-2">Spending by Category</h3>{groups.length ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{groups.map(([category, amount]) => <div key={category} className="rounded-lg border border-slate-200 px-3 py-2"><div className="text-xs text-gray-500 truncate">{category}</div><div className="font-bold text-rose-600">{formatCurrency(amount)}</div></div>)}</div> : <p className="text-xs text-gray-400">No expenses to summarize.</p>}</div>;
      })()}
      <Table
        dataSource={filteredTransactions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8, size: 'small' }}
        size="small"
      />
      <Modal
        title={`Expense Edit History${historyTransaction ? ` · ${historyTransaction.category || 'Expense'}` : ''}`}
        open={Boolean(historyTransaction)}
        onCancel={() => setHistoryTransaction(null)}
        footer={null}
        width={720}
        destroyOnClose
      >
        {isHistoryLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading edit history...</div>
        ) : editHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
            <HistoryOutlined className="mb-2 text-2xl text-gray-400" />
            <p className="m-0 font-medium text-gray-700">No edits yet</p>
            <p className="mb-0 mt-1 text-sm text-gray-500">Changes to this expense will appear here.</p>
          </div>
        ) : (
          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {(editHistory as TransactionEdit[]).map((entry, index, entries) => {
              const before = entry.snapshot;
              const after = index === 0 ? historyTransaction! : entries[index - 1].snapshot;
              const beforeJar = jars.find((jar) => jar.id === before.jarId);
              const afterJarId = index === 0 ? historyTransaction!.jarId : entries[index - 1].snapshot.jarId;
              const afterJar = jars.find((jar) => jar.id === afterJarId);
              const fields = [
                { label: 'Category', oldValue: before.category || 'Uncategorized', newValue: after.category || 'Uncategorized' },
                { label: 'Amount', oldValue: formatCurrency(before.amount), newValue: formatCurrency(after.amount) },
                { label: 'Jar', oldValue: beforeJar?.name || 'Unknown jar', newValue: afterJar?.name || 'Unknown jar' },
                { label: 'Date', oldValue: formatDateTime(before.transactionDate), newValue: formatDateTime(after.transactionDate) },
                { label: 'Notes', oldValue: before.note || 'No notes', newValue: after.note || 'No notes' },
              ];
              return (
                <section key={entry.id} className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <span className="font-semibold text-gray-800">Edit {entries.length - index} of {entries.length}</span>
                    <Tag color="blue" className="m-0">{formatDateTime(entry.editedAt)}</Tag>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-x-3 gap-y-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <span>Before</span><span aria-hidden="true" /> <span>After</span>
                  </div>
                  <div className="divide-y divide-slate-100 px-4">
                    {fields.map((field) => {
                      const changed = field.oldValue !== field.newValue;
                      return <div key={field.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 text-sm">
                        <div className="min-w-0"><div className="text-[11px] text-gray-400">{field.label}</div><div className="break-words text-gray-700">{field.oldValue}</div></div>
                        <span className={`text-xs ${changed ? 'text-blue-500' : 'text-gray-300'}`} aria-label={changed ? 'changed to' : 'unchanged'}>→</span>
                        <div className="min-w-0"><div className="text-[11px] text-gray-400">{field.label}</div><div className={`break-words ${changed ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>{field.newValue}</div></div>
                      </div>;
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Modal>
    </Card>
  );
};
