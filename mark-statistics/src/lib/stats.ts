import { Draw, Bet, NumberStats, PlayTypeStats, TimeStats } from './types';
import { getShengXiao, getSeBo } from './mappings';

// 号码冷热统计
export const calculateNumberStats = (draws: Draw[]): NumberStats[] => {
  const stats: NumberStats[] = [];
  
  // 初始化 1-49 号码统计
  for (let i = 1; i <= 49; i++) {
    stats.push({
      number: i,
      frequency: 0,
      maxGap: 0,
      avgGap: 0,
      currentGap: 0
    });
  }
  
  // 统计出现次数
  draws.forEach(draw => {
    const numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
    numbers.forEach(num => {
      if (num >= 1 && num <= 49) {
        stats[num - 1].frequency++;
      }
    });
  });
  
  // 计算遗漏
  draws.forEach((draw) => {
    const numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
    const appearedNumbers = new Set(numbers);
    
    stats.forEach(stat => {
      if (!appearedNumbers.has(stat.number)) {
        stat.currentGap++;
        stat.maxGap = Math.max(stat.maxGap, stat.currentGap);
      } else {
        stat.currentGap = 0;
      }
    });
  });
  
  // 计算平均遗漏
  stats.forEach(stat => {
    if (stat.frequency > 0) {
      stat.avgGap = (draws.length - stat.frequency) / stat.frequency;
    }
  });
  
  return stats.sort((a, b) => b.frequency - a.frequency);
};

// 玩法统计
export const calculatePlayTypeStats = (bets: Bet[]): PlayTypeStats[] => {
  const statsMap = new Map<string, PlayTypeStats>();
  
  bets.forEach(bet => {
    const key = bet.playType;
    if (!statsMap.has(key)) {
      statsMap.set(key, {
        playType: bet.playType,
        totalBets: 0,
        totalStake: 0,
        totalResult: 0,
        hitRate: 0,
        profitRate: 0
      });
    }
    
    const stat = statsMap.get(key)!;
    stat.totalBets++;
    stat.totalStake += bet.stake;
    stat.totalResult += bet.result || 0;
  });
  
  // 计算命中率和盈利率
  statsMap.forEach(stat => {
    const winningBets = bets.filter(bet => 
      bet.playType === stat.playType && (bet.result || 0) > 0
    ).length;
    
    stat.hitRate = stat.totalBets > 0 ? winningBets / stat.totalBets : 0;
    stat.profitRate = stat.totalStake > 0 ? stat.totalResult / stat.totalStake : 0;
  });
  
  return Array.from(statsMap.values()).sort((a, b) => b.totalStake - a.totalStake);
};

// 号码投注统计
export const calculateNumberBetStats = (bets: Bet[]): NumberStats[] => {
  const stats: NumberStats[] = [];
  
  // 初始化 1-49 号码统计
  for (let i = 1; i <= 49; i++) {
    stats.push({
      number: i,
      frequency: 0,
      maxGap: 0,
      avgGap: 0,
      currentGap: 0,
      totalStake: 0,
      totalResult: 0,
      hitRate: 0,
      profitRate: 0
    });
  }
  
  // 统计投注数据
  bets.forEach(bet => {
    if (bet.playType === 'TE_MA' || bet.playType === 'ZHENG_MA' || bet.playType === 'LIAN_MA' || bet.playType === 'MIXED_BET') {
      let numbers: number[] = [];
      
      if (Array.isArray(bet.numbers)) {
        numbers = bet.numbers;
      } else if (typeof bet.numbers === 'string' && bet.numbers.includes(',')) {
        numbers = bet.numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      } else if (typeof bet.numbers === 'object' && bet.numbers.numbers) {
        numbers = Array.isArray(bet.numbers.numbers) ? bet.numbers.numbers : [bet.numbers.numbers];
      }
      
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          const stat = stats[num - 1];
          stat.frequency++;
          stat.totalStake += bet.stake;
          stat.totalResult += bet.result || 0;
        }
      });
    }
  });
  
  // 计算命中率和盈利率
  stats.forEach(stat => {
    if (stat.frequency > 0) {
      const winningBets = bets.filter(bet => {
        if (bet.playType !== 'TE_MA' && bet.playType !== 'ZHENG_MA' && bet.playType !== 'LIAN_MA' && bet.playType !== 'MIXED_BET') return false;
        
        let numbers: number[] = [];
        if (Array.isArray(bet.numbers)) {
          numbers = bet.numbers;
        } else if (typeof bet.numbers === 'string' && bet.numbers.includes(',')) {
          numbers = bet.numbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        } else if (typeof bet.numbers === 'object' && bet.numbers.numbers) {
          numbers = Array.isArray(bet.numbers.numbers) ? bet.numbers.numbers : [bet.numbers.numbers];
        }
        
        return numbers.includes(stat.number) && (bet.result || 0) > 0;
      }).length;
      
      stat.hitRate = winningBets / stat.frequency;
      stat.profitRate = stat.totalStake > 0 ? stat.totalResult / stat.totalStake : 0;
    }
  });
  
  return stats.sort((a, b) => b.totalStake - a.totalStake);
};

