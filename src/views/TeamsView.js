import React, {useState} from 'react';
import { InputLabel, Select, MenuItem, FormControl, Grid, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import TeamPlayerRow from '../components/TeamPlayerRow'

export default function Teams () {
    const [selectedTeam, setTeam] = useState('')
    const [defaultSeason, setDefaultSeason] = useState((new Date()).getFullYear()+'')
    const tableHeadingStyle = {fontWeight: '600'}

    const teamPlayers = [
        'Clint Capela',
        'Trae Young',
        'John Collins'
    ]
    const teams = [
        'Atalanta',
        'Boston',
        'Brooklyn'
    ]
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

    const handleTeamSelect = (team) => {
        setTeam(team)
    }

    const handleDefaultSeaonChange = (season) => {
        setDefaultSeason(season)
    }

    return (
        <>

            {/* TITLE */}
            <header className="App-header">
                <h3>
                    Teams
                </h3>
            </header>

            {/* TEAM SELECT */}
            <div>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Select team</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedTeam}
                        label="Select team"
                        onChange={(e) => {handleTeamSelect(e.target.value)}}
                    >
                        {teams.map((team, idx) => (
                            <MenuItem value={team}>{team}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {selectedTeam && <>
                <TableContainer component={Paper} className='statsTable'>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            {tableColumns.map((colHeading, idx) => (
                                <TableCell sx={tableHeadingStyle}>{colHeading}</TableCell>
                            ))}
                            
                        </TableRow>
                        </TableHead>
                        <TableBody>

                            <TeamPlayerRow index={9999} filtersOnly onSeasonChange={handleDefaultSeaonChange}/>

                            {/* TEAM PLAYER ROW*/}
                            {teamPlayers.map((player, idx) => (
                                <TeamPlayerRow team={selectedTeam} player={player} index={idx} teams={teams} defaultSeason={defaultSeason ?? ''}/>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

            </>}
        </>
    )

}