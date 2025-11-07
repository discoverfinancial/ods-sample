/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState, useEffect } from 'react';
import { Button, Chip, InputLabel, TextField } from '@mui/material';
import { IDocMgr } from '../managers/Managers';
import { AppContext } from "../common";
import './StringListEditor.css';

let timeOutId:any;

interface Props {
    fieldName: string;
    label?: string;
    docMgr: IDocMgr<any>;
    document: any;
    setDocument: React.Dispatch<React.SetStateAction<any>>;
    editMode: boolean;
    children?: React.ReactNode;
    onChange?: (document: any, fieldName: string) => Promise<void>;
    required?: boolean;
    setError: (name:string, text:string) => void;
    context?: AppContext
}

/* This component will display a text field that the user can use to add values to
 *  a list, represented using chips.  User can delete items from list by deleting
 *  chips.  List will be saved as an array of strings to document[fieldName].
 */
const StringListEditor: React.FC<Props> = ({ fieldName, label, docMgr, document, setDocument, editMode, children, onChange, required=false, setError, context }) => {
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const _value = document[fieldName];
    const [currItem, setCurrItem] = useState<string>();
    const [value, setValue] = useState<Set<string>>(_value ? new Set<string>(_value) : new Set<string>([]));
    const [readonly, setReadonly] = useState<boolean>(!editMode);

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

    const areArraysEqual = (array1: Array<string>, array2: Array<string>) => {
        if (!array1 && !array2) return true;
        if (!array1 || !array2 || array1.length !== array2.length) return false;
        const equal = Array.from(array1).every((s1item, index) => {return array2[index] === s1item});
        return equal;
    }

    async function saveData() {
        const valueArray = Array.from(value);
        if (!areArraysEqual(document[fieldName], valueArray)) {
            console.log("Editor state data changed=", value);
            document[fieldName] = valueArray;
            try {
                const r = await docMgr.saveDocument(document, fieldName);
                if (r) {
                    setDocument(r);
                    if (onChange) {
                        onChange(r, fieldName);
                    }
                }
            } catch (e) {
                context && context.showErrorDialog && context.showErrorDialog(e);
            }
        }
    }

    const handleItemAdd = () => {
        if (currItem) {
            //update current set
            setValue(new Set<string>(value.add(currItem)));
            setCurrItem("");
        }
    }

    const handleItemDelete = (item: string) => {
        //update current set
        const succeeded = value.delete(item);
        if (succeeded) {
            setValue(new Set<string>(value));
        }
    }

    return (
        <div className="editorDiv">
            <InputLabel id={`${fieldName}-chip-list-label`} style={{textTransform: "uppercase"}}>{label}</InputLabel>
            {!readonly && <div className='stringListEditorContainer'>
                <TextField
                    value={currItem}
                    aria-labelledby={`${fieldName}-chip-list-label`}
                    onChange={(event) => setCurrItem(event.target.value)}
                    sx={{
                        width: "100%"
                    }}
                />
                <Button variant="outlined" onClick={handleItemAdd} sx={{marginLeft: "var(--spacing-1)"}}>Add</Button>
            </div>}

            <div style={{display: "flex", width: "100%"}}>
                <div className="chipContainer darkerChips">
                    {Array.from(value).map((value) => {
                        if (!readonly) {
                            return (<Chip key={value} label={value} variant="outlined" onDelete={() => {handleItemDelete(value)}} />)
                        } else {
                            return (<Chip key={value} label={value} variant="outlined" />)
                        }
                    })}
                </div>
            </div>
        </div>
    )
}

export default StringListEditor;
