var express = require ('express');
var app = express();

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
                const powerplayInfo = nhlParse.getPowerPlayInfoFromGameLiveData(response.data);
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
    const scheduleURL = "http://localhost:8083/team/" + req.params['teamID'] + "/schedule";
    const axios = require('axios').default;
    const nhlParse = require("./nhl_parse");
    sendArray = [];
    axios.get(scheduleURL)
        .then(function(response){
            for(game of response.data){
                let gameInfoURL = "http://localhost:8083/game/" + game['gameID'];
                console.log(gameInfoURL);
                axios.get(gameInfoURL)
                    .then(function(gameResponse){
                        sendArray.push(gameResponse.data);
                    })
            }
        })
    res.send(sendArray);
})

var server = app.listen(8083, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})