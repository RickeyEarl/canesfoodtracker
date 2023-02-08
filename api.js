var express = require ('express');
require('dotenv').config();
var app = express();
const PORT = process.env.PORT || 3000;

app.get('/', function(req, res){
    res.send('Hello World');
})

app.get("/game/:gameID", function(req, res){

    //to be able to get the game info re: powerplays
    
    //request and URL Generation
    const axios = require('axios').default;
    const nhlGameID = req.params['gameID'];
    const gameRequestURL = "https://statsapi.web.nhl.com/api/v1/game/"+ nhlGameID + "/feed/live"

    //request execution
        const nhlParse = require("./nhl_parse.js");
        axios.get(gameRequestURL)
            .then(function(response){
                const powerplayInfo = nhlParse.getPPGInfoFromGameLiveData(response.data);
                res.send(powerplayInfo);
            })
})

app.get("/team/:teamID/schedule", function(req,res){
    const seasonStart = "2022-10-07";
    const seasonEnd = "2023-05-01";
    const axios = require('axios').default;
    const nhlTeamID = req.params['teamID'];
    const scheduleRequestURL = "https://statsapi.web.nhl.com/api/v1/schedule?teamId=" + nhlTeamID + "&startDate=" + seasonStart +"&endDate=" + seasonEnd;
    const nhlParse = require("./nhl_parse.js");

    axios.get(scheduleRequestURL)
        .then(function(response){
            const scheduleInfo = nhlParse.transformScheduleInfoFromAPI(response.data);
            res.send(scheduleInfo);
        })
})



app.get('/team/:teamID/schedule/powerplay', function(req,res){
    const scheduleURL = process.env.LOCAL_CALL_HOST + "/team/" + req.params['teamID'] + "/schedule";
    const axios = require('axios').default;
    const nhlParse = require("./nhl_parse");
    sendArray = [];
    axios.get(scheduleURL)
        .then(function(response){
            return scheduleData = response.data;
        })
        .then(function(schedule){
            let promiseArray = []
            for (game of schedule) {
                let gameInfoURL = process.env.LOCAL_CALL_HOST + "/game/" + game['gameID'];
                promiseArray.push(axios.get(gameInfoURL))
               
            }
            Promise.all(promiseArray).then((values) =>{
                let sendArray = []
                for(value of values){
                    sendArray.push(value['data']);
                }
                res.send(sendArray);
            })
        })
})



var server = app.listen(PORT, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Canes Food Tracker listening at http://%s:%s", host, port)
})