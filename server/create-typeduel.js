const createTypeDuel = (time) => {
    let allowedTime = time;

    const randomSentence = (sentenceBank) => {
        let randomChoice = Math.floor(Math.random() * sentenceBank.length);
        return sentenceBank[randomChoice];
    };

    const getTime = () => allowedTime;


    return {
        randomSentence,
        getTime,
    };
};

module.exports = createTypeDuel;