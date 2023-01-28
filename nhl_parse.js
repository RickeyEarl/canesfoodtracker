const favoriteTeam = 12; //12 is the Carolina Hurricane's assigned number

function getPowerPlayInfoFromGameLiveData(data){
    
    //get play data
    const playData = data['liveData']['plays']['allPlays'] //get all play info



    //get penalty play data
    
    let penaltyPlayData = [];

    let i = 0;
    let transformedPlayData = [];
    while(i < playData.length){
        //'play' is a value of an event that's on playData, so we have to
        //find the exact value of each penalty in the playData array
        let savePlay = true;
        if (playData[i]['result']['eventTypeId'] != "PENALTY") { //why are some games giving me stoppages? game 2022020006 for ex
            savePlay = false;
        }else{ //putting the team penalty search in an else case prevents exceptions when the penalty data isnt there
            if(playData[i]['team']['id'] === favoriteTeam){
                savePlay = false;
            }
        }

        if (savePlay) {
                let tempObj = {
                    type : {
                        call: null,
                        description: null,
                        minutes : null
                    },
                    time:{
                        period: null,
                        timeIntoPeriod: null,
                        timeLeftInPeriod: null
                    }
                };    
                tempObj['type']['call'] = playData[i]['result']['secondaryType'];
                tempObj['type']['description'] = playData[i]['result']['description'];
                tempObj['type']['minutes'] = playData[i]['result']['penaltyMinutes'];

                tempObj['time']['period'] = playData[i]['about']['period'];
                tempObj['time']['timeIntoPeriod'] = playData[i]['about']['periodTime'];
                tempObj['time']['timeLeftInPeriod'] = playData[i]['about']['periodTimeRemaining'];
                transformedPlayData.push(tempObj);
        }


        //make sure that the penalty is on someone other than the favorite team

        i++;
    }
    return transformedPlayData;
    
    
}

module.exports = {getPowerPlayInfoFromGameLiveData}