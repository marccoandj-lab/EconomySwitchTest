
import React, { useState, useEffect, useRef } from 'react';
import { AIQuestion, AIEnumeration } from '../../types.ts';
import { validateEnumTerms } from '../../geminiService.ts';
import { CheckCircle2, XCircle, BrainCircuit, ListChecks, Loader2, Timer as TimerIcon, Wallet, Trees, ChevronRight, Lightbulb } from 'lucide-react';

interface Props {
  type: 'QUESTION' | 'ENUM';
  data: any;
  loading?: boolean;
  onClose: (reward: number) => void;
}

const AIModal: React.FC<Props> = ({ type, data, loading, onClose }) => {
  const [state, setState] = useState<'PENDING' | 'RESULT'>('PENDING');
  const [isValidating, setIsValidating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userInput, setUserInput] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoize a hint to ensure it stays consistent during the modal's life
  const hintTerm = React.useMemo(() => {
    if (data?.expectedTerms && data.expectedTerms.length > 0) {
      return data.expectedTerms[Math.floor(Math.random() * data.expectedTerms.length)];
    }
    return "...";
  }, [data]);

  useEffect(() => {
    if (state === 'PENDING' && data && !loading) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (type === 'QUESTION') handleAnswer(-1); // Auto-fail
            else handleEnumerationSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [type, state, data, loading]);

  const handleAnswer = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(idx);
    setState('RESULT');
  };

  const handleEnumerationSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!userInput.trim()) {
      setMatchCount(0);
      setState('RESULT');
      return;
    }

    setIsValidating(true);
    try {
      const { validTerms } = await validateEnumTerms(data.theme || data.category, userInput, data.expectedTerms || []);
      setMatchCount(validTerms.length);
      // Optional: Update modal data to show valid terms? 
      // For now just count is enough as per request to "check if term is correct".
    } catch (e) {
      console.error(e);
      setMatchCount(0);
    } finally {
      setIsValidating(false);
      setState('RESULT');
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white p-8 sm:p-20 rounded-[2rem] sm:rounded-[3rem] flex flex-col items-center gap-6 sm:gap-8 shadow-2xl animate-pulse w-[90%] max-w-sm">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12 sm:w-20 sm:h-20" />
            <BrainCircuit className="absolute inset-0 m-auto text-blue-400" size={32} />
          </div>
          <div className="text-center">
            <p className="font-black text-slate-800 text-xl sm:text-2xl tracking-tight">Syncing with AI...</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Preparing your challenge</p>
          </div>
        </div>
      </div>
    );
  }

  const isFinance = data.category === 'ECONOMY' || data.category === 'Financial Literacy';
  const themeColor = isFinance ? 'text-blue-600' : 'text-emerald-600';
  const themeBg = isFinance ? 'bg-blue-50' : 'bg-emerald-50';
  const themeTitle = isFinance ? 'Financial Literacy' : 'Ecosystem';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] w-[95%] sm:w-full max-w-xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">

        {state === 'PENDING' && (
          <div className={`h-2 transition-all duration-1000 ${timeLeft < 5 ? 'bg-rose-500 animate-pulse' : isFinance ? 'bg-blue-500' : 'bg-emerald-500'}`} style={{ width: `${(timeLeft / 20) * 100}%` }}></div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar">
          {type === 'QUESTION' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 ${themeBg} ${themeColor} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner`}>
                    {isFinance ? <Wallet size={20} className="sm:w-8 sm:h-8" /> : <Trees size={20} className="sm:w-8 sm:h-8" />}
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-2xl font-black tracking-tight ${themeColor}`}>{themeTitle}</h3>
                    <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Knowledge Challenge</p>
                  </div>
                </div>
                {state === 'PENDING' && (
                  <div className={`text-xl font-black ${timeLeft < 5 ? 'text-rose-500 animate-bounce' : 'text-slate-400'} flex items-center gap-2`}>
                    <TimerIcon size={24} /> {timeLeft}s
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-inner">
                <p className="text-base sm:text-2xl font-black text-slate-800 leading-tight">{data.question}</p>
              </div>

              {state === 'PENDING' ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                    <Wallet size={16} />
                    <span className="font-black text-sm uppercase">Reward: €{data.reward?.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-4">
                    {data.options.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className={`group p-4 sm:p-6 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl text-left font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3 sm:gap-5 shadow-sm active:scale-[0.98] transform`}
                      >
                        <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-[10px] sm:rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors font-black text-base sm:text-lg shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1 text-sm sm:text-lg leading-tight">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-6">
                  <div className={`p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-4 flex flex-col items-center text-center gap-3 sm:gap-4 ${selectedOption === data.correctIndex ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                    {selectedOption === data.correctIndex ? <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" /> : <XCircle className="w-12 h-12 sm:w-16 sm:h-16" />}
                    <div>
                      <p className="text-2xl sm:text-4xl font-black">{selectedOption === data.correctIndex ? 'Genius!' : 'Oops!'}</p>
                      <p className="text-sm sm:text-lg font-bold opacity-80 mt-1 sm:mt-2">{data.explanation}</p>
                    </div>
                  </div>

                  {selectedOption === data.correctIndex && (
                    <div className="flex flex-col items-center gap-2 p-6 bg-emerald-100 rounded-2xl border-2 border-emerald-200">
                      <p className="text-emerald-600 font-black uppercase text-xs tracking-widest">Earnings</p>
                      <p className="text-3xl font-black text-emerald-800">+€{data.reward?.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-violet-100 text-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner"><ListChecks size={20} className="sm:w-8 sm:h-8" /></div>
                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-violet-600 tracking-tight">Rapid Listing</h3>
                    <p className="text-slate-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-widest">Memory Blitz</p>
                  </div>
                </div>
                {state === 'PENDING' && (
                  <div className={`text-sm sm:text-xl font-black ${timeLeft < 5 ? 'text-rose-500 animate-bounce' : 'text-slate-400'} flex items-center gap-1.5 sm:gap-2 whitespace-nowrap`}>
                    <TimerIcon size={18} className="sm:w-6 sm:h-6" /> {timeLeft}s
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-inner">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Category</p>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3 sm:mb-4">
                  <h4 className="text-lg sm:text-2xl font-black text-slate-800">{data.theme || data.category}</h4>
                  <div className="px-3 py-1 bg-violet-100 text-violet-600 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider h-fit">
                    €{data.reward?.toLocaleString()} / Item
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-violet-100/50 rounded-lg sm:rounded-xl border border-violet-100 text-violet-600 text-[10px] sm:text-sm font-bold flex items-center gap-2">
                  <Lightbulb size={14} className="sm:w-4 sm:h-4" />
                  <span>Hint: e.g. "{hintTerm}"</span>
                </div>
              </div>

              {isValidating ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
                  <Loader2 size={48} className="animate-spin text-violet-500" />
                  <p className="text-violet-600 font-bold animate-pulse">Checking your answers with AI...</p>
                </div>
              ) : state === 'PENDING' ? (
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter items separated by commas or new lines..."
                  className="w-full p-4 sm:p-6 border-2 border-slate-100 rounded-xl sm:rounded-2xl focus:outline-none focus:border-violet-500 focus:bg-violet-50 resize-none h-24 sm:h-32 font-semibold text-sm sm:text-base text-slate-700"
                />
              ) : (
                <div className="space-y-6">
                  <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-4 flex flex-col items-center text-center gap-3 sm:gap-4 bg-violet-50 border-violet-100 text-violet-800">
                    <ListChecks className="w-12 h-12 sm:w-16 sm:h-16" />
                    <div>
                      <p className="text-3xl sm:text-4xl font-black">{matchCount}/{data.expectedTerms.length}</p>
                      <p className="text-sm sm:text-lg font-bold opacity-80 mt-1 sm:mt-2">Terms matched correctly</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 p-6 bg-emerald-100 rounded-2xl border-2 border-emerald-200">
                    <p className="text-emerald-600 font-black uppercase text-xs tracking-widest">Total Earnings</p>
                    <p className="text-3xl font-black text-emerald-800">+€{(matchCount * data.reward).toLocaleString()}</p>
                    <p className="text-emerald-600/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {matchCount} words × €{data.reward?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 sm:p-8 bg-slate-50 flex gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (state === 'RESULT') {
                if (type === 'QUESTION') {
                  onClose(selectedOption === data.correctIndex ? data.reward : 0);
                } else {
                  onClose(matchCount * data.reward);
                }
              } else {
                onClose(0);
              }
            }}
            className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 font-black rounded-lg sm:rounded-xl transition-all text-xs sm:text-base ${state === 'RESULT' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {state === 'RESULT' ? 'Claim Rewards' : 'Skip Challenge'}
          </button>
          {state === 'PENDING' && type === 'ENUM' && (
            <button
              onClick={handleEnumerationSubmit}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-violet-600 text-white font-bold rounded-lg sm:rounded-xl hover:bg-violet-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base"
            >
              Submit <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIModal;