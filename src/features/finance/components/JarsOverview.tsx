import type { FC } from 'react';
import { Card, Tag, Button } from 'antd';
import { MinusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Jar, JarCode } from '@/types/finance';
import { formatCurrency } from '@/utils/format';

interface JarsOverviewProps {
  jars: Jar[];
  onOpenExpense: (jarType: JarCode) => void;
  onSelectJar: (jar: Jar) => void;
}

export const JarsOverview: FC<JarsOverviewProps> = ({ jars, onOpenExpense, onSelectJar }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {jars.map((jar) => {
        const isNegative = jar.balance < 0;

        return (
          <Card
            key={jar.id}
            className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
            bodyStyle={{ padding: '18px' }}
            onClick={() => onSelectJar(jar)}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: jar.color }}
                  />
                  <h4 className="font-bold text-gray-800 text-base m-0">{jar.name}</h4>
                </div>
                <Tag color="geekblue" className="font-semibold text-xs rounded-full px-2.5">
                  {jar.targetPercentage}%
                </Tag>
              </div>

              <div className="my-3">
                <span className="text-xs text-gray-400 block mb-0.5">Available Balance</span>
                <div
                  className={`text-2xl font-black ${
                    isNegative ? 'text-red-500' : 'text-slate-800'
                  }`}
                >
                  {formatCurrency(jar.balance)}
                </div>
                {isNegative && (
                  <span className="text-xs text-red-500 font-medium">⚠️ Budget overspent!</span>
                )}
              </div>

              <p className="text-xs text-gray-500 min-h-[34px] leading-relaxed mb-4">
                {jar.description}
              </p>
            </div>

            <div
              className="pt-3 border-t border-gray-100 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                onClick={() => onSelectJar(jar)}
                className="text-xs text-gray-500 hover:text-blue-600 px-1"
              >
                History ({jar._count?.transactions || 0})
              </Button>

              <Button
                size="small"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() => onOpenExpense(jar.type)}
                className="rounded-lg text-xs flex items-center"
              >
                Spend from jar
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
