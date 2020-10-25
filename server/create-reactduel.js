const createReactDuel = (id1, id2, time) => {
    const player1 = id1;
    const player2 = id2;
    const maxTime = time;
    const reactObj = {[player1]: maxTime, [player2]: maxTime};
    let allowClick = false;

    const createRandomTime = () => {
        return randomTime = 1000 + Math.floor(Math.random() * (maxTime-2000));
    };

    const getWinner = () => {
        return reactObj[player1] < reactObj[player2] ? player1 : player2;
    };

    const alreadyClicked = (playerID) => {
        return reactObj[playerID] < maxTime;
    };

    const isClickAllowed = () => {
        return allowClick;
    };

    const setAllowClick = (allowed) => {
        allowClick = allowed;
    };

    const setPlayerTime = (playerID, timeTaken) => {
        reactObj[playerID] = timeTaken;
    };

    return {
        createRandomTime,
        getWinner,
        alreadyClicked,
        isClickAllowed,
        setAllowClick,
        setPlayerTime,
    };
}

module.exports = createReactDuel;