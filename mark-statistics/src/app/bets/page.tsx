'use client';

import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/db';
import { Bet, Draw, PlayType } from '@/lib/types';
import Link from 'next/link';
import Ball from '@/components/Ball';
import { getAllShengXiao, getAllSeBo } from '@/lib/mappings';

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlayType, setSelectedPlayType] = useState<PlayType>('TE_MA');
  const [defaultNextPeriod, setDefaultNextPeriod] = useState<string>('');
  const [multiNumbers, setMultiNumbers] = useState<number[]>([]);
  const [multiZodiac, setMultiZodiac] = useState<string[]>([]);
  const [multiColors, setMultiColors] = useState<string[]>([]);
  const [editingBet, setEditingBet] = useState<Bet | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [betsData, drawsData] = await Promise.all([
        DatabaseService.getBets(500),
        DatabaseService.getDraws(100)
      ]);
      setBets(betsData);
      setDraws(drawsData);
      if (drawsData.length > 0) {
        const latest = drawsData[0];
        const match = /^(\d+)(?:[-_]?(\d+))?$/.exec(latest.period);
        if (match) {
          const head = match[1];
          const tail = match[2];
          setDefaultNextPeriod(tail ? `${head}-${parseInt(tail) + 1}` : String(parseInt(head) + 1));
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBet = async (formData: FormData) => {
    try {
      const periodOverride = (formData.get('periodOverride') as string)?.trim();
      const playType = formData.get('playType') as PlayType;
      const stake = parseFloat(formData.get('stake') as string);
      const odds = parseFloat(formData.get('odds') as string);

      // 根据玩法类型处理投注内容
      let numbers: any = {};
      switch (playType) {
        case 'TE_MA':
        case 'ZHENG_MA':
          {
            const raw = formData.get('numbers') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = Array.isArray(arr) ? arr.map((n: any) => parseInt(n)) : [];
          }
          break;
        case 'LIAN_MA':
          {
            const numStr = formData.get('numbers') as string;
            if (numStr && numStr.includes(',')) {
              numbers = numStr.split(',').map(n => parseInt(n.trim()));
            } else {
              const raw = numStr ? JSON.parse(numStr) : [];
              numbers = Array.isArray(raw) ? raw.map((n: any) => parseInt(n)) : [];
            }
          }
          break;
        case 'SE_BO':
          {
            const raw = formData.get('colors') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = { colors: arr };
          }
          break;
        case 'SHENG_XIAO':
          {
            const raw = formData.get('shengXiao') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = { sx: arr };
          }
          break;
        case 'HE_DAN_SHUANG':
          numbers = { heDanShuang: formData.get('heDanShuang') as string };
          break;
        default:
          numbers = formData.get('numbers') as string;
      }
      // 期号映射到 drawId：优先匹配已存在期号，否则创建占位开奖
      let drawId = '';
      if (periodOverride) {
        const existing = await DatabaseService.getDrawByPeriod(periodOverride);
        if (existing?.id) {
          drawId = existing.id;
        } else {
          const placeholderId = await DatabaseService.addDraw({
            period: periodOverride,
            openTime: new Date().toISOString(),
            n1: 0, n2: 0, n3: 0, n4: 0, n5: 0, n6: 0,
            sp: 0
          } as any);
          drawId = placeholderId;
        }
      } else if (draws[0]?.id) {
        drawId = draws[0].id;
      }

      await DatabaseService.addBet({
        drawId,
        playType,
        numbers,
        stake,
        odds,
        result: 0 // 初始结果，后续可手动结算
      });

      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('添加投注失败:', error);
      alert('添加投注失败，请检查数据格式');
    }
  };

  const getPlayTypeName = (playType: PlayType): string => {
    const names: Record<PlayType, string> = {
      'TE_MA': '特码',
      'ZHENG_MA': '正码',
      'LIAN_MA': '连码',
      'SE_BO': '色波',
      'SHENG_XIAO': '生肖',
      'HE_DAN_SHUANG': '合单/合双',
      'HE_DA_XIAO': '合大/合小',
      'WEI_DA_XIAO': '尾大/尾小'
    };
    return names[playType] || playType;
  };

  const getDrawByPeriod = (drawId: string): Draw | undefined => {
    return draws.find(draw => draw.id === drawId);
  };

  const handleEditBet = (bet: Bet) => {
    setEditingBet(bet);
    setSelectedPlayType(bet.playType);
    
    // 根据投注内容设置多选状态
    if (Array.isArray(bet.numbers)) {
      setMultiNumbers(bet.numbers);
    } else if (typeof bet.numbers === 'object') {
      if (bet.numbers.colors) {
        setMultiColors(bet.numbers.colors);
      }
      if (bet.numbers.sx) {
        setMultiZodiac(Array.isArray(bet.numbers.sx) ? bet.numbers.sx : [bet.numbers.sx]);
      }
    }
    
    setShowAddForm(true);
  };

  const handleDeleteBet = async (betId: string) => {
    if (confirm('确定要删除这条投注记录吗？')) {
      try {
        await DatabaseService.deleteBet(betId);
        loadData();
      } catch (error) {
        console.error('删除投注失败:', error);
        alert('删除投注失败');
      }
    }
  };

  const handleUpdateBet = async (formData: FormData) => {
    if (!editingBet) return;
    
    try {
      const playType = formData.get('playType') as PlayType;
      const stake = parseFloat(formData.get('stake') as string);
      const odds = parseFloat(formData.get('odds') as string);

      // 根据玩法类型处理投注内容
      let numbers: any = {};
      switch (playType) {
        case 'TE_MA':
        case 'ZHENG_MA':
          {
            const raw = formData.get('numbers') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = Array.isArray(arr) ? arr.map((n: any) => parseInt(n)) : [];
          }
          break;
        case 'LIAN_MA':
          {
            const numStr = formData.get('numbers') as string;
            if (numStr && numStr.includes(',')) {
              numbers = numStr.split(',').map(n => parseInt(n.trim()));
            } else {
              const raw = numStr ? JSON.parse(numStr) : [];
              numbers = Array.isArray(raw) ? raw.map((n: any) => parseInt(n)) : [];
            }
          }
          break;
        case 'SE_BO':
          {
            const raw = formData.get('colors') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = { colors: arr };
          }
          break;
        case 'SHENG_XIAO':
          {
            const raw = formData.get('shengXiao') as string;
            const arr = raw ? JSON.parse(raw) : [];
            numbers = { sx: arr };
          }
          break;
        case 'HE_DAN_SHUANG':
          numbers = { heDanShuang: formData.get('heDanShuang') as string };
          break;
        default:
          numbers = formData.get('numbers') as string;
      }

      await DatabaseService.updateBet(editingBet.id, {
        playType,
        numbers,
        stake,
        odds
      });

      setEditingBet(null);
      setShowAddForm(false);
      setMultiNumbers([]);
      setMultiZodiac([]);
      setMultiColors([]);
      loadData();
    } catch (error) {
      console.error('更新投注失败:', error);
      alert('更新投注失败，请检查数据格式');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
              <h1 className="text-lg font-bold text-gray-900">投注管理</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAddForm 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-green-600 text-white'
              }`}
            >
              {showAddForm ? '取消' : '添加'}
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-6 space-y-6">

        {/* 添加表单 - 移动端优化 */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBet ? '编辑投注' : '添加新投注'}
              </h2>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <form action={editingBet ? handleUpdateBet : handleAddBet} className="space-y-4">
              {/* 期号和玩法选择 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">期号（默认最新+1）</label>
                  <input
                    type="text"
                    name="periodOverride"
                    defaultValue={editingBet ? getDrawByPeriod(editingBet.drawId)?.period || '' : defaultNextPeriod}
                    disabled={!!editingBet}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${
                      editingBet ? 'bg-gray-100 text-gray-500' : ''
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingBet ? '编辑模式下不可修改期号' : '留空时将关联最近期'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">玩法类型</label>
                  <select
                    name="playType"
                    value={selectedPlayType}
                    onChange={(e) => setSelectedPlayType(e.target.value as PlayType)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  >
                    <option value="TE_MA">特码</option>
                    <option value="ZHENG_MA">正码</option>
                    <option value="LIAN_MA">连码</option>
                    <option value="SE_BO">色波</option>
                    <option value="SHENG_XIAO">生肖</option>
                    <option value="HE_DAN_SHUANG">合单/合双</option>
                    <option value="HE_DA_XIAO">合大/合小</option>
                    <option value="WEI_DA_XIAO">尾大/尾小</option>
                  </select>
                </div>
              </div>

              {/* 投注内容 - 根据玩法类型显示 */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">投注内容</h3>
                
                {(selectedPlayType === 'TE_MA' || selectedPlayType === 'ZHENG_MA') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">选择号码（可多选）</label>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 49 }).map((_, i) => i + 1).map((n) => (
                        <Ball
                          key={n}
                          number={n}
                          size="sm"
                          active={multiNumbers.includes(n)}
                          onClick={() => setMultiNumbers((prev) => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])}
                        />
                      ))}
                    </div>
                    <input type="hidden" name="numbers" value={JSON.stringify(multiNumbers)} />
                  </div>
                )}

                {selectedPlayType === 'LIAN_MA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">号码组合 (用逗号分隔)</label>
                    <input
                      type="text"
                      name="numbers"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                      placeholder="1,2,3"
                    />
                    <p className="text-xs text-gray-500 mt-1">例如：1,2,3 或 5,10,15</p>
                  </div>
                )}

                {selectedPlayType === 'SE_BO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">色波（可多选）</label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAllSeBo().map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-full py-3 px-4 text-center rounded-xl border-2 transition-colors ${
                            multiColors.includes(color) ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setMultiColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="colors" value={JSON.stringify(multiColors)} />
                  </div>
                )}

                {selectedPlayType === 'SHENG_XIAO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">生肖（可多选）</label>
                    <div className="grid grid-cols-3 gap-2">
                      {getAllShengXiao().map((zodiac) => (
                        <button
                          key={zodiac}
                          type="button"
                          className={`w-full py-2 px-3 text-center rounded-lg border-2 transition-colors ${
                            multiZodiac.includes(zodiac) ? 'bg-blue-100 border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setMultiZodiac(prev => prev.includes(zodiac) ? prev.filter(z => z !== zodiac) : [...prev, zodiac])}
                        >
                          <span className="text-sm font-medium">{zodiac}</span>
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="shengXiao" value={JSON.stringify(multiZodiac)} />
                  </div>
                )}

                {selectedPlayType === 'HE_DAN_SHUANG' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">合单/合双</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['单', '双'].map((type) => (
                        <label key={type} className="relative">
                          <input
                            type="radio"
                            name="heDanShuang"
                            value={type}
                            required
                            className="sr-only peer"
                          />
                          <div className="w-full py-3 px-4 text-center rounded-xl border-2 border-gray-200 peer-checked:bg-purple-100 peer-checked:border-purple-500 transition-colors">
                            <span className="font-medium">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 金额和赔率 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">投注金额</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    name="stake"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editingBet?.stake || ''}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    placeholder="100.00"
                  />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">赔率</label>
                  <input
                    type="number"
                    name="odds"
                    step="0.01"
                    min="1"
                    required
                    defaultValue={editingBet?.odds || 45}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    placeholder="1.95"
                  />
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBet(null);
                    setMultiNumbers([]);
                    setMultiZodiac([]);
                    setMultiColors([]);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  {editingBet ? '更新投注' : '添加投注'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 投注列表 - 移动端卡片式布局 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">投注记录</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {bets.length} 条
            </span>
          </div>
          
          {bets.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">💰</div>
              <div className="text-gray-600 mb-2">暂无投注记录</div>
              <div className="text-sm text-gray-500">点击上方"添加"开始记录投注</div>
            </div>
          ) : (
            <div className="space-y-3">
              {bets.map((bet) => {
                const draw = getDrawByPeriod(bet.drawId);
                return (
                  <div key={bet.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    {/* 投注头部 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">投</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{draw?.period || '未知期号'}</div>
                          <div className="text-xs text-gray-500">{getPlayTypeName(bet.playType)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">¥{bet.stake.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">赔率 {bet.odds.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* 投注内容 */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-500 mb-1">投注内容</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(bet.numbers) ? (
                          bet.numbers.map((num, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-bold rounded-lg"
                            >
                              {num}
                            </span>
                          ))
                        ) : typeof bet.numbers === 'object' ? (
                          Object.values(bet.numbers).map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                            >
                              {value}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                            {bet.numbers}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 盈亏状态和操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-xs text-gray-500">
                          {new Date(bet.createdAt).toLocaleDateString('zh-CN')}
                        </div>
                        <div className={`text-sm font-medium ${
                          (bet.result || 0) > 0 ? 'text-green-600' : 
                          (bet.result || 0) < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {bet.result ? `¥${bet.result.toFixed(2)}` : '未结算'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (bet.result || 0) > 0 ? 'bg-green-100 text-green-700' : 
                          (bet.result || 0) < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {(bet.result || 0) > 0 ? '盈利' : (bet.result || 0) < 0 ? '亏损' : '待结算'}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditBet(bet)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="编辑"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteBet(bet.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="删除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
