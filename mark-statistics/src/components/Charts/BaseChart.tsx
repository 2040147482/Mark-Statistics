'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface BaseChartProps {
  option: EChartsOption;
  height?: string | number;
  width?: string | number;
  loading?: boolean;
  className?: string;
  onChartReady?: (chart: any) => void;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  option,
  height = '400px',
  width = '100%',
  loading = false,
  className = '',
  onChartReady
}) => {
  const chartRef = useRef<ReactECharts>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (chartRef.current && onChartReady) {
      const chart = chartRef.current.getEchartsInstance();
      onChartReady(chart);
    }
  }, [onChartReady]);

  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ height, width }}
      >
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height, width }}
        showLoading={loading}
        loadingOption={{
          text: '加载中...',
          color: '#1890ff',
          textColor: '#000',
          maskColor: 'rgba(255, 255, 255, 0.8)',
          zlevel: 0
        }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};
