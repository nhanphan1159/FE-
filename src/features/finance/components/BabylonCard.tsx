import type { FC } from 'react';
import { Card } from 'antd';
import { CrownOutlined, RiseOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/utils/format';

interface BabylonCardProps {
  ffaBalance: number;
  totalAssets: number;
}

export const BabylonCard: FC<BabylonCardProps> = ({ ffaBalance, totalAssets }) => {
  const babylonRatio = totalAssets > 0 ? Math.round((ffaBalance / totalAssets) * 100) : 0;

  return (
    <Card className="rounded-2xl border-none bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white shadow-lg overflow-hidden relative mb-6">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 mb-3">
            <CrownOutlined /> Philosophy: The Richest Man in Babylon
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
            "A part of all you earn is yours to keep — not less than one-tenth (10%)!"
          </h3>
          <p className="text-amber-100 text-sm leading-relaxed m-0">
            Whenever income arrives, before paying anyone else, immediately allocate at least 10%
            into the <strong>Financial Freedom Account (FFA)</strong> to put your money to work and
            build compounding wealth.
          </p>
        </div>

        {/* Babylon FFA Metric */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[220px]">
          <span className="text-xs uppercase font-medium text-amber-200 block mb-1">
            Babylon Wealth Fund (FFA)
          </span>
          <div className="text-2xl font-black text-white">{formatCurrency(ffaBalance)}</div>
          <div className="mt-2 text-xs text-amber-100 flex items-center gap-1.5">
            <RiseOutlined className="text-emerald-300" />
            <span>Accounts for <strong>{babylonRatio}%</strong> of total assets</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
