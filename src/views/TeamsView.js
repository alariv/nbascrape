import React, { useEffect, useState } from 'react';
import {
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack
} from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import TeamPlayerRow from '../components/TeamPlayerRow';
import teamsString from '../scrapedData/teams.json';

export default function Teams() {
  const [loading, setLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [selectedTeam, setTeam] = useState('');
  const [defaultSeason, setDefaultSeason] = useState(['21/22']);
  const tableHeadingStyle = { fontWeight: '600' };
  const [opponent, setOpponent] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [defaultPredMinutes, setdefaultPredMinutes] = useState('');

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [teams, setTeams] = useState({});

  const tableColumns = [
    selectedTeam,
    'Opponent',
    'Market',
    'Line',
    'Seasons',
    'Pred. min range',
    'Extra filtrid',
    '+/- player',
    'Total games (Over/Under)',
    'Matchup value',
    'True over %',
    'True under %',
    'Bookie odds',
    'Unit size'
  ];

  useEffect(() => {
    window.localStorage.getItem('selectedTeam') &&
      setTeam(window.localStorage.getItem('selectedTeam'));
  }, []);

  useEffect(() => {
    Object.keys(teams).length && selectedTeam && handleTeamSelect(selectedTeam);
  }, [selectedTeam, teams]);

  useEffect(() => {
    // setTeams(JSON.parse(teamsString))
    // // console.log(teamsString)
    setTeams(teamsString);
  }, [teamsString]);

  const handleTeamSelect = (team) => {
    setTeam(team);
    // console.log('selected:', team);
    setPlayersLoading(true);
    let teamPlayersArr = [];
    Object.keys(teams[team].players).map((player) => {
      // // console.log(player)
      teamPlayersArr.push(player);
    });
    setTeamPlayers(teamPlayersArr);
    window.localStorage.setItem('selectedTeam', team);
    setPlayersLoading(false);
  };

  const handleOpponentSelect = (opponent) => {
    // console.log('default opponent selected:', opponent);
    setOpponent(opponent);
  };

  const handleMarketSelect = (market) => {
    // console.log('default market selected:', market);
    setSelectedMarket(market);
  };

  const handleDefaultSeaonChange = (season) => {
    // console.log('setting default season to:', season);
    setDefaultSeason(typeof season === 'string' ? season.split(',') : season);
  };

  const handlePredMinutesChange = (predMinutes) => {
    // console.log('setting pred minutes to:', predMinutes);
    setdefaultPredMinutes(predMinutes);
  };

  return (
    <>
      <header className='App-header'>
        <h3>Teams</h3>
      </header>
      {!loading && (
        <div>
          <FormControl style={{ minWidth: '200px' }}>
            <InputLabel id='demo-simple-select-label'>Select team</InputLabel>
            <Select
              labelId='demo-simple-select-label'
              id='demo-simple-select'
              value={selectedTeam}
              label='Select team'
              onChange={(e) => {
                setTeam(e.target.value);
              }}>
              {Object.keys(teams).map((team, idx) => (
                <MenuItem value={team} key={idx}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {selectedTeam && !loading && (
        <>
          <TableContainer component={Paper} className='statsTable'>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  {tableColumns.map((colHeading, idx) => (
                    <TableCell key={idx} sx={tableHeadingStyle}>
                      {colHeading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TeamPlayerRow
                  index={9999}
                  filtersOnly
                  onSeasonChange={handleDefaultSeaonChange}
                  onOpponentSelect={handleOpponentSelect}
                  onMarketSelect={handleMarketSelect}
                  onPredMinutesChange={handlePredMinutesChange}
                  opponent={opponent}
                  team={selectedTeam}
                />

                {teamPlayers.map((player, idx) => {
                  return (
                    <TeamPlayerRow
                      key={idx}
                      team={selectedTeam}
                      player={player}
                      players={teamPlayers}
                      index={idx}
                      defaultSeason={defaultSeason ?? []}
                      opponent={opponent}
                      selectedMarket={selectedMarket}
                      defaultPredMinutes={defaultPredMinutes}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
}
