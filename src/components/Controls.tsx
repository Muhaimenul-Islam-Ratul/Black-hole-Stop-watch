import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { StopwatchStatus } from '../types';

interface ControlsProps {
  status: StopwatchStatus;
  onStartPause: () => void;
  onLapReset: () => void;
  hasLaps: boolean;
}

export default function Controls({
  status,
  onStartPause,
  onLapReset,
  hasLaps,
}: ControlsProps) {
  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';
  const isIdle = status === 'IDLE';

  // Can only reset if there is recorded data or it is paused
  const canReset = !isIdle || hasLaps;

  // Can only lap if it is actively running
  const canLap = isRunning;

  return (
    <div 
      className="flex items-center justify-center gap-6 md:gap-10 my-6 w-full max-w-md px-4" 
      id="controls-section"
    >
      {/* RESET Button (Left side, stable position) */}
      <motion.button
        id="lap-reset-btn"
        whileHover={canReset ? { scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.3)' } : {}}
        whileTap={canReset ? { scale: 0.95 } : {}}
        disabled={!canReset}
        onClick={onLapReset}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border flex flex-col items-center justify-center transition-all duration-300 group ${
          canReset 
            ? 'border-white/10 text-white/60 hover:text-white cursor-pointer bg-white/[0.01]' 
            : 'border-white/5 text-white/10 cursor-not-allowed bg-transparent'
        }`}
        title="Reset stopwatch and laps"
      >
        <RotateCcw size={14} className="mb-0.5 transition-transform group-hover:rotate-[-45deg] duration-300" />
        <span className="text-[9px] uppercase tracking-wider font-display">Reset</span>
      </motion.button>

      {/* START / PAUSE Button (Center, larger, stable position) */}
      <motion.button
        id="start-pause-btn"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onStartPause}
        className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
          isRunning
            ? 'bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:bg-rose-400'
            : isPaused
            ? 'bg-cyan-400 text-black shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:bg-cyan-300 font-semibold'
            : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-100'
        }`}
      >
        {isRunning ? (
          <>
            <Pause size={24} fill="currentColor" className="mb-0.5" />
            <span className="text-[10px] uppercase tracking-widest font-display">Pause</span>
          </>
        ) : (
          <>
            <Play size={24} fill="currentColor" className="ml-1 mb-0.5 text-current" />
            <span className="text-[10px] uppercase tracking-widest font-display font-medium">
              {isPaused ? 'Resume' : 'Start'}
            </span>
          </>
        )}
      </motion.button>

      {/* LAP Button (Right side, stable position) */}
      <motion.button
        id="lap-btn"
        whileHover={canLap ? { scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.4)' } : {}}
        whileTap={canLap ? { scale: 0.95 } : {}}
        disabled={!canLap}
        onClick={onLapReset} // Maps to the lap logic when running
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border flex flex-col items-center justify-center transition-all duration-300 group ${
          canLap
            ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer'
            : 'border-white/5 text-white/10 cursor-not-allowed bg-transparent'
        }`}
        title="Record current lap split"
      >
        <span className="text-sm font-light mb-0.5">＋</span>
        <span className="text-[9px] uppercase tracking-wider font-display">Lap</span>
      </motion.button>
    </div>
  );
}

