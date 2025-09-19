// 远程接口服务：拉取并规范化澳门六合彩数据
import { Draw } from '@/lib/types';

type RawLatestItem = {
  expect: string;
  openTime: string; // "2025-05-03 21:32:32"
  type: string;
  openCode: string; // "37,30,49,16,09,12,45"
  wave?: string;
  zodiac?: string;
};

type RawHistoryResponse = {
  result: boolean;
  message: string;
  code: number;
  data: RawLatestItem[];
  timestamp: number;
};

function parseOpenCode(openCode: string): { n: number[]; sp: number } {
  const parts = openCode.split(',').map((s) => parseInt(s, 10));
  const n = parts.slice(0, 6);
  const sp = parts[6];
  return { n, sp };
}

function normalizeToDraw(item: RawLatestItem): Draw {
  const { n, sp } = parseOpenCode(item.openCode);
  return {
    id: item.expect, // 使用期号作为唯一ID
    period: item.expect,
    openTime: new Date(item.openTime.replace(/-/g, '/')).toISOString(),
    n1: n[0],
    n2: n[1],
    n3: n[2],
    n4: n[3],
    n5: n[4],
    n6: n[5],
    sp,
    createdAt: new Date().toISOString(),
  };
}

// 历史记录：按年
export async function fetchHistoryByYear(year: string): Promise<Draw[]> {
  const url = `https://history.macaumarksix.com/history/macaujc2/y/${year}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
  const json = (await res.json()) as RawHistoryResponse;
  if (!json.result || !Array.isArray(json.data)) return [];
  return json.data.map(normalizeToDraw);
}

// 最新一期
export async function fetchLatest(): Promise<Draw | null> {
  const url = 'https://macaumarksix.com/api/macaujc2.com';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Latest fetch failed: ${res.status}`);
  const list = (await res.json()) as RawLatestItem[];
  if (!Array.isArray(list) || list.length === 0) return null;
  return normalizeToDraw(list[0]);
}

// 一颗一颗开奖（与最新结构一致，取第一项）
export async function fetchLive(): Promise<Draw | null> {
  const url = 'https://macaumarksix.com/api/live2';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Live fetch failed: ${res.status}`);
  const list = (await res.json()) as RawLatestItem[];
  if (!Array.isArray(list) || list.length === 0) return null;
  return normalizeToDraw(list[0]);
}

export type { RawLatestItem, RawHistoryResponse };


