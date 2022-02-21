import logo from '../logo.svg'
import React, {useState} from 'react'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import {InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell, TextField} from '@mui/material'
import SelectionList from './SelectionList'
import DefaultFilters from './DefaultFilters'
import Input from './Input'
import teams from '../scrapedData/teams.json'
import SelectionListMultiple from './SelectionListMultiple'

export default function TeamPlayerRow({
  team = '',
  player = '',
  index,
  filtersOnly = false,
  onSeasonChange = () => {},
  onOpponentSelect = () => {},
  onMarketSelect = () => {},
  defaultSeason = '',
  opponent = '',
  selectedMarket = ''
}) {
  const [market, setMarket] = useState('')
  const [line, setLine] = useState('')
  const [season, setSeason] = useState('')

  const markets = {
    G: 'G',
    GS: 'GS',
    MP: 'MP',
    FG: 'FG',
    FGA: 'FGA',
    'FG%': 'FG%',
    '3P': '3P',
    '3PA': '3PA',
    '3P%': '3P%',
    '2P': '2P',
    '2PA': '2PA',
    '2P%': '2P%',
    eFG: 'eFG',
    FT: 'FT',
    FTA: 'FTA',
    'FT%': 'FT%',
    ORB: 'ORB',
    DRB: 'DRB',
    TRB: 'TRB',
    AST: 'AST',
    STL: 'STL',
    BLK: 'BLK',
    TOV: 'TOV',
    PF: 'PF',
    PTS: 'PTS'
  }

  const seasons = ['16/17', '17/18', '18/19', '19/20', '20/21', '21/22']

  //   const handleOpponentSelect = team => {
  //     setOpponent(team)
  //   }

  const handleMarketSelect = market => {
    setMarket(market)
  }

  const handleSeasonSelect = season => {
    setSeason(season)
  }

  const handleLineChange = line => {
    setLine(line)
  }

  return (
    <>
      {filtersOnly ? (
        <DefaultFilters
          seasons={seasons}
          onSeasonChange={onSeasonChange}
          onTeamChange={onOpponentSelect}
          onMarketChange={onMarketSelect}
          markets={Object.values(markets)}
        />
      ) : (
        <TableRow key={index} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
          <TableCell component="th" scope="row">
            {player}
          </TableCell>
          <TableCell>
            <SelectionList value={opponent} list={Object.keys(teams)} dense disabled />
          </TableCell>
          <TableCell>
            <SelectionList value={market ? market : selectedMarket} onChange={handleMarketSelect} list={Object.values(markets)} dense />
          </TableCell>
          <TableCell>
            <Input onChange={handleLineChange} dense narrow />
          </TableCell>
          <TableCell>
            <SelectionListMultiple value={season ? season : defaultSeason} onChange={handleSeasonSelect} list={seasons} dense />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
          <TableCell>
            <Input onChange={() => {}} dense narrow />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
