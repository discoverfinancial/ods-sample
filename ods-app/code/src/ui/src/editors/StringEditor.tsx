/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { getDocField, setDocField } from '../managers';
import { TextField } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { IDocMgr } from '../managers/Managers';

let timeOutId:any;

interface Props {
    fieldName: string;
    label?: string;
    document: any;
    setDocument: React.Dispatch<React.SetStateAction<any>>;
    editMode: boolean;
    children?: React.ReactNode;
    onChange?: (document: any, fieldName: string) => Promise<void>;
    required?: boolean;
    setError: (name:string, text:string) => void;
    rows?: number;
    docMgr: IDocMgr<any>;
}

const StringEditor: React.FC<Props> = ({ fieldName, label, document: document, setDocument, editMode, children, onChange, required=false, setError, rows, docMgr}) => {

    const [initComplete, setInitComplete] = useState<boolean>(false);    

    const _value = getDocField(document, fieldName);
    const [value, setValue] = useState<string>((_value || ""))
    
    async function saveData() {
        if ( getDocField(document, fieldName) != value) {
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

    async function onEditorBlur() {
        saveData();
    }

    async function onEditorChange(event: any): Promise<void> {
        const _value = event.target.value;
        setValue(_value);
    }

    useEffect(() => {
        console.log("Init page load")
        setInitComplete(true);
    }, []);

    useEffect(() => {
        if (initComplete) {
            if (timeOutId) clearTimeout(timeOutId);
            timeOutId = setTimeout(async () => {
                timeOutId = null;
                saveData();
            }, 1000);
        }
        if (required) {
            if (value) {
                setError(fieldName, "");
            }
            else {
                setError(fieldName, `Field ${fieldName} is required`)
            }
        }
    }, [value]);

    const paddingTop = "1em";
    return (
        <div>
            {children && 
                <div className="editorDescription">{children}</div>
            }
            <div style={{paddingTop: paddingTop}}/>
            <div className="editorDiv">
                <TextField
                    id={"editor-"+fieldName} 
                    value={value} 
                    disabled={!editMode} 
                    onBlur={onEditorBlur} 
                    onChange={onEditorChange}
                    label={label}
                    multiline={rows?true:false}
                    rows={rows?rows:1}
                    sx={{
                        width: "100%",
                        ".MuiInputBase-multiline": {
                                padding: "0px",
                        }
                    }}
                />
                    {!value && required &&
                    <div style={{color:"#A01C2B", fontSize:"14px", marginLeft:"10px", marginTop:"10px"}}>
                        <ErrorIcon style={{width: "12px", height: "12px"}}/> This selection is required.
                    </div>}
            </div>
        </div>
    )
}

export default StringEditor;
