'use client';

import React from 'react';
import { NumberBadge } from './NumberBadge';

interface BetHistoryProps {
  betHistory: Array<{
    id: string;
    numbers: number[];
    amount: number;
    timestamp: number;
  }>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectedBetId?: string | null;
}

export const BetHistory: React.FC<BetHistoryProps> = ({ 
  betHistory,
  onEdit,
  onDelete,
  selectedBetId
}) => {
  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto">
      {betHistory.length === 0 ? (
        <p className="text-gray-500">暂无投注记录</p>
      ) : (
        betHistory.map(bet => (
          <div key={bet.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-500">
                {formatDate(bet.timestamp)}
              </div>
              <div className="text-sm font-semibold text-red-600">
                ¥{bet.amount}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {bet.numbers.map(number => (
                <NumberBadge key={number} number={number} selected={selectedBetId === bet.id} size="sm" />
              ))}
            </div>
            {(onEdit || onDelete) && (
              <div className="flex justify-end gap-2 mt-2">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(bet.id)}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  >
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(bet.id)}
                    className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};