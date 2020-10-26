//const { seq } = require("async");
//const { SSL_OP_NO_QUERY_MTU } = require("constants");
const Player = require("./Player");
const createBoard = require("./create-board");
const createAimDuel = require("./create-aimduel");
const createReactDuel = require("./create-reactduel");
const createTypeDuel = require("./create-typeduel");

class Game {
  constructor(player1, player2) {
    this.players = {[player1]: new Player(player1, 100), [player2]: new Player(player2, 100)};
    this.gameID = player1 + player2 + Math.floor(Math.random() * 3000); //find a better way to make unique id

    this.lastPlayer;
    this.currentPlayer;
    this.timeInterval;
    this.playersReady = 0;
    this.roundCount = 0;

    // start decider - reaction game
    this.reactDuel = createReactDuel(player1, player2, 5000);
    // aim duel object - uses closures to keep track of game
    this.aimDuel = createAimDuel();
    // noughts and crosses object - uses closures to keep track of board
    this.board = createBoard(2000, 100);
    // type duel game
    this.typeDuel = createTypeDuel(5000);

    this.gameModes = ["waiting-screen", "game-over", "start-decider", "aim-game", "tictac-game"];
    this.currentMode = this.gameModes[0];

  }

  updateTurns() {
    [this.lastPlayer, this.currentPlayer] = [this.currentPlayer, this.lastPlayer];
  }
}

module.exports = Game;
