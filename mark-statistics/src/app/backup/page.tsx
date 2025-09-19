'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/db';
import { ExportData } from '@/lib/types';

export default function BackupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const data = await DatabaseService.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `markstats-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('数据导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      setMessage('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage('');
      
      const text = await file.text();
      const data: ExportData = JSON.parse(text);
      
      // 验证数据格式
      if (!data.draws || !data.bets || !data.settings) {
        throw new Error('无效的数据格式');
      }
      
      await DatabaseService.importAll(data);
      setMessage('数据导入成功！页面将刷新...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('导入失败:', error);
      setMessage('导入失败，请检查文件格式');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      await DatabaseService.importAll({
        draws: [],
        bets: [],
        settings: [],
        version: '1.0.0',
        exportTime: new Date().toISOString()
      });
      
      setMessage('数据已清空！页面将刷新...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('清空失败:', error);
      setMessage('清空失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">数据备份</h1>
          <p className="text-gray-600">导入导出数据，确保数据安全</p>
        </div>

        {/* 操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 导出数据 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导出数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                将所有数据导出为 JSON 文件，包含期号、投注记录和设置
              </p>
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '导出中...' : '导出数据'}
              </button>
            </div>
          </div>

          {/* 导入数据 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">📥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">导入数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                从 JSON 文件导入数据，将覆盖现有数据
              </p>
              <label className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors inline-block">
                {loading ? '导入中...' : '选择文件导入'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 清空数据 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">清空数据</h3>
              <p className="text-sm text-gray-600 mb-4">
                清空所有数据，谨慎操作
              </p>
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '清空中...' : '清空所有数据'}
              </button>
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.includes('成功') ? 'bg-green-50 text-green-700 border border-green-200' :
            message.includes('失败') ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {message.includes('成功') ? '✅' : message.includes('失败') ? '❌' : 'ℹ️'}
              </span>
              {message}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>导出数据：</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>点击"导出数据"按钮下载 JSON 文件</li>
                <li>文件包含所有期号、投注记录和设置</li>
                <li>建议定期备份数据以防丢失</li>
              </ul>
            </div>
            <div>
              <strong>导入数据：</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>选择之前导出的 JSON 文件</li>
                <li>导入将覆盖现有数据，请谨慎操作</li>
                <li>建议导入前先导出当前数据作为备份</li>
              </ul>
            </div>
            <div>
              <strong>清空数据：</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>清空所有期号、投注记录和设置</li>
                <li>此操作不可恢复，请谨慎使用</li>
                <li>建议清空前先导出数据作为备份</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">数据统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">本地存储</div>
              <div className="text-sm text-gray-600">数据存储在浏览器本地</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">自动保存</div>
              <div className="text-sm text-gray-600">操作实时保存到本地</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">离线可用</div>
              <div className="text-sm text-gray-600">无需网络连接即可使用</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
