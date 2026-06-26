import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Lap } from '../types';
import { formatTimeToString } from '../utils';

interface LapChartProps {
  laps: Lap[];
}

export default function LapChart({ laps }: LapChartProps) {
  if (laps.length < 2) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-6 px-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl min-h-[140px] text-center">
        <span className="text-[10px] tracking-widest text-white/20 uppercase font-display mb-1">
          Trend Analysis
        </span>
        <span className="text-[9px] text-white/10 font-sans leading-relaxed max-w-[180px]">
          Record 2 or more laps to visualize space-time velocity curves.
        </span>
      </div>
    );
  }

  // Chronological order for the chart (oldest to newest)
  const data = [...laps].reverse().map((lap) => ({
    name: `L${lap.lapNumber}`,
    seconds: lap.lapTime / 1000,
    formatted: formatTimeToString(lap.lapTime),
    lapNumber: lap.lapNumber,
  }));

  // Find min/max values for Y-axis buffer padding
  const values = data.map((d) => d.seconds);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;
  const padding = range === 0 ? 0.5 : range * 0.15;
  const yDomain = [Math.max(0, minVal - padding), maxVal + padding];

  return (
    <div className="mt-6 p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex flex-col gap-2 relative overflow-hidden" id="lap-trend-chart">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/[0.02] rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/80 font-display font-medium">
          Velocity Curve (sec)
        </span>
        <span className="text-[8px] font-mono text-white/30 uppercase">
          {laps.length} Laps Recorded
        </span>
      </div>

      <div className="w-full h-32 mt-2 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <XAxis
              dataKey="name"
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={yDomain}
              stroke="rgba(255, 255, 255, 0.2)"
              tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-zinc-950/90 border border-white/10 px-2.5 py-1.5 rounded-lg shadow-xl font-mono text-[10px] text-zinc-300">
                      <div className="text-white/40 mb-0.5">LAP {String(item.lapNumber).padStart(2, '0')}</div>
                      <div className="text-cyan-300 font-medium">{item.formatted}</div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.05)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="seconds"
              stroke="#06b6d4"
              strokeWidth={1.5}
              dot={{ fill: '#06b6d4', r: 3, stroke: '#020205', strokeWidth: 1 }}
              activeDot={{ fill: '#06b6d4', r: 5, stroke: '#020205', strokeWidth: 1.5, className: 'shadow-[0_0_8px_cyan]' }}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
