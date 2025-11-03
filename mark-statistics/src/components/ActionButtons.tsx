'use client';

import React from 'react';

interface ActionButtonsProps {
  onClear: () => void;
  onConfirm: () => void;
  disableConfirm: boolean;
  isEditing?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClear,
  onConfirm,
  disableConfirm,
  isEditing = false
}) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onClear}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        aria-label="清空选择"
      >
        清空
      </button>
      <button
        onClick={onConfirm}
        disabled={disableConfirm}
        className={`px-4 py-2 rounded-md transition-colors ${
          disableConfirm
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : isEditing 
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        aria-label={isEditing ? "保存修改" : "确认投注"}
      >
        {isEditing ? "保存修改" : "确认投注"}
      </button>
    </div>
  );
};