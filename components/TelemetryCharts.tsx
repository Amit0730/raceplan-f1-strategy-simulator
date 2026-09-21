'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { SimulationResult } from '@/types/f1';
import { COMPOUND_INFO } from '@/lib/circuits';
import { useIsClient } from '@/lib/use-is-client';
import { Activity } from 'lucide-react';

interface TelemetryChartsProps {
  result: SimulationResult;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: {
    lap: number;
    isPitLap: boolean;
  };
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'pace' | 'wear' | 'delta'>('pace');
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 h-80 flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading Telemetry Engine...
      </div>
    );
  }

  const { laps, strategy } = result;

  // Transform data for charts
  const chartData = laps.map((lap) => {
    return {
      lap: lap.lap,
      lapTime: lap.lapTimeSeconds,
      lapTimeFormatted: lap.lapTimeFormatted,
      tyreWear: lap.tyreWearPct,
      compound: lap.compound,
      tyreAge: lap.tyreAge,
      fuelDelta: lap.fuelDelta,
      tyreDegDelta: lap.tyreDegDelta,
      isPitLap: lap.isPitLap,
      stintIndex: lap.stintIndex + 1,
    };
  });

  // Calculate dynamic domain for lap times (ignoring pit stop spike for Y-axis scaling)
  const nonPitLapTimes = laps.filter((l) => !l.isPitLap).map((l) => l.lapTimeSeconds);
  const minLapTime = nonPitLapTimes.length ? Math.floor(Math.min(...nonPitLapTimes)) - 1 : 70;
  const maxLapTime = nonPitLapTimes.length ? Math.ceil(Math.max(...nonPitLapTimes)) + 2 : 110;

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5">
      {/* Top Bar with Chart View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              Interactive Telemetry Charts
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time lap-by-lap pace evolution, tyre wear, and pit lane delta
          </p>
        </div>

        {/* Chart View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pace')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'pace'
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lap Times (s)
          </button>
          <button
            onClick={() => setActiveTab('wear')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'wear'
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tyre Wear (%)
          </button>
          <button
            onClick={() => setActiveTab('delta')}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              activeTab === 'delta'
                ? 'bg-red-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fuel vs Deg Delta
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full pt-2">
        {activeTab === 'pace' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="lap"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                label={{
                  value: 'Race Lap Number',
                  position: 'insideBottomRight',
                  offset: -5,
                  fill: '#64748b',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              <YAxis
                stroke="#64748b"
                domain={[minLapTime, maxLapTime + (result.pitStopsCount > 0 ? 5 : 2)]}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}s`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const comp = COMPOUND_INFO[data.compound as keyof typeof COMPOUND_INFO];
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-white font-bold">Lap {data.lap}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              backgroundColor: `${comp.colorHex}30`,
                              color: comp.colorHex,
                              border: `1px solid ${comp.colorHex}60`,
                            }}
                          >
                            {data.compound} (Age: {data.tyreAge}L)
                          </span>
                        </div>
                        <p className="text-slate-200 font-bold">
                          Lap Time: {data.lapTimeFormatted}
                          {data.isPitLap && (
                            <span className="text-red-400 ml-1.5 font-bold">[PIT STOP]</span>
                          )}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Tyre Wear: {data.tyreWear}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Pit stop markers */}
              {strategy.stints.slice(0, -1).map((s, idx) => (
                <ReferenceLine
                  key={`pit-ref-${idx}`}
                  x={s.endLap}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `PIT ${idx + 1}`,
                    fill: '#ef4444',
                    fontSize: 10,
                    fontFamily: 'monospace',
                  }}
                />
              ))}
              <Line
                type="monotone"
                dataKey="lapTime"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={(props: DotProps) => {
                  const { cx, cy, payload } = props;
                  if (payload && payload.isPitLap && typeof cx === 'number' && typeof cy === 'number') {
                    return (
                      <circle
                        key={`dot-pit-${payload.lap}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={{ r: 5, fill: '#ffffff', stroke: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'wear' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="wearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="lap"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine
                y={75}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: 'CLIFF WARNING (75%)',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs">
                        <p className="text-white font-bold mb-1">
                          Lap {data.lap} ({data.compound})
                        </p>
                        <p className="text-amber-400 font-bold">
                          Tyre Wear: {data.tyreWear}%
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Tyre Age: {data.tyreAge} laps
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="tyreWear"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#wearGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'delta' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis
                dataKey="lap"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                domain={[0, 'auto']}
                tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `+${v}s`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs space-y-1">
                        <p className="text-white font-bold">Lap {data.lap}</p>
                        <p className="text-red-400">
                          Tyre Deg Loss: +{data.tyreDegDelta}s
                        </p>
                        <p className="text-emerald-400">
                          Fuel Weight Penalty: +{data.fuelDelta}s
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="tyreDegDelta"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Tyre Wear Loss"
              />
              <Line
                type="monotone"
                dataKey="fuelDelta"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Fuel Penalty"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Telemetry Insights */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500 rounded" />
            <span>Lap Pace Line</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
            <span>Pit Stop In-Lap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded" />
            <span>Fuel Burn Off</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          * Telemetry computed under constant track temperature and tire degradation model
        </div>
      </div>
    </div>
  );
};
