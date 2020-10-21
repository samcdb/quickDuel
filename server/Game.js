//const { seq } = require("async");
//const { SSL_OP_NO_QUERY_MTU } = require("constants");
const Player = require("./Player");
const createBoard = require("./create-board");
const createAimDuel = require("./create-aimduel");

class Game {
  constructor(player1, player2) {
    this.players = {[player1]: new Player(player1, 100), [player2]: new Player(player2, 100)};
    this.gameID = player1 + player2 + Math.floor(Math.random() * 3000); //find a better way to make unique id
    this.lastPlayer = player2;
    this.currentPlayer = player1;
    this.timeLeft = 0;
    this.timeInterval;
    this.playersReady = 0;
    this.roundCount = 0;
    this.turnTime = 2000;
    // aim duel object - uses closures to keep track of game
    this.aimDuel = createAimDuel();
    // noughts and crosses object - uses closures to keep track of board
    this.board = createBoard();
  }

  // ################################# NOUGHTS AND CROSSES #######################################

  updateTurns() {
    [this.lastPlayer, this.currentPlayer] = [this.currentPlayer, this.lastPlayer];
  }

  updateHealth(playerNum, hpChange) {
    let player = this.players[playerNum];
    player.health += hpChange;
  
    if (player.isDead()) {
      console.log("game over");
    }
  
  }

}

/*
class AimGame extends Game {
  constructor(player1, player2, turns, height, width) {
    super.constructor(player1,player2);
    this.numTurns = turns;
    this.height = height;
    this.width = width;
    this.coordArr = [];
  }

  makeCoordArr(numTurns) {
    for(let i = 0; i < numTurns; i++) {
      let x = Math.floor((Math.random() * width));
      let y = Math.floor((Math.random() * height));
      coordArr.push([x, y]);
    }
  }

  updateAimDuel() {
    if (this.coordArr.length === 0) {
      this.players[0].emit("gameUpdate", this.lastPlayer); //change
      this.players[1].emit("gameUpdate", this.lastPlayer); //change
    }

    let turnNow = this.lastPlayer === this.players[0].id ? 1 : 0;
    let notNow = this.lastPlayer === this.players[0].id ? 0 : 1;

    this.timeInterval = setTimeout(function() {
      let coords = this.coordArr.pop();

      this.players[turnNow].emit("aimTurnUpdate", {
        isTurn: true,
        coords: coords,
      }); //show timer

      this.players[notNow].emit("aimTurnUpdate", {
        isTurn: false,
        coords: coords
      }); //don't show timer
    }.bind(this),2000);
    
  }

    
}


*/



module.exports = Game;
