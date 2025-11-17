'use client';

import React from 'react';
import { NumberBall } from './NumberBall';
import { zodiacMap } from '@/lib/mappings';

interface NumberGridProps {
  selectedNumbers: number[];
  onNumberSelect: (number: number) => void;
  onMultipleSelect?: (numbers: number[]) => void;
}

export const NumberGrid: React.FC<NumberGridProps> = ({ 
  selectedNumbers, 
  onNumberSelect,
  onMultipleSelect
}) => {
  // 处理生肖选择
  const handleZodiacSelect = (zodiac: string) => {
    if (!onMultipleSelect) return;
    
    const numbersToSelect = zodiacMap[zodiac] || [];
    
    // 检查是否所有相关号码都已选中
    const allSelected = numbersToSelect.every(num => selectedNumbers.includes(num));
    
    if (allSelected) {
      // 如果全部已选中，则取消选择
      const newSelectedNumbers = selectedNumbers.filter(num => !numbersToSelect.includes(num));
      onMultipleSelect(newSelectedNumbers);
    } else {
      // 如果未全部选中，则选择所有相关号码
      const newSelectedNumbers = [...new Set([...selectedNumbers, ...numbersToSelect])];
      onMultipleSelect(newSelectedNumbers);
    }
  };

  // 按指定顺序排列生肖
  const zodiacList = ['马', '羊', '猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇'];

  return (
    <div className="w-full space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">生肖快速选择</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {zodiacList.map(zodiac => {
            const zodiacNumbers = zodiacMap[zodiac] || [];
            const allSelected = zodiacNumbers.every(num => selectedNumbers.includes(num));

            return (
              <button
                key={zodiac}
                onClick={() => handleZodiacSelect(zodiac)}
                className={`
                  h-12 rounded-md border flex items-center justify-center transition-colors
                  ${allSelected ? 'bg-blue-500 border-blue-500 text-white font-bold' : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                `}
              >
                {zodiac}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 49 }, (_, i) => i + 1).map(number => (
            <div key={number} className="flex justify-center">
              <NumberBall
                number={number}
                selected={selectedNumbers.includes(number)}
                onClick={() => onNumberSelect(number)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};