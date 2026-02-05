
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  BoardType,
  Player,
  TileType,
  TileData,
  AIQuestion,
  AIEnumeration
} from './types.ts';
import {
  STARTING_CAPITAL,
  WIN_THRESHOLD,
  BOARD_SIZE,
  ECONOMY_TILES,
  SUSTAINABILITY_TILES,
  PLAYER_COLORS
} from './constants.ts';
import { getAIQuestion, getAIEnumeration } from './geminiService.ts';
import {
  ECONOMY_QUESTIONS,
  SUSTAINABILITY_QUESTIONS,
  ECONOMY_ENUMS,
  SUSTAINABILITY_ENUMS
} from './data/content.ts';
import BoardComponent from './components/BoardComponent.tsx';
import DiceComponent from './components/DiceComponent.tsx';
import PlayerStats from './components/PlayerStats.tsx';
import ActionModal from './components/Modals/ActionModal.tsx';
import AIModal from './components/Modals/AIModal.tsx';
import LobbyScreen from './components/LobbyScreen.tsx';
import { Trophy, Users, Info, Wallet, Rocket, UserCircle } from 'lucide-react';

const getSocketURL = () => {
  const envUrl = (import.meta as any).env?.VITE_SOCKET_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) return `http://${window.location.hostname}:3001`;
  }
  return ''; // Production must have VITE_SOCKET_URL or it won't connect
};

const SOCKET_URL = getSocketURL();

