import logo from '../logo.svg'
import React, {useState} from 'react'
import {styled} from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import {InputLabel, Select, MenuItem, FormControl, Grid, TableRow, TableCell, Checkbox} from '@mui/material'

export default function SelectionListMultiple({value, label = '', onChange = () => {}, list = [], dense = false, disabled = false}) {
  return (
    <Select
      multiple
      className={dense ? 'dense' : ''}
      value={[value]}
      label={label}
      disabled={disabled}
      renderValue={selected => selected.join(', ')}
      onChange={e => {
        onChange(e.target.value)
      }}
    >
      {list.map((item, idx) => (
        <MenuItem value={item} key={idx}>
          <Checkbox checked={value.indexOf(value) > -1} />
          {item}
        </MenuItem>
      ))}
    </Select>
  )
}
