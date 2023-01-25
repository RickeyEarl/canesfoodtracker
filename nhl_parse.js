function getPowerPlayInfoFromGameLieData(data){
    
    //get play data
    const playData = data['liveData']['plays']['allPlays'] //get all play info

    //get penalty play data
    const penaltyPlays = data['liveData']['plays']['penaltyPlays'];
    
    let penaltyPlayData = [];

    for(play in penaltyPlays){
        //'play' is a value of an event that's on playData, so we have to
        //find the exact value of each penalty in the playData array
        return play
        penaltyPlayData.push(playData.find(o => o['about']['eventId'] === play));
    }

    return penaltyPlayData;
}

module.exports = {getPowerPlayInfoFromGameLieData}