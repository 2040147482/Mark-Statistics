'use client';

import React from 'react';
import { redNumbers, blueNumbers, greenNumbers } from '@/lib/mappings';

interface NumberBallProps {
  number: number;
  selected: boolean;
  onClick?: () => void;
}

// 根据号码确定颜色
const getBallColor = (number: number): string => {
  if (redNumbers.includes(number)) {
    return 'bg-red-500';
  } else if (blueNumbers.includes(number)) {
    return 'bg-blue-500';
  } else if (greenNumbers.includes(number)) {
    return 'bg-green-500';
  }
  return 'bg-gray-500'; // 默认颜色
};

export const NumberBall: React.FC<NumberBallProps> = ({ 
  number, 
  selected, 
  onClick 
}) => {
  const ballColor = getBallColor(number);
  
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        relative transition-all duration-200
        ${selected ? 'transform scale-110 shadow-lg' : ''}
      `}
      aria-label={`号码 ${number}`}
      aria-pressed={selected}
    >
      {/* 外圈 */}
      <div className={`
        absolute inset-0 rounded-full ${ballColor}
        flex items-center justify-center
        border-2 ${selected ? 'border-yellow-300' : 'border-white'}
        ${selected ? 'ring-4 ring-yellow-400/50' : ''}
      `}>
        {/* 号码 */}
        <span className={`
          text-white font-bold text-lg
          ${selected ? 'text-shadow-sm' : ''}
        `}>
          {number.toString().padStart(2, '0')}
        </span>
      </div>
    </button>
  );
};