// require statements
const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Game = require("./game.js");

// server variables
const app = express()
const server = createServer(app);
const io = new Server(server);

// config
const port = 12345

//////////////////
// server setup //
//////////////////

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
    res.sendFile("index.html");
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
        startGame();
    }

    socket.on("disconnect", () => {
        console.log("user disconnected!");
        removePlayer(socket);
        endGame();
    })

    socket.on("declare move", move => {
        console.log(move);
        // TODO
        // check if its valid (ie there is nothing in there yet, its the users turn) (also check the same thing client side)
        // then check if the user wins
        // then check if the game is over
        // then add w/l to w/l counter if needed
        // start new game immediately
        // socket.emit("player move", PLAYERID_X_OR_O, BOARDGAMEINDEX)
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

function startGame() {
    if (!whoStartedGameround) {
        whoStartedGameround = Game.pickRandomPlayer();
    }

    // alternate starting player every round
    this.currentTurnPlayer = Game.getOpponent(whoStartedGameround);
    currentGame = new Game(whoStartedGameround);

    players.forEach((player) => {
        player.socket.emit("game start", player.role, currentGame.currentTurnPlayer);
    })
}

function endGame() {
    io.emit("game end", "Your opponent left. Waiting for new player...");
}