'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/db';
import { Draw } from '@/lib/types';
import Link from 'next/link';
import Ball from '@/components/Ball';
import { getSeBo, getShengXiao } from '@/lib/mappings';

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadDraws();
    // 默认导入最新年份数据
    handleImportHistory();
  }, []);

  const loadDraws = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getDraws(200);
      setDraws(data);
    } catch (error) {
      console.error('加载期号数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDraw = async (formData: FormData) => {
    try {
      const drawData = {
        period: formData.get('period') as string,
        openTime: formData.get('openTime') as string,
        n1: parseInt(formData.get('n1') as string),
        n2: parseInt(formData.get('n2') as string),
        n3: parseInt(formData.get('n3') as string),
        n4: parseInt(formData.get('n4') as string),
        n5: parseInt(formData.get('n5') as string),
        n6: parseInt(formData.get('n6') as string),
        sp: parseInt(formData.get('sp') as string),
      };

      await DatabaseService.addDraw(drawData);
      setShowAddForm(false);
      loadDraws();
    } catch (error) {
      console.error('添加期号失败:', error);
      alert('添加期号失败，请检查数据格式');
    }
  };

  async function handleImportHistory() {
    if (isImporting) return;
    try {
      setIsImporting(true);
      const res = await fetch(`/api/marksix/history?year=${year}`, { cache: 'no-store' });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || '导入失败');
      const list = (data.draws || []) as any[];
      let addedCount = 0;
      for (const d of list) {
        try {
          // @ts-ignore
          await DatabaseService.addDraw(d);
          addedCount++;
        } catch (_) {}
      }
      await DatabaseService.setSetting('lastSyncAt', new Date().toISOString());
      await loadDraws();
      if (addedCount > 0) {
        alert(`导入完成：${addedCount} 条(${year})`);
      }
    } catch (e: any) {
      console.error('导入失败:', e);
      // 静默失败，不弹窗
    } finally {
      setIsImporting(false);
    }
  }

  async function handleRefreshLatest() {
    try {
      const res = await fetch('/api/marksix/latest', { cache: 'no-store' });
      const data = await res.json();
      if (!data?.ok || !data?.draw) throw new Error(data?.error || '拉取失败');
      try {
        // @ts-ignore
        await DatabaseService.addDraw(data.draw);
      } catch (_) {}
      await DatabaseService.setSetting('lastSyncAt', new Date().toISOString());
      await loadDraws();
      alert(`已刷新到最新期：${data.draw.period}`);
    } catch (e: any) {
      alert(`刷新失败：${e?.message || e}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold text-gray-900">开奖记录</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                aria-label="选择年份"
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const y = String(new Date().getFullYear() - i);
                  return (
                    <option key={y} value={y}>{y}</option>
                  );
                })}
              </select>
              <button
                onClick={handleImportHistory}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                导入历史
              </button>
              <button
                onClick={handleRefreshLatest}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                刷新最新
              </button>
              <a
                href="https://live-macaujc.com/live/livestream/new.m3u8"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                直播流
              </a>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAddForm ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white'
                }`}
              >
                {showAddForm ? '取消' : '添加'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-6">

        {/* 添加表单 - 移动端优化 */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">添加新期号</h2>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <form action={handleAddDraw} className="space-y-4">
              {/* 期号和时间 */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">期号</label>
                  <input
                    type="text"
                    name="period"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                    placeholder="2025-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">开奖时间</label>
                  <input
                    type="datetime-local"
                    name="openTime"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 号码输入区域 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">开奖号码 (1-49)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num}>
                      <label className="block text-xs text-gray-500 mb-1">号码{num}</label>
                      <input
                        type="number"
                        name={`n${num}`}
                        min="1"
                        max="49"
                        required
                        className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-medium"
                        placeholder={num.toString()}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">特码</label>
                  <input
                    type="number"
                    name="sp"
                    min="1"
                    max="49"
                    required
                    className="w-full px-3 py-3 border-2 border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg font-bold text-red-600"
                    placeholder="特码"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  添加期号
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 期号列表 - 移动端卡片式布局 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">开奖记录列表</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {draws.length} 条
            </span>
          </div>
          
          {draws.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">📊</div>
              <div className="text-gray-600 mb-2">暂无期号数据</div>
              <div className="text-sm text-gray-500">点击上方"添加"开始录入数据</div>
            </div>
          ) : (
            <div className="space-y-3">
              {draws.map((draw) => (
                <div key={draw.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  {/* 期号头部 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">期</span>
                      </div>
                      <span className="font-semibold text-gray-900">{draw.period}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(draw.openTime).toLocaleDateString('zh-CN')}
                    </div>
                  </div>

                  {/* 开奖号码 */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">开奖号码</div>
                    <div className="flex flex-wrap gap-2">
                      {[draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6].map((num, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <Ball number={num} size="lg" />
                          <div className="mt-1 text-[10px] text-gray-500">
                            {getSeBo(num)} · {getShengXiao(num)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 特码 */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">特码</div>
                    <div className="flex items-center space-x-2">
                      <Ball number={draw.sp} size="lg" />
                      <div className="text-[10px] text-gray-500">
                        {getSeBo(draw.sp)} · {getShengXiao(draw.sp)}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-3">
                    <Link
                      href={`/bets?drawId=${draw.id}`}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-center text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      查看投注
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这个期号吗？')) {
                          DatabaseService.deleteDraw(draw.id).then(() => loadDraws());
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-center text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
