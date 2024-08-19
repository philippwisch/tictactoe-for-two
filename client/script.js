
import { Game } from '../shared/game.js';

window.onload = function () {
    const socket = io();

    const boxes = document.querySelectorAll(".box");
    const top = document.getElementById("top");
    const bottom = document.getElementById("bottom");

    let game;
    let whoAmI;
    let wins = 0;
    let losses = 0;

    boxes.forEach(box => {
        box.addEventListener('click', (event) => {
            // because the "game" object gets created WHEN a game starts (ie two players connected) and not before that,
            // if only one player is connected, the game object could be undefined.
            // That's why the optional chaining operator (? at game?) is used here
            if (game?.isValidTurn(whoAmI, event.target.id)) {
                // Check if the move would be valid, to avoid sending unnecessary requests
                socket.emit('declare move', event.target.id);
            }
        })
    })

    // if the game is already full, display the message from the server
    socket.on('connection refused', (msg) => {
        document.body.innerHTML = '';
        document.body.appendChild(document.createTextNode(msg));
    })

    socket.on('opponent left', (msg) => {
        top.innerHTML = msg;
    })

    socket.on('game start', (role, startingPlayer) => {
        console.log("game start");
        whoAmI = role; // 'X' or 'O' - does not change between game rounds
        startNewRound(startingPlayer);
    });

    // TODO split this function up for better readability
    socket.on('player move', (player, move, roundOver, winner, nextRoundStartingPlayer) => {
        console.log("player move: " + player + " " + move + " " + roundOver + " " + winner + " " + nextRoundStartingPlayer);
        // sync local gamestate with server's gamestate
        game.takeTurn(player, move);
        // display move on the gameboard
        const box = Array.from(boxes).find(box => box.id === move);
        if(box) box.innerHTML = player;

        if (roundOver) {
            // TODO wait 1 second here to display game board for a second before starting the next round
            startNewRound(nextRoundStartingPlayer);
        } else {
            updateWhoseTurnDisplay();
        }
    })

    function startNewRound(startingPlayer) {
        game = new Game(startingPlayer);

        clearGameboard();
        updateWhoseTurnDisplay();
    }

    function clearGameboard() {
        boxes.forEach(box => {
            box.innerHTML = '';
        })
    }

    function updateWhoseTurnDisplay() {
        // display whose turn it is in the top section of the webpage
        top.innerHTML = (whoAmI === game.currentTurnPlayer) ? "Your turn" : "Opponent's turn";
    }
}
