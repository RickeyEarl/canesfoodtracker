const { param } = require("express/lib/router");

const favoriteTeam = 12; //12 is the Carolina Hurricane's assigned number
const monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dowArray = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function convertClockTimeToJson(clockString){
    return clockString.split(":")
}

function transformScheduleInfoFromAPI(data){
    let returnObj = [];
    for(eventArray of data['dates']){ 
        let date = eventArray['games'][0]; //this only work b/c we're looking at one team
        let tempObj  = {
            dateTime: null,
            dateReadable: null,
            dowReadable: null, //day of week
            timeReadable:null,
            gameID: null,
            opponent: {
                teamID: null,
                teamName: null
            },
            homeGame: null //this is a bool
        };
        
        tempObj['dateTime'] = date['gameDate'];
        let tempDate = new Date(tempObj['dateTime']);
        tempObj['dowReadable'] = dowArray[tempDate.getDay()];
        tempObj['dateReadable'] = monthArray[tempDate.getMonth()] + " " + tempDate.getDate();
        
        if (tempDate.getMinutes() > 0){
            //doesn't start on the hour, provide the minutes
            var timeOptions = { hour: 'numeric', minute: '2-digit'} //maybe use narrow in the future?
        }else{
            //starts on the hour
            var timeOptions = { hour: 'numeric'} //maybe use narrow in the future?
        }

        tempObj['timeReadable'] = tempDate.toLocaleTimeString(['en-US'],timeOptions);

        tempObj['gameID'] = date['gamePk'];
        if(date['teams']['home']['team']['id'] == favoriteTeam){
            //home game
            tempObj['opponent']['teamID'] = date['teams']['away']['team']['id'];
            tempObj['opponent']['teamName'] = date['teams']['away']['team']['name'];
            tempObj['homeGame'] = true;


        }else{
            //not a home game
            //todo: how are things like outdoor games coded?
            tempObj['opponent']['teamID'] = date['teams']['home']['team']['id'];
            tempObj['opponent']['teamName'] = date['teams']['home']['team']['name'];
            tempObj['homeGame'] = false;
        }

        returnObj.push(tempObj);        

    }
    return returnObj;

}

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

function getPenaltiesFromAllPlays(allPlays){
    let transformedPlayData = [];
    for (play of allPlays) {
        //'play' is a value of an event that's on playData, so we have to
        //find the exact value of each penalty in the playData array
        let savePlay = true;
        if (play['result']['eventTypeId'] != "PENALTY") { //why are some games giving me stoppages? game 2022020006 for ex
            savePlay = false;
        } else { //putting the team penalty search in an else case prevents exceptions when the penalty data isnt there
            if (play['team']['id'] === favoriteTeam) {
                savePlay = false;
            }
        }

        if (savePlay) {
            let tempObj = {
                type: {
                    call: null,
                    description: null,
                    minutes: null
                },
                time: {
                    period: null,
                    timeIntoPeriod: null,
                    timeLeftInPeriod: null
                }
            };
            tempObj['type']['call'] = play['result']['secondaryType'];
            tempObj['type']['description'] = play['result']['description'];
            tempObj['type']['minutes'] = play['result']['penaltyMinutes'];

            tempObj['time']['period'] = play['about']['period'];
            tempObj['time']['timeIntoPeriod'] = play['about']['periodTime'];
            tempObj['time']['timeLeftInPeriod'] = play['about']['periodTimeRemaining'];
            transformedPlayData.push(tempObj);
        }
    } 
    return transformedPlayData;
}

function getMostRecentPenalty(data, period, timeIntoPeriod) {
    
    //get the penalty plays from the game data
    let returnPenalty = null;
    let penaltyData = getPenaltiesFromAllPlays(data)
    for (penalty of penaltyData) {
        if (penalty['time']['period'] > period) {
            //ignore it, it's after the period that we're looking for
        } else {
            paramTimeConverted = convertClockTimeToJson(timeIntoPeriod);
            arrayTimeConverted = convertClockTimeToJson(penalty['time']['timeIntoPeriod']);
            if (arrayTimeConverted[0] > paramTimeConverted[0]) {

            } else {
                if (arrayTimeConverted[1] > paramTimeConverted[1]) {
                    returnPenalty = penalty;
                }
            }
        }
    }
    return returnPenalty;
}

