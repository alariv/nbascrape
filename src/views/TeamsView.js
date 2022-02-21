import React, {useEffect, useState} from 'react'
import {InputLabel, Select, MenuItem, FormControl, Grid, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody} from '@mui/material'
import TeamPlayerRow from '../components/TeamPlayerRow'
import teamsString from '../scrapedData/teams.json'

export default function Teams() {
  const [loading, setLoading] = useState(false)
  const [playersLoading, setPlayersLoading] = useState(false)
  const [selectedTeam, setTeam] = useState('')
  const [defaultSeason, setDefaultSeason] = useState('21/22')
  const tableHeadingStyle = {fontWeight: '600'}
  const [opponent, setOpponent] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')

  const [teamPlayers, setTeamPlayers] = useState([])
  const [teams, setTeams] = useState({})

  const tableColumns = [
    selectedTeam,
    'Opponent',
    'Market',
    'Line',
    'Seasons',
    'Pred. min range',
    'Extra filtrid',
    'Total games (Over/Under)',
    'Matchup value',
    'True over %',
    'True under %',
    'Bookie odds',
    'Unit size'
  ]

  useEffect(() => {
    // setTeams(JSON.parse(teamsString))
    console.log(teamsString)
    setTeams(teamsString)
  }, [])

  const handleTeamSelect = team => {
    setTeam(team)
    setPlayersLoading(true)
    let teamPlayersArr = []
    Object.keys(teams[team].players).map(player => {
      // console.log(player)
      teamPlayersArr.push(player)
    })
    setTeamPlayers(teamPlayersArr)
    setPlayersLoading(false)
  }

  const handleOpponentSelect = opponent => {
    console.log('default opponent selected:', opponent)
    setOpponent(opponent)
  }

  const handleMarketSelect = market => {
    console.log('default market selected:', market)
    setSelectedMarket(market)
  }

  const handleDefaultSeaonChange = season => {
    setDefaultSeason(season)
  }

  return (
    <>
      <header className="App-header">
        <h3>Teams</h3>
      </header>
      {!loading && (
        <div>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Select team</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedTeam}
              label="Select team"
              onChange={e => {
                handleTeamSelect(e.target.value)
              }}
            >
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
          <TableContainer component={Paper} className="statsTable">
            <Table sx={{minWidth: 650}} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {tableColumns.map((colHeading, idx) => (
                    <TableCell sx={tableHeadingStyle}>{colHeading}</TableCell>
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
                  opponent={opponent}
                />

                {teamPlayers.map((player, idx) => (
                  <TeamPlayerRow
                    team={selectedTeam}
                    player={player}
                    index={idx}
                    defaultSeason={defaultSeason ?? ''}
                    opponent={opponent}
                    selectedMarket={selectedMarket}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  )
}
