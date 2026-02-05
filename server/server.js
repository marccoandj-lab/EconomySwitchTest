const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

// In-memory storage for rooms
// Key: roomId, Value: Room object
const rooms = new Map();

/**
 * Room Structure:
 * {
 *   roomId: string,
 *   players: Array<{ id: string, name: string, finishedTurn: boolean, isHost: boolean }>,
 *   currentTurnIndex: number,
 *   status: 'waiting' | 'playing' | 'finished',
 *   gameState: object
 * }
 */

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create Room
    socket.on('createRoom', (playerName) => {
        const roomId = nanoid(6).toUpperCase();
        const room = {
            roomId,
            players: [
                {
                    id: socket.id,
                    name: playerName || "Host",
                    finishedTurn: false,
                    isHost: true
                }
            ],
            currentTurnIndex: 0,
            status: 'waiting',
            gameState: {}
        };

        rooms.set(roomId, room);
        socket.join(roomId);

        socket.emit('roomCreated', room);
        console.log(`Room created: ${roomId} by ${socket.id}`);
    });

    // Join Room
    socket.on('joinRoomById', (roomId, playerName) => {
        const cleanRoomId = roomId?.trim()?.toUpperCase();
        console.log(`Join attempt: Player ${playerName} searching for Room [${cleanRoomId}]`);
        const room = rooms.get(cleanRoomId);

        if (!room) {
            console.log(`Room [${cleanRoomId}] not found. Available rooms:`, Array.from(rooms.keys()));
            return socket.emit('errorMessage', `Soba [${cleanRoomId}] nije pronađena.`);
        }

        if (room.status !== 'waiting') {
            return socket.emit('errorMessage', 'Igra je već u toku.');
        }

        if (room.players.length >= 4) {
            return socket.emit('errorMessage', 'Soba je puna.');
        }

        const newPlayer = {
            id: socket.id,
            name: playerName || `Player ${room.players.length + 1}`,
            finishedTurn: false,
            isHost: false
        };

        room.players.push(newPlayer);
        socket.join(roomId);

        io.to(roomId).emit('playersUpdate', room.players);
        socket.emit('roomJoined', room);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Start Game
    socket.on('startGame', (roomId) => {
        const room = rooms.get(roomId);

        if (!room) return socket.emit('errorMessage', 'Soba nije pronađena.');

        const player = room.players.find(p => p.id === socket.id);
        if (!player || !player.isHost) {
            return socket.emit('errorMessage', 'Samo HOST može pokrenuti igru.');
        }

        if (room.players.length < 2) {
            return socket.emit('errorMessage', 'Potrebno je bar 2 igrača.');
        }

        room.status = 'playing';
        room.currentTurnIndex = 0;

        io.to(roomId).emit('gameStarted', room);
        io.to(roomId).emit('turnChanged', {
            currentTurnIndex: room.currentTurnIndex,
            activePlayerId: room.players[room.currentTurnIndex].id
        });

        console.log(`Game started in room ${roomId}`);
    });

    // Player Action
    socket.on('playerAction', (roomId, actionData) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        const activePlayer = room.players[room.currentTurnIndex];
        if (activePlayer.id !== socket.id) {
            return socket.emit('errorMessage', 'Nije tvoj red!');
        }

        // Broadcast the action to everyone in the room (including sender)
        io.to(roomId).emit('gameStateUpdated', actionData);
    });

    // Finish Turn
    socket.on('finishTurn', (roomId) => {
        const room = rooms.get(roomId);
        if (!room || room.status !== 'playing') return;

        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== room.currentTurnIndex) {
            return socket.emit('errorMessage', 'Ne možeš završiti tuđi potez.');
        }

        const player = room.players[playerIndex];
        if (player.finishedTurn) return;

        player.finishedTurn = true;

        // Move to next player
        room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;

        // Reset finishedTurn for all players or just the next one
        room.players.forEach(p => p.finishedTurn = false);

        io.to(roomId).emit('turnChanged', {
            currentTurnIndex: room.currentTurnIndex,
            activePlayerId: room.players[room.currentTurnIndex].id
        });

        console.log(`Turn changed in ${roomId} to player index ${room.currentTurnIndex}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                const wasOnTurn = (room.currentTurnIndex === playerIndex);
                const wasHost = room.players[playerIndex].isHost;

                room.players.splice(playerIndex, 1);

                if (room.players.length === 0) {
                    rooms.delete(roomId);
                    return;
                }

                // If host left, assign new host
                if (wasHost && room.players.length > 0) {
                    room.players[0].isHost = true;
                }

                // If player was on turn, advance turn
                if (wasOnTurn && room.status === 'playing') {
                    room.currentTurnIndex = room.currentTurnIndex % room.players.length;
                    io.to(roomId).emit('turnChanged', {
                        currentTurnIndex: room.currentTurnIndex,
                        activePlayerId: room.players[room.currentTurnIndex].id
                    });
                } else if (room.currentTurnIndex >= room.players.length) {
                    room.currentTurnIndex = 0;
                }

                io.to(roomId).emit('playersUpdate', room.players);
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
