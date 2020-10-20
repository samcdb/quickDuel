//const { seq } = require("async");
//const { SSL_OP_NO_QUERY_MTU } = require("constants");
const Player = require("./Player");
const createBoard = require("./create-board");

class Game {
  constructor(player1, player2) {
    this.players = [new Player(player1, 100), new Player(player2, 100)];
    this.gameID = player1 + player2 + Math.floor(Math.random() * 3000); //find a better way to make unique id
    this.lastPlayer = player1;
    this.timeLeft = 0;
    this.timeInterval;
    this.playersReady = 0;
    this.roundCount = 0;
    this.turnTime = 2000;
    // aimgame only
    this.aimBtnWidth;
    this.coordArr = [];
    this.reactionArr = [];  // first is attack, second is defend
    this.testCount = 0;
    // noughts and crosses object - uses closures to keep track of board
    this.board = createBoard();
    {}
  }

  // ################################# NOUGHTS AND CROSSES #######################################


  createAimDuel(numTurns, btnWidth, courtWidth, courtHeight) {
    for(let i = 0; i < numTurns; i++) {
      this.aimBtnWidth = btnWidth;
      let x = Math.floor(btnWidth + (Math.random() * (courtWidth - 2 * btnWidth)));
      let y = Math.floor(courtHeight / 2 + btnWidth + (Math.random() * ((courtHeight / 2) - 2 * btnWidth)));
      this.coordArr.push([x, y]);
    }
  }

  whoseTurn() {
    return this.players[0].id === this.lastPlayer
      ? this.players[1].id
      : this.players[0].id;
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
