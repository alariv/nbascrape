import logo from '../logo.svg';
import React, {useState} from 'react';
import { InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import TeamPlayerRow from '../components/TeamPlayerRow'

export default function Teams () {
    const [selectedTeam, setTeam] = useState('')

    const teamPlayers = [
        'Clint Capela',
        'Trae Young',
        'John Collins'
    ]

    const handleTeamSelect = (team) => {
        setTeam(team)
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
                    <InputLabel id="demo-simple-select-label">Age</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedTeam}
                        label="Age"
                        onChange={(e) => {handleTeamSelect(e.target.value)}}
                    >
                        <MenuItem value="Atlanta">Atlanta</MenuItem>
                        <MenuItem value="Boston">Boston</MenuItem>
                        <MenuItem value="Brooklyn">Brooklyn</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {selectedTeam && <>
                <h4>{selectedTeam}</h4>

                {/* TEAM PLAYER ROW*/}
                {teamPlayers.map((player) => (
                    <TeamPlayerRow team={selectedTeam} player={player}/>
                ))}

            </>}
        </>
    )

}