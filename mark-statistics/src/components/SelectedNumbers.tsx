'use client';

import React from 'react';

interface SelectedNumbersProps {
  selectedNumbers: number[];
  onNumberRemove: (number: number) => void;
}

export const SelectedNumbers: React.FC<SelectedNumbersProps> = ({
  selectedNumbers,
  onNumberRemove
}) => {
  const sortedNumbers = [...selectedNumbers].sort((a, b) => a - b);

  return (
    <div>
      {sortedNumbers.length === 0 ? (
        <p className="text-gray-500">尚未选择号码</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {sortedNumbers.map(number => (
            <div
              key={number}
              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-0.5"
            >
              <span className="mr-1 text-sm">{number}</span>
              <button
                onClick={() => onNumberRemove(number)}
                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                aria-label={`移除号码 ${number}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-600">
        已选择 {selectedNumbers.length} 个号码
      </div>
    </div>
  );
};