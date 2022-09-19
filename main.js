import express from "express";
import http from "http";
import cors from "cors";
import fs from "fs";
import { getTeams } from "./getTeams.js";
import { getPlayers } from "./getPlayers.js";
import { getLeagueStats } from "./getLeagueStats.js";
import { getPlayersStats } from "./getPlayersStats.js";
import cheerio from "cheerio";
import request from "request";
import { calculateUnitSize } from "./calculate.js";
import { getTeamsShorts } from "./getTeamsShorts.js";
import path from "path";
import { fileURLToPath } from "url";

var app = express();
const appserver = http.createServer(app);
const baseUrl = "https://www.basketball-reference.com/";
const teamsHtml = `${baseUrl}teams/index.html`;
// const playersHtml = `${baseUrl}{{teamUrl}}players.html`
const playersHtml = `${baseUrl}teams/{{teamShort}}/{{year}}.html`;
const leagueStatsHtml = `${baseUrl}leagues/NBA_{{year}}.html`;

let allTeams = [];
global.teamsWPlayers = {};

app.use(express.json());

const corsOpts = {
  origin: "*",

  methods: ["GET"],

  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOpts));

app.use(express.static("react/build"));
// app.get("/", (req, res) => {
//   const __filename = fileURLToPath(import.meta.url);

//   const __dirname = path.dirname(__filename);

//   console.log("dirname??", __dirname);
//   // res.sendFile(path.join(__dirname, "react", "build", "index.html"));
//   // res.send("This is from express.js");
// });

