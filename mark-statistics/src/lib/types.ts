// 数据类型定义
export interface Draw {
  id: string;
  period: string; // 期号，例：2025-123
  openTime: string; // ISO 日期字符串
  n1: number;
  n2: number;
  n3: number;
  n4: number;
  n5: number;
  n6: number;
  sp: number; // 特码
  createdAt: string;
}

export type PlayType = 
  | 'TE_MA'           // 特码
  | 'ZHENG_MA'        // 正码
  | 'LIAN_MA'         // 连码
  | 'SE_BO'           // 色波
  | 'SHENG_XIAO'      // 生肖
  | 'MIXED_BET'       // 混合投注（号码+生肖）
  | 'HE_DAN_SHUANG'   // 合单/合双
  | 'HE_DA_XIAO'      // 合大/合小
  | 'WEI_DA_XIAO';    // 尾大/尾小

export interface Bet {
  id: string;
  drawId: string;
  playType: PlayType;
  numbers: unknown; // 投注内容，如: [8]、[1,2,3]、{"color":"red"}、{"sx":"鼠"}
  stake: number; // 投注金额
  odds: number; // 赔率
  result?: number; // 结算盈亏
  createdAt: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

// 统计相关类型
export interface NumberStats {
  number: number;
  frequency: number; // 出现次数
  lastAppear?: string; // 最后出现期号
  maxGap: number; // 最大遗漏
  avgGap: number; // 平均遗漏
  currentGap: number; // 当前遗漏
  totalStake: number; // 投注总金额
  totalResult: number; // 盈亏总金额
  hitRate: number; // 命中率
  profitRate: number; // 盈利率
}

export interface PlayTypeStats {
  playType: PlayType;
  totalBets: number;
  totalStake: number;
  totalResult: number;
  hitRate: number; // 命中率
  profitRate: number; // 盈利率
}

export interface TimeStats {
  period: string;
  totalBets: number;
  totalStake: number;
  totalResult: number;
  hitRate: number;
}

// 导出/导入类型
export interface ExportData {
  draws: Draw[];
  bets: Bet[];
  settings: Setting[];
  version: string;
  exportTime: string;
}