// 时间维度统计
export const calculateTimeStats = (bets: Bet[], draws: Draw[]): TimeStats[] => {
  const statsMap = new Map<string, TimeStats>();
  
  // 创建期号到开奖数据的映射
  const drawMap = new Map<string, Draw>();
  draws.forEach(draw => {
    // 以 draw.id 建索引，便于用 bet.drawId 直接映射
    drawMap.set(draw.id, draw);
  });
  
  bets.forEach(bet => {
    const draw = drawMap.get(bet.drawId);
    if (!draw) return;
    
    const period = draw.period;
    if (!statsMap.has(period)) {
      statsMap.set(period, {
        period,
        totalBets: 0,
        totalStake: 0,
        totalResult: 0,
        hitRate: 0
      });
    }
    
    const stat = statsMap.get(period)!;
    stat.totalBets++;
    stat.totalStake += bet.stake;
    stat.totalResult += bet.result || 0;
  });
  
  // 计算命中率
  statsMap.forEach(stat => {
    const periodBets = bets.filter(bet => {
      const draw = drawMap.get(bet.drawId);
      return draw?.period === stat.period;
    });
    
    const winningBets = periodBets.filter(bet => (bet.result || 0) > 0).length;
    stat.hitRate = stat.totalBets > 0 ? winningBets / stat.totalBets : 0;
  });
  
  return Array.from(statsMap.values()).sort((a, b) => b.period.localeCompare(a.period));
};

// 生肖统计
export const calculateShengXiaoStats = (bets: Bet[], draws: Draw[]): Record<string, unknown> => {
  const stats: Record<string, unknown> = {};
  const shengXiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  // 初始化生肖统计
  shengXiaoList.forEach(sx => {
    stats[sx] = {
      totalBets: 0,
      totalStake: 0,
      totalResult: 0,
      hitRate: 0,
      profitRate: 0
    };
  });
  
  // 创建期号到开奖数据的映射
  const drawMap = new Map<string, Draw>();
  draws.forEach(draw => {
    drawMap.set(draw.id, draw);
  });
  
  bets.forEach(bet => {
    if (bet.playType !== 'SHENG_XIAO') return;

    const draw = drawMap.get(bet.drawId);
    if (!draw) return;

    const drawNumbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
    const drawShengXiao = new Set(drawNumbers.map(num => getShengXiao(num)));

    // 兼容单选与多选：numbers 可能为 { sx: string | string[] } 或 string | string[]
    let selections: string[] = [];
    const raw = (bet.numbers as { sx?: string | string[] })?.sx ?? bet.numbers;
    if (Array.isArray(raw)) selections = raw as string[];
    else if (typeof raw === 'string') selections = [raw];

    // 计算每个生肖对应的号码数量
    const getShengXiaoNumberCount = (sx: string): number => {
      const zodiacMap: Record<string, number[]> = {
        '鼠': [6, 18, 30, 42],
        '牛': [5, 17, 29, 41],
        '虎': [4, 16, 28, 40],
        '兔': [3, 15, 27, 39],
        '龙': [2, 14, 26, 38],
        '蛇': [1, 13, 25, 37, 49],
        '马': [12, 24, 36, 48],
        '羊': [11, 23, 35, 47],
        '猴': [10, 22, 34, 46],
        '鸡': [9, 21, 33, 45],
        '狗': [8, 20, 32, 44],
        '猪': [7, 19, 31, 43]
      };
      return zodiacMap[sx]?.length || 0;
    };

    // 计算总号码数量
    const totalNumberCount = selections.reduce((sum, sx) => sum + getShengXiaoNumberCount(sx), 0);
    
    // 按号码数量计算投注金额：每个号码的投注金额 = 总投注金额 / 总号码数量
    const stakePerNumber = totalNumberCount > 0 ? bet.stake / totalNumberCount : 0;

    selections.forEach((sx: string) => {
      if (!stats[sx]) return;
      const numberCount = getShengXiaoNumberCount(sx);
      const actualStake = stakePerNumber * numberCount;
      
      stats[sx].totalBets += 1; // 每个生肖计作一次投注
      stats[sx].totalStake += actualStake; // 按号码数量分摊的投注金额
      
      // 仅当命中该生肖时累计收益
      if (drawShengXiao.has(sx)) {
        stats[sx].totalResult += actualStake * bet.odds; // 按实际投注金额计算收益
      } else {
        stats[sx].totalResult -= actualStake; // 未命中时扣除投注金额
      }
    });
  });
  
  // 计算命中率和盈利率
  shengXiaoList.forEach(sx => {
    const stat = stats[sx];
    // 命中率：按生肖投注次数统计
    const winningBets = bets.reduce((acc, bet) => {
      if (bet.playType !== 'SHENG_XIAO') return acc;
      const draw = drawMap.get(bet.drawId);
      if (!draw) return acc;
      
      const drawNumbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
      const drawShengXiao = new Set(drawNumbers.map(num => getShengXiao(num)));
      
      const raw = (bet.numbers as { sx?: string | string[] })?.sx ?? bet.numbers;
      let selections: string[] = [];
      if (Array.isArray(raw)) selections = raw as string[]; 
      else if (typeof raw === 'string') selections = [raw];
      
      if (selections.includes(sx) && drawShengXiao.has(sx)) return acc + 1;
      return acc;
    }, 0);

    stat.hitRate = stat.totalBets > 0 ? winningBets / stat.totalBets : 0;
    stat.profitRate = stat.totalStake > 0 ? stat.totalResult / stat.totalStake : 0;
  });
  
  return stats;
};

