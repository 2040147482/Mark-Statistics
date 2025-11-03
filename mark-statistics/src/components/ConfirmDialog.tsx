'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 dark:bg-black/50 transition-opacity"
        onClick={onCancel}
      />

      {/* 对话框 */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[92%] max-w-sm p-5 transform transition-all duration-200 scale-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3 py-2 rounded-lg text-white ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;