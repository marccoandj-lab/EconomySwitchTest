
import React, { useState, useMemo } from 'react';
import { TileData } from '../../types.ts';
import { TrendingUp, TrendingDown, Target, HelpCircle, Wallet, Dices, ChevronRight, X } from 'lucide-react';

interface Props {
  type: 'INVESTMENT';
  data: { tile: TileData; playerIdx: number; balance: number };
  onClose: (reward: number) => void;
}

const ActionModal: React.FC<Props> = ({ type, data, onClose }) => {
  const [outcome, setOutcome] = useState<'IDLE' | 'ROLLING' | 'RESULT'>('IDLE');
  const [rollValue, setRollValue] = useState(0);
  const [finalGain, setFinalGain] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [rollingValue, setRollingValue] = useState(1);

  const canAfford = selectedAmount > 0 && selectedAmount <= data.balance;

  // Timer Logic
  React.useEffect(() => {
    if (outcome !== 'IDLE') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [outcome, onClose]);

  const handleRollDice = () => {
    if (!canAfford) return;
    setOutcome('ROLLING');

    const finalRoll = Math.floor(Math.random() * 6) + 1;
    setRollValue(finalRoll);

    // Dice Animation logic
    let counter = 0;
    const maxSteps = 15;
    const interval = setInterval(() => {
      counter++;
      if (counter >= maxSteps) {
        clearInterval(interval);
        setRollingValue(finalRoll);
      } else {
        setRollingValue(Math.floor(Math.random() * 6) + 1);
      }
    }, 80);

    setTimeout(() => {
      setOutcome('RESULT');

      if (finalRoll < 3) {
        setFinalGain(-selectedAmount);
      } else if (finalRoll === 3) {
        setFinalGain(0);
      } else {
        const multiplier = finalRoll === 6 ? 1.5 : 0.5;
        const profit = Math.floor(selectedAmount * multiplier);
        setFinalGain(profit);
      }
    }, 1500);
  };

  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [25, 75], [75, 25], [75, 75]],
    5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-[95%] sm:w-full max-w-lg shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in fade-in duration-300">

        <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar">
          <div className="text-center mb-6 sm:mb-10">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-100 text-blue-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner ring-4 sm:ring-8 ring-blue-50 relative">
              <Target size={32} className="sm:w-12 sm:h-12" />
              {outcome === 'IDLE' && (
                <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-12 sm:h-12 bg-rose-500 text-white rounded-full flex items-center justify-center font-black text-sm sm:text-lg shadow-lg border-2 border-white animate-pulse">
                  {timeLeft}
                </div>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 mb-1 sm:mb-2">Investment</h2>
            <div className="flex flex-col items-center gap-1">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs text-wrap">{data.tile.label}</p>
              {outcome === 'IDLE' && (
                <div className="w-full max-w-[120px] bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 20) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {outcome === 'IDLE' ? (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-slate-50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Wallet size={80} className="sm:w-28 sm:h-28" /></div>
                <label className="block text-slate-400 font-black uppercase text-[8px] sm:text-[10px] tracking-[0.2em] mb-3 sm:mb-4">Select Capital</label>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                  {[5000, 20000, 50000, 100000].map((amount) => {
                    const isDisabled = data.balance < amount;
                    const isSelected = selectedAmount === amount; // reusing recommendedAmount state var name for selected
                    return (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        disabled={isDisabled}
                        className={`py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all ${isSelected
                          ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                          : isDisabled
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                      >
                        €{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 sm:mt-4 flex justify-between px-2">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400">Available: €{data.balance.toLocaleString()}</span>
                  {selectedAmount > 0 && <span className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-wider">Stake: €{selectedAmount.toLocaleString()}</span>}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest px-2">Risk/Reward Outlook</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="bg-rose-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-rose-100/50 text-center">
                    <span className="block text-rose-600 font-black text-base sm:text-xl mb-0.5 sm:mb-1">1-2</span>
                    <span className="text-[8px] sm:text-[10px] text-rose-400 font-black uppercase tracking-widest leading-none">Total Loss</span>
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/50 text-center">
                    <span className="block text-slate-600 font-black text-base sm:text-xl mb-0.5 sm:mb-1">3</span>
                    <span className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Neutral</span>
                  </div>
                  <div className="bg-emerald-50 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-100/50 text-center">
                    <span className="block text-emerald-600 font-black text-base sm:text-xl mb-0.5 sm:mb-1">4-6</span>
                    <span className="text-[8px] sm:text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">Profit</span>
                  </div>
                </div>
              </div>
            </div>
          ) : outcome === 'ROLLING' ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in fade-in">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl sm:rounded-[2.5rem] shadow-2xl flex items-center justify-center animate-bounce border-4 border-slate-50">
                <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 fill-slate-800">
                  {(dots[rollingValue as keyof typeof dots] || []).map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="10" />
                  ))}
                </svg>
              </div>
              <div className="text-center">
                <p className="font-black text-slate-800 text-2xl uppercase tracking-tighter animate-pulse">Rolling the Market...</p>
                <p className="text-slate-400 text-xs font-bold mt-2 tracking-widest">PREDICTING TRENDS</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-slate-900 text-white rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-4xl font-black shadow-2xl ring-4 sm:ring-8 ring-slate-100">
                  {rollValue}
                </div>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Market Result</p>
                  <p className="text-base sm:text-xl font-black text-slate-800">
                    {rollValue < 3 ? 'Market Crash!' : rollValue === 3 ? 'Market Stagnation' : 'Bull Market!'}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className={`text-5xl sm:text-7xl font-black drop-shadow-sm ${finalGain > 0 ? 'text-emerald-500' : finalGain < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  {finalGain > 0 ? '+' : ''}€{Math.abs(finalGain).toLocaleString()}
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 sm:mt-2 uppercase tracking-[0.3em]">
                  {finalGain > 0 ? 'Net Gain' : finalGain < 0 ? 'Net Loss' : 'Break Even'}
                </p>
              </div>

              <div className={`p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] flex items-center justify-center gap-3 sm:gap-4 ${finalGain > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : finalGain < 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>
                {finalGain > 0 ? <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" /> : finalGain < 0 ? <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" /> : <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
                <span className="text-lg sm:text-2xl font-black">
                  {finalGain > 0 ? 'Great Return!' : finalGain < 0 ? 'Ouch! Lost Assets' : 'No Damage'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-8 bg-slate-50 border-t border-slate-100">
          {outcome === 'IDLE' ? (
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => onClose(0)}
                className="flex-1 py-3 sm:py-5 px-3 sm:px-4 rounded-xl sm:rounded-[1.5rem] bg-slate-200 text-slate-600 font-black hover:bg-slate-300 transition-colors uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                Skip
              </button>
              <button
                onClick={handleRollDice}
                disabled={!canAfford}
                className={`flex-[2] py-3 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-sm sm:text-xl flex items-center justify-center gap-2 sm:gap-3 shadow-xl transition-all active:scale-95 ${canAfford ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                INVEST €{selectedAmount >= 1000 ? `${selectedAmount / 1000}k` : selectedAmount} <ChevronRight size={18} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          ) : outcome === 'RESULT' ? (
            <button
              onClick={() => onClose(finalGain)}
              className="w-full py-4 sm:py-6 bg-slate-900 text-white rounded-xl sm:rounded-[1.5rem] font-black text-lg sm:text-2xl hover:bg-black transition-colors shadow-2xl active:scale-95"
            >
              COLLECT & EXIT
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
