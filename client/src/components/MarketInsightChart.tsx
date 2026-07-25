import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SkillMetric {
  skillName: string;
  count: number;
  frequencyPercentage: number;
}

interface MarketInsightChartProps {
  data: SkillMetric[];
}

export const MarketInsightChart: React.FC<MarketInsightChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0F172A] border border-[#334155]/60 rounded-xl">
        <p className="text-[#64748B] italic text-sm">No skill metrics data available to render.</p>
      </div>
    );
  }

  // Format data for chart display
  const chartData = data.slice(0, 10).map(item => ({
    name: item.skillName,
    percentage: Math.round(item.frequencyPercentage),
    count: item.count
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#1E293B] border border-[#4F46E5]/40 rounded-lg p-3 shadow-lg text-xs space-y-1">
          <p className="font-bold text-white text-sm">{dataPoint.name}</p>
          <p className="text-[#A5B4FC]">Frequency: {dataPoint.percentage}%</p>
          <p className="text-[#94A3B8]">Found in {dataPoint.count} job description(s)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-[#1E293B]/45 border border-[#334155]/60 rounded-xl p-4 shadow-inner">
      <h4 className="font-bold text-xs uppercase tracking-wider text-[#A5B4FC] border-b border-[#334155]/40 pb-2 mb-4">
        Skill Demand Frequency Chart (%)
      </h4>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fill: '#64748B', fontSize: 10 }}
              stroke="#334155"
              unit="%"
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: '500' }}
              stroke="#334155"
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
            <Bar 
              dataKey="percentage" 
              fill="#4F46E5" 
              radius={[0, 4, 4, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
