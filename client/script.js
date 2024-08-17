import { Game } from './shared/game.js';

window.onload = function () {
    const socket = io();

    const boxes = document.querySelectorAll(".box");
    const top = document.getElementById("top");
    const bottom = document.getElementById("bottom");

    let whoAmI;
    let wins = 0;
    let losses = 0;
    let game;

    boxes.forEach(box => {
        box.addEventListener('click', (event) => {

            // TODO check if move can be made, use game.js
            // if that comes back positive, change it immedietaly to make it look more responsive. Server can still overwrite it theoretically later if needed
            // which it wont be without tampering anyway
            socket.emit('declare move', event.target.id);
        })
    })

    // if the game is already full, display the message from the server
    socket.on('connection refused', (msg) => {
        document.body.innerHTML = '';
        document.body.appendChild(document.createTextNode(msg));
    })

    socket.on('game start', (role, activePlayer) => {
        console.log("game start");
        // TODO needs a delay to show prev result for like 1 second
        // clear the board
        clearGameboard();
        whoAmI = role; // keep track of whether you are X or O
        game = new Game(activePlayer);
        updateTop();
    });

    socket.on('opponent left', (msg) => {
        top.innerHTML = msg;
    })

    socket.on('player move', (player, move) => {
        boxes[move - 1].innerHTML = player;
    })

    function clearGameboard() {
        boxes.forEach(box => {
            box.innerHTML = '';
        })
    }

    function updateTop() {
        // display who's turn it is
        if (whoAmI === game.activePlayer) {
            top.innerHTML = "Your turn";
        } else {
            top.innerHTML = "Opponent's turn";
        }
    }
}
