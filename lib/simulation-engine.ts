import {
  CircuitPreset,
  DegradationProfile,
  LapTelemetry,
  SimulationResult,
  StintSummary,
  StrategyConfig,
  TyreCompound,
  WeatherCondition,
} from '@/types/f1';
import { CIRCUITS, COMPOUND_INFO } from './circuits';

// Multipliers for track degradation level
const DEG_MULTIPLIERS: Record<DegradationProfile, number> = {
  LOW: 0.75,
  STANDARD: 1.0,
  HIGH: 1.35,
  EXTREME: 1.7,
};

// Fuel weight sensitivity (seconds lost per kg of fuel on board)
const FUEL_TIME_PENALTY_PER_KG = 0.033; // ~0.33s per 10kg fuel

/**
 * Formats a time in seconds to mm:ss.mmm
 */
export function formatLapTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00.000';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const wholeSecs = Math.floor(secs);
  const millis = Math.round((secs - wholeSecs) * 1000);
  return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

/**
 * Formats a total race time in seconds to HH:MM:SS.mmm or MM:SS.mmm
 */
export function formatRaceTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00.000';
  const hours = Math.floor(seconds / 3600);
  const remainingSecs = seconds % 3600;
  const mins = Math.floor(remainingSecs / 60);
  const secs = remainingSecs % 60;
  const wholeSecs = Math.floor(secs);
  const millis = Math.round((secs - wholeSecs) * 1000);

  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, '0')}m ${wholeSecs
      .toString()
      .padStart(2, '0')}.${millis.toString().padStart(3, '0')}s`;
  }
  return `${mins}m ${wholeSecs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}s`;
}

/**
 * Calculates weather mismatch penalty
 */
export function calculateWeatherPenalty(
  compound: TyreCompound,
  weather: WeatherCondition
): number {
  const isSlick = compound === 'SOFT' || compound === 'MEDIUM' || compound === 'HARD';

  if (weather === 'DRY') {
    if (isSlick) return 0;
    if (compound === 'INTERMEDIATE') return 4.0; // Overheating & tread squirm
    if (compound === 'WET') return 8.5; // Severe overheating
  } else if (weather === 'MIXED') {
    if (compound === 'INTERMEDIATE') return 0; // Ideal crossover window
    if (isSlick) return 7.5; // Wet surface loss of mechanical & aero grip
    if (compound === 'WET') return 3.2; // Too dry for deep tread
  } else if (weather === 'WET') {
    if (compound === 'WET') return 0; // Standing water, optimal dispersal
    if (compound === 'INTERMEDIATE') return 4.5; // Aquaplaning risk
    if (isSlick) return 22.0; // Complete loss of traction
  }
  return 0;
}

/**
 * Core mathematical engine to simulate an entire Grand Prix strategy
 */
export function simulateStrategy(
  strategy: StrategyConfig,
  circuitOverride?: CircuitPreset
): SimulationResult {
  const circuit =
    circuitOverride ||
    CIRCUITS.find((c) => c.id === strategy.circuitId) ||
    CIRCUITS[0];

  const totalLaps = strategy.totalLaps;
  const degMultiplier = DEG_MULTIPLIERS[strategy.degradation] || 1.0;
  const startingFuelKg = strategy.startingFuelKg || 105;
  const fuelBurnPerLap = startingFuelKg / Math.max(1, totalLaps);

  const lapsTelemetry: LapTelemetry[] = [];
  const stintSummaries: StintSummary[] = [];

  let cumulativeTimeSeconds = 0;
  let totalPitTimeLost = 0;
  let fastestLap = {
    lap: 1,
    timeSeconds: Infinity,
    timeFormatted: '0:00.000',
    compound: strategy.stints[0]?.compound || 'MEDIUM',
  };
  let maxTyreWearPct = 0;

  // Stints map: which stint applies to which lap
  strategy.stints.forEach((stint, stintIdx) => {
    const compInfo = COMPOUND_INFO[stint.compound];
    const stintLapsCount = stint.endLap - stint.startLap + 1;
    let stintLapTimesSum = 0;
    let stintFastest = Infinity;
    let currentWearPct = 0;

    for (let lap = stint.startLap; lap <= stint.endLap; lap++) {
      const tyreAge = lap - stint.startLap + 1;
      const isPitLap = stint.pitLap === lap;
      const isOutLap = lap === stint.startLap && stintIdx > 0;

      // 1. Base Circuit Lap Time
      const basePace = circuit.baseLapTimeSeconds;

      // 2. Initial Tyre Compound Delta (relative to Medium)
      const compoundDelta = compInfo.initialPaceDelta;

      // 3. Fuel Load Burn-off Effect
      // Fuel at current lap: startingFuelKg - (lap - 1) * fuelBurnPerLap
      const fuelOnBoardKg = Math.max(0, startingFuelKg - (lap - 1) * fuelBurnPerLap);
      const fuelWeightPenalty = fuelOnBoardKg * FUEL_TIME_PENALTY_PER_KG;
      // We express fuel delta relative to empty tank
      const fuelDelta = fuelWeightPenalty;

      // 4. Tyre Degradation Model
      // Linear phase + Non-linear Cliff Drop-off
      const optimalLife = compInfo.optimalLifeLaps / degMultiplier;
      
      // Wear percentage (0% to 100%)
      currentWearPct = Math.min(100, (tyreAge / optimalLife) * 65);
      if (tyreAge > optimalLife) {
        const excessLaps = tyreAge - optimalLife;
        currentWearPct = Math.min(100, 65 + excessLaps * 4.5 * degMultiplier);
      }
      if (currentWearPct > maxTyreWearPct) {
        maxTyreWearPct = currentWearPct;
      }

      // Lap time degradation penalty in seconds
      let tyreDegDelta = (tyreAge - 1) * 0.042 * degMultiplier;
      if (tyreAge > optimalLife) {
        const lapsPastCliff = tyreAge - optimalLife;
        // Exponential cliff degradation
        tyreDegDelta += 0.12 * Math.pow(lapsPastCliff, compInfo.cliffMultiplier) * degMultiplier;
      }

      // Out-lap warmup penalty (cold tyres)
      if (isOutLap) {
        tyreDegDelta += 0.45;
      }

      // 5. Weather Penalty
      const weatherPenalty = calculateWeatherPenalty(stint.compound, strategy.weather);

      // 6. Pit Stop Penalty
      const pitDelta = isPitLap ? strategy.pitLossSeconds : 0;
      if (isPitLap) {
        totalPitTimeLost += pitDelta;
      }

      // Final Lap Time calculation
      const lapTimeSeconds =
        basePace +
        compoundDelta +
        fuelDelta +
        tyreDegDelta +
        weatherPenalty +
        pitDelta;

      cumulativeTimeSeconds += lapTimeSeconds;
      stintLapTimesSum += lapTimeSeconds;

      if (lapTimeSeconds < stintFastest && !isPitLap) {
        stintFastest = lapTimeSeconds;
      }

      if (lapTimeSeconds < fastestLap.timeSeconds && !isPitLap) {
        fastestLap = {
          lap,
          timeSeconds: lapTimeSeconds,
          timeFormatted: formatLapTime(lapTimeSeconds),
          compound: stint.compound,
        };
      }

      lapsTelemetry.push({
        lap,
        lapTimeSeconds: Math.round(lapTimeSeconds * 1000) / 1000,
        lapTimeFormatted: formatLapTime(lapTimeSeconds),
        cumulativeTimeSeconds: Math.round(cumulativeTimeSeconds * 1000) / 1000,
        cumulativeTimeFormatted: formatRaceTime(cumulativeTimeSeconds),
        stintIndex: stintIdx,
        compound: stint.compound,
        tyreAge,
        tyreWearPct: Math.round(currentWearPct * 10) / 10,
        tyreDegDelta: Math.round(tyreDegDelta * 1000) / 1000,
        fuelDelta: Math.round(fuelDelta * 1000) / 1000,
        pitDelta,
        weatherPenalty: Math.round(weatherPenalty * 1000) / 1000,
        isPitLap,
        isOutLap,
      });
    }

    const avgStintLapTime = stintLapsCount > 0 ? stintLapTimesSum / stintLapsCount : 0;

    stintSummaries.push({
      stintIndex: stintIdx,
      compound: stint.compound,
      startLap: stint.startLap,
      endLap: stint.endLap,
      lapsCount: stintLapsCount,
      startWearPct: 0,
      endWearPct: Math.round(currentWearPct * 10) / 10,
      averageLapTime: Math.round(avgStintLapTime * 1000) / 1000,
      fastestLapTime: Math.round((stintFastest === Infinity ? avgStintLapTime : stintFastest) * 1000) / 1000,
      pitTimeLost: stint.pitLap ? strategy.pitLossSeconds : 0,
    });
  });

  const pitStopsCount = Math.max(0, strategy.stints.length - 1);
  const averageLapTimeSeconds = totalLaps > 0 ? cumulativeTimeSeconds / totalLaps : 0;

  return {
    strategy,
    totalTimeSeconds: Math.round(cumulativeTimeSeconds * 1000) / 1000,
    totalTimeFormatted: formatRaceTime(cumulativeTimeSeconds),
    pitStopsCount,
    totalPitTimeLost: Math.round(totalPitTimeLost * 10) / 10,
    averageLapTimeSeconds: Math.round(averageLapTimeSeconds * 1000) / 1000,
    averageLapTimeFormatted: formatLapTime(averageLapTimeSeconds),
    fastestLap: fastestLap.timeSeconds === Infinity
      ? { lap: 1, timeSeconds: 0, timeFormatted: '0:00.000', compound: 'MEDIUM' }
      : fastestLap,
    stintSummaries,
    laps: lapsTelemetry,
    maxTyreWearPct: Math.round(maxTyreWearPct * 10) / 10,
  };
}

/**
 * Compares two or more simulation results and generates lap-by-lap gap data
 */
export function compareSimulationResults(results: SimulationResult[]): {
  gapData: Array<{ lap: number; [strategyName: string]: number }>;
  summary: Array<{
    id: string;
    name: string;
    totalTimeSeconds: number;
    deltaSeconds: number;
    deltaFormatted: string;
    pitStopsCount: number;
    strategyPath: string;
    avgWearPct: number;
  }>;
} {
  if (!results.length) return { gapData: [], summary: [] };

  // Sort by fastest total time
  const sorted = [...results].sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds);
  const baselineTime = sorted[0].totalTimeSeconds;
  const maxLaps = Math.max(...results.map((r) => r.laps.length));

  // Build lap-by-lap cumulative gap relative to the fastest overall strategy or Strategy 1
  const benchmarkResult = results[0];
  const gapData: Array<{ lap: number; [strategyName: string]: number }> = [];

  for (let l = 1; l <= maxLaps; l++) {
    const row: { lap: number; [strategyName: string]: number } = { lap: l };
    const benchLap = benchmarkResult.laps.find((lap) => lap.lap === l);
    const benchCumTime = benchLap ? benchLap.cumulativeTimeSeconds : 0;

    results.forEach((res) => {
      const resLap = res.laps.find((lap) => lap.lap === l);
      if (resLap && benchCumTime > 0) {
        // Positive means trailing the benchmark, negative means ahead
        const gap = resLap.cumulativeTimeSeconds - benchCumTime;
        row[res.strategy.name] = Math.round(gap * 1000) / 1000;
      }
    });
    gapData.push(row);
  }

  const summary = results.map((res) => {
    const delta = res.totalTimeSeconds - baselineTime;
    const deltaFormatted = delta === 0 ? 'LEADER (P1 Reference)' : `+${delta.toFixed(3)}s`;
    const strategyPath = res.strategy.stints.map((s) => s.compound).join(' ➔ ');
    const avgWear =
      res.stintSummaries.reduce((acc, s) => acc + s.endWearPct, 0) /
      Math.max(1, res.stintSummaries.length);

    return {
      id: res.strategy.id,
      name: res.strategy.name,
      totalTimeSeconds: res.totalTimeSeconds,
      deltaSeconds: delta,
      deltaFormatted,
      pitStopsCount: res.pitStopsCount,
      strategyPath,
      avgWearPct: Math.round(avgWear * 10) / 10,
    };
  });

  return { gapData, summary };
}
