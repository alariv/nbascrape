import React from 'react';
import { Select, MenuItem } from '@mui/material';

export default function SelectionList({
  value,
  label = '',
  onChange = (season) => {},
  list = [],
  dense = false,
  disabled = false,
  flex = false
}) {
  return (
    <Select
      className={dense ? 'dense' : '' + flex ? 'flex' : ''}
      value={value}
      label={label}
      disabled={disabled}
      onChange={(e) => {
        onChange(e.target.value);
      }}>
      {list.map((item, idx) => (
        <MenuItem value={item} key={idx}>
          {item}
        </MenuItem>
      ))}
    </Select>
  );
}
