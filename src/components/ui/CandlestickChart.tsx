
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  Line
} from 'recharts';

interface CandlestickData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  height?: number | string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, height = 400 }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // Recharts Candlestick workaround
      bottom: Math.min(item.open, item.close),
      top: Math.max(item.open, item.close),
      fill: item.close >= item.open ? '#34d399' : '#ef4444',
      // The box represents the open/close range
      height: Math.abs(item.open - item.close),
    }));
  }, [data]);

  return (
    <div className="w-full h-full" style={{ minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#ffffff20" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#bac9cd', fontWeight: 'bold' }}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#ffffff20" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#bac9cd', fontWeight: 'bold' }}
            orientation="right"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#05070a', border: '1px solid #ffffff10', borderRadius: '4px' }}
            itemStyle={{ fontSize: '10px', textTransform: 'uppercase', color: '#fff' }}
            labelStyle={{ fontSize: '10px', marginBottom: '8px', color: '#00e0ff', fontWeight: 'black' }}
            cursor={{ stroke: '#ffffff10', strokeWidth: 1 }}
          />
          
          {/* Wick (High-Low) */}
          <Bar dataKey="low" fill="transparent" stackId="wick" />
          <Bar dataKey="high" fill="transparent" stackId="wick" isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`wick-${index}`} fill={entry.fill} fillOpacity={0.3} />
            ))}
          </Bar>

          {/* Body (Open-Close) */}
          <Bar dataKey="bottom" fill="transparent" stackId="body" />
          <Bar dataKey="height" stackId="body">
            {chartData.map((entry, index) => (
              <Cell key={`body-${index}`} fill={entry.fill} />
            ))}
          </Bar>

          {/* Optional: Line connecting the close prices to show trend */}
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#00e0ff" 
            strokeWidth={1} 
            dot={false} 
            strokeOpacity={0.2} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
