'use client';

import React from 'react';
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';
import { NumberStats } from '@/lib/types';

interface NumberFrequencyProps {
  data: NumberStats[];
  height?: string | number;
  className?: string;
  showTop?: number; // 显示前N个最热号码
}

export const NumberFrequency: React.FC<NumberFrequencyProps> = ({
  data,
  height = '400px',
  className = '',
  showTop = 20
}) => {
  const topData = data.slice(0, showTop);
  
  const option: EChartsOption = {
    title: {
      text: `号码出现频率 (前${showTop}名)`,
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
      formatter: (params: any) => {
        const { data, name } = params[0];
        return `号码: ${name}<br/>出现次数: ${data}<br/>排名: ${topData.findIndex(item => item.number === parseInt(name)) + 1}`;
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
      data: topData.map(item => item.number.toString()),
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: '出现次数',
      nameTextStyle: {
        fontSize: 12
      }
    },
    series: [{
      name: '出现次数',
      type: 'bar',
      data: topData.map(item => item.frequency),
      itemStyle: {
        color: (params: any) => {
          // 根据出现次数设置颜色渐变
          const maxFreq = Math.max(...topData.map(item => item.frequency));
          const ratio = params.value / maxFreq;
          if (ratio > 0.8) return '#ff4d4f';
          if (ratio > 0.6) return '#ff7a45';
          if (ratio > 0.4) return '#ffa940';
          if (ratio > 0.2) return '#ffec3d';
          return '#52c41a';
        }
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
