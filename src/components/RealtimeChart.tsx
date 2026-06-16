import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis } from 'recharts';

interface RealtimeChartProps {
  color: string;
  base: number;
  lang: 'FR' | 'EN';
  formatPrice: (n: number) => string;
  labelFR: string;
  labelEN: string;
  showPrice?: boolean;
}

export const RealtimeChart: React.FC<RealtimeChartProps> = ({ color, base, lang, formatPrice, labelFR, labelEN, showPrice = true }) => {
  const T = (fr: string, en: string) => lang === 'FR' ? fr : en;
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: new Date(Date.now() - (20 - i) * 2500).toLocaleTimeString(),
      v: Math.round(base + (Math.random() - 0.5) * base * 0.04),
    }))
  );
  const current = data[data.length - 1]?.v || base;
  const prev = data[data.length - 2]?.v || base;
  const change = (((current - prev) / prev) * 100).toFixed(2);
  const isUp = current >= prev;

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]?.v || base;
        const next = Math.round(last + (Math.random() - 0.5) * last * 0.012);
        return [...prev.slice(-19), { t: new Date().toLocaleTimeString(), v: next }];
      });
    }, 2500);
    return () => clearInterval(id);
  }, [base]);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <p className="text-4xl font-black font-mono text-on-surface">
          {showPrice ? formatPrice(current) : current.toLocaleString(lang === 'FR' ? 'fr-FR' : 'en-US')}
        </p>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`text-sm font-black ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>{isUp ? '↑' : '↓'}{Math.abs(+change)}%</span>
          <span className="flex items-center gap-1 text-[10px] font-black text-primary-cyan uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-cyan animate-pulse" />LIVE
          </span>
        </div>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`rtGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#rtGrad-${color.replace('#','')})`} dot={false} isAnimationActive={false}/>
            <XAxis dataKey="t" hide />
            <Tooltip
              contentStyle={{ background: '#0f121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [showPrice ? formatPrice(v) : v, T(labelFR, labelEN)]}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[10px] text-on-surface-variant/30 font-mono">
        <span>{T('Mise à jour toutes les 2.5s', 'Updated every 2.5s')}</span>
        <span>20 {T('points de données', 'data points')}</span>
      </div>
    </div>
  );
};
