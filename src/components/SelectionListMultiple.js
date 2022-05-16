import React from 'react';
import { Select, MenuItem, Checkbox, ListItemText } from '@mui/material';

export default function SelectionListMultiple({
  value,
  label = '',
  onChange = (season) => {},
  list = [],
  dense = false,
  disabled = false
}) {
  const changeCB = (e) => {
    // console.log(e)
  };

  return (
    <Select
      multiple
      className={(dense ? 'dense' : '') + ' multiSelect'}
      value={value}
      label={label}
      disabled={disabled}
      renderValue={(selected) => selected.sort().join('\n ')}
      onChange={(e) => {
        // // console.log(value)
        onChange(e.target.value);
      }}>
      {list.map((item, idx) => (
        <MenuItem value={item} key={idx}>
          <Checkbox checked={value.includes(item)} />
          <ListItemText primary={item} />
        </MenuItem>
      ))}
    </Select>
  );
}
