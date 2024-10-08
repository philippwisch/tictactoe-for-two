
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
        whoAmI = role; // 'X' or 'O' - does not change between game rounds
        startNewRound(startingPlayer);
    });

    // TODO split this function up for better readability
    socket.on('player move', (player, move, roundOver, winner, nextRoundStartingPlayer) => {
        // sync local gamestate with server's gamestate
        game.takeTurn(player, move);
        // display move on the gameboard
        const box = Array.from(boxes).find(box => box.id === move);
        if(box) box.innerHTML = player;

        if (roundOver) {
            // display who won the round or if it was a draw
            updateWhoWonDisplay(winner);
            updateWinsLossesDisplay(winner);
            // wait 1 second before starting the next round
            // to display results for a short moment
            setTimeout(() => startNewRound(nextRoundStartingPlayer), 1000);
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
        let opponent = Game.getOpponent(whoAmI);
        top.innerHTML = (whoAmI === game.currentTurnPlayer) ? `Your turn (${whoAmI})` : `Opponent's turn (${opponent})`;
    }

    function updateWhoWonDisplay(winner) {
        if (winner) {
            let text = (winner === whoAmI) ? "You win!" : "Your opponent wins!";
            top.innerHTML = text;
        } else {
            top.innerHTML = "Draw!";
        }
    }

    function updateWinsLossesDisplay(winner) {
        if(winner) {
            if(winner === whoAmI) {
                wins++;
            } else {
                losses++;
            }
            bottom.innerHTML = `Wins: ${wins} | Losses: ${losses}`;
        }
    }
}
