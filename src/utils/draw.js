function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const draw = (playersArrayList) => {
    let games = []
    const shuffledPlayersArrayList = shuffle(playersArrayList);
    while (shuffledPlayersArrayList.length > 0) {
        let [num1, num2] = shuffledPlayersArrayList.splice(0, 2);
        games.push([num1, num2])
    };
    return games;
}