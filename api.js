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
                const powerplayInfo = nhlParse.getPowerPlayInfoFromGameLieData(response.data);
                res.send(powerplayInfo);
            })
})

var server = app.listen(8081, function(){
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})