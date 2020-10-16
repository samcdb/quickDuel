const { seq } = require("async");
const { SSL_OP_NO_QUERY_MTU } = require("constants");

class Game {
  constructor(player1, player2) {
    this.players = [player1, player2];
    this.gameID = player1.id + player2.id + Math.floor(Math.random() * 3000); //find a better way to make unique id
    this.lastPlayer = player1.id;
    this.timeLeft = 0;
    this.timeInterval;
    this.playersReady = 0;
    this.roundCount = 0;
    // aimgame only
    this.coordArr = [];
    this.reactionArr = [];  // first is attack, second is defend
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
        this.players[turnNow].emit("turnUpdate0X", {
          isTurn: true,
          time: this.timeLeft,
        }); //show timer

        this.players[notNow].emit("turnUpdate0X", {
          isTurn: false,
          time: this.timeLeft,
        }); //don't show timer

        this.timeLeft -= timeStep;

        if (this.timeLeft <= 0) {
          clearInterval(this.timeInterval);
          this.players[0].emit("gameUpdate", this.lastPlayer); //change
          this.players[1].emit("gameUpdate", this.lastPlayer); //change
          this.lastPlayer = this.players[turnNow];
        }
        console.log("time left: " + this.timeLeft);
      }.bind(this),
      timeStep
    );
  }
  // ############################## aim game ######################
  makeCoordArr(numTurns, width, height) {
    for(let i = 0; i < numTurns; i++) {
      let x = Math.floor((Math.random() * width));
      let y = Math.floor((Math.random() * height));
      this.coordArr.push([x, y]);
    }
  }

  updateAimDuel() {
    if (this.coordArr.length === 0) {
      console.log("aim duel over");
      this.roundCount++;
      this.players[0].emit("startNextMode", this.lastPlayer); //change
      this.players[1].emit("startNextMode", this.lastPlayer); //change
      return;
    }
    
    let attacker = (this.lastPlayer === this.players[0].id) ? 1 : 0;
    let defender = (this.lastPlayer === this.players[0].id) ? 0 : 1;
    let coords = this.coordArr.pop();
    console.log("coords: " + coords);
    this.players[attacker].emit("turnUpdateAim", {
      attacking: true,
      coords: coords,
    }); 

    this.players[defender].emit("turnUpdateAim", {
      attacking: false,
      coords: coords
    });

    this.timeInterval = setTimeout(function() {
      // case when only 1 player has clicked in time
      let attackSuccess = false;

      if (this.reactionArr[0]) {
        //attack success
        attackSuccess = true;
        this.players[attacker].emit("attack", attackSuccess);
        this.players[defender].emit("defend", attackSuccess);

      } else if (this.reactionArr[1]) {
        this.players[attacker].emit("attack", attackSuccess);
        this.players[defender].emit("defend", attackSuccess);
      } else {
        console.log("no one clicked in time");
      }
      // actually need to repeat the emit twice as nothing must happen if reactionArr empty
      
      this.lastPlayer = this.players[attacker].id;
      this.updateAimDuel();
    }.bind(this), 2000);
    
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
