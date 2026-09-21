export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type WeatherCondition = 'DRY' | 'MIXED' | 'WET';

export type DegradationProfile = 'LOW' | 'STANDARD' | 'HIGH' | 'EXTREME';

export interface StintConfig {
  id: string;
  compound: TyreCompound;
  startLap: number;
  endLap: number;
  pitLap?: number; // Lap at which the car enters pit at the end of this stint (if not final stint)
}

export interface StrategyConfig {
  id: string;
  name: string;
  circuitId: string;
  circuitName: string;
  totalLaps: number;
  weather: WeatherCondition;
  degradation: DegradationProfile;
  pitLossSeconds: number;
  startingFuelKg: number;
  stints: StintConfig[];
  createdAt: number;
}

export interface LapTelemetry {
  lap: number;
  lapTimeSeconds: number;
  lapTimeFormatted: string;
  cumulativeTimeSeconds: number;
  cumulativeTimeFormatted: string;
  stintIndex: number;
  compound: TyreCompound;
  tyreAge: number;
  tyreWearPct: number; // 0 to 100%
  tyreDegDelta: number; // Seconds lost to tyre wear
  fuelDelta: number; // Seconds saved from burning fuel
  pitDelta: number; // Pit stop time lost on this lap
  weatherPenalty: number; // Seconds lost to weather mismatch
  isPitLap: boolean;
  isOutLap: boolean;
}

export interface StintSummary {
  stintIndex: number;
  compound: TyreCompound;
  startLap: number;
  endLap: number;
  lapsCount: number;
  startWearPct: number;
  endWearPct: number;
  averageLapTime: number;
  fastestLapTime: number;
  pitTimeLost: number;
}

export interface SimulationResult {
  strategy: StrategyConfig;
  totalTimeSeconds: number;
  totalTimeFormatted: string;
  pitStopsCount: number;
  totalPitTimeLost: number;
  averageLapTimeSeconds: number;
  averageLapTimeFormatted: string;
  fastestLap: {
    lap: number;
    timeSeconds: number;
    timeFormatted: string;
    compound: TyreCompound;
  };
  stintSummaries: StintSummary[];
  laps: LapTelemetry[];
  maxTyreWearPct: number;
}

export interface CircuitPreset {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  totalLaps: number;
  baseLapTimeSeconds: number;
  defaultPitLossSeconds: number;
  trackDegradation: DegradationProfile;
  trackLengthKm: number;
  description: string;
}

export interface CompoundInfo {
  name: string;
  code: TyreCompound;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeBg: string;
  initialPaceDelta: number; // in seconds relative to Medium
  wearRatePerLap: number; // standard wear % per lap
  optimalLifeLaps: number; // laps before cliff
  cliffMultiplier: number;
  description: string;
}