const App: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [boardType, setBoardType] = useState<BoardType>('ECONOMY');
  const [gameStatus, setGameStatus] = useState<'SETUP' | 'PLAYING' | 'WON'>('SETUP');
  const [logs, setLogs] = useState<string[]>(["Welcome to EconomySwitch! Connect to a lobby to start."]);
  const [isMoving, setIsMoving] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [activeModal, setActiveModal] = useState<'ACTION' | 'QUESTION' | 'ENUM' | 'INVEST' | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const [seenQuestions, setSeenQuestions] = useState<Set<string>>(new Set());
  const [seenEnums, setSeenEnums] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(25);

  // Refs to avoid stale closures in socket listeners
  const playersRef = useRef<Player[]>([]);
  const turnIndexRef = useRef(0);
  const roomIdRef = useRef<string | null>(null);
  const boardTypeRef = useRef<BoardType>('ECONOMY');
  const handleSwitchBoardRef = useRef<any>(null);
  const processDiceRollRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    turnIndexRef.current = currentPlayerIndex;
  }, [currentPlayerIndex]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    boardTypeRef.current = boardType;
  }, [boardType]);

  // Turn Timer logic
  useEffect(() => {
    if (gameStatus !== 'PLAYING' || isMoving || !!activeModal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Reset timer on turn change
    setTimeLeft(25);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-skip turn if it's OUR turn
          if (playersRef.current[turnIndexRef.current]?.id === socketRef.current?.id) {
            addLog("Time's up! Turn skipped.");
            socketRef.current?.emit('finishTurn', roomIdRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPlayerIndex, gameStatus, isMoving, activeModal]);

  // Socket Initialization
  useEffect(() => {
    if (!SOCKET_URL) {
      addLog("⚠️ ERROR: Backend server URL (VITE_SOCKET_URL) is not set!");
      console.error("Missing VITE_SOCKET_URL environment variable.");
    }

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server:', socketRef.current?.id);
      addLog("Connected to multiplayer server.");
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      addLog("Disconnected from server.");
    });

    socketRef.current.on('connect_error', (error: any) => {
      console.error('Connection Error:', error);
      setIsConnected(false);
      addLog("Connection failed. Retrying...");
    });

    socketRef.current.on('roomCreated', (room: any) => {
      setRoomId(room.roomId);
      setIsHost(true);
      const initialPlayers = room.players.map((p: any, i: number) => ({
        ...p,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        position: 0,
        balance: STARTING_CAPITAL,
        isPrisoned: false,
        prisonTurns: 0
      }));
      setPlayers(initialPlayers);
    });

    socketRef.current.on('roomJoined', (room: any) => {
      setRoomId(room.roomId);
      setIsHost(room.players.find((p: any) => p.id === socketRef.current?.id)?.isHost || false);
      const initialPlayers = room.players.map((p: any, i: number) => ({
        ...p,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        position: 0,
        balance: STARTING_CAPITAL,
        isPrisoned: false,
        prisonTurns: 0
      }));
      setPlayers(initialPlayers);
    });

    socketRef.current.on('playersUpdate', (serverPlayers) => {
      setPlayers(prev => serverPlayers.map((sp: any, i: number) => {
        const existing = prev.find(p => p.id === sp.id);
        return {
          ...sp,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          position: existing?.position || 0,
          balance: existing?.balance || STARTING_CAPITAL,
          isPrisoned: existing?.isPrisoned || false,
          prisonTurns: existing?.prisonTurns || 0
        };
      }));
    });

    socketRef.current.on('gameStarted', (room) => {
      setGameStatus('PLAYING');
      addLog("The market is open! Good luck.");
    });

    socketRef.current.on('turnChanged', ({ currentTurnIndex }) => {
      setCurrentPlayerIndex(currentTurnIndex);
      const nextPlayer = playersRef.current[currentTurnIndex];
      addLog(`Turn changed to ${nextPlayer?.name}`);

      // Auto-skip if in JAIL
      if (nextPlayer?.id === socketRef.current?.id && nextPlayer?.isPrisoned) {
        addLog("You are in JAIL. Turn skipped.");
        setPlayers(prev => prev.map(p => p.id === nextPlayer.id ? { ...p, isPrisoned: false } : p));
        setTimeout(() => {
          socketRef.current?.emit('finishTurn', roomIdRef.current);
        }, 2000);
      }
    });

    socketRef.current.on('gameStateUpdated', (data) => {
      if (data.type === 'DICE_ROLL') {
        processDiceRollRef.current?.(data.roll, data.playerIdx);
      }
      if (data.type === 'BALANCE_UPDATE') {
        setPlayers(prev => prev.map(p => p.id === data.playerId ? { ...p, balance: data.newBalance } : p));
      }
      if (data.type === 'SWITCH_REALM') {
        handleSwitchBoardRef.current?.(true);
      }
    });

    socketRef.current.on('errorMessage', (msg) => {
      alert(msg);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 49)]);
  };

  const handleCreateRoom = (playerName: string) => {
    socketRef.current?.emit('createRoom', playerName);
  };

  const handleJoinRoom = (id: string, playerName: string) => {
    const cleanId = id.trim().toUpperCase();
    socketRef.current?.emit('joinRoomById', cleanId, playerName);
  };

  const handleStartGame = () => {
    if (isHost && roomIdRef.current) {
      socketRef.current?.emit('startGame', roomIdRef.current);
    }
  };

  const handleSwitchBoard = useCallback((fromSync: boolean = false) => {
    setIsSwitching(true);
    if (!fromSync) {
      socketRef.current?.emit('playerAction', roomIdRef.current, { type: 'SWITCH_REALM' });
    }
    setTimeout(() => {
      setBoardType(prev => {
        const next = prev === 'ECONOMY' ? 'SUSTAINABILITY' : 'ECONOMY';
        addLog(`REALM SHIFT: Switched to ${next === 'ECONOMY' ? 'Financial Hub' : 'Nature Reserve'}!`);
        return next;
      });
      setIsSwitching(false);
    }, 500);
  }, []);

  useEffect(() => {
    handleSwitchBoardRef.current = handleSwitchBoard;
  }, [handleSwitchBoard]);

  const checkWinCondition = (updatedPlayers: Player[]) => {
    const winnerPlayer = updatedPlayers.find(p => p.balance >= WIN_THRESHOLD);
    if (winnerPlayer) {
      setWinner(winnerPlayer);
      setGameStatus('WON');
    }
  };

  const handleTileAction = useCallback(async (playerIdx: number, tile: TileData) => {
    const player = playersRef.current[playerIdx];
    if (!player) return;

    let updatedBalance = player.balance;
    let shouldUpdateImm = true;

    // Only handle action if it's OUR turn
    if (player.id !== socketRef.current?.id) {
      // If it's not us, we just wait for the turn finish
      return;
    }

    switch (tile.type) {
      case TileType.PROFIT:
        updatedBalance += (tile.amount || 10000);
        break;
      case TileType.TAX:
        updatedBalance -= (tile.amount || 5000);
        break;
      case TileType.SWITCH:
        handleSwitchBoard();
        break;
      case TileType.INVESTMENT:
        setActiveModal('INVEST');
        setModalData({ tile, playerIdx, balance: player.balance });
        shouldUpdateImm = false;
        break;
      case TileType.QUESTION:
        setActiveModal('QUESTION');
        const qPool = boardType === 'ECONOMY' ? ECONOMY_QUESTIONS : SUSTAINABILITY_QUESTIONS;
        const availableQ = qPool.filter(q => !seenQuestions.has(q.question));
        const randomQ = availableQ[Math.floor(Math.random() * (availableQ.length || qPool.length))] || qPool[0];

        const correctText = randomQ.options[randomQ.correctIndex];
        const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);

        setModalData({
          ...randomQ,
          options: shuffledOptions,
          correctIndex: shuffledOptions.indexOf(correctText),
          playerIdx,
          category: boardType
        });
        shouldUpdateImm = false;
        break;
      case TileType.ENUM:
        setActiveModal('ENUM');
        const ePool = boardType === 'ECONOMY' ? ECONOMY_ENUMS : SUSTAINABILITY_ENUMS;
        const randomE = ePool[Math.floor(Math.random() * ePool.length)];
        setModalData({ ...randomE, playerIdx });
        shouldUpdateImm = false;
        break;
      case TileType.JAIL:
        setPlayers(prev => prev.map((p, i) => i === playerIdx ? { ...p, isPrisoned: true, prisonTurns: 1 } : p));
        break;
    }

    if (shouldUpdateImm) {
      syncBalance(player.id, updatedBalance);
      setTimeout(() => {
        socketRef.current?.emit('finishTurn', roomIdRef.current);
      }, tile.type === TileType.SWITCH ? 1000 : 500);
    }
  }, [boardType, handleSwitchBoard, seenQuestions]);

  const syncBalance = (playerId: string, newBalance: number) => {
    socketRef.current?.emit('playerAction', roomIdRef.current, { type: 'BALANCE_UPDATE', playerId, newBalance });
  };

  const processDiceRoll = async (val: number, playerIdx: number) => {
    setIsMoving(true);
    let currentPos = playersRef.current[playerIdx].position;
    for (let step = 1; step <= val; step++) {
      currentPos = (currentPos + 1) % BOARD_SIZE;
      setPlayers(prev => prev.map((p, i) => i === playerIdx ? { ...p, position: currentPos } : p));
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setIsMoving(false);

    // Trigger action ONLY if it's my turn
    if (playersRef.current[playerIdx].id === socketRef.current?.id) {
      const currentBoard = boardTypeRef.current === 'ECONOMY' ? ECONOMY_TILES : SUSTAINABILITY_TILES;
      handleTileAction(playerIdx, currentBoard[currentPos]);
    }
  };

  useEffect(() => {
    processDiceRollRef.current = processDiceRoll;
  }, [processDiceRoll]);

  const onDiceRoll = (val: number) => {
    if (isMoving || !!activeModal || isSwitching || playersRef.current[turnIndexRef.current]?.id !== socketRef.current?.id) return;

    socketRef.current?.emit('playerAction', roomIdRef.current, {
      type: 'DICE_ROLL',
      roll: val,
      playerIdx: turnIndexRef.current
    });
  };

  const handleModalClose = (reward: number = 0) => {
    const player = playersRef.current[turnIndexRef.current];
    if (player && player.id === socketRef.current?.id) {
      syncBalance(player.id, player.balance + reward);
      socketRef.current?.emit('finishTurn', roomIdRef.current);
    }
    setActiveModal(null);
    setModalData(null);
  };

  if (gameStatus === 'SETUP') {
    return (
      <LobbyScreen
        onJoin={handleJoinRoom}
        onCreate={handleCreateRoom}
        onStartGame={handleStartGame}
        players={players}
        roomId={roomId}
        isHost={isHost}
        status="waiting"
        isConnected={isConnected}
      />
    );
  }

  const bgStyles = boardType === 'ECONOMY' ? 'from-blue-600' : 'from-emerald-600';

  return (
    <div className={`min-h-screen transition-all duration-1000 p-2 sm:p-4 lg:p-8 flex flex-col bg-slate-950 bg-gradient-to-br ${bgStyles} to-black/80 relative overflow-hidden`}>
      <div className={`absolute inset-0 bg-white z-[90] pointer-events-none transition-opacity duration-500 ${isSwitching ? 'opacity-40' : 'opacity-0'}`}></div>

      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8 relative z-10 overflow-x-hidden md:overflow-visible">
        <div className="order-1 lg:order-2 lg:col-span-6 flex items-center justify-center p-2">
          <div className="w-full max-w-[95vw] lg:max-w-none aspect-square">
            <BoardComponent boardType={boardType} players={players} onSwitch={handleSwitchBoard} />
          </div>
        </div>

        <div className="order-2 lg:order-3 lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-4">
          <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[2rem] p-4 sm:p-8 shadow-2xl border border-white/10 flex flex-col items-center justify-center gap-4 sm:gap-8 text-white">
            <div className="text-center">
              <h2 className="text-white/40 font-black uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mb-1">Current Turn</h2>
              <div className="flex items-center justify-center gap-3">
                <p className="text-white font-black text-xl leading-none">
                  {players[currentPlayerIndex]?.id === socketRef.current?.id ? "Your Turn" : `${players[currentPlayerIndex]?.name}'s Turn`}
                </p>
                {gameStatus === 'PLAYING' && !isMoving && !activeModal && (
                  <span className={`px-2 py-1 rounded-lg font-black text-xs ${timeLeft < 10 ? 'bg-red-500 animate-pulse' : 'bg-white/10'}`}>
                    {timeLeft}s
                  </span>
                )}
              </div>
            </div>
            <DiceComponent
              onRoll={onDiceRoll}
              disabled={isMoving || !!activeModal || isSwitching || players[currentPlayerIndex]?.id !== socketRef.current?.id}
            />
          </div>

          <div className="p-4 sm:p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[1.5rem] flex items-center gap-4 text-white">
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg">
              <Trophy size={28} />
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Millionaire Quest</p>
              <p className="text-sm font-black leading-tight">Reach <span className="text-emerald-400">€1M</span></p>
            </div>
          </div>
        </div>

        <div className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-4">
          <PlayerStats players={players} currentIndex={currentPlayerIndex} boardType={boardType} />
          <div className="hidden lg:flex bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-2xl border border-white/10 h-64 flex-col text-white">
            <h3 className="text-white/40 font-black mb-4 flex items-center gap-2 uppercase tracking-widest text-[10px]">
              Activity Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 text-[11px] pr-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className={`p-3 rounded-2xl transition-all ${i === 0 ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30' : 'opacity-40'}`}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(activeModal === 'QUESTION' || activeModal === 'ENUM') && <AIModal type={activeModal as 'QUESTION' | 'ENUM'} data={modalData} onClose={handleModalClose} loading={isLoadingAI} />}
      {activeModal === 'INVEST' && modalData && <ActionModal type="INVESTMENT" data={modalData} onClose={handleModalClose} />}

      {gameStatus === 'WON' && winner && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[200] backdrop-blur-2xl p-4 text-center text-white">
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 sm:p-20 max-w-xl w-full shadow-2xl animate-in zoom-in">
            <Trophy size={110} className="text-yellow-400 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
            <h2 className="text-5xl sm:text-7xl font-black mb-6 tracking-tighter">EPIC WIN!</h2>
            <p className="text-xl mb-12">
              Champion <span className="font-black text-blue-400">{winner.name}</span> reached the goal!
            </p>
            <button onClick={() => window.location.reload()} className="w-full py-6 bg-blue-600 rounded-[2rem] font-black text-2xl">PLAY AGAIN</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
