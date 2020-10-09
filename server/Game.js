function Game(player1, player2) {
  this.players = [player1, player2];
  this.gameID = player1.id + player2.id + Math.floor(Math.random() * 3000); //find a better way to make unique id
  this.lastPlayer = player1.id;
  this.timeLeft = 0;
  this.timeInterval;
}

Game.prototype.updateLastPlayer = function (player) {
  this.lastPlayer = player;
};

Game.prototype.whoseTurn = function () {
  return this.players[0].id === this.lastPlayer
    ? this.players[1].id
    : this.players[0].id;
};

Game.prototype.setTime = function (turnTime) {
  this.timeLeft = turnTime;
};

Game.prototype.turnTimer = function (timeStep) {
  let turnNow = this.lastPlayer === this.players[0].id ? 1 : 0;
  let notNow = this.lastPlayer === this.players[0].id ? 0 : 1;
  this.setTime(2000);

  this.timeInterval = setInterval(
    function () {
      this.timeLeft -= timeStep;
      this.players[turnNow].emit("turnUpdate", {
        isTurn: true,
        time: this.timeLeft,
      }); //show timer

      this.players[notNow].emit("turnUpdate", {
        isTurn: false,
        time: this.timeLeft,
      }); //don't show timer

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
};

module.exports = Game;
