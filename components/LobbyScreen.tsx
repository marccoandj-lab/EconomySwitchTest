import React, { useState } from 'react';
import { Users, Plus, Link as LinkIcon, ArrowRight, Play, User, ShieldCheck, Globe, Zap } from 'lucide-react';

interface Props {
    onJoin: (roomId: string, name: string) => void;
    onCreate: (name: string) => void;
    onStartGame: () => void;
    players: any[];
    roomId: string | null;
    isHost: boolean;
    status: 'waiting' | 'playing';
}

const LobbyScreen: React.FC<Props> = ({ onJoin, onCreate, onStartGame, players, roomId, isHost, status }) => {
    const [name, setName] = useState('');
    const [joinId, setJoinId] = useState('');
    const [view, setView] = useState<'INITIAL' | 'CREATE' | 'JOIN' | 'LOBBY'>(roomId ? 'LOBBY' : 'INITIAL');

    const handleCopyLink = () => {
        if (typeof window !== 'undefined' && roomId) {
            navigator.clipboard.writeText(roomId);
            // Optional: Toast notification logic here
        }
    };

    if (roomId && view !== 'LOBBY') setView('LOBBY');

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="w-full max-w-4xl z-10">
                {/* Logo / Header */}
                <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full mb-4 sm:mb-6 backdrop-blur-md">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60">New Multiplayer Engine</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent break-words">
                        ECONOMY<span className="text-blue-500">SWITCH</span>
                    </h1>
                    <p className="text-white/40 text-sm sm:text-base md:text-lg font-medium max-w-lg mx-auto leading-relaxed px-4">
                        Ultimate multiplayer experience. Strategy, investments, and fast-paced economy battles.
                    </p>
                </div>

                {view === 'INITIAL' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-in zoom-in-95 duration-500 px-2 sm:px-0">
                        <button
                            onClick={() => setView('CREATE')}
                            className="group p-6 sm:p-8 bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/50 transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                                <Plus size={120} />
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                <Plus size={28} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black mb-2">Create Empire</h3>
                            <p className="text-white/40 text-xs sm:text-sm font-medium">Start a new private lobby and invite your partners.</p>
                            <div className="mt-6 sm:mt-8 flex items-center gap-2 text-blue-400 font-bold group-hover:gap-4 transition-all uppercase text-[10px] sm:text-xs tracking-widest">
                                Start Lobby <ArrowRight size={14} />
                            </div>
                        </button>

                        <button
                            onClick={() => setView('JOIN')}
                            className="group p-6 sm:p-8 bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] hover:bg-white/10 hover:border-emerald-500/50 transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                                <Globe size={120} />
                            </div>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-[0_0_30px_rgba(5,150,105,0.4)]">
                                <Globe size={28} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black mb-2">Join Session</h3>
                            <p className="text-white/40 text-xs sm:text-sm font-medium">Entering an existing game? Paste your code here.</p>
                            <div className="mt-6 sm:mt-8 flex items-center gap-2 text-emerald-400 font-bold group-hover:gap-4 transition-all uppercase text-[10px] sm:text-xs tracking-widest">
                                Enter Code <ArrowRight size={14} />
                            </div>
                        </button>
                    </div>
                )}

                {(view === 'CREATE' || view === 'JOIN') && (
                    <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3.rem] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8">
                        <h2 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 text-center">{view === 'CREATE' ? 'New Game' : 'Join Game'}</h2>
                        <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your handle..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 focus:outline-none focus:border-blue-500 transition-colors font-bold text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {view === 'JOIN' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Lobby Code</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input
                                            type="text"
                                            value={joinId}
                                            onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                            placeholder="e.g. ABC123"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 focus:outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest font-black text-sm sm:text-base"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => view === 'CREATE' ? onCreate(name) : onJoin(joinId, name)}
                                disabled={!name || (view === 'JOIN' && !joinId)}
                                className="w-full py-4 sm:py-5 bg-white text-black rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none mt-2 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                            >
                                {view === 'CREATE' ? 'Initialize Lobby' : 'Access Session'}
                            </button>

                            <button
                                onClick={() => setView('INITIAL')}
                                className="w-full text-white/40 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest hover:text-white transition-colors py-2"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}

                {view === 'LOBBY' && roomId && (
                    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-500 px-2 sm:px-0">
                        <div className="bg-white/5 border border-white/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 hidden sm:block">
                                <Users size={80} />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 mb-8 sm:mb-12">
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-blue-400 mb-2">Lobby Access Key</p>
                                    <h2 className="text-3xl sm:text-5xl font-black tracking-[0.1em] sm:tracking-[0.2em]">{roomId}</h2>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-colors font-black text-xs sm:text-sm uppercase tracking-widest"
                                >
                                    <LinkIcon size={16} /> Copy Key
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40">Registered Partners ({players.length}/4)</p>
                                    {isHost && players.length < 2 && (
                                        <span className="text-[7px] sm:text-[8px] font-black text-yellow-500 uppercase tracking-widest px-2 py-1 bg-yellow-500/10 rounded-md">Need 1 more</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {players.map((p, i) => (
                                        <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-lg sm:text-xl ${p.isHost ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]'}`}>
                                                {p.name[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-base sm:text-lg flex items-center gap-2 truncate">
                                                    {p.name}
                                                    {p.isHost && <ShieldCheck size={14} className="text-blue-400 shrink-0" />}
                                                </p>
                                                <p className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.isHost ? 'Empire Lead' : 'Partner'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                                        <div key={`empty-${i}`} className="flex items-center gap-3 sm:gap-4 bg-white/[0.02] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-dashed border-white/10 opacity-60">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/10">
                                                <User size={18} />
                                            </div>
                                            <p className="text-white/20 font-black uppercase text-[8px] sm:text-[10px] tracking-widest">Awaiting...</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isHost ? (
                            <button
                                onClick={onStartGame}
                                disabled={players.length < 2}
                                className="w-full py-6 sm:py-8 bg-blue-600 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-xl sm:text-3xl hover:bg-blue-500 transition-all active:scale-[0.98] shadow-[0_30px_60px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <Play size={24} className="fill-white sm:w-10 sm:h-10" /> INITIALIZE SWITCH
                            </button>
                        ) : (
                            <div className="bg-white/5 border border-white/10 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center backdrop-blur-md">
                                <div className="w-8 h-8 sm:w-12 sm:h-12 border-3 sm:border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-emerald-400 font-black uppercase text-[10px] sm:text-xs tracking-widest">Waiting for host to initialize...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LobbyScreen;
