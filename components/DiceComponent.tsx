
import React, { useState } from 'react';

interface Props {
  onRoll: (val: number) => void;
  disabled: boolean;
}

const DiceComponent: React.FC<Props> = ({ onRoll, disabled }) => {
  const [rolling, setRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState(1);

  const rollDice = () => {
    if (disabled || rolling) return;
    setRolling(true);

    let counter = 0;
    const maxSteps = 8;
    const interval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter >= maxSteps) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setCurrentValue(finalVal);
        setRolling(false);
        onRoll(finalVal);
      }
    }, 50);
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
    <div className="flex flex-col items-center gap-2 sm:gap-4">
      <button
        onClick={rollDice}
        disabled={disabled}
        className={`group relative w-16 h-16 sm:w-28 sm:h-28 transition-all duration-300 focus:outline-none transform-gpu active:scale-90 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 active:rotate-12'}`}
      >
        <div className={`w-full h-full bg-white rounded-xl sm:rounded-[2.5rem] shadow-[0_8px_0_#cbd5e1,0_20px_40px_rgba(0,0,0,0.15)] sm:shadow-[0_12px_0_#cbd5e1,0_25px_50px_rgba(0,0,0,0.15)] border-2 sm:border-4 border-slate-100 flex items-center justify-center p-2 sm:p-5 transform-gpu ${rolling ? 'animate-bounce' : ''}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-800 transition-transform duration-200">
            {(dots[currentValue as keyof typeof dots] || []).map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="10" />
            ))}
          </svg>
        </div>
      </button>
      <div className="flex flex-col items-center">
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse">ROLL DICE</span>
      </div>
    </div>
  );
};

export default DiceComponent;
