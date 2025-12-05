/**
 * Copyright (c) 2025 Capital One
*/

import React, { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField, TextFieldVariants } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface Props {
    readonly? : boolean;
    value?: string;
    changeCallback?: React.Dispatch<React.SetStateAction<string>>
    variant?: TextFieldVariants;
}

/**
 * A password field component that hides the underlying TextField's value
 *  by default.  It can be bound to a value and will call the setter
 *  function should the value change and the field loses focus.
 */
const SecretField: React.FC<Props> = ({ readonly, value, changeCallback, variant }) => {

    const [secret, setSecret] = useState(value);
    const [readOnly, setReadOnly] = useState(readonly);
    const [hidePassword, setHidePassword] = useState(true);
    const [_variant] = useState<TextFieldVariants>(variant ? variant : "outlined");

    useEffect(() => {
        if (secret !== value) {
            setSecret(value);
        }
        if (readOnly !== readonly) {
            setReadOnly(readonly);
        }
    }, [value, readonly])

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        // when the SecretField loses focus and the bound value has changed,
        //  the bound value setter will be called with the updated value
        if (event && event.target && changeCallback) {
            if (event.target.value !== value) {
                changeCallback(event.target.value);
            }
        }
    }

    return (
        <TextField
            type={hidePassword ? "password" : "text"}
            value={value}
            variant={variant}
            inputProps={{readonly: readOnly}}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => handleBlur(event)}
            InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => {setHidePassword(!hidePassword)}}>
                        {hidePassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
            }}
        />
    )
}

export default SecretField;