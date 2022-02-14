import logo from '../logo.svg';
import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell, TextField } from '@mui/material';
import SelectionList from './SelectionList'
import DefaultFilters from './DefaultFilters';
import Input from './Input';

export default function TeamPlayerRow ({team='', player='', index, teams=[], filtersOnly=false, onSeasonChange=()=>{}, defaultSeason=(new Date()).getFullYear()+''}) {
    const [opponent, setOpponent] = useState('')
    const [market, setMarket] = useState('')
    const [line, setLine] = useState('')
    const [season, setSeason] = useState('')

    const markets = {
        'G': 'G',
        'GS': 'GS',
        'MP': 'MP',
        'FG': 'FG',
        'FGA': 'FGA',
        'FG%': 'FG%',
        '3P': '3P',
        '3PA': '3PA',
        '3P%': '3P%',
        '2P': '2P',
        '2PA': '2PA',
        '2P%': '2P%',
        'eFG': 'eFG',
        'FT': 'FT',
        'FTA': 'FTA',
        'FT%': 'FT%',
        'ORB': 'ORB',
        'DRB': 'DRB',
        'TRB': 'TRB',
        'AST': 'AST',
        'STL': 'STL',
        'BLK': 'BLK',
        'TOV': 'TOV',
        'PF': 'PF',
        'PTS': 'PTS',
    }

    const seasons = [
        '2017',
        '2018',
        '2019',
        '2020',
        '2021',
        '2022'
    ]

    const handleOpponentSelect = (team) => {
        setOpponent(team)
    }

    const handleMarketSelect = (market) => {
        setMarket(market)
    }

    const handleSeasonSelect = (season) => {
        setSeason(season)
    }

    const handleLineChange = (line) => {
        setLine(line)
    }

    return (
        <>
            {filtersOnly
                ? <DefaultFilters seasons={seasons} onSeasonChange={onSeasonChange}/>
                : <TableRow
                    key={index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                    <TableCell component="th" scope="row">
                        {player}
                    </TableCell>
                    <TableCell>
                        <SelectionList value={opponent} onChange={handleOpponentSelect} list={teams} dense/>
                    </TableCell>
                    <TableCell>
                        <SelectionList value={market} onChange={handleMarketSelect} list={Object.keys(markets)} dense/>
                    </TableCell>
                    <TableCell>
                        <Input onChange={handleLineChange} dense narrow/>
                    </TableCell>
                    <TableCell>
                        <SelectionList value={season ? season : defaultSeason} onChange={handleSeasonSelect} list={seasons} dense/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                    <TableCell>
                        <Input onChange={() => {}} dense narrow/>    
                    </TableCell>
                </TableRow>}
        </>
    )
}