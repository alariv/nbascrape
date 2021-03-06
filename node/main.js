import express from 'express';
import http from 'http';
import cors from 'cors';
import fs from 'fs';
import { getTeams } from './getTeams.js';
import { getPlayers } from './getPlayers.js';
import { getLeagueStats } from './getLeagueStats.js';
import { getPlayersStats } from './getPlayersStats.js';
import cheerio from 'cheerio';
import request from 'request';
import { calculateUnitSize } from './calculate.js';

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
        getLeagueStats(leagueStatsHtml)
          .then((data) => {
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
          })
          .finally(() => {
            res.send('OK');
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

app.post('/calculateunitsize', async (req, res) => {
  console.log('landed on /calculateunitsize');
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
    player
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

app.post('/updatePlayersStats/:team', async (req, res) => {
  // console.log('landed on /updatePlayersStats')
  global.teamsWPlayers = testTeams;
  const { team } = req.params;
  const teams = req.body.teams || testTeams;

  try {
    updatePlayersStats(team, teams, res).then((data) => {
      console.log('playerSeasons updated');
      // updatePlayerSeasonStats()
      updatePlayersSeasonStats(data, team).then((data) => {
        console.log('players seasons data fetched');
        // console.log(data[team].players['LeBron James'].playerData['2021-22']);
        res.send(JSON.stringify(data));
      });
    });
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

const updatePlayersSeasonStats = (test, teamName) => {
  console.log('updating players season stats');
  console.log(Object.keys(test[teamName].players).length);
  return new Promise((resolve) => {
    let playerCounter = 0;
    const playersCount = Object.keys(test[teamName].players).length;
    const maxSeasons = 3;
    let requestedPlayers = [];
    Object.keys(test[teamName].players).map((player) => {
      var seasonCounter = 0;
      playerCounter += 1;

      Object.keys(test[teamName].players[player].playerData)
        .reverse()
        .map((playerSeason, idx) => {
          if (idx <= maxSeasons) {
            // console.log(
            //   `getting player ${player} data for season ${playerSeason} from link ${test[teamName].players[player].playerData[playerSeason].link}`
            // );

            request(
              {
                method: 'GET',
                url:
                  baseUrl +
                  test[teamName].players[player].playerData[
                    playerSeason
                  ].link.replace('/', '')
              },
              (err, response, body) => {
                seasonCounter += 1;
                !requestedPlayers.includes(player) &&
                  requestedPlayers.push(player);
                playerCounter = requestedPlayers.length;
                console.log(
                  `GOT player ${player} data for season ${playerSeason} from link ${test[teamName].players[player].playerData[playerSeason].link}`
                ); //   console.error(err)
                //   console.log(response)
                // console.log(body)
                if (!body || typeof body !== 'string') return;
                let $ = cheerio.load(body);
                let rows = $('#pgl_basic').find('tr');
                let playerData = {};
                $(rows).each(function (i, row) {
                  if ($(row).find('td[data-stat=game_season]').text().length) {
                    playerData[i] = {
                      date: $(row)
                        .find('td[data-stat=date_game]')
                        .find('a')
                        .text(),
                      opponent: $(row)
                        .find('td[data-stat=opp_id]')
                        .find('a')
                        .text(),
                      result: $(row)
                        .find('td[data-stat=game_result]')
                        .find('a')
                        .text(),
                      mp: $(row).find('td[data-stat=mp]').text(),
                      fg3: $(row).find('td[data-stat=fg3]').text(),
                      trb: $(row).find('td[data-stat=trb]').text(),
                      ast: $(row).find('td[data-stat=ast]').text(),
                      stl: $(row).find('td[data-stat=stl]').text(),
                      blk: $(row).find('td[data-stat=blk]').text(),
                      tov: $(row).find('td[data-stat=tov]').text(),
                      pts: $(row).find('td[data-stat=pts]').text()
                    };
                  }
                });
                test[teamName].players[player].playerData[playerSeason] = {
                  ...test[teamName].players[player].playerData[playerSeason],
                  data: playerData
                };
                console.log('player:', player, playerData);
                if (
                  playerCounter == playersCount &&
                  seasonCounter == maxSeasons
                ) {
                  console.log('resolving');
                  resolve(test);
                } else {
                  console.log(`playerCount ${playerCounter}/${playersCount}`);
                  console.log(`seasonCount ${seasonCounter}`);
                }
              }
            );
          }
        });
    });
  });
};

const updatePlayersStats = (team, teams, res) => {
  console.log('UPDATE PLAYERS STATS');
  console.log('updating for', team);
  // console.log(global.teamsWPlayers);

  // let teamObj = { [team]: global.teamsWPlayers[team] };
  let teamObj = { [team]: teams[team] };

  return new Promise((resolve) => {
    // getPlayersStats({ team: global.teamsWPlayers[team] }, baseUrl).then(
    getPlayersStats(teamObj, baseUrl).then((data) => {
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
      resolve(data);
    });
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
  'Atlanta Hawks': {
    link: 'teams/ATL/',
    players: {
      'Delon Wright': { link: 'players/w/wrighde01.html', pos: 'SG' },
      'Trae Young': { link: 'players/y/youngtr01.html', pos: 'PG' },
      'Kevin Huerter': { link: 'players/h/huertke01.html', pos: 'SG' },
      'Clint Capela': { link: 'players/c/capelca01.html', pos: 'C' },
      'Danilo Gallinari': { link: 'players/g/gallida01.html', pos: 'PF' },
      'Bogdan Bogdanovi??': { link: 'players/b/bogdabo01.html', pos: 'SG' },
      'Lou Williams': { link: 'players/w/willilo02.html', pos: 'PG' },
      'John Collins': { link: 'players/c/collijo01.html', pos: 'PF' },
      "De'Andre Hunter": { link: 'players/h/huntede01.html', pos: 'SF' },
      'Timoth?? Luwawu-Cabarrot': {
        link: 'players/l/luwawti01.html',
        pos: 'SF'
      },
      'Onyeka Okongwu': { link: 'players/o/okongon01.html', pos: 'C' },
      'Gorgui Dieng': { link: 'players/d/dienggo01.html', pos: 'C' },
      'Skylar Mays': { link: 'players/m/mayssk01.html', pos: 'SG' },
      'Jalen Johnson': { link: 'players/j/johnsja05.html', pos: 'PF' },
      'Kevin Knox': { link: 'players/k/knoxke01.html', pos: 'SF' },
      'Sharife Cooper': { link: 'players/c/coopesh01.html', pos: 'PG' }
    },
    'Jalen Johnson': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/j/johnsja05/gamelog/2022' },
        Career: {}
      }
    },
    'Sharife Cooper': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/c/coopesh01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Boston Celtics': {
    link: 'teams/BOS/',
    players: {
      'Grant Williams': { link: 'players/w/willigr01.html', pos: 'PF' },
      'Jayson Tatum': { link: 'players/t/tatumja01.html', pos: 'SF' },
      'Marcus Smart': { link: 'players/s/smartma01.html', pos: 'PG' },
      'Payton Pritchard': { link: 'players/p/pritcpa01.html', pos: 'SG' },
      'Al Horford': { link: 'players/h/horfoal01.html', pos: 'C' },
      'Jaylen Brown': { link: 'players/b/brownja02.html', pos: 'SF' },
      'Robert Williams': { link: 'players/w/williro04.html', pos: 'C' },
      'Aaron Nesmith': { link: 'players/n/nesmiaa01.html', pos: 'SF' },
      'Derrick White': { link: 'players/w/whitede01.html', pos: 'SG' },
      'Sam Hauser': { link: 'players/h/hausesa01.html', pos: 'SF' },
      'Daniel Theis': { link: 'players/t/theisda01.html', pos: 'C' },
      'Brodric Thomas': { link: 'players/t/thomabr01.html', pos: 'SG' },
      'Luke Kornet': { link: 'players/k/kornelu01.html', pos: 'C' },
      'Malik Fitts': { link: 'players/f/fittsma01.html', pos: 'PF' },
      'Nik Stauskas': { link: 'players/s/stausni01.html', pos: 'SG' },
      'Matt Ryan': { link: 'players/r/ryanma01.html', pos: 'SF' }
    },
    'Matt Ryan': { playerData: {} }
  },
  'Brooklyn Nets': { link: 'teams/NJN/', players: {} },
  'Charlotte Hornets': { link: 'teams/CHA/', players: {} },
  'Chicago Bulls': {
    link: 'teams/CHI/',
    players: {
      'DeMar DeRozan': { link: 'players/d/derozde01.html', pos: 'PF' },
      'Ayo Dosunmu': { link: 'players/d/dosunay01.html', pos: 'SG' },
      'Nikola Vu??evi??': { link: 'players/v/vucevni01.html', pos: 'C' },
      'Zach LaVine': { link: 'players/l/lavinza01.html', pos: 'SF' },
      'Troy Brown Jr.': { link: 'players/b/browntr01.html', pos: 'SF' },
      'Javonte Green': { link: 'players/g/greenja02.html', pos: 'SF' },
      'Coby White': { link: 'players/w/whiteco01.html', pos: 'PG' },
      'Tony Bradley': { link: 'players/b/bradlto01.html', pos: 'C' },
      'Derrick Jones Jr.': { link: 'players/j/jonesde02.html', pos: 'PF' },
      'Alex Caruso': { link: 'players/c/carusal01.html', pos: 'SG' },
      'Matt Thomas': { link: 'players/t/thomama02.html', pos: 'SG' },
      'Lonzo Ball': { link: 'players/b/balllo01.html', pos: 'PG' },
      'Tristan Thompson': { link: 'players/t/thomptr01.html', pos: 'PF' },
      'Tyler Cook': { link: 'players/c/cookty01.html', pos: 'PF' },
      'Patrick Williams': { link: 'players/w/willipa01.html', pos: 'PF' },
      'Malcolm Hill': { link: 'players/h/hillma01.html', pos: 'SF' },
      'Marko Simonovic': { link: 'players/s/simonma01.html', pos: 'C' }
    },
    'Patrick Williams': {
      playerData: {
        Season: {},
        '2020-21': { link: '/players/w/willipa01/gamelog/2021' },
        '2021-22': { link: '/players/w/willipa01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Cleveland Cavaliers': {
    link: 'teams/CLE/',
    players: {
      'Kevin Love': { link: 'players/l/loveke01.html', pos: 'PF' },
      'Evan Mobley': { link: 'players/m/mobleev01.html', pos: 'PF' },
      'Darius Garland': { link: 'players/g/garlada01.html', pos: 'PG' },
      'Isaac Okoro': { link: 'players/o/okorois01.html', pos: 'SF' },
      'Cedi Osman': { link: 'players/o/osmande01.html', pos: 'SF' },
      'Lamar Stevens': { link: 'players/s/stevela01.html', pos: 'PF' },
      'Lauri Markkanen': { link: 'players/m/markkla01.html', pos: 'PF' },
      'Jarrett Allen': { link: 'players/a/allenja01.html', pos: 'C' },
      'Dean Wade': { link: 'players/w/wadede01.html', pos: 'PF' },
      'Dylan Windler': { link: 'players/w/windldy01.html', pos: 'SF' },
      'Brandon Goodwin': { link: 'players/g/goodwbr01.html', pos: 'PG' },
      'Ed Davis': { link: 'players/d/davised01.html', pos: 'C' },
      'Rajon Rondo': { link: 'players/r/rondora01.html', pos: 'PG' },
      'Caris LeVert': { link: 'players/l/leverca01.html', pos: 'SG' },
      'Moses Brown': { link: 'players/b/brownmo01.html', pos: 'C' },
      'Collin Sexton': { link: 'players/s/sextoco01.html', pos: 'SG' }
    }
  },
  'Dallas Mavericks': {
    link: 'teams/DAL/',
    players: {
      'Dwight Powell': { link: 'players/p/poweldw01.html', pos: 'C' },
      'Dorian Finney-Smith': { link: 'players/f/finnedo01.html', pos: 'PF' },
      'Jalen Brunson': { link: 'players/b/brunsja01.html', pos: 'PG' },
      'Reggie Bullock': { link: 'players/b/bullore01.html', pos: 'SF' },
      'Josh Green': { link: 'players/g/greenjo02.html', pos: 'SG' },
      'Luka Don??i??': { link: 'players/d/doncilu01.html', pos: 'PG' },
      'Maxi Kleber': { link: 'players/k/klebima01.html', pos: 'PF' },
      'Frank Ntilikina': { link: 'players/n/ntilila01.html', pos: 'PG' },
      'Sterling Brown': { link: 'players/b/brownst02.html', pos: 'SG' },
      'Tim Hardaway Jr.': { link: 'players/h/hardati02.html', pos: 'SG' },
      'Trey Burke': { link: 'players/b/burketr01.html', pos: 'PG' },
      'Marquese Chriss': { link: 'players/c/chrisma01.html', pos: 'PF' },
      'Spencer Dinwiddie': { link: 'players/d/dinwisp01.html', pos: 'PG' },
      'Boban Marjanovi??': { link: 'players/m/marjabo01.html', pos: 'C' },
      'D??vis Bert??ns': { link: 'players/b/bertada01.html', pos: 'PF' },
      'Theo Pinson': { link: 'players/p/pinsoth01.html', pos: 'SF' },
      'Moses Wright': { link: 'players/w/wrighmo01.html', pos: 'PF' }
    }
  },
  'Denver Nuggets': {
    link: 'teams/DEN/',
    players: {
      'Aaron Gordon': { link: 'players/g/gordoaa01.html', pos: 'PF' },
      'Monte Morris': { link: 'players/m/morrimo01.html', pos: 'PG' },
      'Nikola Joki??': { link: 'players/j/jokicni01.html', pos: 'C' },
      'Jeff Green': { link: 'players/g/greenje02.html', pos: 'C' },
      'Will Barton': { link: 'players/b/bartowi01.html', pos: 'SG' },
      'Bones Hyland': { link: 'players/h/hylanbo01.html', pos: 'PG' },
      'JaMychal Green': { link: 'players/g/greenja01.html', pos: 'PF' },
      'Austin Rivers': { link: 'players/r/riverau01.html', pos: 'SG' },
      'Facundo Campazzo': { link: 'players/c/campafa01.html', pos: 'PG' },
      'Davon Reed': { link: 'players/r/reedda01.html', pos: 'SG' },
      'Zeke Nnaji': { link: 'players/n/nnajize01.html', pos: 'PF' },
      'Bryn Forbes': { link: 'players/f/forbebr01.html', pos: 'SG' },
      'DeMarcus Cousins': { link: 'players/c/couside01.html', pos: 'C' },
      'Markus Howard': { link: 'players/h/howarma02.html', pos: 'SG' },
      'Vlatko ??an??ar': { link: 'players/c/cancavl01.html', pos: 'PF' },
      'Michael Porter Jr.': { link: 'players/p/portemi01.html', pos: 'SF' },
      'Jamal Murray': { link: 'players/m/murraja01.html', pos: 'PG' }
    },
    'Bones Hyland': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/h/hylanbo01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Detroit Pistons': {
    link: 'teams/DET/',
    players: {
      'Saddiq Bey': { link: 'players/b/beysa01.html', pos: 'SF' },
      'Isaiah Stewart': { link: 'players/s/stewais01.html', pos: 'C' },
      'Cory Joseph': { link: 'players/j/josepco01.html', pos: 'PG' },
      'Killian Hayes': { link: 'players/h/hayeski01.html', pos: 'PG' },
      'Cade Cunningham': { link: 'players/c/cunnica01.html', pos: 'PG' },
      'Hamidou Diallo': { link: 'players/d/diallha01.html', pos: 'SG' },
      'Frank Jackson': { link: 'players/j/jacksfr01.html', pos: 'PG' },
      'Rodney McGruder': { link: 'players/m/mcgruro01.html', pos: 'SG' },
      'Jerami Grant': { link: 'players/g/grantje01.html', pos: 'PF' },
      'Kelly Olynyk': { link: 'players/o/olynyke01.html', pos: 'C' },
      'Saben Lee': { link: 'players/l/leesa01.html', pos: 'PG' },
      'Luka Garza': { link: 'players/g/garzalu01.html', pos: 'C' },
      'Marvin Bagley III': { link: 'players/b/baglema01.html', pos: 'PF' },
      'Isaiah Livers': { link: 'players/l/liveris01.html', pos: 'SF' },
      'Jamorko Pickett': { link: 'players/p/pickeja01.html', pos: 'PF' },
      'Braxton Key': { link: 'players/k/keybr01.html', pos: 'SF' },
      'Carsen Edwards': { link: 'players/e/edwarca01.html', pos: 'SG' }
    }
  },
  'Golden State Warriors': {
    link: 'teams/GSW/',
    players: {
      'Kevon Looney': { link: 'players/l/looneke01.html', pos: 'C' },
      'Jordan Poole': { link: 'players/p/poolejo01.html', pos: 'SG' },
      'Andrew Wiggins': { link: 'players/w/wiggian01.html', pos: 'SF' },
      'Juan Toscano-Anderson': { link: 'players/t/toscaju01.html', pos: 'SF' },
      'Gary Payton II': { link: 'players/p/paytoga02.html', pos: 'PG' },
      'Nemanja Bjelica': { link: 'players/b/bjeline01.html', pos: 'C' },
      'Jonathan Kuminga': { link: 'players/k/kuminjo01.html', pos: 'SF' },
      'Stephen Curry': { link: 'players/c/curryst01.html', pos: 'PG' },
      'Otto Porter Jr.': { link: 'players/p/porteot01.html', pos: 'PF' },
      'Damion Lee': { link: 'players/l/leeda03.html', pos: 'SG' },
      'Moses Moody': { link: 'players/m/moodymo01.html', pos: 'SG' },
      'Draymond Green': { link: 'players/g/greendr01.html', pos: 'PF' },
      'Chris Chiozza': { link: 'players/c/chiozch01.html', pos: 'PG' },
      'Klay Thompson': { link: 'players/t/thompkl01.html', pos: 'SG' },
      'Andre Iguodala': { link: 'players/i/iguodan01.html', pos: 'SF' },
      'Quinndary Weatherspoon': { link: 'players/w/weathqu01.html', pos: 'SG' },
      'James Wiseman': { link: 'players/w/wisemja01.html', pos: 'C' }
    }
  },
  'Houston Rockets': {
    link: 'teams/HOU/',
    players: {
      'Kenyon Martin Jr.': { link: 'players/m/martike04.html', pos: 'SF' },
      "Jae'Sean Tate": { link: 'players/t/tateja01.html', pos: 'SF' },
      'Josh Christopher': { link: 'players/c/chrisjo01.html', pos: 'SG' },
      'Alperen ??eng??n': { link: 'players/s/sengual01.html', pos: 'C' },
      'Christian Wood': { link: 'players/w/woodch01.html', pos: 'C' },
      'Jalen Green': { link: 'players/g/greenja05.html', pos: 'SG' },
      'Garrison Mathews': { link: 'players/m/mathega01.html', pos: 'SG' },
      'Kevin Porter Jr.': { link: 'players/p/porteke02.html', pos: 'PG' },
      'Eric Gordon': { link: 'players/g/gordoer01.html', pos: 'SG' },
      'David Nwaba': { link: 'players/n/nwabada01.html', pos: 'SF' },
      'Daishen Nix': { link: 'players/n/nixda01.html', pos: 'SG' },
      'Usman Garuba': { link: 'players/g/garubus01.html', pos: 'PF' },
      'Dennis Schr??der': { link: 'players/s/schrode01.html', pos: 'PG' },
      'Bruno Fernando': { link: 'players/f/fernabr01.html', pos: 'C' },
      'Trevelin Queen': { link: 'players/q/queentr01.html', pos: 'SG' },
      'John Wall': { link: 'players/w/walljo01.html', pos: 'PG' },
      'Anthony Lamb': { link: 'players/l/lamban01.html', pos: 'SF' }
    },
    'Usman Garuba': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/g/garubus01/gamelog/2022' },
        Career: {}
      }
    },
    'Jalen Green': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/g/greenja05/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Indiana Pacers': {
    link: 'teams/IND/',
    players: {
      'Oshae Brissett': { link: 'players/b/brissos01.html', pos: 'SF' },
      'Chris Duarte': { link: 'players/d/duartch01.html', pos: 'SG' },
      'Goga Bitadze': { link: 'players/b/bitadgo01.html', pos: 'C' },
      'Duane Washington Jr.': { link: 'players/w/washidu02.html', pos: 'PG' },
      'Myles Turner': { link: 'players/t/turnemy01.html', pos: 'C' },
      'Lance Stephenson': { link: 'players/s/stephla01.html', pos: 'SG' },
      'Malcolm Brogdon': { link: 'players/b/brogdma01.html', pos: 'PG' },
      'Isaiah Jackson': { link: 'players/j/jacksis01.html', pos: 'PF' },
      'Terry Taylor': { link: 'players/t/taylote01.html', pos: 'SG' },
      'T.J. McConnell': { link: 'players/m/mccontj01.html', pos: 'PG' },
      'Buddy Hield': { link: 'players/h/hieldbu01.html', pos: 'SG' },
      'Tyrese Haliburton': { link: 'players/h/halibty01.html', pos: 'PG' },
      'Jalen Smith': { link: 'players/s/smithja04.html', pos: 'PF' },
      'Nate Hinton': { link: 'players/h/hintona01.html', pos: 'SG' },
      'Ricky Rubio': { link: 'players/r/rubiori01.html', pos: 'PG' },
      'Gabe York': { link: 'players/y/yorkga01.html', pos: 'SG' },
      'T.J. Warren': { link: 'players/w/warretj01.html', pos: 'SF' }
    },
    'Terry Taylor': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/t/taylote01/gamelog/2022' },
        Career: {}
      }
    },
    'Gabe York': { playerData: {} }
  },
  'Los Angeles Clippers': {
    link: 'teams/LAC/',
    players: {
      'Terance Mann': { link: 'players/m/mannte01.html', pos: 'SF' },
      'Reggie Jackson': { link: 'players/j/jacksre01.html', pos: 'SG' },
      'Ivica Zubac': { link: 'players/z/zubaciv01.html', pos: 'C' },
      'Luke Kennard': { link: 'players/k/kennalu01.html', pos: 'SG' },
      'Amir Coffey': { link: 'players/c/coffeam01.html', pos: 'SG' },
      'Isaiah Hartenstein': { link: 'players/h/harteis01.html', pos: 'C' },
      'Nicolas Batum': { link: 'players/b/batumni01.html', pos: 'PF' },
      'Marcus Morris': { link: 'players/m/morrima03.html', pos: 'PF' },
      'Brandon Boston Jr.': { link: 'players/b/bostobr01.html', pos: 'SG' },
      'Paul George': { link: 'players/g/georgpa01.html', pos: 'SF' },
      'Robert Covington': { link: 'players/c/covinro01.html', pos: 'SF' },
      'Jay Scrubb': { link: 'players/s/scrubja01.html', pos: 'SG' },
      'Rodney Hood': { link: 'players/h/hoodro01.html', pos: 'SG' },
      'Xavier Moon': { link: 'players/m/moonxa01.html', pos: 'SG' },
      'Norman Powell': { link: 'players/p/powelno01.html', pos: 'SG' },
      'Jason Preston': { link: 'players/p/prestja01.html', pos: 'PG' },
      'Kawhi Leonard': { link: 'players/l/leonaka01.html', pos: 'SF' }
    },
    'Jason Preston': { playerData: {} }
  },
  'Los Angeles Lakers': {
    link: 'teams/LAL/',
    players: {
      'Russell Westbrook': { link: 'players/w/westbru01.html', pos: 'PG' },
      'Malik Monk': { link: 'players/m/monkma01.html', pos: 'SG' },
      'Carmelo Anthony': { link: 'players/a/anthoca01.html', pos: 'PF' },
      'Avery Bradley': { link: 'players/b/bradlav01.html', pos: 'SG' },
      'Austin Reaves': { link: 'players/r/reaveau01.html', pos: 'SG' },
      'Dwight Howard': { link: 'players/h/howardw01.html', pos: 'C' },
      'Talen Horton-Tucker': { link: 'players/h/hortota01.html', pos: 'SG' },
      'LeBron James': { link: 'players/j/jamesle01.html', pos: 'SF' },
      'Stanley Johnson': { link: 'players/j/johnsst04.html', pos: 'PF' },
      'Wayne Ellington': { link: 'players/e/ellinwa01.html', pos: 'SG' },
      'Anthony Davis': { link: 'players/d/davisan02.html', pos: 'C' },
      'Kent Bazemore': { link: 'players/b/bazemke01.html', pos: 'SF' },
      'D.J. Augustin': { link: 'players/a/augusdj01.html', pos: 'PG' },
      'Wenyen Gabriel': { link: 'players/g/gabriwe01.html', pos: 'PF' },
      'Mason Jones': { link: 'players/j/jonesma05.html', pos: 'SG' },
      'Kendrick Nunn': { link: 'players/n/nunnke01.html', pos: 'PG' }
    }
  },
  'Memphis Grizzlies': {
    link: 'teams/MEM/',
    players: {
      'Jaren Jackson Jr.': { link: 'players/j/jacksja02.html', pos: 'PF' },
      'Desmond Bane': { link: 'players/b/banede01.html', pos: 'SF' },
      'Steven Adams': { link: 'players/a/adamsst01.html', pos: 'C' },
      'Tyus Jones': { link: 'players/j/jonesty01.html', pos: 'PG' },
      "De'Anthony Melton": { link: 'players/m/meltode01.html', pos: 'SG' },
      'John Konchar': { link: 'players/k/konchjo01.html', pos: 'SG' },
      'Kyle Anderson': { link: 'players/a/anderky01.html', pos: 'PF' },
      'Brandon Clarke': { link: 'players/c/clarkbr01.html', pos: 'PF' },
      'Ziaire Williams': { link: 'players/w/willizi02.html', pos: 'SF' },
      'Ja Morant': { link: 'players/m/moranja01.html', pos: 'PG' },
      'Xavier Tillman Sr.': { link: 'players/t/tillmxa01.html', pos: 'PF' },
      'Killian Tillie': { link: 'players/t/tilliki02.html', pos: 'C' },
      'Jarrett Culver': { link: 'players/c/culveja01.html', pos: 'SG' },
      'Dillon Brooks': { link: 'players/b/brookdi01.html', pos: 'SF' },
      'Santi Aldama': { link: 'players/a/aldamsa01.html', pos: 'PF' },
      'Yves Pons': { link: 'players/p/ponsyv01.html', pos: 'SF' },
      'Sam Merrill': { link: 'players/m/merrisa01.html', pos: 'SG' },
      'Tyrell Terry': { link: 'players/t/terryty01.html', pos: 'PG' }
    },
    'Ziaire Williams': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/willizi02/gamelog/2022' },
        Career: {}
      }
    },
    'Yves Pons': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/p/ponsyv01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Miami Heat': {
    link: 'teams/MIA/',
    players: {
      'Duncan Robinson': { link: 'players/r/robindu01.html', pos: 'SG' },
      'P.J. Tucker': { link: 'players/t/tuckepj01.html', pos: 'PF' },
      'Max Strus': { link: 'players/s/strusma01.html', pos: 'SF' },
      'Gabe Vincent': { link: 'players/v/vincega01.html', pos: 'PG' },
      'Dewayne Dedmon': { link: 'players/d/dedmode01.html', pos: 'C' },
      'Tyler Herro': { link: 'players/h/herroty01.html', pos: 'SG' },
      'Kyle Lowry': { link: 'players/l/lowryky01.html', pos: 'PG' },
      'Caleb Martin': { link: 'players/m/martica02.html', pos: 'SF' },
      'Jimmy Butler': { link: 'players/b/butleji01.html', pos: 'SF' },
      'Bam Adebayo': { link: 'players/a/adebaba01.html', pos: 'C' },
      'Omer Yurtseven': { link: 'players/y/yurtsom01.html', pos: 'C' },
      'Haywood Highsmith': { link: 'players/h/highsha01.html', pos: 'SF' },
      'Markieff Morris': { link: 'players/m/morrima02.html', pos: 'PF' },
      'Udonis Haslem': { link: 'players/h/hasleud01.html', pos: 'C' },
      'Victor Oladipo': { link: 'players/o/oladivi01.html', pos: 'SG' },
      'Javonte Smart': { link: 'players/s/smartja01.html', pos: 'PG' },
      'Mychal Mulder': { link: 'players/m/muldemy01.html', pos: 'PG' }
    }
  },
  'Milwaukee Bucks': {
    link: 'teams/MIL/',
    players: {
      'Bobby Portis': { link: 'players/p/portibo01.html', pos: 'C' },
      'Giannis Antetokounmpo': { link: 'players/a/antetgi01.html', pos: 'PF' },
      'Khris Middleton': { link: 'players/m/middlkh01.html', pos: 'SF' },
      'Jrue Holiday': { link: 'players/h/holidjr01.html', pos: 'PG' },
      'Grayson Allen': { link: 'players/a/allengr01.html', pos: 'SG' },
      'Pat Connaughton': { link: 'players/c/connapa01.html', pos: 'SG' },
      'Jordan Nwora': { link: 'players/n/nworajo01.html', pos: 'SF' },
      'George Hill': { link: 'players/h/hillge01.html', pos: 'SG' },
      'Wesley Matthews': { link: 'players/m/matthwe02.html', pos: 'SG' },
      'Thanasis Antetokounmpo': { link: 'players/a/antetth01.html', pos: 'SF' },
      'Sandro Mamukelashvili': { link: 'players/m/mamuksa01.html', pos: 'PF' },
      'Serge Ibaka': { link: 'players/i/ibakase01.html', pos: 'PF' },
      'Jevon Carter': { link: 'players/c/carteje01.html', pos: 'PG' },
      'Lindell Wigginton': { link: 'players/w/wiggili01.html', pos: 'PG' },
      'Brook Lopez': { link: 'players/l/lopezbr01.html', pos: 'C' },
      'Luca Vildoza': { link: 'players/v/vildolu01.html', pos: 'PG' }
    },
    'Luca Vildoza': { playerData: {} }
  },
  'Minnesota Timberwolves': {
    link: 'teams/MIN/',
    players: {
      'Malik Beasley': { link: 'players/b/beaslma01.html', pos: 'SG' },
      'Naz Reid': { link: 'players/r/reidna01.html', pos: 'C' },
      'Karl-Anthony Towns': { link: 'players/t/townska01.html', pos: 'C' },
      'Jarred Vanderbilt': { link: 'players/v/vandeja01.html', pos: 'PF' },
      'Anthony Edwards': { link: 'players/e/edwaran01.html', pos: 'SG' },
      'Jaden McDaniels': { link: 'players/m/mcdanja02.html', pos: 'PF' },
      'Taurean Prince': { link: 'players/p/princta02.html', pos: 'PF' },
      "D'Angelo Russell": { link: 'players/r/russeda01.html', pos: 'PG' },
      'Jaylen Nowell': { link: 'players/n/nowelja01.html', pos: 'SG' },
      'Jordan McLaughlin': { link: 'players/m/mclaujo01.html', pos: 'PG' },
      'Patrick Beverley': { link: 'players/b/beverpa01.html', pos: 'PG' },
      'Josh Okogie': { link: 'players/o/okogijo01.html', pos: 'SG' },
      'Nathan Knight': { link: 'players/k/knighna01.html', pos: 'PF' },
      'Leandro Bolmaro': { link: 'players/b/bolmale01.html', pos: 'SF' },
      'Jake Layman': { link: 'players/l/laymaja01.html', pos: 'SF' },
      'McKinley Wright IV': { link: 'players/w/wrighmc01.html', pos: 'PG' },
      'Greg Monroe': { link: 'players/m/monrogr01.html', pos: 'C' }
    },
    'Jaden McDaniels': {
      playerData: {
        Season: {},
        '2020-21': { link: '/players/m/mcdanja02/gamelog/2021' },
        '2021-22': { link: '/players/m/mcdanja02/gamelog/2022' },
        Career: {}
      }
    }
  },
  'New Orleans Pelicans': { link: 'teams/NOH/', players: {} },
  'New York Knicks': {
    link: 'teams/NYK/',
    players: {
      'Alec Burks': { link: 'players/b/burksal01.html', pos: 'SG' },
      'Evan Fournier': { link: 'players/f/fournev01.html', pos: 'SG' },
      'Immanuel Quickley': { link: 'players/q/quickim01.html', pos: 'PG' },
      'Julius Randle': { link: 'players/r/randlju01.html', pos: 'PF' },
      'Mitchell Robinson': { link: 'players/r/robinmi01.html', pos: 'C' },
      'Obi Toppin': { link: 'players/t/toppiob01.html', pos: 'PF' },
      'RJ Barrett': { link: 'players/b/barrerj01.html', pos: 'SF' },
      'Taj Gibson': { link: 'players/g/gibsota01.html', pos: 'C' },
      'Quentin Grimes': { link: 'players/g/grimequ01.html', pos: 'SG' },
      'Miles McBride': { link: 'players/m/mcbrimi01.html', pos: 'PG' },
      'Jericho Sims': { link: 'players/s/simsje01.html', pos: 'PF' },
      'Kemba Walker': { link: 'players/w/walkeke02.html', pos: 'PG' },
      'Derrick Rose': { link: 'players/r/rosede01.html', pos: 'PG' },
      'Nerlens Noel': { link: 'players/n/noelne01.html', pos: 'C' },
      'Cam Reddish': { link: 'players/r/reddica01.html', pos: 'SF' },
      'Ryan Arcidiacono': { link: 'players/a/arcidry01.html', pos: 'PG' },
      'Feron Hunt': { link: 'players/h/huntfe01.html', pos: 'SF' }
    },
    'Miles McBride': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/m/mcbrimi01/gamelog/2022' },
        Career: {}
      }
    },
    'Jericho Sims': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/s/simsje01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Oklahoma City Thunder': {
    link: 'teams/OKC/',
    players: {
      'Darius Bazley': { link: 'players/b/bazleda01.html', pos: 'PF' },
      'Aleksej Pokusevski': { link: 'players/p/pokusal01.html', pos: 'PF' },
      'Tre Mann': { link: 'players/m/manntr01.html', pos: 'PG' },
      'Shai Gilgeous-Alexander': {
        link: 'players/g/gilgesh01.html',
        pos: 'PG'
      },
      'Josh Giddey': { link: 'players/g/giddejo01.html', pos: 'SG' },
      'Luguentz Dort': { link: 'players/d/dortlu01.html', pos: 'SF' },
      'Th??o Maledon': { link: 'players/m/maledth01.html', pos: 'PG' },
      'Aaron Wiggins': { link: 'players/w/wiggiaa01.html', pos: 'SG' },
      'Jeremiah Robinson-Earl': { link: 'players/r/robinje02.html', pos: 'C' },
      'Kenrich Williams': { link: 'players/w/willike04.html', pos: 'SF' },
      'Ty Jerome': { link: 'players/j/jeromty01.html', pos: 'SG' },
      'Isaiah Roby': { link: 'players/r/robyis01.html', pos: 'PF' },
      'Mike Muscala': { link: 'players/m/muscami01.html', pos: 'C' },
      'Derrick Favors': { link: 'players/f/favorde01.html', pos: 'C' },
      'Vit Krejci': { link: 'players/k/krejcvi01.html', pos: 'SG' },
      'Lindy Waters III': { link: 'players/w/waterli01.html', pos: 'SG' },
      'Gabriel Deck': { link: 'players/d/deckga01.html', pos: 'PF' },
      'Jaylen Hoard': { link: 'players/h/hoardja01.html', pos: 'SF' },
      'Georgios Kalaitzakis': { link: 'players/k/kalaige01.html', pos: 'SF' },
      'Zavier Simpson': { link: 'players/s/simpsza01.html', pos: 'PG' },
      'Melvin Frazier': { link: 'players/f/frazime01.html', pos: 'SG' }
    },
    'Tre Mann': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/m/manntr01/gamelog/2022' },
        Career: {}
      }
    },
    'Aaron Wiggins': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/wiggiaa01/gamelog/2022' },
        Career: {}
      }
    },
    'Josh Giddey': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/g/giddejo01/gamelog/2022' },
        Career: {}
      }
    },
    'Lindy Waters III': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/waterli01/gamelog/2022' },
        Career: {}
      }
    },
    'Vit Krejci': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/k/krejcvi01/gamelog/2022' },
        Career: {}
      }
    },
    'Zavier Simpson': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/s/simpsza01/gamelog/2022' },
        Career: {}
      }
    },
    'Aleksej Pokusevski': {
      playerData: {
        Season: {},
        '2020-21': { link: '/players/p/pokusal01/gamelog/2021' },
        '2021-22': { link: '/players/p/pokusal01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Orlando Magic': {
    link: 'teams/ORL/',
    players: {
      'Franz Wagner': { link: 'players/w/wagnefr01.html', pos: 'SF' },
      'Mo Bamba': { link: 'players/b/bambamo01.html', pos: 'C' },
      'Chuma Okeke': { link: 'players/o/okekech01.html', pos: 'PF' },
      'Cole Anthony': { link: 'players/a/anthoco01.html', pos: 'PG' },
      'Terrence Ross': { link: 'players/r/rosste01.html', pos: 'SG' },
      'R.J. Hampton': { link: 'players/h/hamptrj01.html', pos: 'SG' },
      'Wendell Carter Jr.': { link: 'players/c/cartewe01.html', pos: 'C' },
      'Moritz Wagner': { link: 'players/w/wagnemo01.html', pos: 'C' },
      'Gary Harris': { link: 'players/h/harriga01.html', pos: 'SG' },
      'Jalen Suggs': { link: 'players/s/suggsja01.html', pos: 'PG' },
      'Ignas Brazdeikis': { link: 'players/b/brazdig01.html', pos: 'SF' },
      'Admiral Schofield': { link: 'players/s/schofad01.html', pos: 'SF' },
      'Robin Lopez': { link: 'players/l/lopezro01.html', pos: 'C' },
      'Markelle Fultz': { link: 'players/f/fultzma01.html', pos: 'PG' },
      'Devin Cannady': { link: 'players/c/cannade01.html', pos: 'PG' },
      'Jonathan Isaac': { link: 'players/i/isaacjo01.html', pos: 'PF' },
      'Bol Bol': { link: 'players/b/bolbo01.html', pos: 'PF' }
    },
    'Devin Cannady': {
      playerData: {
        Season: {},
        '2020-21': { link: '/players/c/cannade01/gamelog/2021' },
        '2021-22': { link: '/players/c/cannade01/gamelog/2022' },
        Career: {}
      }
    },
    'Franz Wagner': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/wagnefr01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Philadelphia 76ers': {
    link: 'teams/PHI/',
    players: {
      'Georges Niang': { link: 'players/n/niangge01.html', pos: 'PF' },
      'Tyrese Maxey': { link: 'players/m/maxeyty01.html', pos: 'PG' },
      'Tobias Harris': { link: 'players/h/harrito02.html', pos: 'PF' },
      'Joel Embiid': { link: 'players/e/embiijo01.html', pos: 'C' },
      'Furkan Korkmaz': { link: 'players/k/korkmfu01.html', pos: 'SG' },
      'Matisse Thybulle': { link: 'players/t/thybuma01.html', pos: 'SG' },
      'Danny Green': { link: 'players/g/greenda02.html', pos: 'SF' },
      'Shake Milton': { link: 'players/m/miltosh01.html', pos: 'PG' },
      'Isaiah Joe': { link: 'players/j/joeis01.html', pos: 'SG' },
      'Paul Reed': { link: 'players/r/reedpa01.html', pos: 'C' },
      'Charles Bassey': { link: 'players/b/bassech01.html', pos: 'PF' },
      'James Harden': { link: 'players/h/hardeja01.html', pos: 'SG' },
      'Charlie Brown Jr.': { link: 'players/b/brownch02.html', pos: 'SG' },
      'DeAndre Jordan': { link: 'players/j/jordade01.html', pos: 'C' },
      'Myles Powell': { link: 'players/p/powelmy01.html', pos: 'PG' },
      'Paul Millsap': { link: 'players/m/millspa01.html', pos: 'PF' },
      'Jaden Springer': { link: 'players/s/sprinja01.html', pos: 'SG' }
    }
  },
  'Phoenix Suns': {
    link: 'teams/PHO/',
    players: {
      'Mikal Bridges': { link: 'players/b/bridgmi01.html', pos: 'SF' },
      'JaVale McGee': { link: 'players/m/mcgeeja01.html', pos: 'C' },
      'Devin Booker': { link: 'players/b/bookede01.html', pos: 'SG' },
      'Landry Shamet': { link: 'players/s/shamela01.html', pos: 'SG' },
      'Jae Crowder': { link: 'players/c/crowdja01.html', pos: 'PF' },
      'Chris Paul': { link: 'players/p/paulch01.html', pos: 'PG' },
      'Cameron Johnson': { link: 'players/j/johnsca02.html', pos: 'PF' },
      'Deandre Ayton': { link: 'players/a/aytonde01.html', pos: 'C' },
      'Cameron Payne': { link: 'players/p/payneca01.html', pos: 'PG' },
      'Elfrid Payton': { link: 'players/p/paytoel01.html', pos: 'PG' },
      'Ish Wainright': { link: 'players/w/wainris01.html', pos: 'PF' },
      'Bismack Biyombo': { link: 'players/b/biyombi01.html', pos: 'C' },
      'Torrey Craig': { link: 'players/c/craigto01.html', pos: 'SF' },
      'Aaron Holiday': { link: 'players/h/holidaa01.html', pos: 'PG' },
      'Gabriel Lundberg': { link: 'players/l/lundbga01.html', pos: 'SG' },
      'Dario ??ari??': { link: 'players/s/saricda01.html', pos: 'C' }
    }
  },
  'Portland Trail Blazers': {
    link: 'teams/POR/',
    players: {
      'Ben McLemore': { link: 'players/m/mclembe01.html', pos: 'SG' },
      'Anfernee Simons': { link: 'players/s/simonan01.html', pos: 'SG' },
      'CJ Elleby': { link: 'players/e/ellebcj01.html', pos: 'SF' },
      'Jusuf Nurki??': { link: 'players/n/nurkiju01.html', pos: 'C' },
      'Trendon Watford': { link: 'players/w/watfotr01.html', pos: 'SF' },
      'Greg Brown III': { link: 'players/b/browngr01.html', pos: 'SF' },
      'Nassir Little': { link: 'players/l/littlna01.html', pos: 'SF' },
      'Keljin Blevins': { link: 'players/b/blevike01.html', pos: 'SF' },
      'Damian Lillard': { link: 'players/l/lillada01.html', pos: 'PG' },
      'Brandon Williams': { link: 'players/w/willibr03.html', pos: 'PG' },
      'Drew Eubanks': { link: 'players/e/eubandr01.html', pos: 'C' },
      'Keon Johnson': { link: 'players/j/johnske07.html', pos: 'SG' },
      'Elijah Hughes': { link: 'players/h/hugheel01.html', pos: 'SG' },
      'Kris Dunn': { link: 'players/d/dunnkr01.html', pos: 'PG' },
      'Josh Hart': { link: 'players/h/hartjo01.html', pos: 'SF' },
      'Justise Winslow': { link: 'players/w/winslju01.html', pos: 'SF' },
      'Reggie Perry': { link: 'players/p/perryre01.html', pos: 'PF' },
      'Didi Louzada': { link: 'players/l/louzama01.html', pos: 'SG' },
      'Joe Ingles': { link: 'players/i/inglejo01.html', pos: 'SF' },
      'Eric Bledsoe': { link: 'players/b/bledser01.html', pos: 'PG' }
    },
    'Trendon Watford': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/watfotr01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Sacramento Kings': {
    link: 'teams/SAC/',
    players: {
      'Harrison Barnes': { link: 'players/b/barneha02.html', pos: 'PF' },
      'Davion Mitchell': { link: 'players/m/mitchda01.html', pos: 'PG' },
      "De'Aaron Fox": { link: 'players/f/foxde01.html', pos: 'PG' },
      'Chimezie Metu': { link: 'players/m/metuch01.html', pos: 'C' },
      'Damian Jones': { link: 'players/j/jonesda03.html', pos: 'C' },
      'Maurice Harkless': { link: 'players/h/harklma01.html', pos: 'SF' },
      'Richaun Holmes': { link: 'players/h/holmeri01.html', pos: 'C' },
      'Alex Len': { link: 'players/l/lenal01.html', pos: 'C' },
      'Terence Davis': { link: 'players/d/daviste02.html', pos: 'SG' },
      'Donte DiVincenzo': { link: 'players/d/divindo01.html', pos: 'SG' },
      'Justin Holiday': { link: 'players/h/holidju01.html', pos: 'SG' },
      'Trey Lyles': { link: 'players/l/lylestr01.html', pos: 'PF' },
      'Domantas Sabonis': { link: 'players/s/sabondo01.html', pos: 'PF' },
      'Jeremy Lamb': { link: 'players/l/lambje01.html', pos: 'SG' },
      'Neemias Queta': { link: 'players/q/quetane01.html', pos: 'C' },
      'Josh Jackson': { link: 'players/j/jacksjo02.html', pos: 'SF' }
    }
  },
  'San Antonio Spurs': {
    link: 'teams/SAS/',
    players: {
      'Keldon Johnson': { link: 'players/j/johnske04.html', pos: 'SF' },
      'Devin Vassell': { link: 'players/v/vassede01.html', pos: 'SF' },
      'Lonnie Walker IV': { link: 'players/w/walkelo01.html', pos: 'SG' },
      'Dejounte Murray': { link: 'players/m/murrade01.html', pos: 'PG' },
      'Jakob Poeltl': { link: 'players/p/poeltja01.html', pos: 'C' },
      'Tre Jones': { link: 'players/j/jonestr01.html', pos: 'PG' },
      'Keita Bates-Diop': { link: 'players/b/bateske01.html', pos: 'SF' },
      'Jock Landale': { link: 'players/l/landajo01.html', pos: 'C' },
      'Doug McDermott': { link: 'players/m/mcderdo01.html', pos: 'PF' },
      'Joshua Primo': { link: 'players/p/primojo01.html', pos: 'SG' },
      'Joe Wieskamp': { link: 'players/w/wieskjo01.html', pos: 'SG' },
      'Zach Collins': { link: 'players/c/colliza01.html', pos: 'PF' },
      'Josh Richardson': { link: 'players/r/richajo01.html', pos: 'SG' },
      'Devontae Cacok': { link: 'players/c/cacokde01.html', pos: 'PF' },
      'Romeo Langford': { link: 'players/l/langfro01.html', pos: 'SG' },
      'D. J. Stewart Jr.': { link: 'players/s/stewadj02.html', pos: 'SG' },
      'Robert Woodard II': { link: 'players/w/woodaro01.html', pos: 'SF' }
    },
    'D. J. Stewart Jr.': { playerData: {} },
    'Joe Wieskamp': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/w/wieskjo01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Toronto Raptors': {
    link: 'teams/TOR/',
    players: {
      'Chris Boucher': { link: 'players/b/bouchch01.html', pos: 'PF' },
      'Scottie Barnes': { link: 'players/b/barnesc01.html', pos: 'PF' },
      'Precious Achiuwa': { link: 'players/a/achiupr01.html', pos: 'C' },
      'Gary Trent Jr.': { link: 'players/t/trentga02.html', pos: 'SG' },
      'Pascal Siakam': { link: 'players/s/siakapa01.html', pos: 'PF' },
      'Fred VanVleet': { link: 'players/v/vanvlfr01.html', pos: 'PG' },
      'Dalano Banton': { link: 'players/b/bantoda01.html', pos: 'SF' },
      'Svi Mykhailiuk': { link: 'players/m/mykhasv01.html', pos: 'SF' },
      'Khem Birch': { link: 'players/b/birchkh01.html', pos: 'C' },
      'OG Anunoby': { link: 'players/a/anunoog01.html', pos: 'SF' },
      'Malachi Flynn': { link: 'players/f/flynnma01.html', pos: 'PG' },
      'Yuta Watanabe': { link: 'players/w/watanyu01.html', pos: 'SF' },
      'Justin Champagnie': { link: 'players/c/champju01.html', pos: 'SF' },
      'Thaddeus Young': { link: 'players/y/youngth01.html', pos: 'PF' },
      'Isaac Bonga': { link: 'players/b/bongais01.html', pos: 'SF' },
      'Armoni Brooks': { link: 'players/b/brookar01.html', pos: 'PG' },
      'David Johnson': { link: 'players/j/johnsda08.html', pos: 'SG' }
    },
    'Justin Champagnie': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/c/champju01/gamelog/2022' },
        Career: {}
      }
    }
  },
  'Utah Jazz': {
    link: 'teams/UTA/',
    players: {
      'Jordan Clarkson': { link: 'players/c/clarkjo01.html', pos: 'SG' },
      "Royce O'Neale": { link: 'players/o/onealro01.html', pos: 'SF' },
      'Mike Conley': { link: 'players/c/conlemi01.html', pos: 'PG' },
      'Bojan Bogdanovi??': { link: 'players/b/bogdabo02.html', pos: 'PF' },
      'Donovan Mitchell': { link: 'players/m/mitchdo01.html', pos: 'SG' },
      'Rudy Gobert': { link: 'players/g/goberru01.html', pos: 'C' },
      'Hassan Whiteside': { link: 'players/w/whiteha01.html', pos: 'C' },
      'Trent Forrest': { link: 'players/f/forretr01.html', pos: 'PG' },
      'Eric Paschall': { link: 'players/p/pascher01.html', pos: 'PF' },
      'Rudy Gay': { link: 'players/g/gayru01.html', pos: 'PF' },
      'Jared Butler': { link: 'players/b/butleja02.html', pos: 'SG' },
      'Danuel House Jr.': { link: 'players/h/houseda01.html', pos: 'SF' },
      'Udoka Azubuike': { link: 'players/a/azubuud01.html', pos: 'C' },
      'Juancho Hernang??mez': { link: 'players/h/hernaju01.html', pos: 'PF' },
      'Nickeil Alexander-Walker': {
        link: 'players/a/alexani01.html',
        pos: 'SG'
      },
      'Xavier Sneed': { link: 'players/s/sneedxa01.html', pos: 'SF' }
    }
  },
  'Washington Wizards': {
    link: 'teams/WAS/',
    players: {
      'Deni Avdija': { link: 'players/a/avdijde01.html', pos: 'SF' },
      'Kentavious Caldwell-Pope': {
        link: 'players/c/caldwke01.html',
        pos: 'SG'
      },
      'Corey Kispert': { link: 'players/k/kispeco01.html', pos: 'SF' },
      'Daniel Gafford': { link: 'players/g/gaffoda01.html', pos: 'C' },
      'Raul Neto': { link: 'players/n/netora01.html', pos: 'PG' },
      'Kyle Kuzma': { link: 'players/k/kuzmaky01.html', pos: 'PF' },
      'Anthony Gill': { link: 'players/g/gillan01.html', pos: 'PF' },
      'Rui Hachimura': { link: 'players/h/hachiru01.html', pos: 'PF' },
      'Bradley Beal': { link: 'players/b/bealbr01.html', pos: 'SG' },
      'Ish Smith': { link: 'players/s/smithis01.html', pos: 'PG' },
      'Thomas Bryant': { link: 'players/b/bryanth01.html', pos: 'C' },
      'Tom???? Satoransk??': { link: 'players/s/satorto01.html', pos: 'SG' },
      'Kristaps Porzi????is': { link: 'players/p/porzikr01.html', pos: 'PF' },
      'Isaiah Todd': { link: 'players/t/toddis01.html', pos: 'PF' },
      'Cassius Winston': { link: 'players/w/winstca01.html', pos: 'PG' },
      'Jordan Schakel': { link: 'players/s/schakjo01.html', pos: 'SG' },
      'Vernon Carey Jr.': { link: 'players/c/careyve01.html', pos: 'C' }
    },
    'Isaiah Todd': {
      playerData: {
        Season: {},
        '2021-22': { link: '/players/t/toddis01/gamelog/2022' },
        Career: {}
      }
    }
  }
};
