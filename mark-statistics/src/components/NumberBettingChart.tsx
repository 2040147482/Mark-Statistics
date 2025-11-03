'use client';

import React, { useMemo } from 'react';
import { BaseChart } from '@/components/Charts/BaseChart';
import type { EChartsOption } from 'echarts';
import { redNumbers, blueNumbers, greenNumbers } from '@/lib/mappings';

interface NumberBettingChartProps {
  numberBets: Record<number, number>;
  height?: string;
  className?: string;
  showAll?: boolean; // 是否显示所有49个号码
}



export const NumberBettingChart: React.FC<NumberBettingChartProps> = ({ 
  numberBets, 
  height = '400px', 
  className = '',
  showAll = true // 默认显示全部49个号码
}) => {
  // 处理数据，确保包含所有1-49号码
  const chartData = useMemo(() => {
    // 创建1-49的完整数据集
    const allNumbersData = Array.from({ length: 49 }, (_, i) => {
      const number = i + 1;
      return {
        name: number.toString(),
        value: numberBets[number] || 0,
        number: number
      };
    });
    
    // 按投注金额排序
    const sortedData = [...allNumbersData].sort((a, b) => b.value - a.value);
    
    return showAll ? sortedData : sortedData.slice(0, 10);
  }, [numberBets, showAll]);

  const option: EChartsOption = {
    title: {
      text: '号码投注金额排行',
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
      formatter: (params: unknown) => {
        const first = Array.isArray(params) ? params[0] as { name: string; value: number } : (params as { name: string; value: number });
        const { name, value } = first;
        return `
          <div>
            <div><strong>号码 ${name}</strong></div>
            <div>投注金额: ${value}元</div>
          </div>
        `;
      }
    },
    grid: {
      left: '18%',
      right: '12%',
      bottom: '10%',
      top: '12%',
      containLabel: true
    },
    dataZoom: [
      {
        type: 'slider',
        show: showAll,
        yAxisIndex: 0,
        start: 0,
        end: showAll ? 40 : 100, // 当显示全部号码时，默认只显示前40%
        zoomLock: false
      }
    ],
    // 水平柱状图：x 为数值轴，y 为类目轴
    xAxis: {
      type: 'value',
      name: '投注金额 (元)',
      nameTextStyle: { fontSize: 12 },
      axisLine: {
        lineStyle: {
          color: '#d9d9d9'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0'
        }
      },
      axisLabel: {
        color: '#595959'
      }
    },
    yAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: {
        interval: 0,
        fontSize: 12,
        formatter: (value: string) => {
          const n = parseInt(value, 10);
          let token = 'ballGray';
          if (redNumbers.includes(n)) token = 'ballR';
          else if (blueNumbers.includes(n)) token = 'ballB';
          else if (greenNumbers.includes(n)) token = 'ballG';
          return `{${token}|${value}}`;
        },
        rich: {
          ballR: {
            width: 24,
            height: 24,
            align: 'center',
            borderRadius: 12,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            lineHeight: 24,
            backgroundColor: '#f5222d'
          },
          ballB: {
            width: 24,
            height: 24,
            align: 'center',
            borderRadius: 12,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            lineHeight: 24,
            backgroundColor: '#1890ff'
          },
          ballG: {
            width: 24,
            height: 24,
            align: 'center',
            borderRadius: 12,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            lineHeight: 24,
            backgroundColor: '#52c41a'
          },
          ballGray: {
            width: 24,
            height: 24,
            align: 'center',
            borderRadius: 12,
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            lineHeight: 24,
            backgroundColor: '#8c8c8c'
          }
        }
      },
      inverse: true
    },
    series: [{
      name: '投注金额',
      type: 'bar',
      data: chartData.map(item => ({
        value: item.value,
        number: item.number
      })),
      barWidth: 16,
      itemStyle: {
        color: (params: unknown) => {
          // 使用与生肖投注金额柱状图一致的颜色方案
          const maxValue = Math.max(...chartData.map(i => i.value));
          const value = chartData[(params as { dataIndex: number }).dataIndex].value;
          const ratio = value / (maxValue || 1);
          
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
        formatter: (p: unknown) => `${(p as { value: number }).value}`
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        暂无投注数据
      </div>
    );
  }

  return (
    <BaseChart
      option={option}
      height={height}
      className={`${className} overflow-hidden`}
    />
  );
};