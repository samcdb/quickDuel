function Player(connectionInfo, health) {
    this.conn = connectionInfo;
    this.id = connectionInfo.id;
    this.health = health;
}

Player.prototype.isDead = function() {
    return this.health <= 0;
};

module.exports = Player;