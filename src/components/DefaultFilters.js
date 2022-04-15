import React, { useEffect, useState } from 'react';
import { TableRow, TableCell } from '@mui/material';
import SelectionList from './SelectionList';
import teams from '../scrapedData/teams.json';
import SelectionListMultiple from './SelectionListMultiple';
import Input from './Input';

export default function TeamPlayerRow({
  seasons,
  markets,
  onSeasonChange,
  onTeamChange,
  onMarketChange,
  onPredMinutesChange,
  currentTeam
}) {
  const [opponent, setOpponent] = useState('');
  const [market, setMarket] = useState('');
  const [season, setSeason] = useState(['21/22']);
  const [predMinutes, setPredMinutes] = useState('');
  const [team, setTeam] = useState('');
  const [opponents, setOpponents] = useState([]);

  function makeOpponentsList() {
    let list = [];
    // console.log(currentTeam)
    Object.keys(teams).forEach((thisTeam) => {
      if (currentTeam !== thisTeam) {
        list.push(thisTeam);
      }
    });
    // console.log('made list')
    // console.log(list)
    setOpponents(list);
  }

  useEffect(() => {
    makeOpponentsList();
  }, []);

  useEffect(() => {
    makeOpponentsList();
  }, [currentTeam]);

  const handleOpponentSelect = (team) => {
    setOpponent(team);
  };

  const handleMarketSelect = (market) => {
    setMarket(market);
    onMarketChange(market);
  };

  const handleSeasonSelect = (season) => {
    // console.log('seaon in deffilters:', season)
    setSeason(season);
    onSeasonChange(season);
  };

  const handlePredMinutesChange = (predMinutes) => {
    // console.log('pred minutes in deffilters:', predMinutes)
    setPredMinutes(predMinutes);
    onPredMinutesChange(predMinutes);
  };

  const handleTeamSelect = (team) => {
    setTeam(team);
    onTeamChange(team);
  };

  return (
    <TableRow
      sx={{
        '&:last-child td, &:last-child th': { border: 0 },
        backgroundColor: 'rgba(0, 128, 128,.15)'
      }}>
      <TableCell component='th' scope='row'></TableCell>
      <TableCell>
        <SelectionList
          value={team}
          onChange={handleTeamSelect}
          list={opponents}
          dense
        />
      </TableCell>
      <TableCell>
        <SelectionList
          value={market}
          onChange={handleMarketSelect}
          list={markets}
          dense
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionListMultiple
          value={season}
          onChange={handleSeasonSelect}
          list={seasons}
          dense
        />
      </TableCell>
      <TableCell>
        <Input
          value={predMinutes}
          onChange={handlePredMinutesChange}
          dense
          narrow
        />
      </TableCell>
      <TableCell>
        <SelectionList value={''} onChange={() => {}} list={[]} dense />
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionList value={''} onChange={() => {}} list={[]} dense />
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