// 色波统计
export const calculateSeBoStats = (bets: Bet[], draws: Draw[]): Record<string, unknown> => {
  const stats: Record<string, unknown> = {};
  const seBoList = ['红', '蓝', '绿'];
  
  // 初始化色波统计
  seBoList.forEach(color => {
    stats[color] = {
      totalBets: 0,
      totalStake: 0,
      totalResult: 0,
      hitRate: 0,
      profitRate: 0
    };
  });
  
  // 创建期号到开奖数据的映射
  const drawMap = new Map<string, Draw>();
  draws.forEach(draw => {
    drawMap.set(draw.id, draw);
  });
  
  bets.forEach(bet => {
    if (bet.playType !== 'SE_BO') return;
    
    const draw = drawMap.get(bet.drawId);
    if (!draw) return;
    
    // 获取开奖号码的色波
    const drawNumbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
    const drawSeBo = drawNumbers.map(num => getSeBo(num));
    
    // 检查投注的色波是否命中
    const betSeBo = (bet.numbers as { color?: string })?.color || bet.numbers;
    const isHit = drawSeBo.includes(betSeBo as string);
    
    if (stats[betSeBo]) {
      stats[betSeBo].totalBets++;
      stats[betSeBo].totalStake += bet.stake;
      stats[betSeBo].totalResult += bet.result || 0;
    }
  });
  
  // 计算命中率和盈利率
  seBoList.forEach(color => {
    const stat = stats[color];
    const winningBets = bets.filter(bet => {
      if (bet.playType !== 'SE_BO') return false;
      const betSeBo = (bet.numbers as { color?: string })?.color || bet.numbers;
      return betSeBo === color && (bet.result || 0) > 0;
    }).length;
    
    stat.hitRate = stat.totalBets > 0 ? winningBets / stat.totalBets : 0;
    stat.profitRate = stat.totalStake > 0 ? stat.totalResult / stat.totalStake : 0;
  });
  
  return stats;
};

// 热力图数据生成（1-49 号码热度矩阵）
export const generateHeatmapData = (draws: Draw[], windowSize = 20): number[][] => {
  const data: number[][] = [];
  
  // 按时间窗口分组
  for (let i = 0; i < draws.length; i += windowSize) {
    const window = draws.slice(i, i + windowSize);
    const frequency = Array(49).fill(0);
    
    window.forEach(draw => {
      const numbers = [draw.n1, draw.n2, draw.n3, draw.n4, draw.n5, draw.n6, draw.sp];
      numbers.forEach(num => {
        if (num >= 1 && num <= 49) {
          frequency[num - 1]++;
        }
      });
    });
    
    data.push(frequency);
  }
  
  return data;
};

// 趋势数据生成
export const generateTrendData = (bets: Bet[], draws: Draw[]): unknown[] => {
  const trendData: unknown[] = [];
  const drawMap = new Map<string, Draw>();
  draws.forEach(draw => {
    drawMap.set(draw.period, draw);
  });
  
  // 按期号分组统计
  const periodStats = new Map<string, unknown>();
  
  bets.forEach(bet => {
    const draw = drawMap.get(bet.drawId);
    if (!draw) return;
    
    const period = draw.period;
    if (!periodStats.has(period)) {
      periodStats.set(period, {
        period,
        totalBets: 0,
        totalStake: 0,
        totalResult: 0,
        hitRate: 0
      });
    }
    
    const stat = periodStats.get(period);
    stat.totalBets++;
    stat.totalStake += bet.stake;
    stat.totalResult += bet.result || 0;
  });
  
  // 计算累计收益和命中率
  let cumulativeResult = 0;
  Array.from(periodStats.values())
    .sort((a, b) => a.period.localeCompare(b.period))
    .forEach(stat => {
      cumulativeResult += stat.totalResult;
      const winningBets = bets.filter(bet => {
        const draw = drawMap.get(bet.drawId);
        return draw?.period === stat.period && (bet.result || 0) > 0;
      }).length;
      
      stat.hitRate = stat.totalBets > 0 ? winningBets / stat.totalBets : 0;
      stat.cumulativeResult = cumulativeResult;
      
      trendData.push(stat);
    });
  
  return trendData;
};
