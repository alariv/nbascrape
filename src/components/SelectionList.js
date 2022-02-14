import logo from '../logo.svg';
import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell } from '@mui/material';

export default function SelectionList ({value, label='', onChange, list, dense=false}) {

    return (
        <Select
            className={dense ? 'dense' : ''}
            value={value}
            label={label}
            onChange={(e) => {onChange(e.target.value)}}
        >
            {list.map((item, idx) => (
                <MenuItem value={item}>{item}</MenuItem>
            ))}
        </Select>
    )
}