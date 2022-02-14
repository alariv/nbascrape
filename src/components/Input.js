import React, {useState} from 'react';
import { TextField } from '@mui/material';

export default function Input ({label='', onChange, dense=false, narrow=false}) {

    return (
        <TextField label={label} onChange={(e) => {onChange(e.target.value)}} 
            className={(dense ? 'dense ' : '')}/>
    )
}