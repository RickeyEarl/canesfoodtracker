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

app.get("team/:teamID/schedule", function(req,res){
    const seasonStart = "2022-10-07";
    const seasonEnd = "2023-05-01";
    const axios = require('axios').default;
    const nhlTeamID = req.params['teamID'];
    const scheduleRequestURL = "https://statsapi.web.nhl.com/api/v1/schedule?teamId=" + teamID + "&startDate=" + seasonStart +"&endDate=" + seasonEnd;

    axios.get(scheduleRequestURL)
        .then(function(response){
            const scheduleInfo = nhlParse.transformScheduleInfoFromAPI(response.data);
        })
})

var server = app.listen(8081, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})