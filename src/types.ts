export interface Lap {
  id: string;
  lapNumber: number;
  lapTime: number; // in milliseconds
  overallTime: number; // in milliseconds
  isFastest?: boolean;
  isSlowest?: boolean;
}

export type StopwatchStatus = 'IDLE' | 'RUNNING' | 'PAUSED';
export type WarpLevel = '3Rs' | '2Rs' | '1.5Rs';

export interface StopwatchStats {
  fastestLapId: string | null;
  slowestLapId: string | null;
  averageLapTime: number;
}
