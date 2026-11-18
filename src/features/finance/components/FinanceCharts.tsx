import { useState, type FC } from 'react';
import { Card } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector,
} from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { Jar } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface FinanceChartsProps {
  jars: Jar[];
}

// Interactive active-slice renderer for Pie
const renderActiveShape = (props: PieSectorDataItem) => {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle,
    endAngle,
    fill,
    payload,
    value,
  } = props as PieSectorDataItem & { payload: { fullName: string }; value: number };

  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} className="text-sm font-bold">
        {(payload as { fullName: string }).fullName}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#374151" fontSize={13}>
        {formatCurrency(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Number(innerRadius)}
        outerRadius={Number(outerRadius) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Number(outerRadius) + 12}
        outerRadius={Number(outerRadius) + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

// Custom legend renderer with toggle support
interface LegendItem {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendItem[];
  hiddenKeys: Set<string>;
  onToggle: (key: string) => void;
}

const CustomLegend: FC<CustomLegendProps> = ({ payload = [], hiddenKeys, onToggle }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
    {payload.map((entry) => {
      const hidden = hiddenKeys.has(entry.value);
      return (
        <button
          key={entry.value}
          onClick={() => onToggle(entry.value)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-all border ${
            hidden
              ? 'opacity-40 border-gray-200 bg-gray-50 text-gray-400'
              : 'border-transparent bg-white text-gray-700 shadow-xs hover:shadow-sm'
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: hidden ? '#d1d5db' : entry.color }}
          />
          {entry.value}
        </button>
      );
    })}
  </div>
);

export const FinanceCharts: FC<FinanceChartsProps> = ({ jars }) => {
  const [activePieIndex, setActivePieIndex] = useState<number | undefined>(undefined);
  const [hiddenPieKeys, setHiddenPieKeys] = useState<Set<string>>(new Set());
  const [hiddenBarKeys, setHiddenBarKeys] = useState<Set<string>>(new Set());

  const togglePieKey = (key: string) => {
    setHiddenPieKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleBarKey = (key: string) => {
    setHiddenBarKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const allPieData = jars
    .filter((j) => j.balance > 0)
    .map((j) => ({
      name: j.type,
      fullName: j.name,
      value: j.balance,
      color: j.color,
    }));

  const chartData = allPieData.filter((d) => !hiddenPieKeys.has(d.name));

  const pieLegendPayload = allPieData.map((d) => ({
    value: d.name,
    color: d.color,
  }));

  const allBarData = jars.map((j) => ({
    name: j.type,
    fullName: j.name,
    Balance: j.balance > 0 ? j.balance : 0,
    color: j.color,
  }));

  const barData = allBarData.map((d) => ({
    ...d,
    Balance: hiddenBarKeys.has(d.name) ? 0 : d.Balance,
  }));

  const barLegendPayload = allBarData.map((d) => ({
    value: d.name,
    color: d.color,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Asset Distribution Pie Chart */}
      <Card
        title={<span className="font-bold text-gray-700">6 Jars Asset Distribution</span>}
        className="rounded-2xl border border-slate-200 shadow-sm"
        bodyStyle={{ padding: '16px' }}
      >
        {allPieData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
            No funds allocated yet. Click &quot;Allocate Income&quot; to begin!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Chart area */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    activeIndex={activePieIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(undefined)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: number, _name, item) => [
                      formatCurrency(val),
                      (item.payload as { fullName: string }).fullName,
                    ]}
                    contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend rendered OUTSIDE chart — always visible */}
            <CustomLegend
              payload={pieLegendPayload}
              hiddenKeys={hiddenPieKeys}
              onToggle={togglePieKey}
            />
          </div>
        )}
      </Card>

      {/* Bar Chart */}
      <Card
        title={<span className="font-bold text-gray-700">Accumulated Wealth by Jar</span>}
        className="rounded-2xl border border-slate-200 shadow-sm"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex flex-col gap-2">
          {/* Chart area */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 16, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) =>
                    val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
                  }
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <RechartsTooltip
                  formatter={(val: number, _name, item) => [
                    formatCurrency(val),
                    (item.payload as { fullName: string }).fullName,
                  ]}
                  contentStyle={{ borderRadius: 10, fontSize: 13 }}
                  cursor={{ fill: '#f1f5f9', radius: 6 }}
                />
                <Bar dataKey="Balance" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={hiddenBarKeys.has(entry.name) ? '#e2e8f0' : entry.color}
                      opacity={hiddenBarKeys.has(entry.name) ? 0.3 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend rendered OUTSIDE chart — always visible */}
          <CustomLegend
            payload={barLegendPayload}
            hiddenKeys={hiddenBarKeys}
            onToggle={toggleBarKey}
          />
        </div>
      </Card>
    </div>
  );
};
