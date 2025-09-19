'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DatabaseService } from '@/lib/db';
import { Draw, Bet } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState({
    totalDraws: 0,
    totalBets: 0,
    totalStake: 0,
    totalResult: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [draws, bets] = await Promise.all([
          DatabaseService.getDraws(100),
          DatabaseService.getBets(1000)
        ]);

        const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
        const totalResult = bets.reduce((sum, bet) => sum + (bet.result || 0), 0);

        setStats({
          totalDraws: draws.length,
          totalBets: bets.length,
          totalStake,
          totalResult
        });
      } catch (error) {
        console.error('加载统计数据失败:', error);
      }
    };

    loadStats();
  }, []);

  const menuItems = [
    {
      title: '期号管理',
      description: '导入和管理开奖数据',
      href: '/draws',
      icon: '📊',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      title: '投注录入',
      description: '记录投注和结算',
      href: '/bets',
      icon: '💰',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      title: '统计报表',
      description: '查看分析图表',
      href: '/stats',
      icon: '📈',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      title: '数据备份',
      description: '导入导出数据',
      href: '/backup',
      icon: '💾',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">六</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">六合彩统计</h1>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-6">
        {/* 欢迎区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">智能投注分析</h2>
          <p className="text-gray-600 text-sm">数据驱动 · 精准预测 · 科学投注</p>
        </div>

        {/* 统计卡片 - 移动端优化 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">📊</span>
              </div>
              <div className="text-xs text-gray-500">期号</div>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalDraws}</div>
            <div className="text-xs text-gray-500">已录入</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">💰</span>
              </div>
              <div className="text-xs text-gray-500">投注</div>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.totalBets}</div>
            <div className="text-xs text-gray-500">记录数</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">💵</span>
              </div>
              <div className="text-xs text-gray-500">总额</div>
            </div>
            <div className="text-lg font-bold text-gray-900">¥{stats.totalStake.toFixed(0)}</div>
            <div className="text-xs text-gray-500">投注金额</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stats.totalResult >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm ${
                  stats.totalResult >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>📈</span>
              </div>
              <div className="text-xs text-gray-500">盈亏</div>
            </div>
            <div className={`text-lg font-bold ${
              stats.totalResult >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>¥{stats.totalResult.toFixed(0)}</div>
            <div className="text-xs text-gray-500">累计</div>
          </div>
        </div>

        {/* 主要功能 - 移动端卡片式布局 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 px-1">主要功能</h3>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block p-4 rounded-xl transition-all duration-200 active:scale-95 ${item.color} border`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{item.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 直播入口 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">直播</h3>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">新澳门六合彩直播流</div>
            <a
              href="https://live-macaujc.com/live/livestream/new.m3u8"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              打开直播
            </a>
          </div>
        </div>

        {/* 快速操作 - 底部固定式 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">快速操作</h3>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/draws?action=add"
              className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors active:scale-95"
            >
              <span className="text-2xl mb-1">➕</span>
              <span className="text-xs font-medium text-gray-700">添加期号</span>
            </Link>
            <Link
              href="/bets?action=add"
              className="flex flex-col items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors active:scale-95"
            >
              <span className="text-2xl mb-1">🎯</span>
              <span className="text-xs font-medium text-gray-700">记录投注</span>
            </Link>
            <Link
              href="/stats"
              className="flex flex-col items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors active:scale-95"
            >
              <span className="text-2xl mb-1">📊</span>
              <span className="text-xs font-medium text-gray-700">查看统计</span>
            </Link>
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">
            数据本地存储 · 隐私安全 · 离线可用
          </p>
        </div>
      </div>
    </div>
  );
}

