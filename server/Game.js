//const { seq } = require("async");
//const { SSL_OP_NO_QUERY_MTU } = require("constants");
const Player = require("./Player");

class Game {
  constructor(player1, player2) {
    this.players = [new Player(player1, 100), new Player(player2, 100)];
    this.gameID = player1.id + player2.id + Math.floor(Math.random() * 3000); //find a better way to make unique id
    this.lastPlayer = player1.id;
    this.timeLeft = 0;
    this.timeInterval;
    this.playersReady = 0;
    this.roundCount = 0;
    // aimgame only
    this.aimBtnWidth;
    this.coordArr = [];
    this.reactionArr = [];  // first is attack, second is defend
    this.testCount = 0;
  }

  updateHealth(playerNum, hpChange) {
    let player = this.players[playerNum];
    player.health += hpChange;
    
    this.players[0].conn.emit("updateHealth", {id: player.id, hp: player.health}); 
    this.players[1].conn.emit("updateHealth", {id: player.id, hp: player.health}); 

    if (player.isDead()) {
      this.gameOver();
    }

  }

  gameOver() {
    console.log("game over");
  }
  
  whoseTurn() {
    return this.players[0].id === this.lastPlayer
      ? this.players[1].id
      : this.players[0].id;
  }
  setTime(turnTime) {
    this.timeLeft = turnTime;
  }

  // ############################ NOUGHTS AND CROSSES ############################
  update0XDuel(timeStep) {
    let turnNow = this.lastPlayer === this.players[0].id ? 1 : 0;
    let notNow = this.lastPlayer === this.players[0].id ? 0 : 1;
    this.setTime(2000);

    this.timeInterval = setInterval(
      function () {
        this.players[turnNow].conn.emit("turnUpdate0X", {
          isTurn: true,
          time: this.timeLeft,
        }); //show timer

        this.players[notNow].conn.emit("turnUpdate0X", {
          isTurn: false,
          time: this.timeLeft,
        }); //don't show timer

        this.timeLeft -= timeStep;

        if (this.timeLeft <= 0) {
          clearInterval(this.timeInterval);
          this.players[0].conn.emit("gameUpdate", this.lastPlayer); //change
          this.players[1].conn.emit("gameUpdate", this.lastPlayer); //change
          this.lastPlayer = this.players[turnNow];
        }
        console.log("time left: " + this.timeLeft);
      }.bind(this),
      timeStep
    );
  }
  // ############################## aim game ######################
  createAimDuel(numTurns, btnWidth, courtWidth, courtHeight) {
    for(let i = 0; i < numTurns; i++) {
      this.aimBtnWidth = btnWidth;
      let x = Math.floor(btnWidth + (Math.random() * (courtWidth - 2 * btnWidth)));
      let y = Math.floor(courtHeight / 2 + btnWidth + (Math.random() * ((courtHeight / 2) - 2 * btnWidth)));
      this.coordArr.push([x, y]);
    }
  }

  updateAimDuel() {
    this.reactionArr = [];
    console.log("player 1 health: " + this.players[0].health);
    console.log("player 2 health: " + this.players[1].health);
    if (this.coordArr.length === 0) {
      console.log("aim duel over");
      this.roundCount++;
      // need to randomise next game
      let fromMode = "aim-game"       // implement this.currentMode
      let toMode = "tictac-game"
      this.players[0].conn.emit("startNextMode", {fromMode, toMode}); //change
      this.players[1].conn.emit("startNextMode", {fromMode, toMode}); //change
      return;
    }
     
    let attacker = (this.lastPlayer === this.players[0].id) ? 1 : 0; 
    let defender = (this.lastPlayer === this.players[0].id) ? 0 : 1;
    let coords = this.coordArr.pop();

    this.players[attacker].conn.emit("turnUpdateAim", {
      attacking: true,
      coords: coords,
      btnWidth: this.aimBtnWidth,
    }); 

    this.players[defender].conn.emit("turnUpdateAim", {
      attacking: false,
      coords: coords,
      btnWidth: this.aimBtnWidth,
    });

    this.timeInterval = setTimeout(function() {
      // case when only 1 player has clicked in time
      if (this.reactionArr[0]) {
        //attack success
        this.updateHealth(defender, -10);
      } 
  
      this.lastPlayer = this.players[attacker].id;
      this.updateAimDuel();
    }.bind(this), 5000);
    
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
