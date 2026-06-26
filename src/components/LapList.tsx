import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lap } from '../types';
import { formatTimeToString, calculateLapStats } from '../utils';

interface LapListProps {
  laps: Lap[];
}

export default function LapList({ laps }: LapListProps) {
  const stats = calculateLapStats(laps);

  return (
    <div className="w-full flex flex-col h-full overflow-hidden relative" id="lap-list-container">
      {/* Top and Bottom Fading Gradient Overlays for High-End Cinematic Depth */}
      <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#020205] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#020205] to-transparent z-10 pointer-events-none" />

      {/* Vertical list layout */}
      <div 
        className="flex flex-col gap-5 py-4 max-h-[300px] md:max-h-[360px] overflow-y-auto pr-1"
        id="lap-history-scroll"
      >
        <AnimatePresence initial={false}>
          {laps.map((lap, index) => {
            const isFastest = lap.id === stats.fastestLapId;
            const isSlowest = lap.id === stats.slowestLapId;
            
            // Generate visual hierarchy opacity based on how recent the lap is
            const opacityClass = index === 0 
              ? 'opacity-100' 
              : index === 1 
              ? 'opacity-80' 
              : index === 2 
              ? 'opacity-55' 
              : 'opacity-30';

            return (
              <motion.div
                key={lap.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex justify-between items-end border-b border-white/[0.03] pb-2 transition-all duration-300 group hover:border-white/10 ${opacityClass}`}
              >
                {/* Left side: Lap Name & Badge */}
                <div className="flex flex-col items-start gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-medium tracking-wider ${
                      isFastest ? 'text-cyan-400' : 'text-white/50'
                    }`}>
                      LAP {String(lap.lapNumber).padStart(2, '0')}
                    </span>
                    
                    {/* Tiny visual indicators for records */}
                    {isFastest && (
                      <span className="text-[8px] uppercase tracking-widest text-cyan-400 font-display px-1.5 py-px rounded bg-cyan-400/5 border border-cyan-400/10 scale-90">
                        fastest
                      </span>
                    )}
                    {isSlowest && (
                      <span className="text-[8px] uppercase tracking-widest text-rose-400 font-display px-1.5 py-px rounded bg-rose-400/5 border border-rose-400/10 scale-90">
                        slowest
                      </span>
                    )}
                  </div>
                  
                  {/* Cumulative Time */}
                  <span className="text-[9px] text-white/20 font-mono">
                    Σ {formatTimeToString(lap.overallTime)}
                  </span>
                </div>

                {/* Right side: Lap Duration */}
                <div className="flex flex-col items-end">
                  <span className={`font-mono text-base tracking-tight ${
                    isFastest ? 'text-cyan-300 font-light' : 'text-white/80'
                  }`}>
                    {formatTimeToString(lap.lapTime)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {laps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-white/20">
            <span className="text-[10px] tracking-[0.3em] uppercase font-display mb-1.5">Horizon Empty</span>
            <span className="text-[10px] max-w-[200px] font-sans font-light leading-relaxed">
              No space-time points recorded yet.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

