import logo from '../logo.svg';
import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell, TextField } from '@mui/material';
import SelectionList from './SelectionList'

export default function TeamPlayerRow ({seasons, onSeasonChange}) {
    const [opponent, setOpponent] = useState('')
    const [market, setMarket] = useState('')
    const [season, setSeason] = useState(2022)

    const handleOpponentSelect = (team) => {
        setOpponent(team)
    }

    const handleMarketSelect = (market) => {
        setMarket(market)
    }

    const handleSeasonSelect = (season) => {
        setSeason(season)
        onSeasonChange(season)
    }

    return (
        <TableRow
            sx={{ '&:last-child td, &:last-child th': { border: 0 }, backgroundColor: 'rgba(0, 128, 128,.15)' }}
        >
                <TableCell component="th" scope="row"></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell>
                    <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense/>    
                </TableCell>
                <TableCell>
                    <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense/>    
                </TableCell>
                <TableCell>
                    <SelectionList value={season} onChange={handleSeasonSelect} list={seasons} dense/>    
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