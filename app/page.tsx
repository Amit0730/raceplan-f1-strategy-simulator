'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StrategyBuilder } from '@/components/StrategyBuilder';
import { StrategyTimeline } from '@/components/StrategyTimeline';
import { ResultsSummary } from '@/components/ResultsSummary';
import { TelemetryCharts } from '@/components/TelemetryCharts';
import { LapTable } from '@/components/LapTable';
import { StrategyComparison } from '@/components/StrategyComparison';
import { StrategyConfig, SimulationResult } from '@/types/f1';
import {
  getDefaultStrategies,
  loadSavedStrategies,
  saveStrategiesToStorage,
  loadActiveStrategy,
  saveActiveStrategy,
} from '@/lib/storage';
import { simulateStrategy } from '@/lib/simulation-engine';
import { CIRCUITS } from '@/lib/circuits';
import { useIsClient } from '@/lib/use-is-client';
import { Zap, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const isClient = useIsClient();

  // Lazy state initialization
  const [activeStrategy, setActiveStrategy] = useState<StrategyConfig>(() =>
    loadActiveStrategy('silverstone')
  );
  const [simulationResult, setSimulationResult] = useState<SimulationResult>(() =>
    simulateStrategy(loadActiveStrategy('silverstone'))
  );
  const [comparedStrategies, setComparedStrategies] = useState<StrategyConfig[]>(() =>
    loadSavedStrategies('silverstone')
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Handler for updating active strategy configuration
  const handleStrategyChange = (updated: StrategyConfig) => {
    setActiveStrategy(updated);
    saveActiveStrategy(updated);
    // Real-time re-simulation for smooth interaction
    const sim = simulateStrategy(updated);
    setSimulationResult(sim);
  };

  // Handler for Simulate Race CTA button
  const handleSimulate = async () => {
    if (!activeStrategy) return;
    setIsSimulating(true);

    // Minor delay for visceral computing feel
    await new Promise((resolve) => setTimeout(resolve, 350));
    const result = simulateStrategy(activeStrategy);
    setSimulationResult(result);
    setIsSimulating(false);

    // Trigger celebratory confetti effect
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#ffffff'],
      });
    } catch {
      // Ignore if confetti not supported
    }

    // Smooth scroll down to results
    const resultsEl = document.getElementById('results');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler to add active strategy to comparison
  const handleSaveToComparison = (strategyToSave: StrategyConfig) => {
    const exists = comparedStrategies.some((s) => s.id === strategyToSave.id);
    let updated: StrategyConfig[];
    if (exists) {
      updated = comparedStrategies.map((s) =>
        s.id === strategyToSave.id ? strategyToSave : s
      );
    } else {
      const cloned = {
        ...strategyToSave,
        id: `strat-user-${Date.now()}`,
        name: `Custom Strategy (${strategyToSave.stints.map((s) => s.compound[0]).join('-')})`,
      };
      updated = [...comparedStrategies, cloned];
    }
    setComparedStrategies(updated);
    saveStrategiesToStorage(updated);
  };

  // Handler to remove a strategy from comparison
  const handleRemoveCompared = (id: string) => {
    const updated = comparedStrategies.filter((s) => s.id !== id);
    setComparedStrategies(updated);
    saveStrategiesToStorage(updated);
  };

  // Handler to load a compared strategy into the live builder
  const handleSelectAsActive = (strat: StrategyConfig) => {
    setActiveStrategy(strat);
    saveActiveStrategy(strat);
    const sim = simulateStrategy(strat);
    setSimulationResult(sim);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Handler to reset presets
  const handleResetPresets = () => {
    const defaults = getDefaultStrategies(activeStrategy.circuitId);
    setComparedStrategies(defaults);
    saveStrategiesToStorage(defaults);
  };

  // Handle switching circuit from Navbar
  const handleCircuitSelect = (circuitId: string) => {
    const circuit = CIRCUITS.find((c) => c.id === circuitId) || CIRCUITS[0];
    const totalLaps = circuit.totalLaps;
    const p1 = Math.round(totalLaps * 0.42);

    const updated: StrategyConfig = {
      id: `strat-${circuit.id}-${Date.now()}`,
      name: `Strategy 1 (${circuit.name})`,
      circuitId: circuit.id,
      circuitName: circuit.name,
      totalLaps,
      weather: 'DRY',
      degradation: circuit.trackDegradation,
      pitLossSeconds: circuit.defaultPitLossSeconds,
      startingFuelKg: 105,
      createdAt: Date.now(),
      stints: [
        { id: 's1', compound: 'MEDIUM', startLap: 1, endLap: p1, pitLap: p1 },
        { id: 's2', compound: 'HARD', startLap: p1 + 1, endLap: totalLaps },
      ],
    };

    setActiveStrategy(updated);
    saveActiveStrategy(updated);
    const sim = simulateStrategy(updated);
    setSimulationResult(sim);

    // Also update comparison with defaults for this circuit
    const defaults = getDefaultStrategies(circuit.id);
    setComparedStrategies(defaults);
    saveStrategiesToStorage(defaults);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Initializing RacePlan Simulator Engine...</span>
        </div>
      </div>
    );
  }

  const isSaved = comparedStrategies.some((s) => s.id === activeStrategy.id);

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200">
      <Navbar
        currentCircuitId={activeStrategy.circuitId}
        onSelectCircuit={handleCircuitSelect}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative rounded-2xl bg-gradient-to-br from-[#0e1422] via-[#0a0d16] to-[#07090e] border border-slate-800/90 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-xs font-mono font-bold border border-red-500/30">
                <Zap className="w-3.5 h-3.5" /> F1 Telemetry Simulator
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-xs font-mono">
                Pirelli 2026 Compounds
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-mono leading-tight">
              Formula 1 Race Strategy <span className="text-red-500">Simulator</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Design, test, and compare Formula 1 pit stop strategies. Simulate how tyre
              compound choice, degradation cliffs, fuel burn-off, and track weather dictate
              total race time and track position.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Physics Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Strategy Head-to-Head</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lap-by-Lap Telemetry</span>
              </div>
            </div>
          </div>
        </section>

        {/* Strategy Builder Component */}
        <section>
          <StrategyBuilder
            strategy={activeStrategy}
            onChangeStrategy={handleStrategyChange}
            onSimulate={handleSimulate}
            isSimulating={isSimulating}
          />
        </section>

        {/* Visual Strategy Timeline */}
        <section>
          <StrategyTimeline
            strategy={activeStrategy}
            stintSummaries={simulationResult.stintSummaries}
          />
        </section>

        {/* Results Dashboard & KPI Cards */}
        <section>
          <ResultsSummary
            result={simulationResult}
            onSaveToComparison={handleSaveToComparison}
            isSavedInComparison={isSaved}
          />
        </section>

        {/* Telemetry Charts */}
        <section>
          <TelemetryCharts result={simulationResult} />
        </section>

        {/* Multi-Strategy Comparison Section */}
        <section>
          <StrategyComparison
            strategies={comparedStrategies}
            onRemoveStrategy={handleRemoveCompared}
            onSelectAsActive={handleSelectAsActive}
            onResetPresets={handleResetPresets}
          />
        </section>

        {/* Detailed Lap Telemetry Table */}
        <section>
          <LapTable laps={simulationResult.laps} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#07090e] py-8 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400">
            RacePlan • Formula 1 Race Strategy & Telemetry Simulator
          </p>
          <p className="text-[11px] text-slate-600">
            Educational engineering simulation model. Formula 1, F1, and related marks are trademarks of Formula One Licensing B.V.
          </p>
        </div>
      </footer>
    </div>
  );
}
