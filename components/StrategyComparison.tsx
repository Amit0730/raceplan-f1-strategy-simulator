'use client';

import React from 'react';
import { StrategyConfig, SimulationResult } from '@/types/f1';
import { simulateStrategy, compareSimulationResults } from '@/lib/simulation-engine';
import { COMPOUND_INFO } from '@/lib/circuits';
import { useIsClient } from '@/lib/use-is-client';
import {
  GitCompare,
  Trash2,
  Copy,
  ArrowRight,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';

interface StrategyComparisonProps {
  strategies: StrategyConfig[];
  onRemoveStrategy: (id: string) => void;
  onSelectAsActive: (strategy: StrategyConfig) => void;
  onResetPresets: () => void;
}

const STRATEGY_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
];

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  strategies,
  onRemoveStrategy,
  onSelectAsActive,
  onResetPresets,
}) => {
  const isClient = useIsClient();

  // Simulate all strategies
  const simulationResults: SimulationResult[] = strategies.map((strat) =>
    simulateStrategy(strat)
  );

  const { gapData, summary } = compareSimulationResults(simulationResults);

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6" id="comparison">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
              Strategy Comparison
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {strategies.length} Strategies
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare estimated race times, stint lengths, and pit stop windows side-by-side.
          </p>
        </div>

        <button
          onClick={onResetPresets}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Standard Presets</span>
        </button>
      </div>

      {/* Important Motorsport Note */}
      <div className="bg-slate-900/50 border border-slate-800 p-3.5 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-slate-300 leading-relaxed">
          <span className="font-bold text-sky-400">Strategic Trade-off Analysis:</span> No single
          strategy is universally best in every scenario. A faster on-paper 2-stop may require
          multiple on-track overtakes in dirty air, whereas a 1-stop prioritizes track position at
          the expense of late-race tyre grip.
        </div>
      </div>

      {/* Strategy Cards Grid matching requested format */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {simulationResults.map((res, idx) => {
          const color = STRATEGY_COLORS[idx % STRATEGY_COLORS.length];
          const summaryItem = summary.find((s) => s.id === res.strategy.id);

          return (
            <div
              key={res.strategy.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              {/* Color Accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: color }}
              />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="font-mono font-bold text-sm text-white truncate">
                      {res.strategy.name}
                    </h3>
                  </div>
                  {strategies.length > 1 && (
                    <button
                      onClick={() => onRemoveStrategy(res.strategy.id)}
                      className="text-slate-600 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Stints Chain Badge */}
                <div className="flex flex-wrap items-center gap-1.5 my-3">
                  {res.strategy.stints.map((stint, sIdx) => {
                    const comp = COMPOUND_INFO[stint.compound];
                    return (
                      <React.Fragment key={`stint-badge-${sIdx}`}>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm ${comp.badgeBg}`}
                        >
                          {comp.name}
                        </span>
                        {sIdx < res.strategy.stints.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* KPI Breakdown */}
                <div className="space-y-2 py-3 border-t border-b border-slate-800/80 font-mono text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Estimated Race Time:</span>
                    <span className="text-base font-extrabold text-white">
                      {res.totalTimeFormatted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pit Stops:</span>
                    <span className="text-slate-200 font-semibold">
                      {res.pitStopsCount} Stop{res.pitStopsCount === 1 ? '' : 's'} ({res.totalPitTimeLost}s lost)
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Delta to Leader:</span>
                    <span
                      className={`font-bold ${
                        summaryItem?.deltaSeconds === 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {summaryItem?.deltaFormatted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Peak Tyre Wear:</span>
                    <span
                      className={
                        res.maxTyreWearPct > 80
                          ? 'text-red-400 font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {res.maxTyreWearPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => onSelectAsActive(res.strategy)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Load in Live Simulator</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Head-to-Head Lap Gap Progression Chart */}
      {isClient && gapData.length > 0 && strategies.length > 1 && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Cumulative Race Gap Progression (Seconds)
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Relative to Benchmark Leader
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gapData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis
                  dataKey="lap"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  label={{
                    value: 'Lap Number',
                    position: 'insideBottomRight',
                    offset: -5,
                    fill: '#64748b',
                    fontSize: 10,
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}s`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl font-mono text-xs space-y-1">
                          <p className="text-white font-bold mb-1">
                            Lap {payload[0].payload.lap} Gap
                          </p>
                          {payload.map((p, i) => (
                            <div
                              key={`tooltip-strat-${i}`}
                              className="flex items-center justify-between gap-3"
                              style={{ color: p.color }}
                            >
                              <span>{p.name}:</span>
                              <span className="font-bold">
                                {Number(p.value) > 0 ? `+${p.value}s` : `${p.value}s`}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                <Legend
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                {strategies.map((strat, i) => (
                  <Line
                    key={`line-compare-${strat.id}`}
                    type="monotone"
                    dataKey={strat.name}
                    stroke={STRATEGY_COLORS[i % STRATEGY_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
