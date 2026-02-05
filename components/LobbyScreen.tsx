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
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-md">
                        <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">New Multiplayer Engine</span>
                    </div>
                    <h1 className="text-6xl sm:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        ECONOMY<span className="text-blue-500">SWITCH</span>
                    </h1>
                    <p className="text-white/40 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                        Ultimate multiplayer experience. Strategy, investments, and fast-paced economy battles.
                    </p>
                </div>

                {view === 'INITIAL' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                        <button
                            onClick={() => setView('CREATE')}
                            className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/50 transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Plus size={120} />
                            </div>
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Create Empire</h3>
                            <p className="text-white/40 font-medium">Start a new private lobby and invite your business partners.</p>
                            <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                                Start Lobby <ArrowRight size={16} />
                            </div>
                        </button>

                        <button
                            onClick={() => setView('JOIN')}
                            className="group p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-emerald-500/50 transition-all text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Globe size={120} />
                            </div>
                            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(5,150,105,0.4)]">
                                <Globe size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Join Session</h3>
                            <p className="text-white/40 font-medium">Entering an existing game? Paste your invite code here.</p>
                            <div className="mt-8 flex items-center gap-2 text-emerald-400 font-bold group-hover:gap-4 transition-all uppercase text-xs tracking-widest">
                                Enter Code <ArrowRight size={16} />
                            </div>
                        </button>
                    </div>
                )}

                {(view === 'CREATE' || view === 'JOIN') && (
                    <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-8 sm:p-12 rounded-[3rem] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8">
                        <h2 className="text-3xl font-black mb-8 text-center">{view === 'CREATE' ? 'New Game' : 'Join Game'}</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your handle..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500 transition-colors font-bold"
                                    />
                                </div>
                            </div>

                            {view === 'JOIN' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2">Lobby Code</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                                        <input
                                            type="text"
                                            value={joinId}
                                            onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                                            placeholder="e.g. ABC123"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest font-black"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => view === 'CREATE' ? onCreate(name) : onJoin(joinId, name)}
                                disabled={!name || (view === 'JOIN' && !joinId)}
                                className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none mt-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                            >
                                {view === 'CREATE' ? 'Initialize Lobby' : 'Access Session'}
                            </button>

                            <button
                                onClick={() => setView('INITIAL')}
                                className="w-full text-white/40 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}

                {view === 'LOBBY' && roomId && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Users size={80} />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                                <div className="text-center sm:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Lobby Access Key</p>
                                    <h2 className="text-5xl font-black tracking-[0.2em]">{roomId}</h2>
                                </div>
                                <button
                                    onClick={handleCopyLink}
                                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-colors font-black text-sm uppercase tracking-widest"
                                >
                                    <LinkIcon size={18} /> Copy Key
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Registered Players ({players.length}/4)</p>
                                    {isHost && players.length < 2 && (
                                        <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest px-2 py-1 bg-yellow-500/10 rounded-md">Need 1 more player</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {players.map((p, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl ${p.isHost ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]'}`}>
                                                {p.name[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-lg flex items-center gap-2">
                                                    {p.name}
                                                    {p.isHost && <ShieldCheck size={16} className="text-blue-400" />}
                                                </p>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.isHost ? 'Empire Lead' : 'Partner'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                                        <div key={`empty-${i}`} className="flex items-center gap-4 bg-white/[0.02] p-5 rounded-2xl border border-dashed border-white/10">
                                            <div className="w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/10">
                                                <User size={20} />
                                            </div>
                                            <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">Waiting for partner...</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isHost ? (
                            <button
                                onClick={onStartGame}
                                disabled={players.length < 2}
                                className="w-full py-8 bg-blue-600 text-white rounded-[2rem] font-black text-3xl hover:bg-blue-500 transition-all active:scale-[0.98] shadow-[0_30px_60px_rgba(37,99,235,0.3)] flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <Play size={40} className="fill-white" /> INITIALIZE SWITCH
                            </button>
                        ) : (
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center backdrop-blur-md">
                                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-emerald-400 font-black uppercase text-xs tracking-widest">Waiting for host to initialize...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LobbyScreen;
