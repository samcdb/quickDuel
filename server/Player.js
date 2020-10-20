function Player(id, health) {
    
    this.id = id;
    this.health = health;
}

Player.prototype.isDead = function() {
    return this.health <= 0;
};

module.exports = Player;