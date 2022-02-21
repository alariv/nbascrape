import logo from '../logo.svg'
import React, {useState} from 'react'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import {InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell, TextField} from '@mui/material'
import SelectionList from './SelectionList'
import teams from '../scrapedData/teams.json'

export default function TeamPlayerRow({seasons, markets, onSeasonChange, onTeamChange, onMarketChange}) {
  const [opponent, setOpponent] = useState('')
  const [market, setMarket] = useState('')
  const [season, setSeason] = useState('21/22')
  const [team, setTeam] = useState('')

  const handleOpponentSelect = team => {
    setOpponent(team)
  }

  const handleMarketSelect = market => {
    setMarket(market)
    onMarketChange(market)
  }

  const handleSeasonSelect = season => {
    setSeason(season)
    onSeasonChange(season)
  }

  const handleTeamSelect = team => {
    setTeam(team)
    onTeamChange(team)
  }

  return (
    <TableRow sx={{'&:last-child td, &:last-child th': {border: 0}, backgroundColor: 'rgba(0, 128, 128,.15)'}}>
      <TableCell component="th" scope="row"></TableCell>
      <TableCell>
        <SelectionList value={team} onChange={handleTeamSelect} list={Object.keys(teams)} dense />
      </TableCell>
      <TableCell>
        <SelectionList value={market} onChange={handleMarketSelect} list={markets} dense />
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense />
      </TableCell>
      <TableCell>
        <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense />
      </TableCell>
      <TableCell>
        <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense />
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
    </TableRow>
  )
}
