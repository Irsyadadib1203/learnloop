'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  date: string;
  xp: number;
}

interface WeeklyXPChartProps {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="text-stone-500 dark:text-stone-400 mb-0.5">{label}</p>
        <p className="font-bold text-orange-500">+{payload[0].value} XP</p>
      </div>
    );
  }
  return null;
};

export const WeeklyXPChart: React.FC<WeeklyXPChartProps> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.xp), 1);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'currentColor', className: 'text-stone-400' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'currentColor', className: 'text-stone-400' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="xp" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.xp === max && entry.xp > 0 ? '#f97316' : '#fed7aa'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
