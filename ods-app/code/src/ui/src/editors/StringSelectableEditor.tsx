/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState, useEffect } from 'react';
import { getDocField, setDocField } from '../managers';
import { FormControl, FormControlLabel, FormLabel, InputLabel, MenuItem, Radio, RadioGroup, Select } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { IDocMgr } from '../managers/Managers';

interface Props {
    fieldName: string;
    label?: string;
    document: any;
    setDocument: React.Dispatch<React.SetStateAction<any>>;
    values: any;
    defaultValue: string;
    variant?: "select" | "radio";
    editMode: boolean;
    children?: React.ReactNode;
    onChange?: (document: any, fieldName: string) => Promise<void>;
    required?: boolean;
    setError: (name:string, text:string) => void;
    docMgr: IDocMgr<any>;
}

const StringSelectableEditor: React.FC<Props> = ({ fieldName, label, document, setDocument, values, defaultValue, variant="select", editMode, children, onChange, required=false, setError , docMgr}) => {
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const _value = getDocField(document, fieldName);
    const [value, setValue] = useState<string>((_value || ""))
    
    async function saveData() {
        console.log("saveData=",value);
        if (getDocField(document, fieldName) != value) {
            console.log("Editor state data changed=", value);
            setDocField(document, fieldName, value);
            const r = await docMgr.saveDocument(document, fieldName);
            if (r) {
                setDocument(r);
                if (onChange) {
                    onChange(r, fieldName);
                }
            }
        }
    }

    async function handleChange(event: any): Promise<void> {
        const _value = event.target.value;
        setValue(_value);
    }

    const renderSelectComponent = () => {
        return (
            <div>
                <Select 
                    id={"stringSelect-"+fieldName}
                    labelId={"stringSelectLabel-"+fieldName}
                    value={value} 
                    onChange={handleChange}
                    sx={{
                        width: "100%",
                    }}
                    label={label}
                >
                    {renderSelectableItems(variant)}
                </Select>
            </div>
        );
    }

    const renderRadioComponent = () => {
        return (
            <FormControl>
                <FormLabel id="underline-hotlinks-lightmode-radio-buttons-group">{label}</FormLabel>
                <RadioGroup
                    aria-labelledby="hotlinks-lightmode-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={value}
                    onChange={handleChange}
                >
                    {renderSelectableItems(variant)}
                </RadioGroup>
            </FormControl>
        );
    }

    const renderSelectableItems = (variant?: string) => {
        var r = [];
        for (var i=0; i<values.length; i++) {
            let value = "";
            let label = "";
            if (typeof values[i] === "string") {
                value = values[i];
                label = value;
            }
            else {
                value = values[i].value;
                label = values[i].label;
            }
            if (!variant || variant === "select") {
                r.push(<MenuItem key={value} value={value}> {label} </MenuItem>)
            } else if (variant === "radio") {
                r.push(<FormControlLabel key={value} value={value} control={<Radio />} label={label} 
                    sx={{
                        "& .MuiFormControlLabel-label": {
                            fontSize: "1rem",
                            fontFamily: "sans-serif",
                        }
                    }}
                />)
            } else {
                r.push(<div>Unknown Values</div>)
            }
        }
        return r;
    }

    useEffect(() => {
        console.log("Init page load")
        setInitComplete(true);
    }, []);

    useEffect(() => {
        console.log("StringSelectableEditor: New value=",value,"initComplete=",initComplete,"fieldName=",fieldName,"required=",required);
        if (initComplete) {
            saveData();
        }
        if (required) {
            if (value) {
                setError(fieldName, "")
            }
            else {
                setError(fieldName, `Field ${fieldName} is required`)
            }
        }
    }, [value]);

    return (
        <div>
            {children && 
                <div className="editorDescription">{children}</div>
            }
            <div style={{paddingTop:"8px"}}/>
            <div className="editorDiv">
                {editMode && <>
                    <InputLabel id={"stringSelectLabel-"+fieldName} >{label}</InputLabel>
                    {(!variant || variant === "select") && renderSelectComponent()}
                    {(variant === "radio") && renderRadioComponent()}

                    {!value && required &&
                    <div style={{color:"#A01C2B", fontSize:"14px", marginLeft:"10px", marginTop:"10px"}}>
                        <ErrorIcon style={{width: "12px", height: "12px"}}/> This selection is required.
                    </div>}

                </>}
                {!editMode && <>
                    <InputLabel id={"stringSelectLabel-"+fieldName} >{label}</InputLabel>
                    {value}                    
                </>}

            </div>
        </div>
    )
}

export default StringSelectableEditor;
