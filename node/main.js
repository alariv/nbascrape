import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import { getTeams } from './getTeams.js';
import { getPlayers } from './getPlayers.js';
import { getLeagueStats } from './getLeagueStats.js';
import { getPlayersStats } from './getPlayersStats.js';

var app = express();
const appserver = http.createServer(app);
const baseUrl = 'https://www.basketball-reference.com/';
const teamsHtml = `${baseUrl}teams/index.html`;
// const playersHtml = `${baseUrl}{{teamUrl}}players.html`
const playersHtml = `${baseUrl}teams/{{teamShort}}/{{year}}.html`;
const leagueStatsHtml = `${baseUrl}leagues/NBA_{{year}}.html`;

let allTeams = [];
global.teamsWPlayers = {};

app.use(express.json());

const corsOpts = {
  origin: '*',

  methods: ['GET'],

  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOpts));

app.get('/updateTeamsData', async (req, res) => {
  // console.log('landed on /updateTeamsData')
  try {
    getTeams(teamsHtml).then((teams) => {
      console.log('finished getTeams');
      Object.keys(teams).forEach((element) => {
        allTeams.push(element);
      });
      // console.log('ALL teams')
      // console.log(allTeams)

      getPlayers(playersHtml, teams).then((teamsWithPlayers) => {
        console.log('finished getPlayers');
        teams = teamsWithPlayers;
        global.teamsWPlayers = teamsWithPlayers;
        fs.writeFile(
          '../src/scrapedData/teams.json',
          JSON.stringify(teams),
          function (err, data) {
            if (!err) {
              return; // console.log('succesfully wrote teams.json file')
            } else {
              return; // console.log(err)
            }
          }
        );
        getLeagueStats(leagueStatsHtml).then((data) => {
          console.log('finished getLeagueStats');
          fs.writeFile(
            '../src/scrapedData/leaguesData.json',
            JSON.stringify(data),
            function (err, data) {
              if (!err) {
                console.log('succesfully wrote leaguesData.json file');
                return;
              } else {
                console.log(err);
                return;
              }
            }
          );
          getPlayersStats(global.teamsWPlayers, baseUrl).then((data) => {
            fs.writeFile(
              '../src/scrapedData/test.json',
              JSON.stringify(data),
              function (err, data) {
                if (!err) {
                  return; // console.log('succesfully wrote test.json file')
                } else {
                  return; // console.log(err)
                }
              }
            );
            res.send({ status: 'FETCHED' });
          });
        });
      });
    });
  } catch (err) {
    console.error(err);
    res.send(err);
  }
});

app.get('/updateLeagueData', async (req, res) => {
  // console.log('landed on /updateTeamsData')
  try {
    updateLeaguesData();
    res.send('ok');
  } catch (err) {
    console.error('ERROR:', err);
    res.send(`ERROR: ${err}`);
  }
});
app.get('/updatePlayersStats', async (req, res) => {
  // console.log('landed on /updatePlayersStats')
  global.teamsWPlayers = testTeams;
  try {
    updatePlayersStats();
    res.send('ok');
  } catch (err) {
    console.error('ERROR:', err);
    res.send(`ERROR: ${err}`);
  }
});

const updateLeaguesData = () => {
  getLeagueStats(leagueStatsHtml).then((data) => {
    fs.writeFile(
      '../src/scrapedData/leaguesData.json',
      JSON.stringify(data),
      function (err, data) {
        if (!err) {
          console.log('succesfully wrote leaguesData.json file');
          return;
        } else {
          console.log(err);
          return;
        }
      }
    );
  });
};

const updatePlayersStats = () => {
  console.log('UPDATE PLAYERS STATS');
  // console.log(global.teamsWPlayers);
  getPlayersStats(global.teamsWPlayers, baseUrl).then((data) => {
    fs.writeFile(
      '../src/scrapedData/test.json',
      JSON.stringify(data),
      function (err, data) {
        if (!err) {
          return; // console.log('succesfully wrote test.json file')
        } else {
          return; // console.log(err)
        }
      }
    );
  });
};

app.get('/endpoint', async (req, res) => {
  try {
    res.send('<h1>all good</h1>');
  } catch (err) {
    console.error(err);
  }
});

export default appserver;

var testTeams = {
  'Atlanta Hawks': { link: 'teams/ATL/', players: {} },
  'Boston Celtics': { link: 'teams/BOS/', players: {} },
  'Brooklyn Nets': { link: 'teams/NJN/', players: {} },
  'Charlotte Hornets': { link: 'teams/CHA/', players: {} },
  'Chicago Bulls': { link: 'teams/CHI/', players: {} },
  'Cleveland Cavaliers': { link: 'teams/CLE/', players: {} },
  'Dallas Mavericks': { link: 'teams/DAL/', players: {} },
  'Denver Nuggets': { link: 'teams/DEN/', players: {} },
  'Detroit Pistons': { link: 'teams/DET/', players: {} },
  'Golden State Warriors': { link: 'teams/GSW/', players: {} },
  'Houston Rockets': { link: 'teams/HOU/', players: {} },
  'Indiana Pacers': { link: 'teams/IND/', players: {} },
  'Los Angeles Clippers': { link: 'teams/LAC/', players: {} },
  'Los Angeles Lakers': { link: 'teams/LAL/', players: {} },
  'Memphis Grizzlies': { link: 'teams/MEM/', players: {} },
  'Miami Heat': { link: 'teams/MIA/', players: {} },
  'Milwaukee Bucks': { link: 'teams/MIL/', players: {} },
  'Minnesota Timberwolves': { link: 'teams/MIN/', players: {} },
  'New Orleans Pelicans': { link: 'teams/NOH/', players: {} },
  'New York Knicks': { link: 'teams/NYK/', players: {} },
  'Oklahoma City Thunder': { link: 'teams/OKC/', players: {} },
  'Orlando Magic': { link: 'teams/ORL/', players: {} },
  'Philadelphia 76ers': { link: 'teams/PHI/', players: {} },
  'Phoenix Suns': { link: 'teams/PHO/', players: {} },
  'Portland Trail Blazers': { link: 'teams/POR/', players: {} },
  'Sacramento Kings': { link: 'teams/SAC/', players: {} },
  'San Antonio Spurs': { link: 'teams/SAS/', players: {} },
  'Toronto Raptors': { link: 'teams/TOR/', players: {} },
  'Utah Jazz': { link: 'teams/UTA/', players: {} },
  'Washington Wizards': { link: 'teams/WAS/', players: {} }
};
