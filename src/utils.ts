import { Lap, StopwatchStats } from './types';

/**
 * Formats a duration in milliseconds to a high-precision string (MM:SS.CC)
 * CC stands for Centiseconds (hundredths of a second)
 */
export function formatTime(ms: number): {
  minutes: string;
  seconds: string;
  centiseconds: string;
  hours?: string;
} {
  if (ms < 0) ms = 0;

  const totalSeconds = Math.floor(ms / 1000);
  const hoursVal = Math.floor(totalSeconds / 3600);
  const minutesVal = Math.floor((totalSeconds % 3600) / 60);
  const secondsVal = totalSeconds % 60;
  const centisecondsVal = Math.floor((ms % 1000) / 10);

  const pad = (num: number) => String(num).padStart(2, '0');

  return {
    hours: hoursVal > 0 ? pad(hoursVal) : undefined,
    minutes: pad(minutesVal),
    seconds: pad(secondsVal),
    centiseconds: pad(centisecondsVal),
  };
}

/**
 * Helper to display formatted time as a single string
 */
export function formatTimeToString(ms: number): string {
  const parts = formatTime(ms);
  if (parts.hours) {
    return `${parts.hours}:${parts.minutes}:${parts.seconds}.${parts.centiseconds}`;
  }
  return `${parts.minutes}:${parts.seconds}.${parts.centiseconds}`;
}

/**
 * Computes the fastest and slowest laps in a list of laps
 */
export function calculateLapStats(laps: Lap[]): StopwatchStats {
  if (laps.length === 0) {
    return { fastestLapId: null, slowestLapId: null, averageLapTime: 0 };
  }

  let fastestLap = laps[0];
  let slowestLap = laps[0];
  let totalTime = 0;

  laps.forEach((lap) => {
    totalTime += lap.lapTime;
    if (lap.lapTime < fastestLap.lapTime) {
      fastestLap = lap;
    }
    if (lap.lapTime > slowestLap.lapTime) {
      slowestLap = lap;
    }
  });

  return {
    fastestLapId: laps.length > 1 ? fastestLap.id : null,
    slowestLapId: laps.length > 1 ? slowestLap.id : null,
    averageLapTime: totalTime / laps.length,
  };
}
