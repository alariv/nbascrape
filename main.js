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
import { fail } from "assert";

var app = express();
const appserver = http.createServer(app);
const baseUrl = "https://www.basketball-reference.com/";
const teamsHtml = `${baseUrl}teams/index.html`;
// const playersHtml = `${baseUrl}{{teamUrl}}players.html`
const playersHtml = `${baseUrl}teams/{{teamShort}}/{{year}}.html`;
const leagueStatsHtml = `${baseUrl}leagues/NBA_{{year}}.html`;

const newBaseUrl = "https://basketball.realgm.com/";
const newTeamsHtml = `${newBaseUrl}nba/teams`;
const newPlayersHtml = `${newBaseUrl}nba/players/{{year}}/{{teamShort}}/{{teamNumber}}`;
const newLeagueStatsHtml = `${newBaseUrl}nba/teams/{{teamShort}}/{{teamNumber}}/Stats/{{year}}/Totals/All/points/All/desc/1/Regular_Season`;

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
    getTeams(newTeamsHtml).then((teams) => {
      console.log("finished getTeams");
      console.log(teams);
      Object.keys(teams).forEach((element) => {
        allTeams.push(element);
      });
      // getTeamsShorts(newTeamsHtml, teams).then((teams) => {
      // console.log("finished getTeamsShorts", teams);

      getPlayers(newPlayersHtml, teams).then((teamsWithPlayers) => {
        console.log("finished getPlayers");
        // console.log(teamsWithPlayers);
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
        getLeagueStats(newLeagueStatsHtml, teams)
          .then((data) => {
            // console.log(data);
            console.log("finished getLeagueStats");

            console.log("calculating averages..");
            let dataWithAverage = data;
            let sumObj = {};
            let counter = 0;
            Object.keys(data).forEach((year) => {
              counter = 0;
              sumObj[year] = {
                g: 0,
                mp: 0,
                fg: 0,
                fga: 0,
                fg_pct: 0,
                fg3: 0,
                fg3a: 0,
                fg3_pct: 0,
                fg2: 0,
                fg2a: 0,
                fg2_pct: 0,
                ft: 0,
                fta: 0,
                ft_pct: 0,
                orb: 0,
                drb: 0,
                trb: 0,
                ast: 0,
                stl: 0,
                blk: 0,
                tov: 0,
                pf: 0,
                pts: 0,
              };
              Object.keys(data[year]).forEach((team, idx) => {
                counter += 1;
                console.log("team", team, "in", year);
                console.log(parseInt(data[year][team].g));

                sumObj[year] = {
                  g: sumObj[year].g + parseInt(data[year][team].g),
                  mp: sumObj[year].mp + parseInt(data[year][team].mp),
                  fg: sumObj[year].fg + parseInt(data[year][team].fg),
                  fga: sumObj[year].fga + parseInt(data[year][team].fga),
                  fg_pct:
                    sumObj[year].fg_pct + parseInt(data[year][team].fg_pct),
                  fg3: sumObj[year].fg3 + parseInt(data[year][team].fg3),
                  fg3a: sumObj[year].fg3a + parseInt(data[year][team].fg3a),
                  fg3_pct:
                    sumObj[year].fg3_pct + parseInt(data[year][team].fg3_pct),
                  fg2: sumObj[year].fg2 + parseInt(data[year][team].fg2),
                  fg2a: sumObj[year].fg2a + parseInt(data[year][team].fg2a),
                  fg2_pct:
                    sumObj[year].fg2_pct + parseInt(data[year][team].fg2_pct),
                  ft: sumObj[year].ft + parseInt(data[year][team].ft),
                  fta: sumObj[year].fta + parseInt(data[year][team].fta),
                  ft_pct:
                    sumObj[year].ft_pct + parseInt(data[year][team].ft_pct),
                  orb: sumObj[year].orb + parseInt(data[year][team].orb),
                  drb: sumObj[year].drb + parseInt(data[year][team].drb),
                  trb: sumObj[year].trb + parseInt(data[year][team].trb),
                  ast: sumObj[year].ast + parseInt(data[year][team].ast),
                  stl: sumObj[year].stl + parseInt(data[year][team].stl),
                  blk: sumObj[year].blk + parseInt(data[year][team].blk),
                  tov: sumObj[year].tov + parseInt(data[year][team].tov),
                  pf: sumObj[year].pf + parseInt(data[year][team].pf),
                  pts: sumObj[year].pts + parseInt(data[year][team].pts),
                };
                if (idx == Object.keys(data[year]).length - 1) {
                  console.log("all teams covered");
                  console.log(sumObj[year]?.g);
                  console.log(counter);

                  dataWithAverage = {
                    ...dataWithAverage,
                    [year]: {
                      ...dataWithAverage[year],
                      "League Average": {
                        g: (sumObj[year].g / counter).toFixed(5).toString(),
                        mp: (sumObj[year].mp / counter).toFixed(5).toString(),
                        fg: (sumObj[year].fg / counter).toFixed(5).toString(),
                        fga: (sumObj[year].fga / counter).toFixed(5).toString(),
                        fg_pct: (sumObj[year].fg_pct / counter)
                          .toFixed(5)
                          .toString(),
                        fg3: (sumObj[year].fg3 / counter).toFixed(5).toString(),
                        fg3a: (sumObj[year].fg3a / counter)
                          .toFixed(5)
                          .toString(),
                        fg3_pct: (sumObj[year].fg3_pct / counter)
                          .toFixed(5)
                          .toString(),
                        fg2: (sumObj[year].fg2 / counter).toFixed(5).toString(),
                        fg2a: (sumObj[year].fg2a / counter)
                          .toFixed(5)
                          .toString(),
                        fg2_pct: (sumObj[year].fg2_pct / counter)
                          .toFixed(5)
                          .toString(),
                        ft: (sumObj[year].ft / counter).toFixed(5).toString(),
                        fta: (sumObj[year].fta / counter).toFixed(5).toString(),
                        ft_pct: (sumObj[year].ft_pct / counter)
                          .toFixed(5)
                          .toString(),
                        orb: (sumObj[year].orb / counter).toFixed(5).toString(),
                        drb: (sumObj[year].drb / counter).toFixed(5).toString(),
                        trb: (sumObj[year].trb / counter).toFixed(5).toString(),
                        ast: (sumObj[year].ast / counter).toFixed(5).toString(),
                        stl: (sumObj[year].stl / counter).toFixed(5).toString(),
                        blk: (sumObj[year].blk / counter).toFixed(5).toString(),
                        tov: (sumObj[year].tov / counter).toFixed(5).toString(),
                        pf: (sumObj[year].pf / counter).toFixed(5).toString(),
                        pts: (sumObj[year].pts / counter).toFixed(5).toString(),
                      },
                    },
                  };
                } else {
                  console.log(
                    "not all teams covered:",
                    idx,
                    Object.keys(data[year]).length - 1
                  );
                }
              });
            });

            console.log("DONE?");
            // console.log(dataWithAverage);

            fs.writeFile(
              "react/src/scrapedData/leaguesData.json",
              JSON.stringify(dataWithAverage),
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
      // });
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
  // console.log("landed on /calculateunitsize");
  // console.log(req.body);
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
      // console.log(data[team].players["Jimmy Butler"]);
      updatePlayersSeasonStats(data, team).then((data) => {
        console.log("players seasons data fetched");
        // res.send(JSON.stringify(data));
        updatePreviousPlayersSeasonStats(data, team).then((alldata) => {
          console.log("previous season players seasons data fetched");
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
          res.send(JSON.stringify(alldata));
        });
      });
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.send(`ERROR: ${err}`);
  }
});

const updateLeaguesData = () => {
  getLeagueStats(newLeagueStatsHtml).then((data) => {
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

    const maxSeasons = 6;
    console.log("players to fetch count:", playersCount);
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
    Object.keys(test[teamName].players).map((player, playerIdx) => {
      console.log("in map, player:", player);
      console.log(test[teamName].players[player]);
      playerCounter += 1;

      Object.keys(test[teamName].players[player].playerData)
        .reverse()
        .map((playerSeason, idx) => {
          if (idx < maxSeasons) {
            console.log("in playerData map", playerSeason);
            request(
              {
                method: "GET",
                url: test[teamName].players[player].playerData[playerSeason]
                  .link,
              },
              (err, response, body) => {
                seasonCounter += 1;
                !requestedPlayers.includes(player) &&
                  requestedPlayers.push(player);
                playerCounter = requestedPlayers.length;
                if (!body || typeof body !== "string") return;
                let $ = cheerio.load(body);
                let rows = $(".main-container table").eq(0).find("tbody tr");
                let playerData = {};
                $(rows).each(function (i, row) {
                  if ($(row).find("td a").eq(0).text().length) {
                    playerData[i] = {
                      date: $(row).find("td a").eq(0).text(),
                      team: $(row)
                        .find("td a")
                        .eq(1)
                        .attr("href")
                        .split("/")[3],
                      opponent: $(row).find("td").eq(2).text(),
                      result: $(row).find("td").eq(3).text(),
                      mp: $(row).find("td").eq(6).text(),
                      fg3: $(row).find("td").eq(11).text(),
                      trb: (
                        parseInt($(row).find("td").eq(17).text()) +
                        parseInt($(row).find("td").eq(18).text())
                      ).toString(),
                      ast: $(row).find("td").eq(20).text(),
                      stl: $(row).find("td").eq(21).text(),
                      blk: $(row).find("td").eq(22).text(),
                      tov: $(row).find("td").eq(23).text(),
                      "3pa": $(row).find("td").eq(12).text(),
                      fga: $(row).find("td").eq(9).text(),
                      pts: $(row).find("td").eq(7).text(),
                    };
                  }
                });
                test[teamName].players[player].playerData[playerSeason] = {
                  ...test[teamName].players[player].playerData[playerSeason],
                  data: playerData,
                };

                if ((seasonCounter ) >= seasonsToFetchCount) {
                  console.log("resolving");
                  resolve(test);
                } else {
                  console.log(
                    "not resolving:",
                    (seasonCounter ),
                    "/",
                    seasonsToFetchCount
                  );
                }
              }
            );
          }
        });
        if(playerIdx >= Object.keys(test[teamName].players).length -1){
          console.log('FINISHED PLAYERS');


        }
    });
    
  });
};

const updatePreviousPlayersSeasonStats = (test, teamName) =>{
  
  console.log("updating previous season players season stats");
  return new Promise((resolve) => {
    let playerCounter = 0;
    const playersCount = Object.keys(test[teamName].previousSeasonPlayers).length;

    const maxSeasons = 6;
    console.log("players to fetch count:", playersCount);
    let seasonsToFetchCount = 0;
   
    Object.keys(test[teamName].previousSeasonPlayers).forEach((player) => {
      Object.keys(test[teamName].previousSeasonPlayers[player].playerData)
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
  
  Object.keys(test[teamName].previousSeasonPlayers).map((player) => {
    console.log("in map, previousSeasonPlayer:", player);
    console.log(test[teamName].players[player]);
    playerCounter += 1;

    Object.keys(test[teamName].previousSeasonPlayers[player].playerData)
      .reverse()
      .map((playerSeason, idx) => {
        if (idx < maxSeasons) {
          console.log("in playerData map", playerSeason);
          request(
            {
              method: "GET",
              url: test[teamName].previousSeasonPlayers[player].playerData[
                playerSeason
              ].link,
            },
            (err, response, body) => {
              seasonCounter = seasonCounter + 1;
              console.log('seasoncounter is now:',seasonCounter);
              !requestedPlayers.includes(player) &&
                requestedPlayers.push(player);
              playerCounter = requestedPlayers.length;
              if (!body || typeof body !== "string") return;
              let $ = cheerio.load(body);
              let rows = $(".main-container table").eq(0).find("tbody tr");
              let playerData = {};
              $(rows).each(function (i, row) {
                if ($(row).find("td a").eq(0).text().length) {
                  playerData[i] = {
                    date: $(row).find("td a").eq(0).text(),
                  };
                }
              });
              test[teamName].previousSeasonPlayers[player].playerData[
                playerSeason
              ] = {
                ...test[teamName].previousSeasonPlayers[player].playerData[
                  playerSeason
                ],
                data: playerData,
              };

              if ((seasonCounter ) >= seasonsToFetchCount) {
                console.log("resolving");
                resolve(test);
              } else {
                console.log(
                  "not resolving:",
                  (seasonCounter),
                  "/",
                  seasonsToFetchCount
                );
              }
              
            }
          )
        }else{console.log('fell here',idx,maxSeasons,(idx < maxSeasons));}
      });
  });

    
  });
}

const updatePlayersStats = (team, teams, res) => {
  let teamObj = { [team]: teams[team] };

  return new Promise((resolve) => {
    getPlayersStats(teamObj, newBaseUrl).then((data) => {
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
