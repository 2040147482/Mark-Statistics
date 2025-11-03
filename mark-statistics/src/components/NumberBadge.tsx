'use client';

import React from 'react';
import { redNumbers, blueNumbers, greenNumbers } from '@/lib/mappings';

interface NumberBadgeProps {
  number: number;
  selected?: boolean;
  size?: 'sm' | 'md';
}

const getBadgeColor = (number: number): string => {
  if (redNumbers.includes(number)) return 'bg-red-500';
  if (blueNumbers.includes(number)) return 'bg-blue-500';
  if (greenNumbers.includes(number)) return 'bg-green-500';
  return 'bg-gray-500';
};

export const NumberBadge: React.FC<NumberBadgeProps> = ({ number, selected = false, size = 'sm' }) => {
  const color = getBadgeColor(number);
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  const radius = size === 'sm' ? 'rounded-full' : 'rounded-full';

  return (
    <span
      className={`inline-flex items-center justify-center ${dim} ${radius} ${color} text-white font-bold shadow-sm dark:shadow-none ${selected ? 'ring-2 ring-yellow-400 shadow-md' : ''}`}
      aria-label={`号码 ${number}`}
    >
      {number.toString().padStart(2, '0')}
    </span>
  );
};

export default NumberBadge;