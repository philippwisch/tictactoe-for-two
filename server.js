// import statements
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './shared/game.js';

// server variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()
const server = createServer(app);
const io = new Server(server);

// config
const port = 12345

//////////////////
// server setup //
//////////////////

app.use(express.static(path.join(__dirname, "client")));
app.use('/shared', express.static(path.join(__dirname, "shared")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})

//////////////////
// for the game //
//////////////////
const players = new Map();
let currentGame;
let whoStartedGameround; // used to alternate starting player for each game round

io.on("connection", (socket => {
    // if the game is full, don't accept any new connections.
    if (players.size >= 2) {
        console.log("user connected - game is full - connection refused");
        disconnectPlayer(socket, "Sorry, but the game is already full :(");
        return;
    } else {
        console.log("user connected");
        addPlayer(socket);
    }

    if (players.size === 2) {
        startNewGame();
    }

    socket.on("disconnect", () => {
        console.log("user disconnected");
        removePlayer(socket);
        endGame();
    })

    socket.on("declare move", move => {
        if(!currentGame) return;
        
        const player = players.get(socket).role;
        let result = currentGame.takeTurn(player, move);

        if(result.valid) {
            io.emit('player move', player, move, result.roundOver, result.winner, Game.getOpponent(whoStartedGameround));
            if (result.roundOver) {
                setupNewRound();
            }
        }
    })
}))

function disconnectPlayer(socket, msg) {
    socket.emit("connection refused", msg);
    socket.disconnect();
}

function addPlayer(socket) {
    let playerRole;

    // randomly assign a role to the first user and give the second user the opposite role
    if (players.size === 0) {
        playerRole = Game.pickRandomPlayer();
    } else {
        playerRole = players.values().next().value.role === "X" ? "O" : "X";
    }

    players.set(socket, { role: playerRole, socket: socket });
}

function removePlayer(socket) {
    players.delete(socket);
}

function startNewGame() {
    setupNewRound();
    players.forEach((player) => {
        player.socket.emit("game start", player.role, whoStartedGameround);
    })
}

function setupNewRound() {
    if (!whoStartedGameround) {
        whoStartedGameround = Game.pickRandomPlayer();
    }

    // alternate starting player every round
    whoStartedGameround = Game.getOpponent(whoStartedGameround);
    currentGame = new Game(whoStartedGameround);
}

function endGame() {
    io.emit("opponent left", "Your opponent left. Waiting for new player...");
}