'use client';

import React from 'react';
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface TrendData {
  period: string;
  totalBets: number;
  totalStake: number;
  totalResult: number;
  hitRate: number;
  cumulativeResult: number;
}

interface TrendChartProps {
  data: TrendData[];
  height?: string | number;
  className?: string;
  type?: 'cumulative' | 'hitRate' | 'stake'; // 显示类型
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = '400px',
  className = '',
  type = 'cumulative'
}) => {
  const getTitle = () => {
    switch (type) {
      case 'cumulative': return '累计盈亏趋势';
      case 'hitRate': return '命中率趋势';
      case 'stake': return '投注金额趋势';
      default: return '趋势图';
    }
  };

  const getYAxisName = () => {
    switch (type) {
      case 'cumulative': return '累计盈亏 (元)';
      case 'hitRate': return '命中率 (%)';
      case 'stake': return '投注金额 (元)';
      default: return '数值';
    }
  };

  const getSeriesData = () => {
    switch (type) {
      case 'cumulative': return data.map(item => item.cumulativeResult);
      case 'hitRate': return data.map(item => item.hitRate * 100);
      case 'stake': return data.map(item => item.totalStake);
      default: return data.map(item => item.cumulativeResult);
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
      formatter: (params: any) => {
        const { data, name } = params[0];
        const item = data.find((d: TrendData) => d.period === name);
        if (!item) return '';
        
        return `
          <div>
            <div><strong>期号: ${name}</strong></div>
            <div>${getYAxisName()}: ${data.toFixed(2)}${type === 'hitRate' ? '%' : '元'}</div>
            <div>投注次数: ${item.totalBets}</div>
            <div>投注金额: ${item.totalStake.toFixed(2)}元</div>
            <div>当期盈亏: ${item.totalResult.toFixed(2)}元</div>
            <div>命中率: ${(item.hitRate * 100).toFixed(1)}%</div>
          </div>
        `;
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.period),
      axisLabel: {
        interval: Math.ceil(data.length / 10), // 显示部分标签避免重叠
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: getYAxisName(),
      nameTextStyle: {
        fontSize: 12
      },
      axisLabel: {
        formatter: (value: number) => {
          if (type === 'hitRate') return value + '%';
          return value.toFixed(0);
        }
      }
    },
    series: [{
      name: getYAxisName(),
      type: 'line',
      data: getSeriesData(),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        color: type === 'cumulative' ? '#1890ff' : 
               type === 'hitRate' ? '#52c41a' : '#fa8c16'
      },
      itemStyle: {
        color: type === 'cumulative' ? '#1890ff' : 
               type === 'hitRate' ? '#52c41a' : '#fa8c16'
      },
      areaStyle: type === 'cumulative' ? {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(24, 144, 255, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(24, 144, 255, 0.1)'
          }]
        }
      } : undefined,
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
