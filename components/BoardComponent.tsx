
import React from 'react';
import { BoardType, Player, TileType } from '../types.ts';
import { ECONOMY_TILES, SUSTAINABILITY_TILES } from '../constants.ts';
import {
  ArrowRight,
  TrendingUp,
  DollarSign,
  HelpCircle,
  Briefcase,
  Repeat,
  ShieldAlert,
  AlertTriangle,
  Leaf,
  Wind,
  Trees,
  TrendingDown,
  Recycle,
  Sprout,
  Wallet
} from 'lucide-react';

interface Props {
  boardType: BoardType;
  players: Player[];
  onSwitch: () => void;
}

const BoardComponent: React.FC<Props> = ({ boardType, players }) => {
  const currentTiles = boardType === 'ECONOMY' ? ECONOMY_TILES : SUSTAINABILITY_TILES;

  const getTileStyles = (index: number) => {
    let gridArea = "";
    if (index >= 0 && index <= 7) gridArea = `1 / ${index + 1}`;
    else if (index >= 8 && index <= 14) gridArea = `${index - 6} / 8`;
    else if (index >= 15 && index <= 21) gridArea = `8 / ${22 - index}`;
    else gridArea = `${29 - index} / 1`;

    return { gridArea };
  };

  const getTileColor = (type: TileType) => {
    switch (type) {
      case TileType.START: return 'bg-slate-900 text-white';
      case TileType.PROFIT: return 'bg-emerald-500 text-white';
      case TileType.TAX: return 'bg-rose-500 text-white';
      case TileType.INVESTMENT: return 'bg-blue-500 text-white';
      case TileType.QUESTION: return 'bg-amber-400 text-white';
      case TileType.ENUM: return 'bg-violet-500 text-white';
      case TileType.SWITCH: return 'bg-indigo-600 text-white ring-4 ring-indigo-400 animate-pulse';
      case TileType.PRISON: return 'bg-slate-600 text-white';
      default: return 'bg-white';
    }
  };

  const getTileIcon = (type: TileType) => {
    const size = "clamp(12px, 2.5vw, 22px)";
    switch (type) {
      case TileType.START: return <ArrowRight style={{ width: size, height: size }} />;
      case TileType.PROFIT: return boardType === 'ECONOMY' ? <TrendingUp style={{ width: size, height: size }} /> : <Leaf style={{ width: size, height: size }} />;
      case TileType.TAX: return <AlertTriangle style={{ width: size, height: size }} />;
      case TileType.INVESTMENT: return <DollarSign style={{ width: size, height: size }} />;
      case TileType.QUESTION: return <HelpCircle style={{ width: size, height: size }} />;
      case TileType.ENUM: return <Briefcase style={{ width: size, height: size }} />;
      case TileType.SWITCH: return <Repeat style={{ width: size, height: size }} />;
      case TileType.PRISON: return <ShieldAlert style={{ width: size, height: size }} />;
      default: return null;
    }
  };

  return (
    <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-[1px] sm:gap-1 bg-slate-300/20 p-0.5 sm:p-2 rounded-[1rem] sm:rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[4px] sm:border-[16px] border-white/95 transition-all duration-700">

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden flex items-center justify-center flex-wrap gap-4 sm:gap-8 p-4 sm:p-12">
        {boardType === 'ECONOMY' ? (
          <>
            <DollarSign className="w-10 h-10 sm:w-20 sm:h-20" /> <TrendingUp className="w-10 h-10 sm:w-20 sm:h-20" /> <Wallet className="w-10 h-10 sm:w-20 sm:h-20" /> <DollarSign className="w-16 h-16 sm:w-32 sm:h-32" />
            <Briefcase className="w-10 h-10 sm:w-20 sm:h-20" /> <TrendingDown className="w-12 h-12 sm:w-24 sm:h-24" /> <DollarSign className="w-8 h-8 sm:w-16 sm:h-16" />
          </>
        ) : (
          <>
            <Leaf className="w-10 h-10 sm:w-20 sm:h-20" /> <Trees className="w-10 h-10 sm:w-20 sm:h-20" /> <Wind className="w-10 h-10 sm:w-20 sm:h-20" /> <Recycle className="w-16 h-16 sm:w-32 sm:h-32" />
            <Sprout className="w-10 h-10 sm:w-20 sm:h-20" /> <Trees className="w-12 h-12 sm:w-24 sm:h-24" /> <Leaf className="w-8 h-8 sm:w-16 sm:h-16" />
          </>
        )}
      </div>

      <div className="col-start-2 col-end-8 row-start-2 row-end-8 flex flex-col items-center justify-center p-2 sm:p-10 bg-white/40 rounded-[1rem] sm:rounded-[2.5rem] m-0.5 sm:m-1 backdrop-blur-xl border border-white/50 shadow-inner overflow-hidden relative z-10">
        <h1 className="text-[clamp(0.8rem,4vw,3rem)] font-black text-slate-900 tracking-tighter text-center leading-none">
          Economy<span className="text-blue-600">Switch</span>
        </h1>

        <div className="mt-2 sm:mt-8 flex gap-2 sm:gap-8">
          <div className={`p-1.5 sm:p-6 rounded-[0.5rem] sm:rounded-[2rem] transition-all duration-700 shadow-xl ${boardType === 'ECONOMY' ? 'bg-blue-600 text-white scale-110 rotate-3' : 'bg-slate-100 text-slate-300 opacity-20'}`}>
            <DollarSign className="w-4 h-4 sm:w-12 sm:h-12" />
          </div>
          <div className={`p-1.5 sm:p-6 rounded-[0.5rem] sm:rounded-[2rem] transition-all duration-700 shadow-xl ${boardType === 'SUSTAINABILITY' ? 'bg-emerald-600 text-white scale-110 -rotate-3' : 'bg-slate-100 text-slate-300 opacity-20'}`}>
            <Wind className="w-4 h-4 sm:w-12 sm:h-12" />
          </div>
        </div>

        <p className="mt-2 sm:mt-10 text-center text-[clamp(0.35rem,1vw,0.8rem)] font-black text-slate-400 max-w-[150px] sm:max-w-[200px] uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed line-clamp-2">
          {boardType === 'ECONOMY' ? 'Finance Hub' : 'Nature Reserve'}
        </p>
      </div>

      {currentTiles.map((tile, i) => (
        <div
          key={i}
          style={getTileStyles(i)}
          className={`relative flex flex-col items-center justify-center p-0.5 sm:p-1.5 rounded-[4px] sm:rounded-[1.5rem] shadow-sm transition-all duration-500 border border-white/10 ${getTileColor(tile.type)}`}
        >
          <div className="mb-0.5 opacity-90 scale-[0.7] sm:scale-100">{getTileIcon(tile.type)}</div>

          <div className="w-full flex-1 flex items-center justify-center px-0.5">
            <span className="text-[clamp(0.3rem,0.8vw,0.75rem)] font-black uppercase text-center leading-[1] sm:leading-[1.1] break-words line-clamp-2">
              {tile.label}
            </span>
          </div>

          {tile.amount && (
            <span className="text-[clamp(0.3rem,0.8vw,0.7rem)] font-black mt-0.5 bg-black/10 px-1 sm:px-1.5 py-0.5 rounded-[4px] sm:rounded-lg">
              €{tile.amount >= 1000 ? `${(tile.amount / 1000).toFixed(0)}k` : tile.amount}
            </span>
          )}


        </div>
      ))}

      {/* Persistent Player Tokens with Smooth Movement and Labels */}
      {players.map((p, idx) => {
        const style = getTileStyles(p.position);
        // Small offset for overlapping players
        const samePos = players.filter((other, i) => other.position === p.position && i < idx);
        const offset = samePos.length * 4;

        return (
          <div
            key={p.id}
            style={{
              ...style,
              zIndex: 100,
              pointerEvents: 'none',
              transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            className="flex items-center justify-center relative"
          >
            <div
              className="relative flex flex-col items-center gap-0.5 sm:gap-1"
              style={{ transform: `translate(${offset}px, ${offset}px)` }}
            >
              {/* Name Label */}
              <div className="bg-slate-900/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full text-[6px] sm:text-[9px] font-black uppercase tracking-tighter shadow-lg border border-white/20 whitespace-nowrap animate-in fade-in zoom-in duration-300">
                {p.name}
              </div>

              {/* Figurice */}
              <div
                className="w-3 h-3 sm:w-10 sm:h-10 rounded-full border-[1.5px] sm:border-[4px] border-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] animate-bounce transform-gpu"
                style={{
                  backgroundColor: p.color,
                  animationDuration: '1.2s'
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-0.5 h-0.5 sm:w-3 sm:h-3 bg-white/40 rounded-full blur-[0.5px] sm:blur-[1.5px]"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardComponent;