app.get("/updateTeamsData", async (req, res) => {
  try {
    getTeams(teamsHtml).then((teams) => {
      console.log("finished getTeams");
      Object.keys(teams).forEach((element) => {
        allTeams.push(element);
      });
      getTeamsShorts(teamsHtml, teams).then((teams) => {
        console.log("finished getTeamsShorts", teams);

        getPlayers(playersHtml, teams).then((teamsWithPlayers) => {
          console.log("finished getPlayers");
          teams = teamsWithPlayers;
          // global.teamsWPlayers = teamsWithPlayers;
          fs.writeFile(
            "react/src/scrapedData/teams.json",
            JSON.stringify(teams),
            function (err, data) {
              if (!err) {
                console.log("succesfully wrote teams.json file");
                return;
              } else {
                console.log(err);
                return;
              }
            }
          );
          getLeagueStats(leagueStatsHtml)
            .then((data) => {
              console.log("finished getLeagueStats");
              fs.writeFile(
                "react/src/scrapedData/leaguesData.json",
                JSON.stringify(data),
                function (err, data) {
                  if (!err) {
                    console.log("succesfully wrote leaguesData.json file");
                    return;
                  } else {
                    console.log(err);
                    return;
                  }
                }
              );
            })
            .finally(() => {
              res.send({ status: "OK" });
            });
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.get("/updateLeagueData", async (req, res) => {
  try {
    updateLeaguesData();
    res.send("ok");
  } catch (err) {
    console.error("ERROR:", err);
    res.send(`ERROR: ${err}`);
  }
});

app.post("/calculateunitsize", async (req, res) => {
  console.log("landed on /calculateunitsize");
  console.log(req.body);
  const {
    market,
    season,
    extraMarket,
    line,
    predMinutes,
    selectedWplayer,
    totalGames,
    totalUnder,
    totalOverP,
    totalUnderP,
    bookieOdds,
    player,
  } = req.body;
  res.send(
    calculateUnitSize(
      market,
      season,
      extraMarket,
      line,
      predMinutes,
      selectedWplayer,
      totalGames,
      totalUnder,
      totalOverP,
      totalUnderP,
      bookieOdds,
      player
    )
  );
});

app.post("/updatePlayersStats/:team", async (req, res) => {
  const { team } = req.params;
  const teams = req.body;

  try {
    updatePlayersStats(team, teams, res).then((data) => {
      console.log("playerSeasons updated");
      updatePlayersSeasonStats(data, team).then((data) => {
        console.log("players seasons data fetched");
        res.send(JSON.stringify(data));
      });
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.send(`ERROR: ${err}`);
  }
});

const updateLeaguesData = () => {
  getLeagueStats(leagueStatsHtml).then((data) => {
    fs.writeFile(
      "react/src/scrapedData/leaguesData.json",
      JSON.stringify(data),
      function (err, data) {
        if (!err) {
          console.log("succesfully wrote leaguesData.json file");
          return;
        } else {
          console.log(err);
          return;
        }
      }
    );
  });
};

const updatePlayersSeasonStats = (test, teamName) => {
  console.log("updating players season stats");
  return new Promise((resolve) => {
    let playerCounter = 0;
    const playersCount = Object.keys(test[teamName].players).length;

    const maxSeasons = 3;
    let seasonsToFetchCount = 0;
    Object.keys(test[teamName].players).forEach((player) => {
      Object.keys(test[teamName].players[player].playerData)
        .reverse()
        .forEach((season, index) => {
          if (index < maxSeasons) {
            seasonsToFetchCount += 1;
            console.log(season, index);
          }
        });
    });
    console.log("seasons to fetch count:", seasonsToFetchCount);

    var seasonCounter = 0;
    let requestedPlayers = [];
    Object.keys(test[teamName].players).map((player) => {
      playerCounter += 1;

      Object.keys(test[teamName].players[player].playerData)
        .reverse()
        .map((playerSeason, idx) => {
          if (idx < maxSeasons) {
            request(
              {
                method: "GET",
                url:
                  baseUrl +
                  test[teamName].players[player].playerData[
                    playerSeason
                  ].link.replace("/", ""),
              },
              (err, response, body) => {
                seasonCounter += 1;
                !requestedPlayers.includes(player) &&
                  requestedPlayers.push(player);
                playerCounter = requestedPlayers.length;
                if (!body || typeof body !== "string") return;
                let $ = cheerio.load(body);
                let rows = $("#pgl_basic").find("tr");
                let playerData = {};
                $(rows).each(function (i, row) {
                  if ($(row).find("td[data-stat=game_season]").text().length) {
                    playerData[i] = {
                      date: $(row)
                        .find("td[data-stat=date_game]")
                        .find("a")
                        .text(),
                      opponent: $(row)
                        .find("td[data-stat=opp_id]")
                        .find("a")
                        .text(),
                      result: $(row)
                        .find("td[data-stat=game_result]")
                        .find("a")
                        .text(),
                      mp: $(row).find("td[data-stat=mp]").text(),
                      fg3: $(row).find("td[data-stat=fg3]").text(),
                      trb: $(row).find("td[data-stat=trb]").text(),
                      ast: $(row).find("td[data-stat=ast]").text(),
                      stl: $(row).find("td[data-stat=stl]").text(),
                      blk: $(row).find("td[data-stat=blk]").text(),
                      tov: $(row).find("td[data-stat=tov]").text(),
                      "3pa": $(row).find("td[data-stat=tov]").text(),
                      fga: $(row).find("td[data-stat=fg3a]").text(),
                      pts: $(row).find("td[data-stat=pts]").text(),
                    };
                  }
                });
                test[teamName].players[player].playerData[playerSeason] = {
                  ...test[teamName].players[player].playerData[playerSeason],
                  data: playerData,
                };
                if (seasonCounter == seasonsToFetchCount) {
                  console.log("resolving");
                  resolve(test);
                } else {
                  console.log(
                    "not resolving:",
                    seasonCounter,
                    "/",
                    seasonsToFetchCount
                  );
                }
              }
            );
          }
        });
    });
  });
};

const updatePlayersStats = (team, teams, res) => {
  let teamObj = { [team]: teams[team] };

  return new Promise((resolve) => {
    getPlayersStats(teamObj, baseUrl).then((data) => {
      fs.writeFile(
        "react/src/scrapedData/test.json",
        JSON.stringify(data),
        function (err, data) {
          if (!err) {
            console.log("succesfully wrote test.json file");
            return;
          } else {
            console.log(err);
            return;
          }
        }
      );
      resolve(data);
    });
  });
};

app.get("/endpoint", async (req, res) => {
  try {
    res.send("<h1>all good</h1>");
  } catch (err) {
    console.error(err);
  }
});

export default appserver;
