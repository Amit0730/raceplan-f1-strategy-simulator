'use client';

import {
  DegradationProfile,
  StintConfig,
  StrategyConfig,
  TyreCompound,
  WeatherCondition,
} from '@/types/f1';
import { CIRCUITS, COMPOUND_INFO } from '@/lib/circuits';
import {
  Play,
  Plus,
  Trash2,
  CloudRain,
  Sun,
  CloudSun,
  Flame,
  Clock,
  Fuel,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface StrategyBuilderProps {
  strategy: StrategyConfig;
  onChangeStrategy: (updated: StrategyConfig) => void;
  onSimulate: () => void;
  isSimulating?: boolean;
}

const COMPOUNDS: TyreCompound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  strategy,
  onChangeStrategy,
  onSimulate,
  isSimulating = false,
}) => {
  const currentCircuit =
    CIRCUITS.find((c) => c.id === strategy.circuitId) || CIRCUITS[0];

  // Circuit change handler
  const handleCircuitChange = (circuitId: string) => {
    const circuit = CIRCUITS.find((c) => c.id === circuitId) || CIRCUITS[0];
    const totalLaps = circuit.totalLaps;
    const pit1 = Math.round(totalLaps * 0.45);

    const updatedStints: StintConfig[] = [
      {
        id: 'stint-1',
        compound: 'MEDIUM',
        startLap: 1,
        endLap: pit1,
        pitLap: pit1,
      },
      {
        id: 'stint-2',
        compound: 'HARD',
        startLap: pit1 + 1,
        endLap: totalLaps,
      },
    ];

    onChangeStrategy({
      ...strategy,
      circuitId: circuit.id,
      circuitName: circuit.name,
      totalLaps,
      degradation: circuit.trackDegradation,
      pitLossSeconds: circuit.defaultPitLossSeconds,
      stints: updatedStints,
    });
  };

  // Weather change handler
  const handleWeatherChange = (weather: WeatherCondition) => {
    // If switching to Wet and currently on slicks, suggest Inters or Wets
    let updatedStints = [...strategy.stints];
    if (weather === 'WET' && updatedStints[0].compound !== 'WET') {
      updatedStints = updatedStints.map((s) => ({
        ...s,
        compound: s.compound === 'INTERMEDIATE' ? 'INTERMEDIATE' : 'WET',
      }));
    } else if (weather === 'MIXED' && !['INTERMEDIATE', 'WET'].includes(updatedStints[0].compound)) {
      updatedStints = updatedStints.map((s) => ({
        ...s,
        compound: 'INTERMEDIATE',
      }));
    }

    onChangeStrategy({
      ...strategy,
      weather,
      stints: updatedStints,
    });
  };

  // Total Laps change
  const handleTotalLapsChange = (laps: number) => {
    const validLaps = Math.max(10, Math.min(100, laps));
    // Re-adjust last stint endLap
    const newStints = [...strategy.stints];
    newStints[newStints.length - 1].endLap = validLaps;

    // Ensure all previous pit laps are valid
    for (let i = 0; i < newStints.length - 1; i++) {
      if (newStints[i].endLap >= validLaps) {
        newStints[i].endLap = Math.max(1, validLaps - (newStints.length - 1 - i));
        newStints[i].pitLap = newStints[i].endLap;
      }
      if (newStints[i + 1]) {
        newStints[i + 1].startLap = newStints[i].endLap + 1;
      }
    }

    onChangeStrategy({
      ...strategy,
      totalLaps: validLaps,
      stints: newStints,
    });
  };

  // Add Pit Stop
  const handleAddStop = () => {
    if (strategy.stints.length >= 4) return; // Limit to 3 pit stops (4 stints)

    const lastStint = strategy.stints[strategy.stints.length - 1];
    const availableLaps = lastStint.endLap - lastStint.startLap;
    if (availableLaps < 4) return; // Not enough room for a new stint

    const splitLap = lastStint.startLap + Math.floor(availableLaps / 2);
    const updatedStints = [...strategy.stints];

    // Modify previous last stint
    updatedStints[updatedStints.length - 1] = {
      ...lastStint,
      endLap: splitLap,
      pitLap: splitLap,
    };

    // Add new final stint
    const defaultNextCompound: TyreCompound =
      lastStint.compound === 'SOFT'
        ? 'MEDIUM'
        : lastStint.compound === 'MEDIUM'
        ? 'HARD'
        : 'SOFT';

    updatedStints.push({
      id: `stint-${Date.now()}`,
      compound: defaultNextCompound,
      startLap: splitLap + 1,
      endLap: strategy.totalLaps,
    });

    onChangeStrategy({
      ...strategy,
      stints: updatedStints,
    });
  };

  // Remove Pit Stop
  const handleRemoveStop = (index: number) => {
    if (strategy.stints.length <= 1) return; // Cannot remove single stint (0 stops)

    const updatedStints = strategy.stints.filter((_, i) => i !== index);
    // Recalculate ranges
    for (let i = 0; i < updatedStints.length; i++) {
      if (i === 0) {
        updatedStints[i].startLap = 1;
      } else {
        updatedStints[i].startLap = updatedStints[i - 1].endLap + 1;
      }
      if (i === updatedStints.length - 1) {
        updatedStints[i].endLap = strategy.totalLaps;
        delete updatedStints[i].pitLap;
      } else {
        if (!updatedStints[i].pitLap) {
          updatedStints[i].pitLap = updatedStints[i].endLap;
        }
      }
    }

    onChangeStrategy({
      ...strategy,
      stints: updatedStints,
    });
  };

  // Change Stint Compound
  const handleCompoundChange = (stintIndex: number, compound: TyreCompound) => {
    const updatedStints = strategy.stints.map((stint, idx) =>
      idx === stintIndex ? { ...stint, compound } : stint
    );
    onChangeStrategy({
      ...strategy,
      stints: updatedStints,
    });
  };

  // Change Pit Lap for a stint
  const handlePitLapChange = (stintIndex: number, newPitLap: number) => {
    const updatedStints = [...strategy.stints];
    const stint = updatedStints[stintIndex];
    const nextStint = updatedStints[stintIndex + 1];

    if (!nextStint) return;

    // Constraints
    const minPitLap = stint.startLap + 1;
    const maxPitLap = nextStint.endLap - 1;
    const clampedPitLap = Math.max(minPitLap, Math.min(maxPitLap, newPitLap));

    stint.endLap = clampedPitLap;
    stint.pitLap = clampedPitLap;
    nextStint.startLap = clampedPitLap + 1;

    onChangeStrategy({
      ...strategy,
      stints: updatedStints,
    });
  };

  // Quick Preset Handlers
  const applyPreset = (type: '1stop-mh' | '2stop-sms' | '1stop-hm' | '2stop-shs') => {
    const total = strategy.totalLaps;
    let stints: StintConfig[] = [];

    if (type === '1stop-mh') {
      const p1 = Math.round(total * 0.42);
      stints = [
        { id: 's1', compound: 'MEDIUM', startLap: 1, endLap: p1, pitLap: p1 },
        { id: 's2', compound: 'HARD', startLap: p1 + 1, endLap: total },
      ];
    } else if (type === '2stop-sms') {
      const p1 = Math.round(total * 0.28);
      const p2 = Math.round(total * 0.68);
      stints = [
        { id: 's1', compound: 'SOFT', startLap: 1, endLap: p1, pitLap: p1 },
        { id: 's2', compound: 'MEDIUM', startLap: p1 + 1, endLap: p2, pitLap: p2 },
        { id: 's3', compound: 'SOFT', startLap: p2 + 1, endLap: total },
      ];
    } else if (type === '1stop-hm') {
      const p1 = Math.round(total * 0.6);
      stints = [
        { id: 's1', compound: 'HARD', startLap: 1, endLap: p1, pitLap: p1 },
        { id: 's2', compound: 'MEDIUM', startLap: p1 + 1, endLap: total },
      ];
    } else if (type === '2stop-shs') {
      const p1 = Math.round(total * 0.26);
      const p2 = Math.round(total * 0.72);
      stints = [
        { id: 's1', compound: 'SOFT', startLap: 1, endLap: p1, pitLap: p1 },
        { id: 's2', compound: 'HARD', startLap: p1 + 1, endLap: p2, pitLap: p2 },
        { id: 's3', compound: 'SOFT', startLap: p2 + 1, endLap: total },
      ];
    }

    onChangeStrategy({
      ...strategy,
      stints,
    });
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Top Banner / Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">
              STRATEGY CONFIGURATOR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              v2026.1
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Build Race Strategy
          </h2>
          <p className="text-xs text-slate-400">
            Configure race conditions, tyre stints, and pit stop windows to simulate lap times.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono uppercase text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          <button
            onClick={() => applyPreset('1stop-mh')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            1-Stop (M ➔ H)
          </button>
          <button
            onClick={() => applyPreset('2stop-sms')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            2-Stop (S ➔ M ➔ S)
          </button>
          <button
            onClick={() => applyPreset('2stop-shs')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            2-Stop (S ➔ H ➔ S)
          </button>
          <button
            onClick={() => applyPreset('1stop-hm')}
            className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            1-Stop (H ➔ M)
          </button>
        </div>
      </div>

      {/* Grid: Track & Race Environment Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Circuit Selection */}
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> Circuit Preset
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              {currentCircuit.trackLengthKm} km
            </span>
          </div>
          <select
            value={strategy.circuitId}
            onChange={(e) => handleCircuitChange(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 text-xs font-medium rounded-md border border-slate-700 p-2 focus:ring-1 focus:ring-red-500 focus:outline-none cursor-pointer"
          >
            {CIRCUITS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.flag} {c.name} ({c.totalLaps} Laps)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            {currentCircuit.description}
          </p>
        </div>

        {/* 2. Number of Race Laps */}
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Race Distance
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">
              {strategy.totalLaps} Laps
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={80}
            value={strategy.totalLaps}
            onChange={(e) => handleTotalLapsChange(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer my-2"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>Sprint (20L)</span>
            <span>Standard ({currentCircuit.totalLaps}L)</span>
            <span>Endurance (80L)</span>
          </div>
        </div>

        {/* 3. Weather Condition */}
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <label className="text-xs font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-sky-400" /> Weather Condition
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleWeatherChange('DRY')}
              className={`flex flex-col items-center justify-center p-2 rounded text-xs font-mono transition-all border ${
                strategy.weather === 'DRY'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4 mb-0.5 text-amber-400" />
              <span>Dry</span>
            </button>
            <button
              type="button"
              onClick={() => handleWeatherChange('MIXED')}
              className={`flex flex-col items-center justify-center p-2 rounded text-xs font-mono transition-all border ${
                strategy.weather === 'MIXED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <CloudSun className="w-4 h-4 mb-0.5 text-emerald-400" />
              <span>Mixed</span>
            </button>
            <button
              type="button"
              onClick={() => handleWeatherChange('WET')}
              className={`flex flex-col items-center justify-center p-2 rounded text-xs font-mono transition-all border ${
                strategy.weather === 'WET'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <CloudRain className="w-4 h-4 mb-0.5 text-sky-400" />
              <span>Wet</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {strategy.weather === 'DRY'
              ? 'Slicks optimal. Inters/Wets overheat.'
              : strategy.weather === 'MIXED'
              ? 'Damp track. Inters have pace advantage.'
              : 'Heavy rain. Full Wets required.'}
          </p>
        </div>

        {/* 4. Degradation & Pit Loss Settings */}
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Track Degradation
            </label>
            <span className="text-[11px] font-mono font-bold text-red-400">
              {strategy.degradation}
            </span>
          </div>
          <select
            value={strategy.degradation}
            onChange={(e) =>
              onChangeStrategy({
                ...strategy,
                degradation: e.target.value as DegradationProfile,
              })
            }
            className="w-full bg-slate-950 text-slate-200 text-xs font-medium rounded border border-slate-700 p-1.5 focus:outline-none mb-2"
          >
            <option value="LOW">Low (Monza / Monaco)</option>
            <option value="STANDARD">Standard (Spa / Spielberg)</option>
            <option value="HIGH">High (Silverstone / Suzuka)</option>
            <option value="EXTREME">Extreme (Bahrain Sakhir)</option>
          </select>

          <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-800">
            <span className="text-slate-400">Pit Loss:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                min="16"
                max="35"
                value={strategy.pitLossSeconds}
                onChange={(e) =>
                  onChangeStrategy({
                    ...strategy,
                    pitLossSeconds: parseFloat(e.target.value) || 22.0,
                  })
                }
                className="w-14 bg-slate-950 text-right px-1.5 py-0.5 rounded text-xs font-mono text-slate-200 border border-slate-700"
              />
              <span className="text-slate-500">sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stint Manager */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
              Stints & Pit Stops ({strategy.stints.length - 1} Pit Stop{strategy.stints.length - 1 === 1 ? '' : 's'})
            </h3>
          </div>

          {strategy.stints.length < 4 && (
            <button
              onClick={handleAddStop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Pit Stop</span>
            </button>
          )}
        </div>

        {/* Stint Cards */}
        <div className="space-y-2.5">
          {strategy.stints.map((stint, idx) => {
            const isLast = idx === strategy.stints.length - 1;
            const stintLength = stint.endLap - stint.startLap + 1;

            return (
              <div
                key={stint.id || idx}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                {/* Left: Stint Identification & Laps */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      {idx === 0 ? 'STARTING STINT' : `STINT ${idx + 1}`}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      Lap {stint.startLap} ➔ Lap {stint.endLap}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Duration: {stintLength} Laps
                    </span>
                  </div>
                </div>

                {/* Center: Compound Selector */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {COMPOUNDS.map((cCode) => {
                      const cInfo = COMPOUND_INFO[cCode];
                      const isSelected = stint.compound === cCode;

                      return (
                        <button
                          key={cCode}
                          type="button"
                          onClick={() => handleCompoundChange(idx, cCode)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                            isSelected
                              ? `${cInfo.badgeBg} border-white/40 text-white shadow-md scale-105`
                              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cInfo.colorHex }}
                          />
                          <span>{cInfo.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Pit Stop Slider (if not final stint) */}
                <div className="flex items-center gap-3">
                  {!isLast ? (
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        Pit at Lap:
                      </span>
                      <input
                        type="number"
                        min={stint.startLap + 1}
                        max={strategy.stints[idx + 1]?.endLap - 1 || strategy.totalLaps - 1}
                        value={stint.pitLap || stint.endLap}
                        onChange={(e) =>
                          handlePitLapChange(idx, parseInt(e.target.value, 10) || stint.endLap)
                        }
                        className="w-14 bg-slate-950 text-center font-mono font-bold text-xs text-red-400 border border-slate-700 rounded px-1 py-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="p-1 hover:text-red-400 text-slate-500 transition-colors ml-1"
                        title="Remove this pit stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-mono font-bold">
                      🏁 Chequered Flag (Lap {strategy.totalLaps})
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer: Simulate Button */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Fuel className="w-4 h-4 text-amber-400" />
          <span>Starting Fuel: 105 kg (~0.033s/kg burn benefit)</span>
        </div>

        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="w-full sm:w-auto relative group overflow-hidden px-8 py-3.5 rounded-xl font-mono font-extrabold uppercase tracking-wider text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-98 transition-all shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 cursor-pointer border border-red-500/50"
        >
          <Play className={`w-4 h-4 fill-white ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Computing Lap Telemetry...' : 'Simulate Race Strategy'}</span>
        </button>
      </div>
    </div>
  );
};
