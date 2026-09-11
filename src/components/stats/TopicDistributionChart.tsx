'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TopicData {
  topic: string;
  count: number;
}

interface TopicDistributionChartProps {
  data: TopicData[];
}

const COLORS = [
  '#f97316', // orange-500
  '#fb923c', // orange-400
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#facc15', // yellow-400
  '#4ade80', // green-400
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-stone-800 dark:text-stone-200">{payload[0].name}</p>
        <p className="text-stone-500">{payload[0].value} catatan</p>
      </div>
    );
  }
  return null;
};

export const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ data }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-40 text-stone-400 dark:text-stone-500 text-sm">
        Belum ada catatan.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="count"
          nameKey="topic"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-stone-600 dark:text-stone-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
