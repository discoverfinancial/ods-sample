/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState } from 'react'
import { IconButton } from '@mui/material'
import AddIcon from "@mui/icons-material/Add"
import { TextField } from '@mui/material';

interface Props {
   label: string;
   handleAdd(value: string): void;
   disabled?: boolean;
}

const AddPerson: React.FC<Props> = ({label, handleAdd, disabled}) => {
    const [input, setInput] = useState<string>("");

    if (disabled) {
        return <></>;
    }

    return (
        <div style={{display:"flex", alignItems:"center"}}>
            <TextField 
                id="newGroupName" 
                className="text" 
                type="input" 
                disabled={disabled}
                label={label} 
                value={input} 
                onChange={(e:any)=>setInput(e.target.value)}
            ></TextField>
            &nbsp; &nbsp; <IconButton disabled={disabled} onClick={() => {
                handleAdd(input);
                setInput("");
            } } aria-label={"Add"} ><AddIcon/></IconButton>
        </div>
  )
}

export default AddPerson;
