'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flag, Gauge, GitCompare, BookOpen, Zap } from 'lucide-react';
import { CIRCUITS } from '@/lib/circuits';

interface NavbarProps {
  currentCircuitId?: string;
  onSelectCircuit?: (circuitId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCircuitId = 'silverstone', onSelectCircuit }) => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md">
      {/* Top Kerb Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 via-50% to-emerald-500 opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 border border-red-500/50 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-5 h-5 text-white stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                  RACE<span className="text-red-500">PLAN</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                  F1 Sim
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Formula 1 Race Strategy & Telemetry
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                pathname === '/'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gauge className="w-4 h-4 text-red-400" />
              <span>Simulator</span>
            </Link>

            <Link
              href="/#results"
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <Flag className="w-4 h-4 text-amber-400" />
              <span>Telemetry</span>
            </Link>

            <Link
              href="/#comparison"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <GitCompare className="w-4 h-4 text-emerald-400" />
              <span>Compare</span>
            </Link>

            <Link
              href="/about"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                pathname === '/about'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Physics & Math</span>
            </Link>
          </nav>

          {/* Circuit Quick Switcher (if on home page) */}
          {onSelectCircuit && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Track:
              </span>
              <select
                value={currentCircuitId}
                onChange={(e) => onSelectCircuit(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500 hover:border-slate-600 transition-colors cursor-pointer"
              >
                {CIRCUITS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.name} ({c.totalLaps} Laps)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
