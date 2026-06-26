import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime } from '../utils';
import { StopwatchStatus, WarpLevel } from '../types';

interface BlackHoleProps {
  elapsedTime: number;
  status: StopwatchStatus;
  lapCount: number;
  currentLapTime: number;
  lapTrigger: number; // incremented whenever a lap is recorded
  warpLevel: WarpLevel;
}

interface GravityWave {
  id: number;
  scale: number;
}

export default function BlackHole({
  elapsedTime,
  status,
  lapCount,
  currentLapTime,
  lapTrigger,
  warpLevel,
}: BlackHoleProps) {
  const [waves, setWaves] = useState<GravityWave[]>([]);
  const [waveCounter, setWaveCounter] = useState(0);

  // Trigger a gravitational wave ripple when a lap is added
  useEffect(() => {
    if (lapTrigger > 0) {
      const newId = waveCounter;
      setWaveCounter((prev) => prev + 1);
      setWaves((prev) => [...prev, { id: newId, scale: 1 }]);

      // Remove the wave after the animation completes
      const timer = setTimeout(() => {
        setWaves((prev) => prev.filter((w) => w.id !== newId));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [lapTrigger]);

  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';

  // Format time elements
  const { hours, minutes, seconds, centiseconds } = formatTime(elapsedTime);
  const formattedLap = formatTime(currentLapTime);

  // Accelerate accretion disk rotation speed when stopwatch is running
  // Proximity to singularity scales velocity: 3Rs = Slower, 2Rs = Standard, 1.5Rs = Hyper dilation (Super fast rotation!)
  const baseRotation = warpLevel === '3Rs' ? 12 : warpLevel === '2Rs' ? 6 : 2;
  const rotationDuration = isRunning ? baseRotation : isPaused ? 25 : 45;

  // Determine neon theme color based on status and warp factor
  let glowColorClass = 'text-white';
  let accentBorderColor = 'border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)]';
  let gradientBackground = 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%)';

  if (isRunning) {
    if (warpLevel === '3Rs') {
      glowColorClass = 'text-cyan-400 text-neon-glow-cyan';
      accentBorderColor = 'border-cyan-500/35 shadow-[0_0_40px_rgba(6,182,212,0.18)]';
      gradientBackground = 'conic-gradient(from 0deg, transparent 0%, rgba(6, 182, 212, 0.25) 25%, transparent 40%, rgba(168, 85, 247, 0.15) 65%, transparent 75%, rgba(6, 182, 212, 0.2) 90%, transparent 100%)';
    } else if (warpLevel === '2Rs') {
      glowColorClass = 'text-indigo-400 text-neon-glow-indigo';
      accentBorderColor = 'border-indigo-500/40 shadow-[0_0_45px_rgba(99,102,241,0.22)]';
      gradientBackground = 'conic-gradient(from 0deg, transparent 0%, rgba(99, 102, 241, 0.3) 20%, transparent 40%, rgba(168, 85, 247, 0.25) 60%, transparent 75%, rgba(6, 182, 212, 0.25) 90%, transparent 100%)';
    } else {
      glowColorClass = 'text-violet-400 text-neon-glow-purple';
      accentBorderColor = 'border-violet-500/50 shadow-[0_0_55px_rgba(139,92,246,0.32)]';
      gradientBackground = 'conic-gradient(from 0deg, transparent 0%, rgba(139, 92, 246, 0.4) 15%, transparent 35%, rgba(236, 72, 153, 0.35) 55%, transparent 70%, rgba(6, 182, 212, 0.3) 85%, transparent 100%)';
    }
  } else if (isPaused) {
    glowColorClass = 'text-rose-400/90 text-neon-glow-rose';
    accentBorderColor = 'border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]';
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-4" id="black-hole-container">
      {/* Gravitational Waves (Expanding Space Ripples) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <AnimatePresence>
          {waves.map((wave) => (
            <motion.div
              key={wave.id}
              initial={{ opacity: 0.6, scale: 0.8, border: '1px solid rgba(6, 182, 212, 0.3)' }}
              animate={{
                opacity: 0,
                scale: 1.8,
                border: '1px solid rgba(6, 182, 212, 0)',
                boxShadow: '0 0 50px rgba(6, 182, 212, 0.15), inset 0 0 25px rgba(6, 182, 212, 0.05)',
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute rounded-full w-[280px] h-[280px] md:w-[340px] md:h-[340px]"
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main Celestial Body Structure */}
      <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] flex items-center justify-center">
        
        {/* Event Horizon Outer Glow Rings from Design Spec */}
        <div className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-cyan-500/10 flex items-center justify-center pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full border border-white/5 pointer-events-none" />

        {/* Dynamic Accretion Disk Ring (using conic gradient) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: rotationDuration,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-[85%] h-[85%] rounded-full opacity-35 filter blur-[2px] pointer-events-none"
          style={{
            background: gradientBackground,
          }}
        />

        {/* Central Event Horizon Circle */}
        <motion.div
          animate={{
            boxShadow: isRunning
              ? warpLevel === '3Rs'
                ? '0 0 80px rgba(6, 182, 212, 0.2), inset 0 0 30px rgba(6, 182, 212, 0.1)'
                : warpLevel === '2Rs'
                ? '0 0 80px rgba(99, 102, 241, 0.25), inset 0 0 30px rgba(99, 102, 241, 0.1)'
                : '0 0 90px rgba(139, 92, 246, 0.3), inset 0 0 35px rgba(139, 92, 246, 0.15)'
              : '0 0 50px rgba(255, 255, 255, 0.02), inset 0 0 20px rgba(255, 255, 255, 0.02)',
          }}
          transition={{ duration: 0.8 }}
          className={`w-[270px] h-[270px] md:w-[340px] md:h-[340px] bg-black rounded-full relative flex flex-col items-center justify-center overflow-hidden border ${accentBorderColor} transition-all duration-700`}
        >
          {/* Neon Top/Left Accent Ring from Design Spec */}
          <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-cyan-500/30 border-l-cyan-500/10 pointer-events-none" />

          {/* Core Content Layer */}
          <div className="flex flex-col items-center justify-center z-10 select-none text-center">
            
            {/* Status & Lap Label */}
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2 font-display">
              {isRunning ? 'elapsed' : status === 'PAUSED' ? 'paused' : 'chronos'}
            </span>

            {/* High-Precision Stopwatch Time Display */}
            <div className="flex items-baseline font-mono tracking-tighter mt-1">
              {/* Hours */}
              {hours && (
                <>
                  <span className={`text-4xl md:text-5xl font-light ${glowColorClass}`}>
                    {hours}
                  </span>
                  <span className="text-xl md:text-2xl text-white/20 mx-0.5">:</span>
                </>
              )}

              {/* Minutes */}
              <span className={`text-4xl md:text-5xl lg:text-6xl font-light ${glowColorClass}`}>
                {minutes}
              </span>

              {/* Colon separator */}
              <span className="text-3xl md:text-4xl text-white/10 mx-0.5 animate-pulse-subtle">:</span>

              {/* Seconds */}
              <span className={`text-4xl md:text-5xl lg:text-6xl font-light ${glowColorClass}`}>
                {seconds}
              </span>

              {/* Dot Separator */}
              <span className={`${
                warpLevel === '3Rs' ? 'text-cyan-400' : warpLevel === '2Rs' ? 'text-indigo-400' : 'text-violet-400'
              } text-3xl md:text-4xl lg:text-5xl font-light transition-colors duration-500`}>.</span>
              
              {/* Centiseconds */}
              <span className="text-xl md:text-2xl lg:text-3xl text-white/70 font-light tracking-wide w-12 text-left">
                {centiseconds}
              </span>
            </div>

            {/* Live split delta or preview if recording laps */}
            <AnimatePresence>
              {lapCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 0.5, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-3 text-[10px] tracking-widest text-zinc-400 font-mono"
                >
                  LAP {lapCount + 1} — {formattedLap.minutes}:{formattedLap.seconds}.{formattedLap.centiseconds}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Triple Dots Indicator from Design Spec */}
            <div className="mt-5 flex gap-1.5 items-center">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  isRunning
                    ? warpLevel === '3Rs'
                      ? 'bg-cyan-400 shadow-[0_0_8px_cyan]'
                      : warpLevel === '2Rs'
                      ? 'bg-indigo-400 shadow-[0_0_8px_#6366f1]'
                      : 'bg-violet-400 shadow-[0_0_8px_#8b5cf6]'
                    : isPaused
                    ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                    : 'bg-white/20'
                }`}
              />
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isRunning
                    ? warpLevel === '3Rs'
                      ? 'bg-cyan-400/40'
                      : warpLevel === '2Rs'
                      ? 'bg-indigo-400/40'
                      : 'bg-violet-400/40'
                    : 'bg-white/20'
                }`}
              />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>

          </div>

          {/* Gravitational pull gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}

