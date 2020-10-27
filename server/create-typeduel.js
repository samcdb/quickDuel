const createTypeDuel = (typingTime) => {
    let turnTime = typingTime;
    let sentence;
    let gameOver = false;

    const randomSentence = (sentenceBank) => {
        let randomChoice = Math.floor(Math.random() * sentenceBank.length);
        sentence = sentenceBank[randomChoice];
        return sentence;
    };

    const getTurnTime = () => turnTime;

    const duelOver = (typedText) => {
        if (typedText === sentence) gameOver = true;
        return gameOver;
    };

    return {
        randomSentence,
        getTurnTime,
        duelOver,
    };
};

module.exports = createTypeDuel;