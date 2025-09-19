// 号码映射工具：生肖、色波、合数等

// 2024年最新生肖映射
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

const SHENG_XIAO_MAP: Record<number, string> = {};
Object.entries(zodiacMap).forEach(([zodiac, numbers]) => {
  numbers.forEach(num => { SHENG_XIAO_MAP[num] = zodiac; });
});

// 2024年最新波色映射
const redNumbers = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const blueNumbers = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const greenNumbers = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];

const SE_BO_MAP: Record<number, string> = {};
redNumbers.forEach(num => { SE_BO_MAP[num] = '红'; });
blueNumbers.forEach(num => { SE_BO_MAP[num] = '蓝'; });
greenNumbers.forEach(num => { SE_BO_MAP[num] = '绿'; });

// 合数映射（1-49 对应合数）
const HE_SHU_MAP: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 1,
  11: 2, 12: 3, 13: 4, 14: 5, 15: 6, 16: 7, 17: 8, 18: 9, 19: 1, 20: 2,
  21: 3, 22: 4, 23: 5, 24: 6, 25: 7, 26: 8, 27: 9, 28: 1, 29: 2, 30: 3,
  31: 4, 32: 5, 33: 6, 34: 7, 35: 8, 36: 9, 37: 1, 38: 2, 39: 3, 40: 4,
  41: 5, 42: 6, 43: 7, 44: 8, 45: 9, 46: 1, 47: 2, 48: 3, 49: 4
};

// 尾数映射（1-49 对应尾数）
const WEI_SHU_MAP: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 0,
  11: 1, 12: 2, 13: 3, 14: 4, 15: 5, 16: 6, 17: 7, 18: 8, 19: 9, 20: 0,
  21: 1, 22: 2, 23: 3, 24: 4, 25: 5, 26: 6, 27: 7, 28: 8, 29: 9, 30: 0,
  31: 1, 32: 2, 33: 3, 34: 4, 35: 5, 36: 6, 37: 7, 38: 8, 39: 9, 40: 0,
  41: 1, 42: 2, 43: 3, 44: 4, 45: 5, 46: 6, 47: 7, 48: 8, 49: 9
};

// 大小映射（1-49 对应大小）
const DA_XIAO_MAP: Record<number, string> = {
  1: '小', 2: '小', 3: '小', 4: '小', 5: '小', 6: '小', 7: '小', 8: '小', 9: '小', 10: '小',
  11: '小', 12: '小', 13: '小', 14: '小', 15: '小', 16: '小', 17: '小', 18: '小', 19: '小', 20: '小',
  21: '小', 22: '小', 23: '小', 24: '小', 25: '大', 26: '大', 27: '大', 28: '大', 29: '大', 30: '大',
  31: '大', 32: '大', 33: '大', 34: '大', 35: '大', 36: '大', 37: '大', 38: '大', 39: '大', 40: '大',
  41: '大', 42: '大', 43: '大', 44: '大', 45: '大', 46: '大', 47: '大', 48: '大', 49: '大'
};

// 单双映射（1-49 对应单双）
const DAN_SHUANG_MAP: Record<number, string> = {
  1: '单', 2: '双', 3: '单', 4: '双', 5: '单', 6: '双', 7: '单', 8: '双', 9: '单', 10: '双',
  11: '单', 12: '双', 13: '单', 14: '双', 15: '单', 16: '双', 17: '单', 18: '双', 19: '单', 20: '双',
  21: '单', 22: '双', 23: '单', 24: '双', 25: '单', 26: '双', 27: '单', 28: '双', 29: '单', 30: '双',
  31: '单', 32: '双', 33: '单', 34: '双', 35: '单', 36: '双', 37: '单', 38: '双', 39: '单', 40: '双',
  41: '单', 42: '双', 43: '单', 44: '双', 45: '单', 46: '双', 47: '单', 48: '双', 49: '单'
};

// 映射函数
export const getShengXiao = (number: number): string => {
  return SHENG_XIAO_MAP[number] || '';
};

export const getSeBo = (number: number): string => {
  return SE_BO_MAP[number] || '';
};

export const getHeShu = (number: number): number => {
  return HE_SHU_MAP[number] || 0;
};

export const getWeiShu = (number: number): number => {
  return WEI_SHU_MAP[number] || 0;
};

export const getDaXiao = (number: number): string => {
  return DA_XIAO_MAP[number] || '';
};

export const getDanShuang = (number: number): string => {
  return DAN_SHUANG_MAP[number] || '';
};

// 获取号码的所有属性
export const getNumberAttributes = (number: number) => {
  return {
    number,
    shengXiao: getShengXiao(number),
    seBo: getSeBo(number),
    heShu: getHeShu(number),
    weiShu: getWeiShu(number),
    daXiao: getDaXiao(number),
    danShuang: getDanShuang(number)
  };
};

// 根据属性筛选号码
export const getNumbersByAttribute = (attribute: string, value: string | number) => {
  const numbers: number[] = [];
  
  for (let i = 1; i <= 49; i++) {
    let match = false;
    
    switch (attribute) {
      case 'shengXiao':
        match = getShengXiao(i) === value;
        break;
      case 'seBo':
        match = getSeBo(i) === value;
        break;
      case 'heShu':
        match = getHeShu(i) === value;
        break;
      case 'weiShu':
        match = getWeiShu(i) === value;
        break;
      case 'daXiao':
        match = getDaXiao(i) === value;
        break;
      case 'danShuang':
        match = getDanShuang(i) === value;
        break;
    }
    
    if (match) {
      numbers.push(i);
    }
  }
  
  return numbers;
};

// 获取所有生肖列表
export const getAllShengXiao = (): string[] => {
  return ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
};

// 获取所有色波列表
export const getAllSeBo = (): string[] => {
  return ['红', '蓝', '绿'];
};

// 导出2024年最新映射数据
export { redNumbers, blueNumbers, greenNumbers, zodiacMap };

// 获取所有合数列表
export const getAllHeShu = (): number[] => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9];
};

// 获取所有尾数列表
export const getAllWeiShu = (): number[] => {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
};
