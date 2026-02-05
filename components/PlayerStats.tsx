
import React from 'react';
import { Player, BoardType } from '../types.ts';
import { Wallet, Award, ShieldAlert } from 'lucide-react';

interface Props {
  players: Player[];
  currentIndex: number;
  boardType: BoardType;
}

const PlayerStats: React.FC<Props> = ({ players, currentIndex }) => {
  return (
    <div className="bg-white/95 backdrop-blur rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-white/20 p-3 sm:p-6 flex flex-col h-full overflow-hidden">
      <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] px-1 mb-3 sm:mb-4 flex items-center justify-between">
        Leaderboard
        <span className="bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-lg font-black text-[7px] sm:text-[9px]">{players.length} PLAYERS</span>
      </h3>

      <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 custom-scrollbar">
        {players.map((p, i) => (
          <div
            key={p.id}
            className={`flex-shrink-0 w-[180px] sm:w-[240px] lg:w-full relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 transform ${i === currentIndex ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]' : 'border-transparent bg-slate-50 opacity-80 hover:opacity-100'}`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-[3px] sm:border-4 border-white shadow-md flex items-center justify-center text-white font-black text-xs sm:text-sm"
                  style={{ backgroundColor: p.color }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <span className={`font-black text-xs sm:text-base leading-none block truncate ${i === currentIndex ? 'text-blue-700' : 'text-slate-700'}`}>
                    {p.name}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tight">Player {p.id + 1}</span>
                </div>
              </div>
              {i === currentIndex && (
                <div className="bg-blue-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg animate-pulse uppercase tracking-widest shadow-md">
                  TURN
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="flex flex-col gap-0.5 bg-white/60 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-white/50 min-w-0">
                <span className="text-[7px] sm:text-[9px] font-black text-slate-400 uppercase leading-none">Balance</span>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-blue-600 truncate">
                  <Wallet size={10} className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  €{p.balance.toLocaleString()}
                </div>
              </div>

            </div>

            {p.isPrisoned && (
              <div className="mt-2 text-[7px] sm:text-[9px] font-black text-rose-500 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 bg-rose-50 py-0.5 sm:py-1 rounded-lg border border-rose-100 animate-bounce">
                <ShieldAlert size={10} className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> AUDIT - PAUSE
              </div>
            )}

            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden border border-white shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${Math.min((p.balance / 1000000) * 100, 100)}%` }}
                ></div>
              </div>
              <span className="text-[7px] sm:text-[9px] font-black text-slate-400 whitespace-nowrap">
                {Math.min(Math.floor((p.balance / 1000000) * 100), 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStats;
