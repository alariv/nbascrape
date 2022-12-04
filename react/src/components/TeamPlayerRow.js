import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import SelectionList from './SelectionList';
import DefaultFilters from './DefaultFilters';
import Input from './Input';
import teams from '../scrapedData/teams.json';
import SelectionListMultiple from './SelectionListMultiple';
import leaguesData from '../scrapedData/leaguesData.json';
import { Button } from '@mui/material';
import Save from '@mui/icons-material/Save';

export default function TeamPlayerRow({
  team = '',
  player = '',
  players = [],
  index,
  filtersOnly = false,
  onSeasonChange = () => {},
  onMatchUpValueSeasonChange = (season) => {},
  onOpponentSelect = () => {},
  onMarketSelect = () => {},
  onExtraMarketSelect = () => {},
  onPredMinutesChange = () => {},
  defaultSeason = [],
  opponent = '',
  selectedMarket = '',
  selectedExtraMarket = '',
  defaultPredMinutes = '',
  seasonsLoading = false,
  playerSeasons,
  teamPlayersData = {},
  defaultMatchUpValueSeason,
  onPredMinutesToggle = () => {},
  predMinutesToggleState = 'depth'
}) {
  const [market, setMarket] = useState('');
  const [extraMarket, setExtraMarket] = useState('');
  const [line, setLine] = useState('');
  const [season, setSeason] = useState([]);
  const [predMinutes, setPredMinutes] = useState('');
  const [extraLine, setExtraLine] = useState('');
  const [selectedWplayer, setWplayer] = useState(['']);
  const [lastTeam, setLastTeam] = useState('');
  const [wPlayers, setWplayers] = useState(makeWplayersList());
  const [calculatedMatchUpValue, setCalculatedMatchUpValue] = useState('-');
  const [matchUpValue, setMatchUpValue] = useState('');
  const [predMinutesFilter, setPredMinutesFilter] = useState({
    filter: '+-',
    filterValue: '10'
  });
  const [extraLineFilter, setExtraLineFilter] = useState({
    filter: '',
    filterValue: ''
  });
  const [totalGames, setTotalGames] = useState(0);
  const [totalOver, setTotalOver] = useState(0);
  const [totalUnder, setTotalUnder] = useState(0);
  const [totalOverP, setTotalOverP] = useState('0');
  const [totalUnderP, setTotalUnderP] = useState('0');
  const [bookieOdds, setBookieOdds] = useState({ under: 0, over: 0 });
  const [unitSize, setUnitSize] = useState({ under: 0, over: 0 });

  useEffect(() => {
    if (team && team !== lastTeam) {
      setWplayer(['']);
      setWplayers(makeWplayersList());
      setLastTeam(team);
      setMarket('');
      setExtraMarket('');
      setLine('');
      setSeason([]);
      setPredMinutes('');
      setExtraLine('');
      setPredMinutesFilter({
        filter: '+-',
        filterValue: '10'
      });
      setExtraLineFilter({
        filter: '',
        filterValue: ''
      });
      setTotalGames(0);
      setTotalOver(0);
      setTotalUnder(0);
      setTotalOverP('0');
      setTotalUnderP('0');
      setBookieOdds({ under: 0, over: 0 });
      setUnitSize({ under: 0, over: 0 });
    } else {
      setTimeout(() => {
        handleMarketSelect(selectedMarket);
      }, 1500);
    }
  }, [team]);

  useEffect(() => {
    //do something
    if (predMinutesToggleState == 'saved') {
      console.log('predMinutesToggleState is SAVED');
      !!market && handleMarketSelect(market);
    } else {
      console.log('predMinutesToggleState changed to', predMinutesToggleState);
      handleDepthData();
    }
  }, [predMinutesToggleState]);

  function makeWplayersList() {
    // console.log("making wplist");
    // console.log(teams[team].previousSeasonPlayers);
    let list = [];
    let teamPlayersArr = Object.keys(teams[team].players).concat(
      Object.keys(teams[team].previousSeasonPlayers)
    );
    teamPlayersArr.forEach((thisPlayer) => {
      if (player != thisPlayer) {
        list.push('+ ' + thisPlayer);
        list.push('- ' + thisPlayer);
      }
    });
    return list;
  }

  useEffect(() => {
    if (opponent) {
      setMatchUpValue('');
    }
  }, [opponent, team]);

  useEffect(() => {
    console.log('suur useEffect');
    if (Object.keys(teamPlayersData).length) {
      const totalGames = findTotalGames(teamPlayersData);
      setTotalGames(Object.keys(teamPlayersData).length ? totalGames.total : 0);
      setTotalOver(Object.keys(teamPlayersData).length ? totalGames.over : 0);
      setTotalUnder(Object.keys(teamPlayersData).length ? totalGames.under : 0);

      console.log(totalGames);
      let justcalculatedMatchupValue;

      console.log('MUV calculation');
      let opponentDataSum = 0;
      let leagueDataSum = 0;
      let divider = 0;
      if (opponent && leaguesData && defaultMatchUpValueSeason) {
        defaultMatchUpValueSeason.forEach((season) => {
          if (
            Object.keys(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ]
            ).length &&
            leaguesData[
              season.split('-')[0].substr(0, 2) + season.split('-')[1]
            ][opponent][leagueStatsMap[market ? market : selectedMarket]] &&
            leaguesData[
              season.split('-')[0].substr(0, 2) + season.split('-')[1]
            ]['League Average'][
              leagueStatsMap[market ? market : selectedMarket]
            ]
          ) {
            console.log(leagueStatsMap[market ? market : selectedMarket]);
            console.log(opponent);
            console.log(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ][opponent]
            );
            console.log('======');
            console.log(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ][opponent][leagueStatsMap[market ? market : selectedMarket]]
            );
            console.log(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ]['League Average'][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            );
            divider += 1;
            opponentDataSum += parseFloat(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ][opponent][leagueStatsMap[market ? market : selectedMarket]]
            );

            leagueDataSum += parseFloat(
              leaguesData[
                season.split('-')[0].substr(0, 2) + season.split('-')[1]
              ]['League Average'][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            );
          }
        });
      }

      console.log('opponentDataSum =', opponentDataSum, '/', divider);
      console.log('leagueDataSum =', leagueDataSum, '/', divider);
      opponentDataSum = opponentDataSum / divider;
      leagueDataSum = leagueDataSum / divider;

      if (opponent && opponentDataSum && leagueDataSum) {
        setCalculatedMatchUpValue(
          (opponentDataSum / leagueDataSum - 1).toFixed(5).toString()
        );
        justcalculatedMatchupValue = (
          opponentDataSum / leagueDataSum -
          1
        ).toFixed(5);

        console.log(
          'setCalculatedMatchUpValue',
          (opponentDataSum / leagueDataSum - 1).toFixed(5).toString()
        );
        console.log('justcalculatedMatchupValue', justcalculatedMatchupValue);
      } else {
        setCalculatedMatchUpValue('-');
        justcalculatedMatchupValue = 0;
        console.log('herrrrrr');
      }

      const matchupValueToUse = matchUpValue
        ? parseFloat(matchUpValue)
        : justcalculatedMatchupValue;
      const overP = (
        totalGames.over > 0
          ? (totalGames.over / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
      ).toFixed(4);

      const underP = (
        totalGames.under > 0
          ? (totalGames.under / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
      ).toFixed(4);

      const totalOverPToSet = (
        totalGames.over > 0
          ? (totalGames.over / totalGames.total) * 100 +
            ((totalGames.under / totalGames.total) *
              100 *
              Number(matchupValueToUse) *
              ((totalGames.over / totalGames.total) * 100)) /
              100
          : 0
      ).toFixed(4);

      setTotalOverP(totalOverPToSet);
      console.log('totalOverPToSet', totalOverPToSet);
      setTotalUnderP((100 - parseFloat(totalOverPToSet)).toFixed(5).toString());
      setTimeout(() => {
        calculateUnitSize(
          totalGames.total,
          totalGames.over,
          totalGames.under,
          underP,
          overP
        );
      }, 500);
    }
  }, [
    teamPlayersData,
    season,
    line,
    predMinutesFilter,
    predMinutes,
    extraLineFilter,
    extraLine,
    extraMarket,
    selectedWplayer,
    market,
    selectedMarket,
    bookieOdds,
    defaultSeason,
    defaultMatchUpValueSeason,
    opponent,
    matchUpValue
  ]);

  const findTotalGames = (list) => {
    const marketToSearch = market ? market : selectedMarket;
    const extraMarketToSearch = extraMarket ? extraMarket : selectedExtraMarket;
    const marketMapping = {
      '3P': 'fg3',
      TRB: 'trb',
      AST: 'ast',
      STL: 'stl',
      BLK: 'blk',
      TOV: 'tov',
      PTS: 'pts',
      FGA: 'fga',
      '3PA': '3pa'
    };

    let playerMatchingSeasons;
    let games = [];
    let overGames = [];
    let underGames = [];
    if (player) {
      playerMatchingSeasons = Object.keys(list.players).includes(player)
        ? Object.keys(list.players[player].playerData).filter(
            (currentSeason) => {
              console.log(
                'currentseason:',
                currentSeason,
                'season.length:',
                season.length
              );
              return (
                (season.length ? season : defaultSeason).includes(
                  currentSeason
                ) && season
              );
            }
          )
        : console.log('could not find player', player);

      (playerMatchingSeasons || []).forEach((matchedSeason) => {
        (list.players[player]?.playerData[matchedSeason]?.data
          ? Object.keys(list.players[player]?.playerData[matchedSeason]?.data)
          : []
        ).forEach((game) => {
          console.log('forEach game', game);
          games.push(
            list.players[player]?.playerData[matchedSeason]?.data[game]
          );
        });
      });

      console.log('games:', games.length);

      games = games.filter((game) => {
        const minValue =
          predMinutesFilter.filter == '+-'
            ? parseInt(predMinutes) - parseInt(predMinutesFilter.filterValue)
            : predMinutesFilter.filter == 'over'
            ? parseInt(predMinutes)
            : 0;

        const maxValue =
          predMinutesFilter.filter == '+-'
            ? parseInt(predMinutes) + parseInt(predMinutesFilter.filterValue)
            : predMinutesFilter.filter == 'over'
            ? 999
            : parseInt(predMinutes) - 1;

        const minutesPlayed = game['mp'].split(':')[0];
        return (
          parseFloat(minutesPlayed) >= minValue &&
          parseFloat(minutesPlayed) <= maxValue
        );
      });

      if (
        extraLineFilter.filter &&
        extraLineFilter.filterValue &&
        extraMarket
      ) {
        games = games.filter((game) => {
          return extraLineFilter.filter == 'over'
            ? parseInt(game[marketMapping[extraMarketToSearch]]) >
                parseFloat(extraLineFilter.filterValue)
            : parseInt(game[marketMapping[extraMarketToSearch]]) <
                parseFloat(extraLineFilter.filterValue);
        });

        console.log('GAMES:');
        console.log(games);
      }

      console.log('games before massive foreach:', games.length);
      selectedWplayer.forEach((thisSelectedWplayer) => {
        let wwoPlayerName = thisSelectedWplayer.substring(
          2,
          thisSelectedWplayer.length
        );
        let wwoPlayerPrefix = thisSelectedWplayer.substring(0, 1);

        let wwoPlayerGameDates = [];
        let matchingGameDates = [];

        let seasonToSearch = season.length ? season : defaultSeason;
        if (wwoPlayerName.length && wwoPlayerPrefix.length) {
          seasonToSearch.forEach((currentSeason) => {
            console.log('searching season', currentSeason);
            Object.keys(list.players).forEach((thisPlayer, index) => {
              if (thisPlayer == wwoPlayerName) {
                console.log('found wwoPlayer', wwoPlayerName);
                if (
                  Object.keys(list.players).includes(wwoPlayerName) &&
                  list.players[wwoPlayerName].playerData[currentSeason] &&
                  list.players[wwoPlayerName].playerData[currentSeason].data
                ) {
                  console.log('millegiprast leidsin tiimilistist');
                  Object.keys(
                    list.players[wwoPlayerName].playerData[currentSeason].data
                  ).forEach((wwoPlayerGame) => {
                    console.log('wwoPlayerGame', wwoPlayerGame);
                    if (
                      list.players[wwoPlayerName].playerData[currentSeason]
                        .data[wwoPlayerGame].team == teams[team].teamShort
                    ) {
                      wwoPlayerGameDates.push(
                        list.players[wwoPlayerName].playerData[currentSeason]
                          .data[wwoPlayerGame].date
                      );
                    }
                  });
                } else if (
                  Object.keys(list.previousSeasonPlayers).includes(
                    wwoPlayerName
                  ) &&
                  list.previousSeasonPlayers[wwoPlayerName].playerData[
                    currentSeason
                  ] &&
                  list.previousSeasonPlayers[wwoPlayerName].playerData[
                    currentSeason
                  ].data
                ) {
                  /////
                  console.log(
                    'leidsin',
                    wwoPlayerName,
                    'previousSeasonPlayers listist'
                  );
                  ////
                  Object.keys(
                    list.previousSeasonPlayers[wwoPlayerName].playerData[
                      currentSeason
                    ].data
                  ).forEach((wwoPlayerGame) => {
                    if (
                      list.previousSeasonPlayers[wwoPlayerName].playerData[
                        currentSeason
                      ].data[wwoPlayerGame].team == teams[team].teamShort
                    ) {
                      wwoPlayerGameDates.push(
                        list.previousSeasonPlayers[wwoPlayerName].playerData[
                          currentSeason
                        ].data[wwoPlayerGame].date
                      );
                    }
                  });
                  ////

                  /////
                } else {
                  console.log(
                    'ei leidnud kummastki listist seda venda:',
                    wwoPlayerName
                  );
                }
                if (
                  list.players[player].playerData[currentSeason] &&
                  list.players[player].playerData[currentSeason].data
                ) {
                  Object.keys(
                    list.players[player].playerData[currentSeason].data
                  ).forEach((currentPlayerGame) => {
                    wwoPlayerGameDates.includes(
                      list.players[player].playerData[currentSeason].data[
                        currentPlayerGame
                      ].date
                    )
                      ? wwoPlayerPrefix == '+' &&
                        matchingGameDates.push(
                          list.players[player].playerData[currentSeason].data[
                            currentPlayerGame
                          ].date
                        )
                      : wwoPlayerPrefix == '-' &&
                        matchingGameDates.push(
                          list.players[player].playerData[currentSeason].data[
                            currentPlayerGame
                          ].date
                        );
                  });
                }
              }
            });
          });

          games = games.filter((game) => matchingGameDates.includes(game.date));
        }
      });
      console.log('games after filter:', games.length);

      overGames = games.filter((game) => {
        return (
          parseFloat(game[marketMapping[marketToSearch]]) >= parseFloat(line)
        );
      });
      underGames = games.filter((game) => {
        return (
          parseFloat(game[marketMapping[marketToSearch]]) < parseFloat(line)
        );
      });
    }

    return {
      total: games.length,
      over: overGames.length,
      under: underGames.length
    };
  };

  const calculateUnitSize = (total, over, under, underP, overP) => {
    const predMinutesToSend =
      predMinutesFilter.filter == '+-'
        ? predMinutesFilter.filter +
          ':' +
          predMinutesFilter.filterValue +
          ':' +
          (predMinutes ? predMinutes : defaultPredMinutes)
        : predMinutesFilter.filter +
          ':' +
          (predMinutes ? predMinutes : defaultPredMinutes);

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market: market ? market : selectedMarket,
        season: season.length ? season : defaultSeason,
        extraMarket: extraMarket ? extraMarket : selectedExtraMarket,
        line: line,
        predMinutes: predMinutesToSend,
        selectedWplayer: selectedWplayer,
        totalGames: total,
        totalOver: over,
        totalUnder: under,
        totalOverP: overP,
        totalUnderP: underP,
        bookieOdds: bookieOdds,
        player: player
      })
    };
    fetch('http://localhost:80/calculateunitsize', requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setUnitSize({
          under: data.unitSizeUnder,
          over: data.unitSizeOver
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const savePlayer = () => {
    const marketToSave = market ? market : selectedMarket;
    const seasonToSave = season.length ? season : defaultSeason;
    const extraMarketToSave = extraMarket ? extraMarket : selectedExtraMarket;
    const predMinutesToSave =
      predMinutesFilter.filter == '+-'
        ? predMinutesFilter.filter +
          ':' +
          predMinutesFilter.filterValue +
          ':' +
          (predMinutes ? predMinutes : defaultPredMinutes)
        : predMinutesFilter.filter +
          '::' +
          (predMinutes ? predMinutes : defaultPredMinutes);

    const saveObj = {
      playerName: player,
      market: marketToSave,
      line: line,
      season: seasonToSave,
      predMinutes: predMinutesToSave,
      extraMarket: extraMarketToSave,
      extraLineFilter: extraLineFilter,
      selectedWplayer: selectedWplayer
    };

    const savedPlayerRows = JSON.parse(localStorage.getItem('spr')) || {};

    const modifiedPlayerRows = savedPlayerRows
      ? {
          ...savedPlayerRows,
          [player]: { ...savedPlayerRows[player], [marketToSave]: saveObj }
        }
      : { [player]: { [marketToSave]: saveObj } };

    localStorage.setItem('spr', JSON.stringify(modifiedPlayerRows));
  };

  useEffect(() => {
    handleDepthData();
  }, []);

  function handleDepthData() {
    let depthData = window.localStorage.getItem('depthData')
      ? JSON.parse(window.localStorage.getItem('depthData'))
      : [];
    if (!!depthData && depthData[team]) {
      Object.keys(depthData[team]).forEach((pos) => {
        Object.keys(depthData[team][pos]).forEach((positionClass) => {
          if (depthData[team][pos][positionClass].player == player) {
            setPredMinutes(depthData[team][pos][positionClass].value);
          }
        });
      });
    }
  }

  const markets = {
    '3P': '3P',
    TRB: 'TRB',
    AST: 'AST',
    STL: 'STL',
    BLK: 'BLK',
    TOV: 'TOV',
    PTS: 'PTS'
  };

  const extraMarkets = {
    FGA: 'FGA',
    '3PA': '3PA'
  };

  const leagueStatsMap = {
    '3P': '3P',
    TRB: 'trb',
    AST: 'ast',
    STL: 'stl',
    BLK: 'blk',
    TOV: 'tov',
    PTS: 'pts',
    FGA: 'fg2',
    '3PA': '3PA'
  };

  const currentDate = new Date();

  const seasons = [
    `${currentDate.getFullYear() - 3}-${(currentDate.getFullYear() - 2)
      .toString()
      .substr(2, 4)}`,
    `${currentDate.getFullYear() - 2}-${(currentDate.getFullYear() - 1)
      .toString()
      .substr(2, 4)}`,
    `${currentDate.getFullYear() - 1}-${currentDate
      .getFullYear()
      .toString()
      .substr(2, 4)}`,
    `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1)
      .toString()
      .substr(2, 4)}`
  ];

  const handleMarketSelect = (market) => {
    setMarket(market);
    const savedPlayerRows = JSON.parse(localStorage.getItem('spr')) || {};

    if (savedPlayerRows[player] && savedPlayerRows[player][market]) {
      setExtraMarket(savedPlayerRows[player][market].extraMarket);
      setSeason(
        typeof savedPlayerRows[player][market].season === 'string'
          ? savedPlayerRows[player][market].season.split(',')
          : savedPlayerRows[player][market].season
      );
      setLine(savedPlayerRows[player][market].line);
      setPredMinutes(savedPlayerRows[player][market].predMinutes.split(':')[2]);
      setPredMinutesFilter({
        filter: savedPlayerRows[player][market].predMinutes.split(':')[0],
        filterValue: savedPlayerRows[player][market].predMinutes.split(':')[1]
      });
      setWplayer(savedPlayerRows[player][market].selectedWplayer);
      setExtraLineFilter(savedPlayerRows[player][market].extraLineFilter);
      setExtraLine(savedPlayerRows[player][market].extraLineFilter.filterValue);
    }
  };
  const handleExtraMarketSelect = (extraMarket) => {
    setExtraMarket(extraMarket);
  };

  const handleSeasonSelect = (season) => {
    setSeason(typeof season === 'string' ? season.split(',') : season);
  };

  const handleLineChange = (line) => {
    setLine(line);
  };
  const handleMatchUpValueChange = (value) => {
    value = !value ? ' ' : value.trim();
    setMatchUpValue(value);
  };

  const handlePredMinutesChange = (predMinutes) => {
    setPredMinutes(predMinutes.value);
    setPredMinutesFilter({
      filter: predMinutes.filter,
      filterValue: predMinutes.filterValue
    });
  };

  const handleMatchUpValueSeasonChange = (value) => {
    onMatchUpValueSeasonChange(value);
  };

  const handleExtraLineChange = (line) => {
    setExtraLine(line.value);
    setExtraLineFilter({
      filter: line.filter,
      filterValue: line.value
    });
  };

  const handleWPlayerChange = (wPlayer) => {
    setWplayer(typeof wPlayer === 'string' ? wPlayer.split(',') : wPlayer);
  };

  const handleBookieOddsChange = (odds, direction) => {
    setBookieOdds({ ...bookieOdds, [direction]: odds });
  };

  return (
    <>
      {filtersOnly ? (
        <DefaultFilters
          seasons={seasons.reverse()}
          onSeasonChange={onSeasonChange}
          onTeamChange={onOpponentSelect}
          onMarketChange={onMarketSelect}
          onExtraMarketChange={onExtraMarketSelect}
          onPredMinutesChange={onPredMinutesChange}
          markets={Object.values(markets)}
          extraMarkets={Object.values(extraMarkets)}
          currentTeam={team}
          seasonsLoading={seasonsLoading}
          onMatchUpValueSeasonChange={handleMatchUpValueSeasonChange}
          onPredMinutesToggle={onPredMinutesToggle}
        />
      ) : (
        <TableRow
          key={index}
          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          {/* SAVE ROW */}
          <TableCell component='th' scope='row' className={'player'}>
            <div style={{ display: 'flex' }}>
              <Button
                onClick={() => {
                  savePlayer();
                }}
                style={{}}>
                <Save color='action' />
              </Button>
              {player}
            </div>
          </TableCell>
          {/* OPPONENT */}
          <TableCell className={'opponent'}>
            <SelectionList
              value={opponent}
              list={Object.keys(teams)}
              dense
              disabled
            />
          </TableCell>
          {/* MARKET */}
          <TableCell className={'market'}>
            <SelectionList
              value={market ? market : selectedMarket}
              onChange={handleMarketSelect}
              list={Object.values(markets)}
              dense
            />
          </TableCell>
          {/* LINE */}
          <TableCell className={'line'}>
            <Input value={line} onChange={handleLineChange} dense narrow />
          </TableCell>
          {/* SEASON */}
          <TableCell className={'seasons'}>
            <SelectionListMultiple
              value={season.length ? season : defaultSeason}
              onChange={handleSeasonSelect}
              list={playerSeasons}
              disabled={seasonsLoading}
              dense
            />
          </TableCell>
          {/* PRED MINUTED RANGE */}
          <TableCell className={'predMinutes'}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <SelectionList
                value={predMinutesFilter.filter}
                onChange={(value) => {
                  handlePredMinutesChange({
                    value: predMinutes ? predMinutes : defaultPredMinutes,
                    filter: value,
                    filterValue: predMinutesFilter.filterValue
                  });
                }}
                list={['+-', 'over', 'under']}
                dense
              />
              {predMinutesFilter.filter == '+-' ? (
                <Input
                  value={predMinutesFilter.filterValue}
                  onChange={(value) => {
                    handlePredMinutesChange({
                      value: predMinutes ? predMinutes : defaultPredMinutes,
                      filter: predMinutesFilter.filter,
                      filterValue: value
                    });
                  }}
                  dense
                />
              ) : (
                <Input
                  value={predMinutes ? predMinutes : defaultPredMinutes}
                  onChange={(value) => {
                    handlePredMinutesChange({
                      value: value,
                      filter: predMinutesFilter.filter,
                      filterValue: predMinutesFilter.filterValue
                    });
                  }}
                  dense
                />
              )}
            </div>
            {predMinutesFilter.filter == '+-' && (
              <Input
                value={predMinutes ? predMinutes : defaultPredMinutes}
                onChange={(value) => {
                  handlePredMinutesChange({
                    value: value,
                    filter: predMinutesFilter.filter,
                    filterValue: predMinutesFilter.filterValue
                  });
                }}
                dense
              />
            )}
          </TableCell>
          {/* EXTRA FILTRID */}
          <TableCell className={'extraFilter'}>
            <SelectionList
              value={extraMarket ? extraMarket : selectedExtraMarket}
              onChange={handleExtraMarketSelect}
              list={[''].concat(Object.values(extraMarkets))}
              dense
            />
          </TableCell>
          {/* EXTRA FILTRI LIIN */}
          <TableCell className={'extraFilterLine'}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <SelectionList
                value={extraLineFilter.filter}
                onChange={(value) => {
                  handleExtraLineChange({
                    value: extraLine,
                    filter: value,
                    filterValue: extraLineFilter.filterValue
                  });
                }}
                list={['', 'over', 'under']}
                dense
              />

              <Input
                value={extraLine}
                onChange={(value) => {
                  handleExtraLineChange({
                    value: value,
                    filter: extraLineFilter.filter,
                    filterValue: extraLineFilter.filterValue
                  });
                }}
                dense
              />
            </div>
          </TableCell>
          {/* +- PLAYER */}
          <TableCell className={'wwoplayer'}>
            {/* <SelectionList
              value={selectedWplayer}
              onChange={handleWPlayerChange}
              list={[""].concat(wPlayers)}
              dense
            /> */}
            <SelectionListMultiple
              value={selectedWplayer}
              onChange={handleWPlayerChange}
              list={wPlayers}
              dense
            />
          </TableCell>
          {/* TOTAL GAMES (OVER/UNDER) */}
          <TableCell className={'totalGames'}>
            <Input
              value={`${totalGames} (${totalOver}/${totalUnder})`}
              onChange={() => {}}
              dense
              disabled
            />
          </TableCell>
          {/* MATCHUP VALUE */}
          <TableCell className={'matchupValue'}>
            <Input
              value={matchUpValue ? matchUpValue : calculatedMatchUpValue}
              onChange={handleMatchUpValueChange}
              onBlur={() => {
                setMatchUpValue(matchUpValue.trim());
              }}
              dense
              wide
            />
          </TableCell>
          {/* TRUE OVER % */}
          <TableCell className={'trueOver'}>
            <Input
              value={totalOverP.toString()}
              onChange={() => {}}
              dense
              wide
              disabled
            />
            <Input
              value={totalUnderP.toString()}
              onChange={() => {}}
              dense
              wide
              disabled
            />
          </TableCell>

          {/* BOOKIE ODDS */}
          <TableCell className={'bookieOdds'}>
            <Input
              value={bookieOdds.over.toString()}
              onChange={(v) => {
                handleBookieOddsChange(v, 'over');
              }}
              dense
              narrow
            />
            <Input
              value={bookieOdds.under.toString()}
              onChange={(v) => {
                handleBookieOddsChange(v, 'under');
              }}
              dense
              narrow
            />
          </TableCell>
          {/* UNIT SIZE */}
          <TableCell className={'unitSize'}>
            <Input
              value={unitSize.over ? unitSize.over.toString() : 'Viga'}
              onChange={() => {}}
              dense
              disabled
            />
            <Input
              value={unitSize.under ? unitSize.under.toString() : 'Viga'}
              onChange={() => {}}
              dense
              wide
              disabled
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
