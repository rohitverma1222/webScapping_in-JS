let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path")

request('https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results', cb); //url of main site


function cb(error, response, html) {
    if (error) {
        console.log(error);
    }
    else if (response.statusCode == 404) {
        console.log("page not found");
    }
    else {
        console.log("Data Processing.............");
        ScoreBoardLink(html);
    }
}

function ScoreBoardLink(html) {
    let searchTool = cheerio.load(html);
    let data = searchTool("a[data-hover='Scorecard']")
    let FullLink = "";

    for (let i = 0; i < data.length; i++) {
        FullLink = "https://www.espncricinfo.com" + searchTool(data[i]).attr("href");
        request(FullLink, newcb);
    }
    function newcb(error, response, html) {
        if (error) {
            console.log(error);
        }
        else if (response.statusCode == 404) {
            console.log("page not found");
        }
        else {
            TeamwithBatsman(html);
        }
    }
    let score = ""
    function TeamwithBatsman(html) {
        let searchTool = cheerio.load(html);
        let teams = searchTool(".Collapsible");
        for (let i = 0; i < teams.length; i++) {
            let teamsName = searchTool(teams[i]).find("h5");
            let Teams = teamsName.text();
            Teams = Teams.split("INNINGS")[0];
            Teams = Teams.trim();
            let batsmanRow = searchTool(teams[i]).find(".table.batsman tbody tr")
            console.log("-------->>>>>" + Teams);
            for (let j = 0; j < batsmanRow.length; j++) {
                numberOftds = searchTool(batsmanRow[j]).find("td");
                let allowed = searchTool(numberOftds[0]).hasClass("batsman-cell");
                if (allowed) {
                    let playerName = (searchTool(numberOftds[0]).text());
                    let run = (searchTool(numberOftds[2]).text());
                    let balls = (searchTool(numberOftds[3]).text());
                    let fours = (searchTool(numberOftds[5]).text());
                    let sixes = (searchTool(numberOftds[6]).text());
                    let sr = (searchTool(numberOftds[7]).text());

                    console.log(`${playerName} playes for ${Teams} ans Scored ${run} runs in ${balls} balls with the StrikeRate ${sr}`);
                    processPlayer(playerName, run, balls, fours, sixes, sr, Teams);
                }
            }
            console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        }

    }
}
function processPlayer(playerName, runs, balls, fours, sixes, sr, teamsName) {
    let playerObject = {
        playerName: playerName,
        runs: runs,
        balls: balls,
        fours: fours,
        sixes: sixes,
        StrikeRate: sr,
    }

    let dir = fs.existsSync(teamsName);
    if (!dir)
        fs.mkdirSync(teamsName);

    let filePath = path.join(__dirname, teamsName, playerName + ".json");
    let checkfile = fs.existsSync(filePath);
    let data = [];
    if (checkfile) {
        playerData = fs.readFileSync(filePath);
        data = JSON.parse(playerData);
        data.push(playerObject);
        fs.writeFileSync(filePath, JSON.stringify(data));
    }
    else {
        data.push(playerObject);
        fs.writeFileSync(filePath, JSON.stringify(data));
    }


}
