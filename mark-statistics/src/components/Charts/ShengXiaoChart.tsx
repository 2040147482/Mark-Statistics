'use client';

import React from 'react';
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface ShengXiaoData {
  [key: string]: {
    totalBets: number;
    totalStake: number;
    totalResult: number;
    hitRate: number;
    profitRate: number;
  };
}

interface ShengXiaoChartProps {
  data: ShengXiaoData;
  height?: string | number;
  className?: string;
  type?: 'stake' | 'result' | 'hitRate'; // 显示类型
}

export const ShengXiaoChart: React.FC<ShengXiaoChartProps> = ({
  data,
  height = '400px',
  className = '',
  type = 'stake'
}) => {
  const shengXiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  const chartData = shengXiaoList.map(sx => {
    const item = data[sx] || { totalBets: 0, totalStake: 0, totalResult: 0, hitRate: 0, profitRate: 0 };
    return {
      name: sx,
      value: type === 'stake' ? item.totalStake : 
             type === 'result' ? item.totalResult : 
             item.hitRate * 100, // 命中率转换为百分比
      totalBets: item.totalBets,
      hitRate: item.hitRate,
      profitRate: item.profitRate
    };
  });

  const getTitle = () => {
    switch (type) {
      case 'stake': return '生肖投注金额分布';
      case 'result': return '生肖盈亏分布';
      case 'hitRate': return '生肖命中率分布';
      default: return '生肖投注分布';
    }
  };

  const getTooltipFormatter = () => {
    return (params: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const { name, value, data } = params;
      return `
        <div>
          <div><strong>${name}</strong></div>
          <div>${type === 'stake' ? '投注金额' : type === 'result' ? '盈亏金额' : '命中率'}: ${value}${type === 'hitRate' ? '%' : '元'}</div>
          <div>投注次数: ${data.totalBets}</div>
          <div>命中率: ${(data.hitRate * 100).toFixed(1)}%</div>
          <div>盈利率: ${(data.profitRate * 100).toFixed(1)}%</div>
        </div>
      `;
    };
  };

  const option: EChartsOption = {
    title: {
      text: getTitle(),
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: getTooltipFormatter()
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      data: chartData.map(item => item.name)
    },
    series: [{
      name: '生肖',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: chartData,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {d}%'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <BaseChart
      option={option}
      height={height}
      className={className}
    />
  );
};

// 生肖条形图组件
export const ShengXiaoBarChart: React.FC<ShengXiaoChartProps> = ({
  data,
  height = '400px',
  className = '',
  type = 'stake'
}) => {
  const shengXiaoList = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  
  const chartData = shengXiaoList.map(sx => {
    const item = data[sx] || { totalBets: 0, totalStake: 0, totalResult: 0, hitRate: 0, profitRate: 0 };
    return {
      name: sx,
      value: type === 'stake' ? item.totalStake : 
             type === 'result' ? item.totalResult : 
             item.hitRate * 100,
      totalBets: item.totalBets,
      hitRate: item.hitRate,
      profitRate: item.profitRate
    };
  })
    .sort((a, b) => b.value - a.value);

  const getTitle = () => {
    switch (type) {
      case 'stake': return '生肖投注金额排行';
      case 'result': return '生肖盈亏排行';
      case 'hitRate': return '生肖命中率排行';
      default: return '生肖投注排行';
    }
  };

  const getYAxisName = () => {
    switch (type) {
      case 'stake': return '投注金额 (元)';
      case 'result': return '盈亏金额 (元)';
      case 'hitRate': return '命中率 (%)';
      default: return '数值';
    }
  };

  const option: EChartsOption = {
    title: {
      text: getTitle(),
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const { name, value, data } = params[0];
        return `
          <div>
            <div><strong>${name}</strong></div>
            <div>${getYAxisName()}: ${value}${type === 'hitRate' ? '%' : '元'}</div>
            <div>投注次数: ${data.totalBets}</div>
            <div>命中率: ${(data.hitRate * 100).toFixed(1)}%</div>
            <div>盈利率: ${(data.profitRate * 100).toFixed(1)}%</div>
          </div>
        `;
      }
    },
    grid: {
      left: '18%',
      right: '12%',
      bottom: '10%',
      top: '12%'
    },
    // 水平柱状图：x 为数值轴，y 为类目轴
    xAxis: {
      type: 'value',
      name: getYAxisName(),
      nameTextStyle: { fontSize: 12 }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: { interval: 0, fontSize: 12 },
      inverse: true
    },
    series: [{
      name: '数值',
      type: 'bar',
      data: chartData.map(item => ({
        value: item.value,
        totalBets: item.totalBets,
        hitRate: item.hitRate,
        profitRate: item.profitRate
      })),
      barWidth: 16,
      itemStyle: {
        color: (params: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          // 根据数值设置颜色
          const maxValue = Math.max(...chartData.map(i => i.value));
          const ratio = (params.value || 0) / (maxValue || 1);
          if (ratio > 0.8) return '#ff4d4f';
          if (ratio > 0.6) return '#ff7a45';
          if (ratio > 0.4) return '#ffa940';
          if (ratio > 0.2) return '#ffec3d';
          return '#52c41a';
        }
      },
      label: {
        show: true,
        position: 'right',
        formatter: (p: unknown) => `${(p as { value: number }).value}${type === 'hitRate' ? '%' : ''}`
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <BaseChart
      option={option}
      height={height}
      className={className}
    />
  );
};
