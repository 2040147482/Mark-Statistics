'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DatabaseService } from '@/lib/db';
import { Bet, PlayType } from '@/lib/types';
import { ShengXiaoBarChart } from '@/components/Charts';
import { getAllShengXiao } from '@/lib/mappings';

export default function ZodiacBettingPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedZodiac, setSelectedZodiac] = useState<string[]>([]);
  const [latestPeriod, setLatestPeriod] = useState<string>('');
  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [betsData, nextPeriodData] = await Promise.all([
        DatabaseService.getBets(500),
        DatabaseService.getNextPeriod()
      ]);
      setBets(betsData);
      setNextPeriod(nextPeriodData);
      
      // 获取最新期号用于显示
      const latest = await DatabaseService.getLatestDraw();
      if (latest) {
        setLatestPeriod(latest.period);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setSubmitting(true);
      const stake = parseFloat(formData.get('stake') as string);

      if (editingBet) {
        // 编辑模式
        await DatabaseService.updateBet(editingBet.id, {
          drawId: editingBet.drawId,
          playType: 'SHENG_XIAO' as PlayType,
          numbers: { sx: selectedZodiac },
          stake,
          odds: 1,
          result: editingBet.result
        });
        setEditingBet(null);
        alert('投注更新成功！');
      } else {
        // 新增模式
        await DatabaseService.addBet({
          drawId: nextPeriod,
          playType: 'SHENG_XIAO' as PlayType,
          numbers: { sx: selectedZodiac },
          stake,
          odds: 1, // 固定赔率为1
          result: 0
        });
        alert('投注录入成功！');
      }

      // 重新加载数据
      await loadData();
      
      // 重置表单
      setSelectedZodiac([]);
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请检查数据格式');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet);
    // 提取生肖数据
    let zodiacList: string[] = [];
    if (typeof bet.numbers === 'object' && bet.numbers !== null && 'sx' in bet.numbers) {
      zodiacList = Array.isArray(bet.numbers.sx) ? bet.numbers.sx : [bet.numbers.sx];
    }
    setSelectedZodiac(zodiacList);
  };

  const handleDelete = async (betId: string) => {
    if (confirm('确定要删除这条投注记录吗？')) {
      try {
        await DatabaseService.deleteBet(betId);
        await loadData();
        alert('删除成功！');
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBet(null);
    setSelectedZodiac([]);
  };

  // 计算生肖统计数据 - 修复统计计算
  const calculateZodiacStats = (bets: Bet[]) => {
    const zodiacList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const stats: Record<string, { totalStake: number; totalBets: number; hitRate: number; profitRate: number }> = {};
    
    // 初始化
    zodiacList.forEach(zodiac => {
      stats[zodiac] = { totalStake: 0, totalBets: 0, hitRate: 0, profitRate: 0 };
    });
    
    // 统计投注数据
    bets.forEach(bet => {
      if (bet.playType === 'SHENG_XIAO') {
        let zodiacList: string[] = [];
        if (typeof bet.numbers === 'object' && bet.numbers !== null && 'sx' in bet.numbers) {
          zodiacList = Array.isArray(bet.numbers.sx) ? bet.numbers.sx : [bet.numbers.sx];
        }
        
        // 每个生肖都加上投注金额
        zodiacList.forEach(zodiac => {
          if (stats[zodiac]) {
            stats[zodiac].totalStake += bet.stake;
            stats[zodiac].totalBets += 1;
          }
        });
      }
    });
    
    return stats;
  };

  const zodiacStats = calculateZodiacStats(bets);
  
  // 创建简化的生肖统计数据用于柱状图
  const shengXiaoStats = Object.entries(zodiacStats).map(([zodiac, stats]) => ({
    [zodiac]: {
      totalBets: stats.totalBets,
      totalStake: stats.totalStake,
      totalResult: 0,
      hitRate: 0,
      profitRate: 0
    }
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {});

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
              <h1 className="text-lg font-bold text-gray-900">生肖投注录入</h1>
            </div>
            <div className="text-xs text-gray-500">
              {latestPeriod && `最新期：${latestPeriod}，投注期：${nextPeriod}`}
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：投注录入表单 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                {editingBet ? '编辑投注' : '投注录入'}
              </h2>
              
              <form action={handleSubmit} className="space-y-4">
                {/* 期号显示 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投注期号</label>
                  <input
                    type="text"
                    value={editingBet ? editingBet.drawId : nextPeriod}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-blue-50 text-blue-800 font-medium text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingBet ? '编辑模式下不可修改期号' : '系统自动设置为下一期'}
                  </p>
                </div>

                {/* 生肖选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择生肖（可多选）</label>
                  <div className="grid grid-cols-3 gap-2">
                    {getAllShengXiao().map((zodiac) => (
                      <button
                        key={zodiac}
                        type="button"
                        className={`w-full py-3 px-3 text-center rounded-lg border-2 transition-colors ${
                          selectedZodiac.includes(zodiac) 
                            ? 'bg-purple-100 border-purple-500 text-purple-800' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                        onClick={() => setSelectedZodiac(prev => 
                          prev.includes(zodiac) 
                            ? prev.filter(z => z !== zodiac) 
                            : [...prev, zodiac]
                        )}
                      >
                        <span className="text-sm font-medium">{zodiac}</span>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" name="zodiac" value={JSON.stringify(selectedZodiac)} />
                </div>

                {/* 投注金额 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投注金额</label>
                  <input
                    type="number"
                    name="stake"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingBet ? editingBet.stake : ''}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="请输入投注金额"
                  />
                </div>


                {/* 按钮组 */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting || selectedZodiac.length === 0}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                      submitting || selectedZodiac.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {submitting ? '提交中...' : (editingBet ? '更新投注' : '确认投注')}
                  </button>
                  {editingBet && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-3 rounded-xl font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 投注记录 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">最近投注记录</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bets.filter(bet => bet.playType === 'SHENG_XIAO').slice(0, 10).map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm text-gray-600">{bet.drawId}</span>
                      <div className="flex space-x-1">
                        {(() => {
                          // 处理不同格式的 numbers 数据
                          let zodiacList: string[] = [];
                          if (Array.isArray(bet.numbers)) {
                            zodiacList = bet.numbers;
                          } else if (typeof bet.numbers === 'object' && bet.numbers !== null && 'sx' in bet.numbers) {
                            zodiacList = Array.isArray(bet.numbers.sx) ? bet.numbers.sx : [bet.numbers.sx];
                          } else if (typeof bet.numbers === 'string') {
                            zodiacList = [bet.numbers];
                          }
                          
                          return zodiacList.map((zodiac, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {zodiac}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">¥{bet.stake}</div>
                        <div className="text-xs text-gray-500">赔率 {bet.odds}</div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(bet)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-2-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {bets.filter(bet => bet.playType === 'SHENG_XIAO').length === 0 && (
                  <div className="text-center text-gray-500 py-8">暂无投注记录</div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：实时图表展示 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">生肖投注柱状图</h2>
              <ShengXiaoBarChart 
                data={shengXiaoStats}
                type="stake"
                height="400px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
