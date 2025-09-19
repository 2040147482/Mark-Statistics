import Dexie, { Table } from 'dexie';
import { Draw, Bet, Setting, ExportData } from './types';

class MarkStatsDB extends Dexie {
  draws!: Table<Draw, string>;
  bets!: Table<Bet, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('markstats');
    this.version(1).stores({
      draws: 'id, period, openTime',
      bets: 'id, drawId, playType, createdAt',
      settings: 'key'
    });
  }
}

export const db = new MarkStatsDB();

// 数据库操作封装
export class DatabaseService {
  // 期号相关
  static async addDraw(draw: Omit<Draw, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newDraw: Draw = {
      ...draw,
      id,
      createdAt: new Date().toISOString()
    };
    await db.draws.add(newDraw);
    return id;
  }

  static async getDraws(limit = 100): Promise<Draw[]> {
    return await db.draws
      .orderBy('openTime')
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async getDrawByPeriod(period: string): Promise<Draw | undefined> {
    return await db.draws.where('period').equals(period).first();
  }

  static async updateDraw(id: string, updates: Partial<Draw>): Promise<void> {
    await db.draws.update(id, updates);
  }

  static async deleteDraw(id: string): Promise<void> {
    await db.transaction('rw', [db.draws, db.bets], async () => {
      // 删除相关投注
      await db.bets.where('drawId').equals(id).delete();
      // 删除期号
      await db.draws.delete(id);
    });
  }

  // 投注相关
  static async addBet(bet: Omit<Bet, 'id' | 'createdAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const newBet: Bet = {
      ...bet,
      id,
      createdAt: new Date().toISOString()
    };
    await db.bets.add(newBet);
    return id;
  }

  static async getBets(limit = 200): Promise<Bet[]> {
    return await db.bets
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async getBetsByDraw(drawId: string): Promise<Bet[]> {
    return await db.bets.where('drawId').equals(drawId).toArray();
  }

  static async getBetsByPlayType(playType: string): Promise<Bet[]> {
    return await db.bets.where('playType').equals(playType).toArray();
  }

  static async updateBet(id: string, updates: Partial<Bet>): Promise<void> {
    await db.bets.update(id, updates);
  }

  static async deleteBet(id: string): Promise<void> {
    await db.bets.delete(id);
  }

  // 设置相关
  static async getSetting(key: string): Promise<unknown> {
    const setting = await db.settings.where('key').equals(key).first();
    return setting?.value;
  }

  static async setSetting(key: string, value: unknown): Promise<void> {
    await db.settings.put({ key, value });
  }

  // 导出/导入
  static async exportAll(): Promise<ExportData> {
    const [draws, bets, settings] = await Promise.all([
      db.draws.toArray(),
      db.bets.toArray(),
      db.settings.toArray()
    ]);

    return {
      draws,
      bets,
      settings,
      version: '1.0.0',
      exportTime: new Date().toISOString()
    };
  }

  static async importAll(data: ExportData): Promise<void> {
    await db.transaction('rw', [db.draws, db.bets, db.settings], async () => {
      // 清空现有数据
      await db.draws.clear();
      await db.bets.clear();
      await db.settings.clear();

      // 导入新数据
      if (data.draws?.length) await db.draws.bulkAdd(data.draws);
      if (data.bets?.length) await db.bets.bulkAdd(data.bets);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);
    });
  }

  // 统计查询
  static async getDrawsForStats(limit = 200): Promise<Draw[]> {
    return await db.draws
      .orderBy('openTime')
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async getBetsForStats(limit = 1000): Promise<Bet[]> {
    return await db.bets
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  // 获取最新期号
  static async getLatestDraw(): Promise<Draw | null> {
    const draws = await db.draws
      .orderBy('openTime')
      .reverse()
      .limit(1)
      .toArray();
    return draws[0] || null;
  }

  // 获取下一期期号
  static async getNextPeriod(): Promise<string> {
    const latest = await this.getLatestDraw();
    if (!latest) {
      // 如果没有期号数据，返回当前年份的第一期
      const currentYear = new Date().getFullYear();
      return `${currentYear}-001`;
    }
    
    const match = /^(\d+)(?:[-_]?(\d+))?$/.exec(latest.period);
    if (match) {
      const head = match[1];
      const tail = match[2];
      return tail ? `${head}-${String(parseInt(tail) + 1).padStart(3, '0')}` : String(parseInt(head) + 1);
    }
    
    // 如果解析失败，返回当前年份的第一期
    const currentYear = new Date().getFullYear();
    return `${currentYear}-001`;
  }
}
