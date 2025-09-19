'use client';

import React from 'react';
import { BaseChart } from './BaseChart';
import { EChartsOption } from 'echarts';

interface NumberHeatmapProps {
  data: number[][];
  periods: string[];
  height?: string | number;
  className?: string;
}

export const NumberHeatmap: React.FC<NumberHeatmapProps> = ({
  data,
  periods,
  height = '500px',
  className = ''
}) => {
  const option: EChartsOption = {
    title: {
      text: '号码热度矩阵',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      position: 'top',
      formatter: function (params: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        const { data, dataIndex, seriesIndex } = params;
        const period = periods[seriesIndex] || `第${seriesIndex + 1}期`;
        const number = dataIndex + 1;
        const frequency = data;
        return `期号: ${period}<br/>号码: ${number}<br/>出现次数: ${frequency}`;
      }
    },
    grid: {
      height: '70%',
      top: '15%',
      left: '10%',
      right: '10%'
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 49 }, (_, i) => i + 1),
      splitArea: {
        show: true
      },
      axisLabel: {
        interval: 4,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: periods,
      splitArea: {
        show: true
      },
      axisLabel: {
        fontSize: 10
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.flat()),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f3ff', '#1890ff', '#0050b3']
      }
    },
    series: [{
      name: '出现次数',
      type: 'heatmap',
      data: data.flatMap((row, seriesIndex) => 
        row.map((value, dataIndex) => [dataIndex, seriesIndex, value])
      ),
      label: {
        show: true,
        formatter: (params: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          return params.data[2] > 0 ? params.data[2] : '';
        },
        fontSize: 10
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
