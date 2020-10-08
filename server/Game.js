function Game(player1, player2) {
  this.players = [player1, player2];
  this.gameID = player1.id + playerID2.id + floor(Math.random() * 3000); //find a better way to make unique id
  this.lastPlayer = player1.id;
  this.timeLeft = 0;
}

Game.prototype.updateLastPlayer = function (player) {
  this.lastPlayer = player;
};

Game.prototype.whoseTurn = function () {
  console.log(this.player1);
  return this.player1 === this.lastPlayer ? this.player2 : this.player1;
};

Game.prototype.setTime = function (turnTime) {
  this.timeLeft = turnTime;
};

Game.prototype.updateTime = function (timeStep) {
  this.timeLeft -= timeStep;
  return this.timeleft <= 0;
};

module.exports = Game;
