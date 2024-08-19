
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
            // check if the move would be valid, to avoid sending unnecessary requests
            if (game.isValidTurn(whoAmI, event.target.id)) {
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

    socket.on('game start', (role, activePlayer) => {
        console.log("game start");
        game = new Game(activePlayer);
        whoAmI = role;

        clearGameboard();
        updateWhoseTurnDisplay();
    });

    socket.on('player move', (player, move, roundOver, winner) => {
        console.log("player move: " + player + " " + move + " " + roundOver + " " + winner);
        // sync local gamestate with server's gamestate
        game.takeTurn(player, move);
        boxes[move - 1].innerHTML = player;

        if (roundOver) {
            // TODO handle roundover
        } else {
            updateWhoseTurnDisplay();
        }
    })

    function clearGameboard() {
        boxes.forEach(box => {
            box.innerHTML = '';
        })
    }

    function updateWhoseTurnDisplay() {
        // display whose turn it is
        if (whoAmI === game.currentTurnPlayer) {
            top.innerHTML = "Your turn";
        } else {
            top.innerHTML = "Opponent's turn";
        }
    }
}
