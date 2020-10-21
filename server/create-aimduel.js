const createAimDuel = () => {
    let aimBtnWidth;
    let coordArr;
    let reactionArr;  // first is attack, second is defend

    const initAimDuel = (numTurns, btnWidth, courtWidth, courtHeight) => {
        coordArr = [];
        for(let i = 0; i < numTurns; i++) {
          aimBtnWidth = btnWidth;
          let x = Math.floor(btnWidth + (Math.random() * (courtWidth - 2 * btnWidth)));
          let y = Math.floor(courtHeight / 2 + btnWidth + (Math.random() * ((courtHeight / 2) - 2 * btnWidth)));
          coordArr.push([x, y]);
        }
    }

    const getAimBtnWidth = () => {
        return aimBtnWidth;
    }

    const resetReactions = () => {
        reactionArr = [];
    };

    const setAtkReaction = (reactionTime) => {
        reactionArr[0] = reactionTime;
    };

    const setDefReaction = (reactionTime) => {
        reactionArr[1] = reactionTime;
    };

    const getAtkReaction = () => {
        return reactionArr[0];
    };

    const getDefReaction = () => {
        return reactionArr[1];
    };

    const bothClicked = () => {
        return reactionArr[0] && reactionArr[1];
    };

    const attackSuccess = () => {
        return reactionArr[0] < reactionArr[1];
    };

    const getCoords = () => {
        return coordArr.pop();
    };

    const duelOver = () => {
        return coordArr.length === 0;
    };

    return {
        initAimDuel,
        setAtkReaction,
        setDefReaction,
        getAtkReaction,
        getDefReaction,
        bothClicked,
        attackSuccess,
        resetReactions,
        duelOver,
        getCoords,
        getAimBtnWidth,
    };
}

module.exports = createAimDuel;