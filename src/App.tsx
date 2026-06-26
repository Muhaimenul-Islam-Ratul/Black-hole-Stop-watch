/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, HelpCircle, Sparkles, Orbit, Clock, Zap, Timer } from 'lucide-react';

import { Lap, StopwatchStatus, WarpLevel } from './types';
import BlackHole from './components/BlackHole';
import Controls from './components/Controls';
import LapList from './components/LapList';
import LapChart from './components/LapChart';
import { formatTimeToString, calculateLapStats } from './utils';

export default function App() {
  const [status, setStatus] = useState<StopwatchStatus>(() => {
    const saved = localStorage.getItem('chronos_status');
    return saved === 'RUNNING' ? 'PAUSED' : (saved as StopwatchStatus) || 'IDLE';
  });
  const [elapsedTime, setElapsedTime] = useState<number>(() => {
    const saved = localStorage.getItem('chronos_elapsed_time');
    return saved ? Number(saved) : 0;
  });
  const [currentLapTime, setCurrentLapTime] = useState<number>(() => {
    const saved = localStorage.getItem('chronos_current_lap_time');
    return saved ? Number(saved) : 0;
  });
  const [laps, setLaps] = useState<Lap[]>(() => {
    const saved = localStorage.getItem('chronos_laps');
    return saved ? JSON.parse(saved) : [];
  });
  const [warpLevel, setWarpLevel] = useState<WarpLevel>(() => {
    const saved = localStorage.getItem('chronos_warp_level');
    return (saved as WarpLevel) || '3Rs';
  });
  const [lapTrigger, setLapTrigger] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // High-precision timing refs to prevent render lag and cumulative drift
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);
  const lapStartRef = useRef<number>(0);
  const lapElapsedBeforePauseRef = useRef<number>(0);

  // Load saved timing refs on mount to prevent drift upon reload
  useEffect(() => {
    const savedElapsed = localStorage.getItem('chronos_elapsed_time');
    const savedLapElapsed = localStorage.getItem('chronos_current_lap_time');
    if (savedElapsed) elapsedBeforePauseRef.current = Number(savedElapsed);
    if (savedLapElapsed) lapElapsedBeforePauseRef.current = Number(savedLapElapsed);
  }, []);

  // Persist loops
  useEffect(() => {
    localStorage.setItem('chronos_laps', JSON.stringify(laps));
  }, [laps]);

  useEffect(() => {
    localStorage.setItem('chronos_warp_level', warpLevel);
  }, [warpLevel]);

  useEffect(() => {
    localStorage.setItem('chronos_status', status);
    localStorage.setItem('chronos_elapsed_time', String(elapsedTime));
    localStorage.setItem('chronos_current_lap_time', String(currentLapTime));
  }, [status, elapsedTime, currentLapTime]);

  // Web Audio synthesizer for relativistic acoustic feedback
  const playCosmicSound = (type: 'start' | 'pause' | 'lap' | 'reset') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'pause') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'lap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.setValueAtTime(750, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'reset') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('Cosmic audio skipped/blocked by browser policies', e);
    }
  };

  // High-precision main timing loop
  const updateTimer = () => {
    const now = performance.now();

    // Calculate total time
    const total = elapsedBeforePauseRef.current + (now - startTimeRef.current);
    setElapsedTime(total);

    // Calculate current lap time
    const lapTotal = lapElapsedBeforePauseRef.current + (now - lapStartRef.current);
    setCurrentLapTime(lapTotal);

    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const handleStartPause = () => {
    if (status === 'RUNNING') {
      // Pause
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      const now = performance.now();
      elapsedBeforePauseRef.current += (now - startTimeRef.current);
      lapElapsedBeforePauseRef.current += (now - lapStartRef.current);

      setStatus('PAUSED');
      playCosmicSound('pause');
    } else {
      // Start or Resume
      const now = performance.now();
      startTimeRef.current = now;
      lapStartRef.current = now;

      setStatus('RUNNING');
      playCosmicSound('start');
      requestRef.current = requestAnimationFrame(updateTimer);
    }
  };

  const handleLapReset = () => {
    if (status === 'RUNNING') {
      // Record Lap
      const now = performance.now();
      const currentLapDuration = lapElapsedBeforePauseRef.current + (now - lapStartRef.current);
      const currentTotalTime = elapsedBeforePauseRef.current + (now - startTimeRef.current);

      const newLap: Lap = {
        id: crypto.randomUUID ? crypto.randomUUID() : `lap-${Date.now()}-${Math.random()}`,
        lapNumber: laps.length + 1,
        lapTime: currentLapDuration,
        overallTime: currentTotalTime,
      };

      setLaps((prev) => [newLap, ...prev]);
      setLapTrigger((prev) => prev + 1);
      playCosmicSound('lap');

      // Reset lap indicators for next lap segment
      lapStartRef.current = now;
      lapElapsedBeforePauseRef.current = 0;
      setCurrentLapTime(0);
    } else {
      // Reset
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      setStatus('IDLE');
      setElapsedTime(0);
      setCurrentLapTime(0);
      setLaps([]);
      setLapTrigger(0);
      playCosmicSound('reset');

      // Reset timing states
      startTimeRef.current = 0;
      elapsedBeforePauseRef.current = 0;
      lapStartRef.current = 0;
      lapElapsedBeforePauseRef.current = 0;

      // Clear localStorage items for the session
      localStorage.removeItem('chronos_status');
      localStorage.removeItem('chronos_elapsed_time');
      localStorage.removeItem('chronos_current_lap_time');
      localStorage.removeItem('chronos_laps');
    }
  };

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Compute live lap metrics
  const stats = calculateLapStats(laps);
  const fastestLapTime = stats.fastestLapId
    ? (laps.find((l) => l.id === stats.fastestLapId)?.lapTime || 0)
    : 0;

  const handleExportLogs = () => {
    if (laps.length === 0) return;
    const logText = [...laps]
      .reverse()
      .map(
        (lap) =>
          `Lap ${String(lap.lapNumber).padStart(2, '0')}: Split Duration ${formatTimeToString(
            lap.lapTime
          )} | Cumulative Elapsed ${formatTimeToString(lap.overallTime)}`
      )
      .join('\n');
    navigator.clipboard.writeText(`--- CHRONOS RELATIVITY TIME-DIAL LOGS ---\nSession Data:\n${logText}\nGravity factor preset: ${warpLevel}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 font-sans flex flex-col items-center justify-between p-6 md:p-10 overflow-x-hidden relative" id="app-root">

      {/* Atmosphere Glow Lights from Clean Minimalism Spec */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[600px] md:h-[600px] bg-cyan-950/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[400px] md:h-[400px] bg-indigo-900/10 rounded-full blur-[60px] md:blur-[80px]" />
      </div>

      {/* Header bar combining interactive buttons and the minimalist text */}
      <header className="w-full max-w-6xl flex justify-between items-center z-20 pb-4 border-b border-white/[0.03]" id="app-header">
        {/* Left header portion: Chronos details & Audio Button */}
        <div className="flex items-center gap-3">
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center text-zinc-400 hover:text-white ${
              soundEnabled ? 'text-cyan-400 border-cyan-500/15' : ''
            }`}
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-white/50">CHRONOS // V.04</span>
            <span className="text-[8px] text-white/20 tracking-wider">AUDIO BOUNDED</span>
          </div>
        </div>

        {/* Center portion: Live status indicator or logo */}
        <div className="flex flex-col items-center">
          <h1 className="text-xs uppercase tracking-[0.4em] font-display text-white/80 flex items-center gap-1.5 font-light">
            <Orbit size={13} className="text-cyan-500 animate-spin-slow" /> Singularity
          </h1>
        </div>

        {/* Right header portion: Info Button & Labs text */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] tracking-widest uppercase text-white/40">DEEP SPACE LABS</span>
            <span className="text-[8px] text-white/20 tracking-wider">RELATIVITY TIMER</span>
          </div>

          <button
            id="info-toggle-btn"
            onClick={() => setShowInfo(true)}
            className="p-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center text-zinc-400 hover:text-white"
            aria-label="About relativity"
          >
            <HelpCircle size={13} />
          </button>
        </div>
      </header>

      {/* Main Content Layout with Responsive Columns */}
      <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between z-10 gap-8 lg:gap-12 flex-1 py-6 md:py-10" id="app-main">

        {/* Left Column: Lap Statistics (Shown prominently on desktop, elegant stack on mobile) */}
        <section className="w-full lg:w-1/4 flex flex-col justify-center gap-5 lg:gap-8 order-2 lg:order-1" id="stats-section">
          <div className="space-y-6 bg-white/[0.01] lg:bg-transparent p-5 lg:p-0 rounded-2xl border border-white/5 lg:border-none">

            {/* Fastest Lap Stat Row */}
            <div className="group transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60 block mb-1 font-display">
                Fastest Lap
              </span>
              <p className="font-mono text-xl md:text-2xl tracking-tighter text-cyan-50 font-light">
                {fastestLapTime > 0 ? formatTimeToString(fastestLapTime) : '— — : — — . — —'}
              </p>
              <div className="h-[2px] w-0 group-hover:w-12 bg-cyan-500/40 transition-all duration-500 mt-1"></div>
            </div>

            <div className="h-px w-full lg:w-12 bg-white/10"></div>

            {/* Average Pace Stat Row */}
            <div className="group transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-1 font-display">
                Average Pace
              </span>
              <p className="font-mono text-xl md:text-2xl tracking-tighter text-white/80 font-light">
                {stats.averageLapTime > 0 ? formatTimeToString(stats.averageLapTime) : '— — : — — . — —'}
              </p>
              <div className="h-[2px] w-0 group-hover:w-12 bg-white/25 transition-all duration-500 mt-1"></div>
            </div>

            <div className="h-px w-full lg:w-12 bg-white/10"></div>

            {/* Current Split Duration Row */}
            <div className="group transition-all duration-300">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 block mb-1 font-display">
                Current Split
              </span>
              <p className="font-mono text-xl md:text-2xl tracking-tighter text-white/80 font-light">
                {currentLapTime > 0 ? `+${formatTimeToString(currentLapTime)}` : '00:00.00'}
              </p>
              <div className="h-[2px] w-0 group-hover:w-12 bg-white/25 transition-all duration-500 mt-1"></div>
            </div>

          </div>
        </section>

        {/* Center Column: The Majestic Black Hole Stopwatch & Controls */}
        <section className="flex flex-col items-center justify-center w-full lg:w-1/2 order-1 lg:order-2" id="central-stopwatch-section">
          {/* Black Hole dial */}
          <BlackHole
            elapsedTime={elapsedTime}
            status={status}
            lapCount={laps.length}
            currentLapTime={currentLapTime}
            lapTrigger={lapTrigger}
            warpLevel={warpLevel}
          />

          {/* Interactive controls */}
          <Controls
            status={status}
            onStartPause={handleStartPause}
            onLapReset={handleLapReset}
            hasLaps={laps.length > 0}
          />

          {/* Gravitational Warp Presets tab selector */}
          <div className="mt-5 flex flex-col items-center gap-2 z-10" id="warp-selector-container">
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-display">
              Gravitational proximity
            </span>
            <div className="flex bg-white/[0.02] border border-white/5 p-1 rounded-xl">
              {(['3Rs', '2Rs', '1.5Rs'] as WarpLevel[]).map((level) => {
                const label = level === '3Rs' ? '3Rs Low Orbit' : level === '2Rs' ? '2Rs Horizon' : '1.5Rs Singularity';
                const activeColor = level === '3Rs' ? 'text-cyan-400' : level === '2Rs' ? 'text-indigo-400' : 'text-violet-400';
                const activeBg = level === '3Rs' ? 'bg-cyan-500/10' : level === '2Rs' ? 'bg-indigo-500/10' : 'bg-violet-500/10';

                return (
                  <button
                    key={level}
                    onClick={() => {
                      setWarpLevel(level);
                      playCosmicSound('lap'); // cool shift tone
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-display font-medium transition-all duration-300 cursor-pointer ${
                      warpLevel === level
                        ? `${activeColor} ${activeBg} border border-white/[0.05]`
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                    title={label}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Dynamic Lap History list */}
        <section className="w-full lg:w-1/4 flex flex-col order-3" id="history-section">
          <div className="bg-white/[0.01] lg:bg-transparent p-5 lg:p-0 rounded-2xl border border-white/5 lg:border-none flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-display">
                Lap History
              </span>
              {laps.length > 0 && (
                <button
                  onClick={handleExportLogs}
                  className="text-[9px] uppercase tracking-wider text-cyan-400/80 hover:text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-400/20 px-2.5 py-1 rounded-md transition-all duration-300 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? 'Copied' : 'Export Logs'}
                </button>
              )}
            </div>
            <LapList laps={laps} />
            <LapChart laps={laps} />
          </div>
        </section>

      </main>

      {/* Footer Branding from Design Spec */}
      <footer className="w-full max-w-6xl text-center py-4 border-t border-white/[0.03] z-10" id="app-footer">
        <span className="text-[9px] uppercase tracking-[0.5em] text-white/20">
          Gravity-Assisted Precision Timing • Port 3000
        </span>
      </footer>

      {/* Relativistic Educational Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInfo(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            id="info-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#05050a] border border-white/10 max-w-sm w-full p-6 rounded-3xl relative overflow-hidden shadow-2xl"
            >
              {/* Deco radial glows in modal */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={15} className="text-cyan-400" />
                <h3 className="font-display text-xs tracking-widest uppercase font-semibold text-zinc-100">
                  Relativity & Gravitational Time Dilation
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-white/60 font-sans leading-relaxed">
                <p>
                  According to Einstein's theory of <strong>General Relativity</strong>, gravity is the warping of space-time caused by mass and energy.
                </p>
                <p>
                  The closer you get to a supermassive object like a <strong>Black Hole</strong>, the stronger the gravitational pull, and the slower time passes relative to an observer far away.
                </p>
                <p className="text-white/40 italic border-l-2 border-cyan-500/20 pl-2.5">
                  This stopwatch celebrates the dilation of time. When the clock is running, the accretion disk spins and pulses as you log moments in your own light cone.
                </p>
              </div>

              <button
                id="close-info-btn"
                onClick={() => setShowInfo(false)}
                className="mt-6 w-full py-2.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/10 text-white/80 hover:text-white font-sans text-[10px] uppercase tracking-widest font-medium transition-all duration-300 cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

