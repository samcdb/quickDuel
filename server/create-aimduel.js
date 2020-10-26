const createAimDuel = () => {
    let aimBtnWidth;
    let coordArr;
    let reactionArr;  // first is attack, second is defend
    let turnTime;

    const initAimDuel = (numTurns, btnWidth, courtWidth, courtHeight, time) => {
        coordArr = [];
        turnTime = time;
        
        for(let i = 0; i < numTurns; i++) {
          aimBtnWidth = btnWidth;
          let x = Math.floor(btnWidth + (Math.random() * (courtWidth - 2 * btnWidth)));
          let y = Math.floor(courtHeight / 2 + btnWidth + (Math.random() * ((courtHeight / 2) - 2 * btnWidth)));
          coordArr.push([x, y]);
        }
    }


    const getAimBtnWidth = () => aimBtnWidth;

    const getTurnTime = () => turnTime;

    const resetReactions = () => reactionArr = [];

    const setAtkReaction = (reactionTime) => reactionArr[0] = reactionTime;

    const setDefReaction = (reactionTime) => reactionArr[1] = reactionTime;

    const getAtkReaction = () => reactionArr[0];

    const getDefReaction = () => reactionArr[1];

    const bothClicked = () => reactionArr[0] && reactionArr[1];

    const attackSuccess = () => reactionArr[0] < reactionArr[1];

    const getCoords = () => coordArr.pop();

    const duelOver = () => coordArr.length === 0;

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
        getTurnTime,
    };
}

module.exports = createAimDuel;