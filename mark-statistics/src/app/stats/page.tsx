'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DatabaseService } from '@/lib/db';
import { Draw, Bet } from '@/lib/types';
import { 
  ShengXiaoChart, 
  ShengXiaoBarChart
} from '@/components/Charts';
import { 
  calculateShengXiaoStats
} from '@/lib/stats';

export default function StatsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [includeUnsettled, setIncludeUnsettled] = useState<boolean>(true);

  useEffect(() => {
    loadData();
    
    // 监听存储变化，实现数据同步
    const handleStorageChange = () => {
      console.log('统计页面：收到数据更新事件');
      loadData();
    };
    
    // 监听 localStorage 变化（用于跨标签页同步）
    window.addEventListener('storage', handleStorageChange);
    
    // 监听自定义事件（用于同标签页内同步）
    window.addEventListener('dataUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataUpdated', handleStorageChange);
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drawsData, betsData, lastSync] = await Promise.all([
        DatabaseService.getDrawsForStats(200),
        DatabaseService.getBetsForStats(1000),
        DatabaseService.getSetting('lastSyncAt')
      ]);
      console.log('统计页面数据更新:', { draws: drawsData.length, bets: betsData.length });
      setDraws(drawsData);
      setBets(betsData);
      setLastSyncAt(typeof lastSync === 'string' ? lastSync : null);
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

  // 构建开奖映射与未开奖统计
  const drawMap = new Map<string, Draw>();
  draws.forEach(d => drawMap.set(d.id, d));
  const isBetSettled = (bet: Bet) => drawMap.has(bet.drawId);
  const unsettledCount = bets.filter(b => !isBetSettled(b)).length;

  // 根据开关过滤投注（未开奖投注仅影响依赖投注的统计）
  const filteredBets = includeUnsettled ? bets : bets.filter(isBetSettled);

  // 计算统计数据
  const shengXiaoStatsRaw = calculateShengXiaoStats(filteredBets, draws);
  
  // 转换为正确的类型
  const shengXiaoStats: Record<string, { totalBets: number; totalStake: number; totalResult: number; hitRate: number; profitRate: number }> = {};
  Object.entries(shengXiaoStatsRaw).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      shengXiaoStats[key] = {
        totalBets: (value as any).totalBets || 0,
        totalStake: (value as any).totalStake || 0,
        totalResult: (value as any).totalResult || 0,
        hitRate: (value as any).hitRate || 0,
        profitRate: (value as any).profitRate || 0
      };
    }
  });

  const tabs = [
    { id: 'overview', name: '概览', icon: '📊' },
    { id: 'zodiac', name: '生肖投注', icon: '🐲' }
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
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-500" suppressHydrationWarning>
                {lastSyncAt ? `最近更新：${new Date(lastSyncAt).toLocaleString('zh-CN')}` : '数据洞察'}
              </div>
              <label className="flex items-center space-x-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={includeUnsettled}
                  onChange={(e) => setIncludeUnsettled(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>包含未开奖</span>
              </label>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-6">
        {/* 标签页 - 移动端优化 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex gap-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
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
            {unsettledCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
                检测到 {unsettledCount} 条未开奖投注。关闭“包含未开奖”可仅统计已开奖数据。
              </div>
            )}
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
          </div>
        )}

        {/* 生肖投注标签页 */}
        {activeTab === 'zodiac' && (
          <div className="space-y-4">
            {/* 生肖投注分布（柱状图在上，饼图在下，饼图缩小） */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注柱状图</h2>
                <ShengXiaoBarChart 
                  data={shengXiaoStats}
                  type="stake"
                  height="350px"
                />
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注分布</h2>
                <ShengXiaoChart 
                  data={shengXiaoStats}
                  type="stake"
                  height="350px"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
