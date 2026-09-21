'use client';

import React from 'react';
import { SimulationResult, StrategyConfig } from '@/types/f1';
import {
  Trophy,
  Clock,
  Wrench,
  Flame,
  Zap,
  PlusCircle,
} from 'lucide-react';

interface ResultsSummaryProps {
  result: SimulationResult;
  onSaveToComparison: (strategy: StrategyConfig) => void;
  isSavedInComparison: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  result,
  onSaveToComparison,
  isSavedInComparison,
}) => {
  const {
    totalTimeFormatted,
    pitStopsCount,
    totalPitTimeLost,
    averageLapTimeFormatted,
    fastestLap,
    maxTyreWearPct,
    strategy,
  } = result;

  const strategyPath = strategy.stints.map((s) => s.compound).join(' ➔ ');

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6" id="results">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              SIMULATION RESULTS COMPUTED
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1 font-mono">
            {strategy.circuitName} ({strategy.totalLaps} Laps)
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-400">
            <span>Strategy:</span>
            <span className="text-slate-200 font-bold">{strategyPath}</span>
            <span>•</span>
            <span>{pitStopsCount} Pit Stop{pitStopsCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        {/* Action Button: Save to Comparison */}
        <button
          onClick={() => onSaveToComparison(strategy)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all border shadow-lg cursor-pointer ${
            isSavedInComparison
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
              : 'bg-gradient-to-r from-slate-800 to-slate-900 text-slate-200 hover:text-white border-slate-700 hover:border-slate-600'
          }`}
        >
          {isSavedInComparison ? (
            <>
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Added to Head-to-Head Compare</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Save Strategy to Compare</span>
            </>
          )}
        </button>
      </div>

      {/* Big KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Race Time */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">
              Total Race Time
            </span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {totalTimeFormatted}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Full {strategy.totalLaps} laps race duration
          </p>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-red-600" />
        </div>

        {/* Pit Stop Time Loss */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">
              Pit Stops & Time Loss
            </span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
            {totalPitTimeLost.toFixed(1)}s
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {pitStopsCount} stop{pitStopsCount === 1 ? '' : 's'} (~{strategy.pitLossSeconds}s in/out loss)
          </p>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>

        {/* Fastest Lap */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">
              Theoretical Fastest Lap
            </span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400 tracking-tight">
            {fastestLap.timeFormatted}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Lap {fastestLap.lap} on {fastestLap.compound} (light fuel)
          </p>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-500" />
        </div>

        {/* Peak Tyre Degradation */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">
              Peak Tyre Wear
            </span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              maxTyreWearPct > 80
                ? 'text-red-400'
                : maxTyreWearPct > 65
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {maxTyreWearPct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Avg Lap Pace: {averageLapTimeFormatted}
          </p>
          <div
            className={`absolute bottom-0 left-0 h-1 w-full ${
              maxTyreWearPct > 80 ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
