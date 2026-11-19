import { useState, type FC } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag, Alert, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, RobotOutlined } from '@ant-design/icons';
import type { AiPortfolioAnalysis, Investment } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface InvestmentPortfolioProps {
  investments: Investment[];
  onCreate: (investment: InvestmentInput) => void;
  onUpdate: (id: string, investment: InvestmentInput) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
  onAnalyze: (symbols?: string[]) => Promise<AiPortfolioAnalysis>;
}

export type InvestmentInput = {
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  targetPrice?: number;
  market: string;
  sector?: string;
  note?: string;
};

export const InvestmentPortfolio: FC<InvestmentPortfolioProps> = ({
  investments,
  onCreate,
  onUpdate,
  onDelete,
  loading,
  onAnalyze,
}) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [analysis, setAnalysis] = useState<AiPortfolioAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidateSymbols, setCandidateSymbols] = useState('');
  const [form] = Form.useForm<InvestmentInput>();

  const showModal = (investment?: Investment) => {
    setEditing(investment || null);
    form.resetFields();
    if (investment) {
      form.setFieldsValue({
        symbol: investment.symbol,
        name: investment.name,
        quantity: investment.quantity,
        averageCost: investment.averageCost,
        currentPrice: investment.currentPrice,
        targetPrice: investment.targetPrice || undefined,
        market: investment.market,
        sector: investment.sector || undefined,
        note: investment.note || undefined,
      });
    }
    setOpen(true);
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) onUpdate(editing.id, values);
      else onCreate(values);
      setOpen(false);
      form.resetFields();
    } catch {
      message.warning('Please complete the required fields.');
    }
  };

  const totalCost = investments.reduce((sum, item) => sum + item.costBasis, 0);
  const totalValue = investments.reduce((sum, item) => sum + item.marketValue, 0);
  const totalProfit = totalValue - totalCost;
  const totalProfitPercentage = totalCost ? (totalProfit / totalCost) * 100 : 0;

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const symbols = candidateSymbols
        .split(',')
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);
      setAnalysis(await onAnalyze(symbols.length ? symbols : undefined));
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'AI analysis failed.';
      message.error(detail);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const columns = [
    {
      title: 'Asset',
      key: 'asset',
      render: (_: unknown, item: Investment) => (
        <div>
          <div className="font-bold">{item.symbol}</div>
          <div className="text-xs text-slate-500">{item.name}</div>
        </div>
      ),
    },
    {
      title: 'Position',
      key: 'position',
      render: (_: unknown, item: Investment) => (
        <div>
          <div>{item.quantity} shares</div>
          <div className="text-xs text-slate-500">Cost: {formatCurrency(item.costBasis)}</div>
        </div>
      ),
    },
    {
      title: 'Current Value',
      key: 'value',
      render: (_: unknown, item: Investment) => (
        <div>
          <div className="font-semibold">{formatCurrency(item.marketValue)}</div>
          <div className="text-xs text-slate-500">{formatCurrency(item.currentPrice)} / share</div>
        </div>
      ),
    },
    {
      title: 'Profit / Loss',
      key: 'profit',
      render: (_: unknown, item: Investment) => (
        <div className={item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
          <div className="font-bold">{formatCurrency(item.profit)}</div>
          <div className="text-xs">{item.profitPercentage >= 0 ? '+' : ''}{item.profitPercentage.toFixed(2)}%</div>
        </div>
      ),
    },
    {
      title: 'AI-style Review',
      key: 'analysis',
      render: (_: unknown, item: Investment) => (
        <div>
          {item.targetPrice && (
            <div className="mb-1 text-xs text-slate-500">
              Target gap: {formatCurrency(item.targetDifference || 0)}
              {item.upsidePercentage !== null && ` (${item.upsidePercentage?.toFixed(2)}%)`}
            </div>
          )}
          <Tag color={item.profit >= 0 ? 'green' : 'red'}>{item.analysis}</Tag>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 88,
      render: (_: unknown, item: Investment) => (
        <div className="flex justify-end gap-1">
          <Button size="small" icon={<EditOutlined />} onClick={() => showModal(item)} />
          <Popconfirm title="Delete this investment?" onConfirm={() => onDelete(item.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-400">Cost Basis</div>
          <div className="mt-1 text-xl font-black">{formatCurrency(totalCost)}</div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="text-xs font-semibold uppercase text-blue-600">Current Market Value</div>
          <div className="mt-1 text-xl font-black text-blue-700">{formatCurrency(totalValue)}</div>
        </div>
        <div className={`rounded-2xl border p-4 ${totalProfit >= 0 ? 'border-emerald-100 bg-emerald-50' : 'border-rose-100 bg-rose-50'}`}>
          <div className={`text-xs font-semibold uppercase ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Total Profit / Loss</div>
          <div className={`mt-1 text-xl font-black ${totalProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(totalProfit)} ({totalProfitPercentage >= 0 ? '+' : ''}{totalProfitPercentage.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="m-0 text-base font-bold">Investment Portfolio</h3>
            <p className="m-0 mt-1 text-xs text-slate-500">Track cost basis, current value, profit/loss, and target-price difference.</p>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<RobotOutlined />}
              loading={isAnalyzing}
              onClick={runAnalysis}
              className="rounded-lg"
            >
              AI Analysis
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} className="rounded-lg">
              Add Asset
            </Button>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700">
          <RobotOutlined className="mr-2" />
          Gemini analysis estimates trends and actions. It is not financial advice or a guaranteed forecast.
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={candidateSymbols}
            onChange={(event) => setCandidateSymbols(event.target.value)}
            placeholder="Optional symbols to recommend or research, e.g. AAPL, MSFT, NVDA"
            className="rounded-lg"
          />
        </div>

        {analysis && (
          <Alert
            className="mb-4"
            type="info"
            showIcon
            message="AI portfolio review"
            description={
              <div className="space-y-3">
                <p className="m-0">{analysis.summary}</p>
                {analysis.marketContext && (
                  <p className="m-0 text-slate-500">{analysis.marketContext}</p>
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  {analysis.recommendations.map((item) => (
                    <div key={item.symbol} className="rounded-lg border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold">{item.symbol}</div>
                        <Tag color={item.action === 'BUY' ? 'green' : item.action === 'AVOID' ? 'red' : 'gold'}>
                          {item.action}
                        </Tag>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Trend: {item.trend} · {item.horizon.replace(/_/g, ' ').toLowerCase()} · Confidence: {item.confidence}%
                      </div>
                      <div className="mt-2 text-sm">
                        Estimated change: {item.estimatedChangePercentLow}% to {item.estimatedChangePercentHigh}%
                      </div>
                      <p className="mb-1 mt-2 text-sm">{item.reasoning}</p>
                      {item.risks?.length > 0 && (
                        <p className="m-0 text-xs text-rose-600">Risks: {item.risks.join('; ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        )}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={investments}
          loading={loading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 820 }}
          locale={{ emptyText: 'No investments tracked yet' }}
        />
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit Investment' : 'Add Investment'}
        onCancel={() => setOpen(false)}
        onOk={submit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ market: 'US', quantity: 1 }}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Ticker" name="symbol" rules={[{ required: true }]}>
              <Input placeholder="AAPL" />
            </Form.Item>
            <Form.Item label="Market" name="market" rules={[{ required: true }]}>
              <Select options={[{ label: 'US', value: 'US' }, { label: 'Vietnam', value: 'VN' }, { label: 'Other', value: 'OTHER' }]} />
            </Form.Item>
          </div>
          <Form.Item label="Company / Asset Name" name="name" rules={[{ required: true }]}>
            <Input placeholder="Apple Inc." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Quantity" name="quantity" rules={[{ required: true }]}>
              <InputNumber min={0.000001} precision={6} className="w-full" />
            </Form.Item>
            <Form.Item label="Average Cost" name="averageCost" rules={[{ required: true }]}>
              <InputNumber min={0.000001} precision={2} className="w-full" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item label="Current Price" name="currentPrice" rules={[{ required: true }]}>
              <InputNumber min={0.000001} precision={2} className="w-full" />
            </Form.Item>
            <Form.Item label="Target Price" name="targetPrice">
              <InputNumber min={0.000001} precision={2} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item label="Sector" name="sector">
            <Input placeholder="Technology" />
          </Form.Item>
          <Form.Item label="Note" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
