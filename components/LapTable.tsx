'use client';

import React, { useState } from 'react';
import { LapTelemetry } from '@/types/f1';
import { COMPOUND_INFO } from '@/lib/circuits';
import { Wrench } from 'lucide-react';

interface LapTableProps {
  laps: LapTelemetry[];
}

export const LapTable: React.FC<LapTableProps> = ({ laps }) => {
  const [filterStint, setFilterStint] = useState<number | 'ALL'>('ALL');
  const [onlyPits, setOnlyPits] = useState(false);

  const stintsAvailable = Array.from(new Set(laps.map((l) => l.stintIndex + 1)));

  const filteredLaps = laps.filter((lap) => {
    if (filterStint !== 'ALL' && lap.stintIndex + 1 !== filterStint) return false;
    if (onlyPits && !lap.isPitLap && !lap.isOutLap) return false;
    return true;
  });

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
            Lap-by-Lap Telemetry Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual lap times, tyre degradation, and fuel burn progression
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stint Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500">Stint:</span>
            <select
              value={filterStint}
              onChange={(e) =>
                setFilterStint(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10))
              }
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                All Stints
              </option>
              {stintsAvailable.map((s) => (
                <option key={`stint-opt-${s}`} value={s} className="bg-slate-900">
                  Stint {s}
                </option>
              ))}
            </select>
          </div>

          {/* Pit Laps Toggle */}
          <button
            onClick={() => setOnlyPits(!onlyPits)}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
              onlyPits
                ? 'bg-red-600/20 text-red-300 border-red-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {onlyPits ? 'Showing Pit In/Out' : 'Filter Pit Laps'}
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="sticky top-0 bg-[#0e1422] text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800 z-10">
            <tr>
              <th className="py-2.5 px-3">Lap</th>
              <th className="py-2.5 px-3">Compound</th>
              <th className="py-2.5 px-3">Tyre Age</th>
              <th className="py-2.5 px-3">Lap Time</th>
              <th className="py-2.5 px-3">Cumulative</th>
              <th className="py-2.5 px-3">Wear %</th>
              <th className="py-2.5 px-3">Fuel Delta</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredLaps.map((lap) => {
              const comp = COMPOUND_INFO[lap.compound];
              return (
                <tr
                  key={`lap-row-${lap.lap}`}
                  className={`hover:bg-slate-900/80 transition-colors ${
                    lap.isPitLap
                      ? 'bg-red-950/20 text-red-300'
                      : lap.isOutLap
                      ? 'bg-amber-950/20 text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-white">L{lap.lap}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${comp.badgeBg}`}
                    >
                      {comp.name}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{lap.tyreAge} L</td>
                  <td className="py-2 px-3 font-semibold text-slate-100">
                    {lap.lapTimeFormatted}
                  </td>
                  <td className="py-2 px-3 text-slate-400">
                    {lap.cumulativeTimeFormatted}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={
                        lap.tyreWearPct > 75
                          ? 'text-red-400 font-bold'
                          : lap.tyreWearPct > 50
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {lap.tyreWearPct}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">+{lap.fuelDelta.toFixed(3)}s</td>
                  <td className="py-2 px-3">
                    {lap.isPitLap && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-900/40 px-2 py-0.5 rounded border border-red-700/50">
                        <Wrench className="w-2.5 h-2.5" /> PIT STOP (+{lap.pitDelta}s)
                      </span>
                    )}
                    {lap.isOutLap && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
                        OUT-LAP
                      </span>
                    )}
                    {!lap.isPitLap && !lap.isOutLap && (
                      <span className="text-slate-600 text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
