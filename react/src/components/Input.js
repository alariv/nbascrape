import React from 'react';
import { TextField } from '@mui/material';

export default function Input({
  label = '',
  onChange,
  dense = false,
  narrow = false,
  disabled = false,
  value = '',
  wide = false,
  flex = false,
  onBlur = () => {}
}) {
  return (
    <TextField
      label={label}
      value={value ?? ''}
      disabled={disabled}
      onBlur={onBlur}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      className={
        (dense ? 'dense ' : '') +
        (narrow ? 'narrow ' : '') +
        (wide ? 'wide ' : '') +
        (flex ? 'flex' : '')
      }
    />
  );
}
