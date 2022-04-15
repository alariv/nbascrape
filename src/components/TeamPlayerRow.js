import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import SelectionList from './SelectionList';
import DefaultFilters from './DefaultFilters';
import Input from './Input';
import teams from '../scrapedData/teams.json';
import SelectionListMultiple from './SelectionListMultiple';
import leaguesData from '../scrapedData/leaguesData.json';

export default function TeamPlayerRow({
  team = '',
  player = '',
  players = [],
  index,
  filtersOnly = false,
  onSeasonChange = () => {},
  onOpponentSelect = () => {},
  onMarketSelect = () => {},
  onPredMinutesChange = () => {},
  defaultSeason = [],
  opponent = '',
  selectedMarket = '',
  defaultPredMinutes = ''
}) {
  const [market, setMarket] = useState('');
  const [line, setLine] = useState('');
  const [season, setSeason] = useState([]);
  const [predMinutes, setPredMinutes] = useState('');
  const [selectedWplayer, setWplayer] = useState('');
  const [wPlayers, setWplayers] = useState(makeWplayersList());
  const [matchUpValue, setMatchUpValue] = useState('-');
  const [predMinutesFilter, setPredMinutesFilter] = useState({
    filter: '+-',
    filterValue: '10'
  });

  function makeWplayersList() {
    let list = [];
    players.forEach((thisPlayer) => {
      if (player !== thisPlayer) {
        list.push('+ ' + thisPlayer);
        list.push('- ' + thisPlayer);
      }
    });
    return list;
  }

  useEffect(() => {
    let depthData = JSON.parse(window.localStorage.getItem('depthData'));
    Object.keys(depthData[team]).forEach((pos) => {
      // console.log(pos);
      Object.keys(depthData[team][pos]).forEach((positionClass) => {
        if (depthData[team][pos][positionClass].player == player) {
          setPredMinutes(depthData[team][pos][positionClass].value);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (
      opponent &&
      leaguesData[2022][opponent][
        leagueStatsMap[market ? market : selectedMarket]
      ] &&
      leaguesData[2022]['League Average'][
        leagueStatsMap[market ? market : selectedMarket]
      ]
    ) {
      // console.log('selected market:', market ? market : selectedMarket);
      // console.log('selected opponent:', opponent);
      // console.log(
      //   leaguesData[2022][opponent][
      //     leagueStatsMap[market ? market : selectedMarket]
      //   ]
      // );
      // console.log(
      //   leaguesData[2022]['League Average'][
      //     leagueStatsMap[market ? market : selectedMarket]
      //   ]
      // );
      setMatchUpValue(
        (
          parseInt(
            leaguesData[2022][opponent][
              leagueStatsMap[market ? market : selectedMarket]
            ]
          ) /
            parseInt(
              leaguesData[2022]['League Average'][
                leagueStatsMap[market ? market : selectedMarket]
              ]
            ) -
          1
        )
          .toFixed(5)
          .toString()
      );
    } else {
      setMatchUpValue('-');
    }
  }, [selectedMarket, market, opponent]);

  const markets = {
    // G: 'G',
    // GS: 'GS',
    // MP: 'MP',
    // FG: 'FG',
    // FGA: 'FGA',
    // 'FG%': 'FG%',
    '3P': '3P',
    // '3PA': '3PA',
    // '3P%': '3P%',
    // '2P': '2P',
    // '2PA': '2PA',
    // '2P%': '2P%',
    // eFG: 'eFG',
    // FT: 'FT',
    // FTA: 'FTA',
    // 'FT%': 'FT%',
    // ORB: 'ORB',
    // DRB: 'DRB',
    TRB: 'TRB',
    AST: 'AST',
    STL: 'STL',
    BLK: 'BLK',
    TOV: 'TOV',
    // PF: 'PF',
    PTS: 'POINTS'
  };

  const leagueStatsMap = {
    // G: 'g',
    // GS: 'GS',
    // MP: 'mp',
    // FG: 'fg',
    // FGA: 'fg2',
    // 'FG%': 'FG%',
    '3P': '3P',
    // '3PA': '3PA',
    // '3P%': '3P%',
    // '2P': '2P',
    // '2PA': '2PA',
    // '2P%': '2P%',
    // eFG: 'eFG',
    // FT: 'FT',
    // FTA: 'FTA',
    // 'FT%': 'FT%',
    // ORB: 'orb',
    // DRB: 'drb',
    TRB: 'trb',
    AST: 'ast',
    STL: 'stl',
    BLK: 'blk',
    TOV: 'tov',
    // PF: 'PF',
    POINTS: 'pts'
  };

  // useEffect(() => {
  //   console.log('defSeason in teamPlayer sent to row:', defaultSeason)
  //   console.log(players)
  // }, [defaultSeason])

  const seasons = ['16/17', '17/18', '18/19', '19/20', '20/21', '21/22'];

  //   const handleOpponentSelect = team => {
  //     setOpponent(team)
  //   }

  const handleMarketSelect = (market) => {
    setMarket(market);
  };

  const handleSeasonSelect = (season) => {
    setSeason(typeof season === 'string' ? season.split(',') : season);
  };

  const handleLineChange = (line) => {
    setLine(line);
  };

  const handlePredMinutesChange = (predMinutes) => {
    setPredMinutes(predMinutes.value);
    setPredMinutesFilter({
      filter: predMinutes.filter,
      filterValue: predMinutes.filterValue
    });
  };

  const handleWPlayerChange = (wPlayer) => {
    setWplayer(wPlayer);
  };

  return (
    <>
      {filtersOnly ? (
        <DefaultFilters
          seasons={seasons}
          onSeasonChange={onSeasonChange}
          onTeamChange={onOpponentSelect}
          onMarketChange={onMarketSelect}
          onPredMinutesChange={onPredMinutesChange}
          markets={Object.values(markets)}
          currentTeam={team}
        />
      ) : (
        <TableRow
          key={index}
          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
          <TableCell component='th' scope='row'>
            {player}
          </TableCell>
          <TableCell>
            <SelectionList
              value={opponent}
              list={Object.keys(teams)}
              dense
              disabled
            />
          </TableCell>
          <TableCell>
            <SelectionList
              value={market ? market : selectedMarket}
              onChange={handleMarketSelect}
              list={Object.values(markets)}
              dense
            />
          </TableCell>
          <TableCell>
            <Input value={line} onChange={handleLineChange} dense narrow />
          </TableCell>
          <TableCell>
            <SelectionListMultiple
              value={season.length ? season : defaultSeason}
              onChange={handleSeasonSelect}
              list={seasons}
              dense
            />
          </TableCell>
          <TableCell>
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
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <SelectionList
              value={selectedWplayer}
              onChange={handleWPlayerChange}
              list={wPlayers}
              dense
            />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow disabled />
          </TableCell>
          <TableCell>
            <Input value={matchUpValue} onChange={() => {}} dense wide />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow disabled />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow disabled />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow disabled />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow disabled />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
