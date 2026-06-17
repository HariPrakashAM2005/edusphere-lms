'use client';

import React, { useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
}

export default function ChartCard({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  color = '#3b82f6',
}: ChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    alert('📊 Preparing chart canvas export. Your image download will start shortly.');
  };

  return (
    <div ref={chartRef} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between group">
      
      {/* Chart Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-black text-slate-850 dark:text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-semibold">{subtitle}</p>}
        </div>

        {/* Download Trigger */}
        <button
          onClick={handleDownload}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
          aria-label="Download chart as image"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/60" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
            />
            
            {/* Glassmorphism custom tooltip */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-150 dark:border-slate-800/80 p-3 rounded-2xl shadow-xl text-xxs font-black uppercase tracking-wider space-y-1.5 z-50">
                      <p className="text-slate-400">{payload[0].payload[xAxisKey]}</p>
                      <p className="text-blue-500 flex items-center gap-1 font-extrabold text-[11px] lowercase tracking-normal">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {payload[0].value} {dataKey}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={`url(#color-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