function getPPGInfoFromGameLiveData(data){
    const playData = data['liveData']['plays']['allPlays'] //get all play info
    const gameData = data['gameData'];

    transformedGameData = {
        homeGame: null,
        gameTime: {
            readable: {
                date: null,
                time: null
            },
            system: null,
        },
        opponent:{
            teamID: null,
            teamName: null,
            teamShortName: null
        }

    }

    if(gameData['teams']['home']['id'] == favoriteTeam){
        transformedGameData['homeGame'] = true;
    }else{
        transformedGameData['homeGame'] = false;
    }

    const gameTime = new Date(gameData['datetime']['dateTime']);

    transformedGameData['gameTime']['system'] = gameTime;

    if (gameTime.getMinutes() > 0){
        //doesn't start on the hour, provide the minutes
        var timeOptions = { hour: 'numeric', minute: '2-digit'} //maybe use narrow in the future?
    }else{
        //starts on the hour
        var timeOptions = { hour: 'numeric'} //maybe use narrow in the future?
    }

    transformedGameData['gameTime']['readable']['time'] = gameTime.toLocaleTimeString(['en-US'],timeOptions);

    let dateOptions = {month:"short", day:"numeric"};

    transformedGameData['gameTime']['readable']['date'] = gameTime.toLocaleDateString('en-US',dateOptions);
    let opponentTeamInfo;
    if(transformedGameData['homeGame'] == true){
        opponentTeamInfo = gameData['teams']['away'];
    }else{
        opponentTeamInfo = gameData['teams']['home'];
    }
    transformedGameData['opponent']['teamID'] = opponentTeamInfo['id']
    transformedGameData['opponent']['teamName'] = opponentTeamInfo['name']
    transformedGameData['opponent']['teamShortName'] = opponentTeamInfo['triCode']


    //get penalty play data

    let penaltyPlayData = [];

    let i = 0;
    let transformedPlayData = [];
    while (i < playData.length) {
        let play = playData[i];

        if(play['result']['eventTypeId'] == "GOAL" ){
            if (play['result']['strength']['code'] == "PPG"){ //if checks are seperate b/c not every play has a strength code
                if(play['team']['id'] == favoriteTeam){
                    let goalPlayInfo = {
                        players: {
                            score: {},
                            assist: []
                        },
                        time: {
                            timeIntoPeriod: null,
                            timeLeftInPeriod: null
                        },
                        penaltyInfo: null
                    };

                    for (let x = 0; x < play['players'].length; x++) {
                        switch (play['players'][x]['playerType']) {
                            case "Scorer":
                                goalPlayInfo['players']['score'] = {
                                    playerID: play['players'][x]['player']['id'],
                                    playerName: play['players'][x]['player']['fullName']
                                }
                                break;
                            case "Assist":
                                goalPlayInfo['players']['assist'].push(
                                    {
                                        playerID: play['players'][x]['player']['id'],
                                        playerName: play['players'][x]['player']['fullName']
                                    }
                                )

                        }
                    }

                    goalPlayInfo['penaltyInfo'] = getMostRecentPenalty(playData, play['about']['period'], play['about']['periodTime']);
                    transformedPlayData.push(goalPlayInfo);
                }
                
            }
            
        }
        
        i++;
    }
    let returnObject = {
        biscuits: null,
        gameInfo: null,
        playInfo: null
    }

    if(transformedPlayData.length > 0){
        returnObject['biscuits'] = true;
        
    }else{
        returnObject['biscuits'] = false;
    }

    returnObject['gameInfo'] = transformedGameData;
    returnObject['playInfo'] = transformedPlayData;

    return returnObject;
}



module.exports = { getPowerPlayInfoFromGameLiveData, transformScheduleInfoFromAPI, getPPGInfoFromGameLiveData }