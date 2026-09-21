'use client';

import React, { useState } from 'react';
import { StrategyConfig, StintSummary } from '@/types/f1';
import { COMPOUND_INFO } from '@/lib/circuits';
import { Wrench, Copy, Check, Info } from 'lucide-react';

interface StrategyTimelineProps {
  strategy: StrategyConfig;
  stintSummaries?: StintSummary[];
}

export const StrategyTimeline: React.FC<StrategyTimelineProps> = ({
  strategy,
  stintSummaries = [],
}) => {
  const [copiedAscii, setCopiedAscii] = useState(false);
  const totalLaps = strategy.totalLaps;

  // Generate ASCII diagram matching user prompt format
  const generateAsciiTimeline = (): string => {
    const stops = strategy.stints.slice(0, -1).map((s) => s.endLap);
    
    // Header line: Lap 1 ─────── Lap 18 ─────── Lap 42 ───── Lap 57
    let header = 'Lap 1';
    stops.forEach((pitLap) => {
      header += ` ───────── Lap ${pitLap}`;
    });
    header += ` ─────── Lap ${totalLaps}`;

    // Compound line
    let compounds = '       ';
    strategy.stints.forEach((stint) => {
      const name = stint.compound;
      compounds += name.padEnd(17, ' ');
    });

    // Pit line
    let pitLine = '                         ';
    strategy.stints.slice(0, -1).forEach(() => {
      pitLine += 'PIT              ';
    });

    return `${header}\n${compounds}\n${pitLine}`;
  };

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(generateAsciiTimeline());
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  return (
    <div className="w-full bg-[#0d121c] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background motorsport motif */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-slate-200">
              Visual Race Strategy Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Stint durations, pit stop crossover windows, and tyre life progression
          </p>
        </div>

        <button
          onClick={handleCopyAscii}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          {copiedAscii ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied ASCII</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy ASCII</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Proportional Graphical Timeline Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
          <span className="text-red-400 font-semibold">START (Lap 1)</span>
          <span className="text-slate-500">Race Distance: {totalLaps} Laps</span>
          <span className="text-emerald-400 font-semibold">FINISH (Lap {totalLaps})</span>
        </div>

        {/* Compound Track Bar */}
        <div className="relative h-12 w-full bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800 p-1 gap-1">
          {strategy.stints.map((stint, idx) => {
            const stintLength = stint.endLap - stint.startLap + 1;
            const widthPct = (stintLength / totalLaps) * 100;
            const summary = stintSummaries[idx];

            return (
              <div
                key={stint.id || idx}
                style={{ width: `${widthPct}%` }}
                className={`relative h-full rounded flex items-center justify-between px-3 transition-all duration-300 hover:brightness-110 group ${
                  stint.compound === 'SOFT'
                    ? 'bg-gradient-to-r from-red-600/90 to-red-500/90 text-white'
                    : stint.compound === 'MEDIUM'
                    ? 'bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-slate-950 font-bold'
                    : stint.compound === 'HARD'
                    ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-950 font-bold'
                    : stint.compound === 'INTERMEDIATE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold'
                }`}
              >
                {/* Compound Label */}
                <div className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap">
                  <span className="text-xs uppercase font-mono font-extrabold tracking-wide">
                    {stint.compound}
                  </span>
                </div>

                {/* Stint Laps Badge */}
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-xs font-semibold whitespace-nowrap hidden sm:inline-block">
                  {stintLength} Laps
                </span>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-slate-950 text-slate-200 text-xs rounded-md px-3 py-2 border border-slate-700 shadow-2xl font-mono whitespace-nowrap">
                    <p className="font-bold text-white mb-1">
                      Stint {idx + 1}: {stint.compound}
                    </p>
                    <p className="text-slate-400">
                      Laps: {stint.startLap} ➔ {stint.endLap} ({stintLength} laps)
                    </p>
                    {summary && (
                      <p className="text-amber-400 mt-0.5">
                        End Tyre Wear: {summary.endWearPct}%
                      </p>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pit Stop Pins & Lap Markers */}
        <div className="relative w-full h-8 mt-1">
          {strategy.stints.map((stint, idx) => {
            if (idx === strategy.stints.length - 1) return null;
            const leftPct = (stint.endLap / totalLaps) * 100;

            return (
              <div
                key={`pit-pin-${idx}`}
                style={{ left: `${leftPct}%` }}
                className="absolute -translate-x-1/2 flex flex-col items-center"
              >
                <div className="w-0.5 h-3 bg-red-500/80" />
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-[10px] font-mono text-red-400 font-bold shadow-sm">
                  <Wrench className="w-3 h-3" />
                  <span>PIT L{stint.endLap}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Structured F1 Strategy Blueprint (Text/ASCII Mode matching prompt) */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            F1 Pit Strategy Diagram
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {strategy.stints.length - 1} Pit Stop{strategy.stints.length - 1 === 1 ? '' : 's'}
          </span>
        </div>

        {/* Preformatted ASCII box */}
        <pre className="p-3.5 rounded-lg bg-[#070a10] border border-slate-800/80 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed select-all">
          {generateAsciiTimeline()}
        </pre>
      </div>

      {/* Stint Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {strategy.stints.map((stint, idx) => {
          const comp = COMPOUND_INFO[stint.compound];
          const summary = stintSummaries[idx];
          const stintLength = stint.endLap - stint.startLap + 1;

          return (
            <div
              key={`stint-card-${idx}`}
              className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Stint {idx + 1}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${comp.badgeBg}`}
                >
                  {comp.name}
                </span>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Laps:</span>
                  <span>
                    {stint.startLap} - {stint.endLap} ({stintLength} L)
                  </span>
                </div>
                {summary && (
                  <>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Avg Lap:</span>
                      <span className="text-slate-100 font-semibold">
                        {(summary.averageLapTime).toFixed(3)}s
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Peak Wear:</span>
                      <span
                        className={
                          summary.endWearPct > 80
                            ? 'text-red-400 font-bold'
                            : summary.endWearPct > 60
                            ? 'text-amber-400 font-semibold'
                            : 'text-emerald-400'
                        }
                      >
                        {summary.endWearPct}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
