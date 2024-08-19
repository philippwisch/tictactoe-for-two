// every field of the tic tac toe board is numbered/indexed from top left to bottom right. There are nine fields in total.
// the numbering goes like this:
// 1, 2, 3
// 4, 5, 6
// 7, 8, 9

export class Game {
    static winConditions = [
        ["1", "2", "3"],
        ["4", "5", "6"],
        ["7", "8", "9"],
    
        ["1", "4", "7"],
        ["2", "5", "8"],
        ["3", "6", "9"],
    
        ["1", "5", "9"],
        ["3", "5", "7"]
    ]

    static pickRandomPlayer() {
        return Math.random() < 0.5 ? "X" : "O";
    }

    static getOpponent(player) {
        return player === 'X' ? 'O' : 'X';
    }

    constructor(startingPlayer = undefined) {
        // keeps track of where players put "X" and "O". Looks like: {1: "X", 7: "O", 2: "X"}
        this.gameState = new Map();
        this.roundOver = false;
        this.winner = null;
        // if the starting player is not provided or is not 'X' or 'O', it picks a random player as a fallback
        this.currentTurnPlayer = (startingPlayer === 'X' || startingPlayer === 'O') ? startingPlayer : Game.pickRandomPlayer();
    }

    takeTurn(player, fieldIndex) {
        let valid = this.isValidTurn(player, fieldIndex);

        if (valid) {
            this.gameState.set(fieldIndex, player);
            this.winner = this.checkForWinner();

            if (this.winner) {
                this.roundOver = true;
            } else {
                this.roundOver = this.isGameboardFull();
            }

            // after player 1 takes their turn, it's player 2's turn
            this.currentTurnPlayer = Game.getOpponent(player);
        }

        return {
            valid,
            roundOver: this.roundOver,
            winner: this.winner
        }
    }

    checkForWinner() {

        for (const condition of Game.winConditions) {
            let xCount = 0;
            let oCount = 0;

            // count who many "X"s and "O"s there are. If there are 3 of one, that player wins.
            // ie the first wincondition it checks for is [1,2,3], which is 3 in-a-row in the first row.
            // the check for [1,5,9] would be diagonal from top left to bottom right
            for (const index of condition) {
                if (this.gameState.get(index) === 'X') xCount++;
                else if (this.gameState.get(index) === 'O') oCount++;

                if (xCount === 3) return 'X';
                else if (oCount === 3) return 'O';
            }
        }

        return null;
    }

    isGameboardFull() {
        return this.gameState.size === 9;
    }

    isValidTurn(player, fieldIndex) {
        // if the game is over
        if (this.roundOver) return false;
        // if the player is not assigned either 'O' or 'X'
        if (!(player === 'X' || player === 'O')) return false;
        // if it's not that player's turn
        if (this.currentTurnPlayer !== player) return false;
        // if the field has already been taken by a player, it can't be taken anymore
        if (this.gameState.get(fieldIndex)) return false;
        // if the field's index is outside the field (outside 1-9)
        if (fieldIndex < 1 || fieldIndex > 9) return false;

        return true;
    }
}