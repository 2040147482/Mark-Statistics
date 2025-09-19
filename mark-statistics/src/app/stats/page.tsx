'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DatabaseService } from '@/lib/db';
import { Draw, Bet, NumberStats } from '@/lib/types';
import { 
  NumberHeatmap, 
  NumberFrequency, 
  ShengXiaoChart, 
  ShengXiaoBarChart, 
  TrendChart 
} from '@/components/Charts';
import { 
  calculateNumberStats, 
  calculatePlayTypeStats, 
  calculateShengXiaoStats, 
  calculateSeBoStats,
  generateHeatmapData,
  generateTrendData
} from '@/lib/stats';

export default function StatsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drawsData, betsData, lastSync] = await Promise.all([
        DatabaseService.getDrawsForStats(200),
        DatabaseService.getBetsForStats(1000),
        DatabaseService.getSetting('lastSyncAt')
      ]);
      setDraws(drawsData);
      setBets(betsData);
      setLastSyncAt(lastSync || null);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // 计算统计数据
  const numberStats = calculateNumberStats(draws);
  const playTypeStats = calculatePlayTypeStats(bets);
  const shengXiaoStats = calculateShengXiaoStats(bets, draws);
  const seBoStats = calculateSeBoStats(bets, draws);
  const trendData = generateTrendData(bets, draws);
  // 取消号码热力矩阵

  const tabs = [
    { id: 'overview', name: '概览', icon: '📊' },
    { id: 'numbers', name: '号码分析', icon: '🔢' },
    { id: 'playtypes', name: '玩法统计', icon: '🎯' },
    { id: 'trends', name: '趋势分析', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
              <h1 className="text-lg font-bold text-gray-900">统计分析</h1>
            </div>
            <div className="text-xs text-gray-500">
              {lastSyncAt ? `最近更新：${new Date(lastSyncAt).toLocaleString('zh-CN')}` : '数据洞察'}
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-6">
        {/* 标签页 - 移动端优化 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-2 gap-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 概览标签页 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 统计卡片 - 移动端优化 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📊</span>
                  </div>
                  <div className="text-xs text-gray-500">期号</div>
                </div>
                <div className="text-xl font-bold text-gray-900">{draws.length}</div>
                <div className="text-xs text-gray-500">已录入</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">💰</span>
                  </div>
                  <div className="text-xs text-gray-500">投注</div>
                </div>
                <div className="text-xl font-bold text-gray-900">{bets.length}</div>
                <div className="text-xs text-gray-500">记录数</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">💵</span>
                  </div>
                  <div className="text-xs text-gray-500">总额</div>
                </div>
                <div className="text-lg font-bold text-gray-900">¥{bets.reduce((sum, bet) => sum + bet.stake, 0).toFixed(0)}</div>
                <div className="text-xs text-gray-500">投注金额</div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    bets.reduce((sum, bet) => sum + (bet.result || 0), 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-sm ${
                      bets.reduce((sum, bet) => sum + (bet.result || 0), 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>📈</span>
                  </div>
                  <div className="text-xs text-gray-500">盈亏</div>
                </div>
                <div className={`text-lg font-bold ${
                  bets.reduce((sum, bet) => sum + (bet.result || 0), 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>¥{bets.reduce((sum, bet) => sum + (bet.result || 0), 0).toFixed(0)}</div>
                <div className="text-xs text-gray-500">累计</div>
              </div>
            </div>

            {/* 热力矩阵已移除 */}

            {/* 生肖投注分布（柱状图在上，饼图在下，饼图缩小） */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注柱状图</h2>
                <ShengXiaoBarChart 
                  data={shengXiaoStats}
                  type="stake"
                  height="280px"
                />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注分布</h2>
                <ShengXiaoChart 
                  data={shengXiaoStats}
                  type="stake"
                  height="240px"
                />
              </div>
            </div>
          </div>
        )}

        {/* 号码分析标签页（移除热力矩阵） */}
        {activeTab === 'numbers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">号码出现频率</h2>
              <NumberFrequency 
                data={numberStats}
                showTop={15}
                height="350px"
              />
            </div>
          </div>
        )}

        {/* 玩法统计标签页 */}
        {activeTab === 'playtypes' && (
          <div className="space-y-4">
            {/* 玩法统计卡片 */}
            <div className="space-y-3">
              {playTypeStats.map((stat) => (
                <div key={stat.playType} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{stat.playType}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{stat.playType}</div>
                        <div className="text-xs text-gray-500">{stat.totalBets} 次投注</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">¥{stat.totalStake.toFixed(0)}</div>
                      <div className="text-xs text-gray-500">投注金额</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">盈亏金额</div>
                      <div className={`text-sm font-medium ${
                        stat.totalResult >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ¥{stat.totalResult.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">命中率</div>
                      <div className="text-sm font-medium text-gray-900">
                        {(stat.hitRate * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">盈利率</span>
                      <span className={`text-sm font-medium ${
                        stat.profitRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(stat.profitRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 生肖和色波分布 */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注分布</h2>
                <ShengXiaoChart 
                  data={shengXiaoStats}
                  type="stake"
                  height="300px"
                />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">色波投注分布</h2>
                <ShengXiaoChart 
                  data={seBoStats}
                  type="stake"
                  height="300px"
                />
              </div>
            </div>
          </div>
        )}

        {/* 趋势分析标签页 */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">累计盈亏趋势</h2>
              <TrendChart 
                data={trendData}
                type="cumulative"
                height="300px"
              />
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">命中率趋势</h2>
                <TrendChart 
                  data={trendData}
                  type="hitRate"
                  height="250px"
                />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">投注金额趋势</h2>
                <TrendChart 
                  data={trendData}
                  type="stake"
                  height="250px"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
