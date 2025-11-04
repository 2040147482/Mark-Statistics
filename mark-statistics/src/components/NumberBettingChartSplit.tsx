'use client';

import React, { useMemo } from 'react';
import { NumberBettingChart } from '@/components/NumberBettingChart';

interface NumberBettingChartSplitProps {
  numberBets: Record<number, number>;
  heightPerChart?: string; // 每个子图高度
  className?: string;
  parts?: number; // 分割份数，默认5
}

// 将数据平均分为4等份并以2x2网格展示，保持统一X轴刻度
export const NumberBettingChartSplit: React.FC<NumberBettingChartSplitProps> = ({
  numberBets,
  heightPerChart = '280px',
  className = '',
  parts = 5,
}) => {
  // 计算全局最大值用于统一X轴刻度
  const globalMax = useMemo(() => {
    const values: number[] = Array.from({ length: 49 }, (_, i) => numberBets[i + 1] || 0);
    return Math.max(...values);
  }, [numberBets]);

  // 计算排序后的索引范围，将数据平均分为指定份数
  const ranges = useMemo(() => {
    const allNumbersData = Array.from({ length: 49 }, (_, i) => ({
      number: i + 1,
      value: numberBets[i + 1] || 0,
    }));
    const sorted = allNumbersData.sort((a, b) => b.value - a.value);
    const total = sorted.length;
    const chunk = Math.ceil(total / parts);
    return Array.from({ length: parts }, (_, idx) => ({
      start: idx * chunk,
      end: Math.min((idx + 1) * chunk, total),
    }));
  }, [numberBets, parts]);

  const titles = Array.from({ length: parts }, (_, i) => `第${i + 1}部分`);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${className}`}>
      {ranges.map((range, idx) => (
        <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <NumberBettingChart
            numberBets={numberBets}
            subsetRange={range}
            xAxisMax={globalMax}
            title={titles[idx]}
            height={heightPerChart}
            className=""
            showAll={false}
          />
        </div>
      ))}
    </div>
  );
};