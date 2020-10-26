const createTypeDuel = (time) => {
    let allowedTime = time;

    const randomSentence = (sentenceBank) => {
        let randomChoice = Math.floor(Math.random() * sentenceBank.length);
        return sentenceBank[randomChoice];
    };

    const getTime = () => allowedTime;

    const setTime = (time) => allowedTime = time;

    return {
        randomSentence,
        getTime,
        setTime,
    };
};

module.exports = createTypeDuel;