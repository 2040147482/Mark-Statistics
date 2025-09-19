'use client';

import React from 'react';
import { getShengXiao, getSeBo } from '@/lib/mappings';

function colorToClasses(color: string) {
  switch (color) {
    case '红':
      return 'from-rose-500 to-red-600 ring-red-300';
    case '蓝':
      return 'from-sky-500 to-blue-600 ring-blue-300';
    case '绿':
      return 'from-emerald-500 to-green-600 ring-green-300';
    default:
      return 'from-gray-400 to-gray-500 ring-gray-300';
  }
}

export interface BallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  showMeta?: boolean; // 是否显示小徽标（波色/生肖）
  active?: boolean; // 选中态
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
};

export default function Ball({ number, size = 'md', showMeta = true, active = false, onClick, className }: BallProps) {
  const color = getSeBo(number);
  const sx = getShengXiao(number);
  const base = colorToClasses(color);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${base} ${sizeMap[size]} text-white font-bold shadow-sm ring-2 ${active ? 'ring-offset-2 ring-offset-white scale-105' : ''} transition-transform`}
        aria-label={`号码${number} ${color}波 ${sx}`}
      >
        <span>{number.toString().padStart(2, '0')}</span>
        {showMeta && (
          <span className="absolute -bottom-1 right-0 text-[10px] px-1 py-0.5 bg-white/90 text-gray-700 rounded shadow">
            {sx}
          </span>
        )}
      </button>
    </div>
  );
}


