'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NumberGrid } from '@/components/NumberGrid';
import { SelectedNumbers } from '@/components/SelectedNumbers';
import { ActionButtons } from '@/components/ActionButtons';
import { BetHistory } from '@/components/BetHistory';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { NumberBettingChartSplit } from '@/components/NumberBettingChartSplit';

export default function NumberBettingPage() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betHistory, setBetHistory] = useState<Array<{id: string, numbers: number[], amount: number, timestamp: number}>>([]);
  const [editingBet, setEditingBet] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 从本地存储加载投注历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('betHistory');
    if (savedHistory) {
      setBetHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存投注历史到本地存储
  useEffect(() => {
    localStorage.setItem('betHistory', JSON.stringify(betHistory));
  }, [betHistory]);

  const handleNumberClick = (number: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    if (editingBet) {
      setEditingBet(null);
    }
  };

  const handleConfirm = () => {
    if (selectedNumbers.length > 0) {
      if (editingBet) {
        // 编辑现有投注
        setBetHistory(prev => 
          prev.map(bet => 
            bet.id === editingBet 
              ? { ...bet, numbers: [...selectedNumbers], amount: betAmount }
              : bet
          )
        );
        setEditingBet(null);
      } else {
        // 创建新投注
        const newBet = {
          id: uuidv4(),
          numbers: [...selectedNumbers],
          amount: betAmount,
          timestamp: Date.now(),
        };
        setBetHistory(prev => [newBet, ...prev]);
      }
      setSelectedNumbers([]);
    }
  };

  const handleEditBet = (id: string) => {
    const bet = betHistory.find(b => b.id === id);
    if (bet) {
      setSelectedNumbers([...bet.numbers]);
      setBetAmount(bet.amount);
      setEditingBet(id);
    }
  };

  const handleDeleteBet = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setBetHistory(prev => prev.filter(bet => bet.id !== id));
    if (editingBet === id) {
      setEditingBet(null);
      setSelectedNumbers([]);
    }
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 允许完全清空输入框
    if (inputValue === '') {
      setBetAmount(0);
      return;
    }
    
    const value = parseInt(inputValue);
    // 只有当输入的是有效数字且大于0时才更新
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setBetAmount(amount);
  };

  // 计算每个号码的总投注金额
  const calculateNumberBets = () => {
    const numberBets: Record<number, number> = {};
    
    // 初始化所有号码的投注金额为0
    for (let i = 1; i <= 49; i++) {
      numberBets[i] = 0;
    }
    
    // 累加每个号码的投注金额
    betHistory.forEach(bet => {
      bet.numbers.forEach(num => {
        numberBets[num] += bet.amount;
      });
    });
    
    return numberBets;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">号码投注</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">选择号码</h2>
          <NumberGrid 
            selectedNumbers={selectedNumbers} 
            onNumberSelect={handleNumberClick}
            onMultipleSelect={(numbers) => setSelectedNumbers(numbers)}
          />
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">已选号码</h3>
            <SelectedNumbers 
              selectedNumbers={selectedNumbers} 
              onNumberRemove={handleNumberClick}
            />
            
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  投注金额
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={betAmount === 0 ? '' : betAmount}
                    onChange={handleAmountChange}
                    min="1"
                    placeholder="输入金额"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-1">
                    {[100, 200, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handleQuickAmount(amount)}
                        className={`px-2 py-1 text-xs rounded ${
                          betAmount === amount
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <ActionButtons 
                onClear={handleClear} 
                onConfirm={handleConfirm} 
                disableConfirm={selectedNumbers.length === 0}
                isEditing={!!editingBet}
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">投注历史</h2>
            <button
              type="button"
              disabled={betHistory.length === 0}
              onClick={() => setClearDialogOpen(true)}
              className={`px-3 py-1.5 text-sm rounded-md border ${betHistory.length === 0 ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'} `}
              aria-disabled={betHistory.length === 0}
            >
              清空
            </button>
          </div>
          <BetHistory 
            betHistory={betHistory} 
            onEdit={handleEditBet}
            onDelete={handleDeleteBet}
            selectedBetId={editingBet}
          />
          
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">号码投注金额柱状图（四部分）</h2>
            </div>
            <NumberBettingChartSplit
              numberBets={calculateNumberBets()}
              heightPerChart="300px"
            />
          </div>
      </div>
      </div>
      {/* 清空历史确认对话框 */}
      <ConfirmDialog
        open={clearDialogOpen}
        title="清空投注历史"
        message="此操作将删除所有投注历史记录，且不可恢复。是否确认清空？"
        confirmText="清空"
        cancelText="取消"
        onConfirm={() => {
          setBetHistory([]);
          setClearDialogOpen(false);
        }}
        onCancel={() => setClearDialogOpen(false)}
        danger
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!pendingDeleteId}
        title="确认删除"
        message="您确定要删除这条投注记录吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        danger={true}
      />
    </div>
  );
}