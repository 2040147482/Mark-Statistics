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
    <div className="w-full">
      <div className="grid grid-cols-6 gap-2">
        {/* 第一列：生肖 */}
        <div className="space-y-4">
          <div className="h-14 flex items-center justify-center font-bold">生肖</div>
          {zodiacList.map(zodiac => {
            const zodiacNumbers = zodiacMap[zodiac] || [];
            const allSelected = zodiacNumbers.every(num => selectedNumbers.includes(num));
            
            return (
              <button
                key={zodiac}
                onClick={() => handleZodiacSelect(zodiac)}
                className={`
                  h-14 w-full rounded-md border flex items-center justify-center
                  ${allSelected ? 'bg-blue-500 text-white font-bold' : 'bg-white text-gray-800'}
                  hover:bg-blue-100 transition-colors
                `}
              >
                {zodiac}
              </button>
            );
          })}
        </div>
        
        {/* 其他列：号码 */}
        {[0, 1, 2, 3, 4].map(colIndex => (
          <div key={colIndex} className="space-y-4">
            <div className="h-14 flex items-center justify-center font-bold">号码</div>
            {zodiacList.map(zodiac => {
              const zodiacNumbers = zodiacMap[zodiac] || [];
              // 每行显示该生肖对应的号码，每列最多显示一个号码
              const numberForThisCell = zodiacNumbers[colIndex];
              
              return (
                <div key={`${zodiac}-${colIndex}`} className="h-14 flex justify-center items-center">
                  {numberForThisCell && (
                    <NumberBall
                      number={numberForThisCell}
                      selected={selectedNumbers.includes(numberForThisCell)}
                      onClick={() => onNumberSelect(numberForThisCell)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};