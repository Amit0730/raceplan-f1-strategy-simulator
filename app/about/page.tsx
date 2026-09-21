'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import {
  ArrowLeft,
  Flame,
  Fuel,
  CloudSun,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import { COMPOUND_INFO } from '@/lib/circuits';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Live Simulator</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-mono text-xs font-bold border border-red-500/30">
              EDUCATIONAL WHITE PAPER
            </span>
            <span className="text-xs text-slate-500 font-mono">v2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2 font-mono">
            How the RacePlan Simulation Engine Works
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            RacePlan implements a deterministic mathematical model based on core Formula 1 race engineering
            principles. Below is a detailed breakdown of how each lap time is calculated.
          </p>
        </div>

        {/* 1. Core Equation Card */}
        <section className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-bold font-mono text-white uppercase">
              1. The Fundamental Lap Time Equation
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            For each individual race lap <code className="text-amber-400">i</code> on stint <code className="text-amber-400">k</code>, the simulated lap time <code className="text-emerald-400">T(i)</code> is formulated as:
          </p>

          <div className="p-4 rounded-lg bg-[#07090e] border border-slate-800 text-sm font-mono text-slate-200 overflow-x-auto leading-loose text-center">
            <span className="text-emerald-400 font-bold">T(i)</span> ={' '}
            <span className="text-slate-300">T_base</span> +{' '}
            <span className="text-red-400">Δ_compound</span> +{' '}
            <span className="text-amber-400">Δ_deg(age, track)</span> +{' '}
            <span className="text-sky-400">Δ_fuel(mass)</span> +{' '}
            <span className="text-purple-400">Δ_weather</span> +{' '}
            <span className="text-yellow-300">Δ_pit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-slate-400 pt-2">
            <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-slate-200 font-bold">T_base:</span> Circuit theoretical baseline pace (e.g. 88.5s for Silverstone, 81.2s for Monza).
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-red-400 font-bold">Δ_compound:</span> Initial mechanical grip offset relative to the Medium tyre (Soft: -0.65s, Hard: +0.75s).
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-amber-400 font-bold">Δ_deg:</span> Cumulative tyre degradation combining linear tread loss and exponential cliff drop-off.
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-800">
              <span className="text-sky-400 font-bold">Δ_fuel:</span> Time penalty caused by the weight of remaining fuel on board (~0.033s/kg).
            </div>
          </div>
        </section>

        {/* 2. Tyre Compounds & Degradation Curve */}
        <section className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold font-mono text-white uppercase">
              2. Pirelli Compound Physics &amp; The &quot;Tyre Cliff&quot;
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Tyres degrade in two distinct regimes: an initial linear phase where rubber sheds smoothly, followed by a non-linear exponential &quot;cliff&quot; once thermal degradation penetrates deep into the carcass.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(COMPOUND_INFO).map(([code, info]) => (
              <div
                key={code}
                className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg space-y-2 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: info.colorHex }}
                    />
                    {info.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Delta: {info.initialPaceDelta > 0 ? `+${info.initialPaceDelta}s` : `${info.initialPaceDelta}s`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {info.description}
                </p>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 flex justify-between">
                  <span>Optimal Life: ~{info.optimalLifeLaps} Laps</span>
                  <span>Cliff exp: {info.cliffMultiplier}x</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs font-mono text-amber-300">
            <strong>The Cliff Equation:</strong> If tyre age <code className="text-white">L &gt; L_optimal</code>, degradation penalty spikes with <code className="text-white">0.12 × (L - L_optimal)^1.65 × Deg_Multiplier</code>.
          </div>
        </section>

        {/* 3. Fuel Effect */}
        <section className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-mono text-white uppercase">
              3. Fuel Load Burn-Off
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            A standard modern Formula 1 car begins the race with approximately 105 kg of fuel. Every 10 kg of fuel adds approximately 0.33 seconds of mass penalty per lap. As the car burns fuel linearly over the Grand Prix distance, it becomes lighter, allowing cars to set their fastest laps at the end of the race despite tyre wear.
          </p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
            <code>Fuel_Penalty(lap) = (105kg - (lap - 1) * (105 / Total_Laps)) × 0.033 s/kg</code>
          </div>
        </section>

        {/* 4. Weather Model */}
        <section className="bg-[#0c101a] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold font-mono text-white uppercase">
              4. Weather Crossover Windows
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Formula 1 teams operate under precise &quot;crossover windows&quot;:
          </p>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-amber-400 font-bold">DRY TRACK:</span>
              <span className="text-slate-300">Slicks are fastest. Inters overheat (+4.0s). Full Wets overheat (+8.5s).</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-emerald-400 font-bold">MIXED / DAMP:</span>
              <span className="text-slate-300">Intermediates are optimal. Slicks lose traction (+7.5s).</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <span className="text-sky-400 font-bold">MONSOON / WET:</span>
              <span className="text-slate-300">Full Wets required. Slicks aquaplane with catastrophic (+22.0s) loss.</span>
            </div>
          </div>
        </section>

        {/* 5. Educational Disclaimer & Limitations */}
        <section className="bg-amber-950/15 border border-amber-600/30 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold font-mono uppercase">
              5. Educational Limitations &amp; Disclaimer
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-300 space-y-3 leading-relaxed">
            <p>
              This simulator is an <strong>educational and conceptual engineering demonstration</strong> designed to illustrate how pit stops, compound choices, and tire degradation interact.
            </p>
            <p className="text-slate-400">
              It does NOT claim to reproduce live FIA telemetry, track telemetry micro-sectors, aerodynamic dirty air deltas, Safety Car / VSC randomizations, or team telemetry secrets.
            </p>
            <p className="text-slate-400">
              In actual Formula 1 races, strategic decisions depend heavily on track position, DRS trains, undercut response times, and ambient asphalt temperatures.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
