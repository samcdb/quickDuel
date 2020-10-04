const createTurnRules = (playerID1, playerID2) => {
    const player1 = playerID1;
    const player22 = playerID2;
    let lastPlayer;
    let beginTime = 0;

    const update = (player) => {
        lastPlayer = player;
    }

    const whoseTurn = () => {
        return (playerID1 === lastPlayer) ? playerID2 : playerID1;
    }

    const timesUp = (turnTime) => {
        let currentTime = Date.now();

        if (currentTIme - beginTime > turnTime) {
            beginTime = currentTime;
            return true;
        } else {
            return false;
        }
    }

    return { update, whoseTurn, timesUp };

};

module.exports = createTurnRules;