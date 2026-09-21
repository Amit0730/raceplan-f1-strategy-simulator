import { StrategyConfig } from '@/types/f1';
import { CIRCUITS } from './circuits';

const STORAGE_KEY_STRATEGIES = 'raceplan_f1_saved_strategies_v1';
const STORAGE_KEY_ACTIVE = 'raceplan_f1_active_strategy_v1';

export function getDefaultStrategies(circuitId: string = 'silverstone'): StrategyConfig[] {
  const circuit = CIRCUITS.find((c) => c.id === circuitId) || CIRCUITS[0];
  const totalLaps = circuit.totalLaps;

  // Stints for 1-Stop Medium -> Hard
  const pitLap1Stop = Math.round(totalLaps * 0.42);
  const strategy1Stop: StrategyConfig = {
    id: `strat-default-1stop-${circuit.id}`,
    name: 'Strategy A: 1-Stop (Medium ➔ Hard)',
    circuitId: circuit.id,
    circuitName: circuit.name,
    totalLaps,
    weather: 'DRY',
    degradation: circuit.trackDegradation,
    pitLossSeconds: circuit.defaultPitLossSeconds,
    startingFuelKg: 105,
    createdAt: Date.now() - 3000,
    stints: [
      {
        id: 'stint-1',
        compound: 'MEDIUM',
        startLap: 1,
        endLap: pitLap1Stop,
        pitLap: pitLap1Stop,
      },
      {
        id: 'stint-2',
        compound: 'HARD',
        startLap: pitLap1Stop + 1,
        endLap: totalLaps,
      },
    ],
  };

  // Stints for 2-Stop Soft -> Medium -> Soft
  const pit1Lap2Stop = Math.round(totalLaps * 0.28);
  const pit2Lap2Stop = Math.round(totalLaps * 0.68);
  const strategy2Stop: StrategyConfig = {
    id: `strat-default-2stop-${circuit.id}`,
    name: 'Strategy B: 2-Stop (Soft ➔ Medium ➔ Soft)',
    circuitId: circuit.id,
    circuitName: circuit.name,
    totalLaps,
    weather: 'DRY',
    degradation: circuit.trackDegradation,
    pitLossSeconds: circuit.defaultPitLossSeconds,
    startingFuelKg: 105,
    createdAt: Date.now() - 2000,
    stints: [
      {
        id: 'stint-1',
        compound: 'SOFT',
        startLap: 1,
        endLap: pit1Lap2Stop,
        pitLap: pit1Lap2Stop,
      },
      {
        id: 'stint-2',
        compound: 'MEDIUM',
        startLap: pit1Lap2Stop + 1,
        endLap: pit2Lap2Stop,
        pitLap: pit2Lap2Stop,
      },
      {
        id: 'stint-3',
        compound: 'SOFT',
        startLap: pit2Lap2Stop + 1,
        endLap: totalLaps,
      },
    ],
  };

  // Stints for Alternative 1-Stop Hard -> Medium
  const pitLapAlt = Math.round(totalLaps * 0.62);
  const strategyAlt: StrategyConfig = {
    id: `strat-default-alt-${circuit.id}`,
    name: 'Strategy C: 1-Stop Overcut (Hard ➔ Medium)',
    circuitId: circuit.id,
    circuitName: circuit.name,
    totalLaps,
    weather: 'DRY',
    degradation: circuit.trackDegradation,
    pitLossSeconds: circuit.defaultPitLossSeconds,
    startingFuelKg: 105,
    createdAt: Date.now() - 1000,
    stints: [
      {
        id: 'stint-1',
        compound: 'HARD',
        startLap: 1,
        endLap: pitLapAlt,
        pitLap: pitLapAlt,
      },
      {
        id: 'stint-2',
        compound: 'MEDIUM',
        startLap: pitLapAlt + 1,
        endLap: totalLaps,
      },
    ],
  };

  return [strategy1Stop, strategy2Stop, strategyAlt];
}

/**
 * Load saved strategies from localStorage or initialize with defaults
 */
export function loadSavedStrategies(circuitId?: string): StrategyConfig[] {
  if (typeof window === 'undefined') return getDefaultStrategies(circuitId);
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STRATEGIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved strategies from localStorage', err);
  }
  return getDefaultStrategies(circuitId);
}

/**
 * Save strategies array to localStorage
 */
export function saveStrategiesToStorage(strategies: StrategyConfig[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_STRATEGIES, JSON.stringify(strategies));
  } catch (err) {
    console.warn('Failed to save strategies to localStorage', err);
  }
}

/**
 * Load active strategy from localStorage
 */
export function loadActiveStrategy(defaultCircuitId: string = 'silverstone'): StrategyConfig {
  if (typeof window === 'undefined') return getDefaultStrategies(defaultCircuitId)[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id && parsed.stints) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse active strategy', err);
  }
  return getDefaultStrategies(defaultCircuitId)[0];
}

/**
 * Save active strategy to localStorage
 */
export function saveActiveStrategy(strategy: StrategyConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(strategy));
  } catch (err) {
    console.warn('Failed to save active strategy', err);
  }
}
