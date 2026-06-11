/**
 * Copyright (c) 2025 Capital One
*/

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { Button, TextField, Drawer, Backdrop, CircularProgress, 
    Select, MenuItem, Accordion, AccordionSummary, AccordionDetails, Checkbox,
  ListItemText } from '@mui/material'

import { AppContext, Notebook, Person } from "../common";
import StyledDialog from '../components/StyledDialog';

import { ScriptMgr } from '../managers/ScriptMgr';
import { NotebookMgr } from '../managers/NotebookMgr';
import { styled } from '@mui/system';
import Help from '../Help';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../navbar';
import TopMenu from '../components/TopMenu';

import { v4 as uuidv4 } from "uuid";
import { formatDateTime, ScriptInfo } from '../common';
import NotebookEditorCell from './NotebookEditorCell';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
// import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
// import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
// import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import Attachments from '../components/Attachments';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MembersTable from '../components/MembersTable';
import AddPerson from '../components/AddPerson';
import { DocMgr } from '../managers/DocMgr';
import { SimpleDialog } from '../components/SimpleDialog';

// let prevSelectedNotebookId = "";
let key = 1;
let notebookUpdated = false;

// export interface Notebook {
//     cells: NotebookCell[];
// }

// export interface NotebookCell {
//     id: string;
//     name: string;
//     type: string;           // "code" | "text";
//     data: string;
//     view: string[];         // "tree" | "raw" | "sbom" | "json" | editor, preview;
//     viewEditor: string;     // "show" or "" | "hide"
//     columns?: string;
//     parameters?: any;
//     run?: any;              // run script method set by NotebookEditorCell so all cells can be run
//     lastRunStart?: any;     // last time cell was run
//     lastRunDone?: any;      // last time cell completed
// }

interface Props {
    context: AppContext;
}

// interface Props {
//     context: AppContext;
//     selectedId: string;
//     setSelectedId: any;
//     setShowSpinner?: any;
//     presentationMode?: boolean;
//     setPresentationMode?: any;
//     embedMode?: boolean;
//     setEmbedMode?: any;
// }

interface NotebookOptions {
    id: string;
    name: string;
    isChecked: boolean;
}

// let initComplete = false;
let importNotebooks: any[] = [];
let noScrollToHash = false;
let pageHeight = 0;

const daysOfWeek = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
]
const timesOfWeek = [
    {value: "", label: "None"},
    {value: "0", label: "12 AM"},
    {value: "1", label: "1 AM"},
    {value: "2", label: "2 AM"},
    {value: "3", label: "3 AM"},
    {value: "4", label: "4 AM"},
    {value: "5", label: "5 AM"},
    {value: "6", label: "6 AM"},
    {value: "7", label: "7 AM"},
    {value: "8", label: "8 AM"},
    {value: "9", label: "9 AM"},
    {value: "10", label: "10 AM"},
    {value: "11", label: "11 AM"},
    {value: "12", label: "12 PM"},
    {value: "13", label: "1 PM"},
    {value: "14", label: "2 PM"},
    {value: "15", label: "3 PM"},
    {value: "16", label: "4 PM"},
    {value: "17", label: "5 PM"},
    {value: "18", label: "6 PM"},
    {value: "19", label: "7 PM"},
    {value: "20", label: "8 PM"},
    {value: "21", label: "9 PM"},
    {value: "22", label: "10 PM"},
    {value: "23", label: "11 PM"},
]

const daysOfMonth:string[] = [];
for (var i=1; i<32; i++) {
    daysOfMonth.push(""+i);
}

const NotebookEditor: React.FC<Props> = ({ context }) => {
// const NotebooksEditor: React.FC<Props> = ({ context, selectedId, setSelectedId, setShowSpinner, presentationMode, setPresentationMode, embedMode, setEmbedMode }) => {
    // console.log("selectedId=", selectedId, "embedMode=", embedMode, "initComplete=", initComplete);
    const type = "notebook";
    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();
    const notebookMgr = NotebookMgr.getInstance();

    const { id } = useParams();
    const scriptId = id || "";

    let presentationParam: any = null;
    let embedParam: any = null;
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        presentationParam = query.get("presentation");
        embedParam = query.get("embed");
    }
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [presentationMode, setPresentationMode] = useState<boolean>(presentationParam ? true: false);
    const [embedMode, setEmbedMode] = useState<boolean>(embedParam ? true : false)

    const [currentNotebook, setCurrentNotebook] = useState<ScriptInfo>();
    const [notebook, setNotebook] = useState<Notebook>({cells: []});
    const [cellIds, setCellIds] = useState<string[]>([]);
    const [cellNames, setCellNames] = useState<any>({});
    const [notebookName, setNotebookName] = useState<string>("");
    const [notebookPublic, setNotebookPublic] = useState<boolean>(true);
    const [notebookTag, setNotebookTag] = useState<string>("");
    const [notebookTimeout, setNotebookTimeout] = useState<string>("");
    const [notebookDescription, setNotebookDescription] = useState<string>("");
    const [notebookEditors, setNotebookEditors] = useState<Person[]>([]);

    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<string>("");
    const [saveSnapshotDescription, setSaveSnapshotDescription] = useState<string>("");
    const [restoreSnapshotEnabled, setRestoreSnapshotEnabled] = useState<boolean>(false);

    // Variables for save form
    const [saveNotebookName, setSaveNotebookName] = useState<any>();
    const [saveNotebookPublic, setSaveNotebookPublic] = useState<any>();
    const [saveNotebookTag, setSaveNotebookTag] = useState<any>();
    const [saveNotebookTimeout, setSaveNotebookTimeout] = useState<any>();
    const [saveNotebookDescription, setSaveNotebookDescription] = useState<any>();

    const [saveNotebookRunCells, setSaveNotebookRunCells] = useState<any>([]);
    const [snapshotText, setSnapshotText] = useState<string>("");


    const [daysSelected, setDaysSelected] = useState<any>([]);
    const [weeklyTimeSelected, setWeeklyTimeSelected] = useState<any>([]);
    const [monthlyTimeSelected, setMonthlyTimeSelected] = useState<string>(timesOfWeek[0].value);
    const [monthlyDaysSelected, setMonthlyDaysSelected] = useState<any>([]);
    const [enabled, setEnabled] = useState(false);


    // const [parameters, setParameters] = useState<string>("");

    const [cellResults, setCellResults] = useState<any>({})
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [updateEnabled, setUpdateEnabled] = useState<boolean>(false);
    // const [notebookUpdated, setNotebookUpdated] = useState<boolean>();

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showEditorsDialog, setShowEditorsDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [isCancelPressed, setIsCancelPressed] = useState<boolean>(false);
    const [error, setError] = useState<any>();

    useEffect(() => {
        setTimeout(() => {
            setShowDialog((prevDialog: any) => {
                if (prevDialog && saveNotebookRunCells) {
                    return { ...prevDialog, toBeRendered: prevDialog.text(saveNotebookRunCells, daysSelected, monthlyDaysSelected, weeklyTimeSelected) }
                }
                return prevDialog;
                })}, 0)
    }, [saveNotebookRunCells, daysSelected, monthlyDaysSelected, weeklyTimeSelected])

    useEffect(() => {
        async function init() {
            if (scriptId) {
                await loadNotebook(scriptId);
            }
            setInitComplete(true);
        }
        if (!initComplete) {
            init();
        }
        const handleClicks = (event:any) => {
            console.info(`Clicked on: ${event.target.tagName}`);
            if (event.target.tagName === "A") {
                noScrollToHash = false;
            }
            else {
                noScrollToHash = true;
            }
        };
        document.addEventListener('click', handleClicks, { capture: true });
        return () => {
            document.removeEventListener('click', handleClicks);
        };
    }, [])
    
    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])

   const updateWindowHistory = () => {
        let hash = window.location.hash;
        console.log("hash=", hash)
        let params = "";
        if (presentationMode) {
            if (!params) {
                params = "?";
            }
            else {
                params = params + "&";
            }
            params = params + "presentation=true";
        }
        if (embedMode) {
            if (!params) {
                params = "?";
            }
            else {
                params = params + "&";
            }
            params = params + "embed=true";
        }
        if (hash === "#top") {
            hash = "";
        }

        window.history.replaceState({}, document.title, `/notebook/${id}${hash}${params}` );
    }

    const observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (pageHeight !== height) {
            pageHeight = height;
            console.log(`Page content size changed: ${width}px x ${height}px`);
            console.log(`noScrollToHash = ${noScrollToHash}`)
            navigateToHash();
        }
    }
    });
    observer.observe(document.body);

    const navigateToHash = () => {
        // console.log(`navigateToHash: noScrollToHash = ${noScrollToHash}`)
        if (noScrollToHash) return;

        const hash = window.location.hash;
        console.log("hash=", hash)
        if (hash) {
            const el = document.getElementById(hash.substring(1))
            if (el) {
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - 60;
                window.scrollTo({
                    top: offsetPosition,
                });
            }
            if (hash === "#top") {
                updateWindowHistory();
            }
        }
    }

    useEffect(() => {
        updateWindowHistory();        
    }, [presentationMode, embedMode])    

    async function loadNotebook(id: string) {
        const scriptMgr = ScriptMgr.getInstance();
        try {
            const _currentNotebook = await scriptMgr.getDocument(id);
            console.log("loadNotebook=", _currentNotebook);
            if (_currentNotebook) {
                setCurrentNotebook(_currentNotebook);
                setNotebookName(_currentNotebook.name);
                const json: Notebook = JSON.parse(_currentNotebook.script);
                console.log(" -- notebook=", json);
                setNotebook(json);
                window.document.title = _currentNotebook.name;
            }
        } catch (e: any) {
            setError("Error: " + e.message);
        }
    }

    /**
     * Save current notebook or create a new one
     * 
     * @param update save=save existing notebook as new one, new=create new blank notebook, update=update existing notebook
     */
    const saveNotebook = async(update: string) => {

        let label = "";
        if (update === "update") {
            label = "update";
        }
        else if (update === "save") {
            label = "Save"
        }

        let title = "Save Notebook";
        if (update === "update") {
            title = "Save Existing Notebook";
        }
        else if (update === "save") {
            title = "Save as New Notebook";
        }

        setSaveNotebookName(notebookName);
        setSaveNotebookDescription(notebookDescription);
        setSaveNotebookPublic(notebookPublic);
        setSaveNotebookTag(notebookTag);
        setSaveNotebookTimeout(notebookTimeout)
        setSaveNotebookRunCells([...saveNotebookRunCells]);

        setShowDialog({
            title: title, 
            yesLabel: label,
            update: update,
            scriptId: currentNotebook?.id || "",
            text: (saveNotebookRunCells: any, daysSelected: any, monthlyDaysSelected: any, weeklyTimeSelected: any) => { 
                return (
                <div>
                <div className="spacer">
                    <b>Name: </b> 
                </div>
                <div>
                    <TextField
                        defaultValue={notebookName} 
                        onChange={(event) => setSaveNotebookName(event.target.value)}
                        fullWidth
                        sx={{
                            width: "100%",
                            minWidth: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Description [optional]: </b> 
                </div>
                <div>
                    <TextField
                        defaultValue={notebookDescription} 
                        onChange={(event) => setSaveNotebookDescription(event.target.value)}
                        fullWidth
                        sx={{
                            width: "100%",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Public: </b> 
                </div>
                <div>
                <Checkbox
                    defaultChecked={notebookPublic} 
                    onChange={(event, value) => {
                        setSaveNotebookPublic(value)
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Tag [optional]: </b> 
                </div>
                <div>
                    <TextField
                        defaultValue={notebookTag} 
                        onChange={(event) => setSaveNotebookTag(event.target.value)}
                        fullWidth
                        sx={{
                            width: "100%",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Timeout [optional - default is 600]: </b> 
                </div>
                <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
                    <TextField
                        defaultValue={notebookTimeout} 
                        onChange={(event) => setSaveNotebookTimeout(event.target.value)}
                        fullWidth
                        sx={{
                            width: "100%",
                        }}
                    />
                    <span>seconds</span>
                </div>

                <div className="spacer" style={{paddingBottom:"12px"}}>
                    <b>Schedule [optional]:</b>
                </div>
                <div style={{border: "1px solid var(--border)", padding:"8px", borderRadius:"8px"}}>
                <div>
                    <div style={{display: 'inline-block', paddingRight: "10px"}}>
                        <div className="spacer1">
                            <b>Weekly Schedule [optional]</b>
                            <br/>
                            <b>Day(s) of week</b>
                        </div>
                        <div>
                            <Select 
                                multiple 
                                value={daysSelected}
                                sx={{ width: "210px", }}
                                onChange={(event) => {
                                    setDaysSelected([ ...event.target.value]);
                                }}
                                renderValue={(value) => value.map((d: any) => d).join(',')}
                                >
                                {
                                    daysOfWeek.map((day) => (
                                        <MenuItem key={day} value={day}>
                                            <Checkbox checked={daysSelected.includes(day)} />
                                            <ListItemText>{day}</ListItemText>
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                    <div style={{display: 'inline-block'}}>
                        <div className="spacer">
                            <b>Time (UTC)</b>
                        </div>
                        <div>
                            <Select
                                multiple
                                value={weeklyTimeSelected}
                                sx={{ width: "180px", }}
                                onChange={(event) => {
                                    console.log("weekly time selected=", event.target.value);
                                    setWeeklyTimeSelected([...event.target.value]);
                                }}
                                renderValue={(value) => value?.map((d: any) => timesOfWeek.find(t => t.value == d)?.label).join(',')}
                                >
                                {
                                    timesOfWeek.map((time) => (
                                        <MenuItem key={time.value} value={time.value}>
                                            <Checkbox checked={weeklyTimeSelected.includes(time.value)} />
                                            <ListItemText>{time.label}</ListItemText>
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>
                <div>
                    <div style={{display: 'inline-block', paddingRight: "10px"}}>
                        <div className="spacer">
                            <b>Monthly Schedule [optional]</b>
                            <br/>
                            <b>Day(s) of month</b>
                        </div>
                        <div>
                            <Select 
                                multiple 
                                value={monthlyDaysSelected}
                                sx={{ width: "210px", }}
                                onChange={(event) => {
                                    setMonthlyDaysSelected([ ...event.target.value]);
                                }}
                                renderValue={(value) => value.map((d: any) => d).join(',')}
                                >
                                {
                                    daysOfMonth.map((month) => (
                                        <MenuItem key={month} value={month}>
                                            <Checkbox checked={monthlyDaysSelected.includes(month)} />
                                            <ListItemText>{month}</ListItemText>
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                    <div style={{display: 'inline-block'}}>
                        <div className="spacer">
                            <b>Time (UTC)</b>
                        </div>
                        <div>
                            <Select  
                                defaultValue={monthlyTimeSelected}
                                sx={{ width: "180px", }}
                                onChange={(event) => {
                                    setMonthlyTimeSelected(event.target.value);
                                }}>
                                {
                                    timesOfWeek.map((time) => (
                                        <MenuItem key={time.value} value={time.value}>{time.label}</MenuItem>
                                    ))
                                }
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="spacer">
                    <b>Select cell(s) to run: </b>
                </div>
                <div>
                    <Select
                        multiple
                        value={saveNotebookRunCells || []}
                        onChange={(event) => {
                            const value = event.target.value;
                            if (value.includes("all")) {
                                if (saveNotebookRunCells.length === notebook.cells.length) {
                                    setSaveNotebookRunCells([]);
                                } else {
                                    setSaveNotebookRunCells(notebook.cells.map((cell) => cell.id));
                                }
                            } else {
                                setSaveNotebookRunCells([...value]);
                            }
                        }}
                        sx={{
                            width: "100%",
                        }}
                    renderValue={(value) => value.map((c: any) => {
                        const cell = notebook.cells.find((cell) => cell.id === c);
                        return cell ? `${cell.name || "Cell"} ${notebook.cells.indexOf(cell)}` : c;
                    }).join(',')}

                    >
                        <MenuItem value={'all'} key={"all"}>
                            <Checkbox
                                checked={saveNotebookRunCells && saveNotebookRunCells.length === notebook.cells.length}
                            />
                            <ListItemText>Run All Cells</ListItemText>
                        </MenuItem>
                        {notebook.cells.map((cell, index) => (
                            <MenuItem key={`${cell.id}_${index}`} value={cell.id}>
                                <Checkbox
                                    checked={saveNotebookRunCells && saveNotebookRunCells.includes(cell.id)}
                                />
                                <ListItemText>{`${cell.name || "Cell"} ${index}`}</ListItemText>
                            </MenuItem>
                        ))} 
                    </Select>
                </div>
                <div className='spacer'>
                    <b>Snapshot Description [optional]:</b>
                </div>
                <div>
                    <TextField
                        defaultValue={snapshotText}
                        onChange={(event) => setSnapshotText(event.target.value)}
                         fullWidth
                        sx={{
                            width: "400px",
                        }}
                        />
                </div>
                <div className="spacer">
                    <b>Enable Schedule: </b>
                </div>
                <Checkbox
                defaultChecked={enabled}
                onChange={(e) => {
                    setEnabled(e.target.checked)
                }}
                />
                </div>
            </div>)
            }
        });
    }

    /**
     * Render save dialog
     * 
     * @returns 
     */
    const renderAlert = () => {

        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: showDialog.yesLabel,
                onClick: async function onClick() {
                    console.log("SAVE NOTEBOOK WITH NAME: ", notebookName);
                    const _notebook:Notebook = {cells:[]};
                    for (const cell of notebook.cells) {
                        const _cell = {
                            type: cell.type,
                            data: cell.data,
                            id: cell.id,
                            name: cell.name,
                            view: cell.view,
                            viewEditor: cell.viewEditor,
                            parameters: cell.parameters,
                            columns: cell.columns,
                        }
                        console.log("_cell =", _cell);

                        // When creating new notebook, cell uuids need to be changed
                        if (!showDialog.update) {
                            _cell.id = uuidv4();
                        }
                        _notebook.cells.push(_cell);
                    }
                    console.log("_notebook=", _notebook)
                    const script = JSON.stringify(_notebook)
                    const runAtPayload: any = {
                        cells: [...saveNotebookRunCells], 
                        dayOfWeek: [...daysSelected],
                        weeklyTime: [...weeklyTimeSelected], 
                        dayOfMonth: [...monthlyDaysSelected], 
                        monthlyTime: monthlyTimeSelected, 
                        enabled: enabled,
                        snapshot: snapshotText
                    };
                    // console.log("script=", script);

                    if (showDialog.update == "update") {
                        if (!updateEnabled) { 
                            throw new Error("Only the owner can update this notebook")
                        }
                        console.log("Updating notebook ", notebookName);
                        const r = await scriptMgr.saveDocument({
                            id: scriptId,
                            type: type,
                            public: saveNotebookPublic,
                            name: saveNotebookName, 
                            script: script, 
                            // parameters: parameters,
                            description: saveNotebookDescription,
                            tag: saveNotebookTag,
                            timeout: saveNotebookTimeout,
                            runAt: runAtPayload,

                        });
                        console.log("updated notebook=", r);
                        setNotebookName(saveNotebookName);
                        setNotebookPublic(saveNotebookPublic);
                        setNotebookDescription(saveNotebookDescription);
                        setNotebookTag(saveNotebookTag);
                        setNotebookTimeout(saveNotebookTimeout);
                    }
                    else if (showDialog.update === "save") {
                        console.log("Creating notebook ", notebookName);
                        const r = await scriptMgr.createDocument({
                            type: type,
                            public: saveNotebookPublic,
                            name: saveNotebookName,
                            script: script,
                            // parameters: parameters,
                            description: saveNotebookDescription,
                            tag: saveNotebookTag,
                            timeout: saveNotebookTimeout,
                            runAt: runAtPayload,
                        })
                        if (r) {
                            // Copy variables from current notebook to new one & create initial snapshot
                            try {
                                const c = await notebookMgr.process(`copyNotebookvars/${id}/${r.id}`)
                                const snapshotName = "0";
                                const r1 = await notebookMgr.processPost(`saveNotebookVarsSnapshot/${r.id}/${snapshotName}`, {
                                    description: "Original data",
                                    notebook: JSON.stringify(r),
                                })
                                console.log("save snapshot =", r1);
                            }
                            catch (e) {
                                throw(e);
                            }
                            
                            window.open("/notebook/" + r.id, "_self");
                        }
                    }

                    setSaveNotebookPublic(undefined);
                    setSaveNotebookName(undefined);
                    setSaveNotebookDescription(undefined);
                    setSaveNotebookTag(undefined);
                    setSaveNotebookTimeout(undefined);

                    notebookUpdated = false;
                    if (embedMode) {
                        setPresentationMode(false);
                        setEmbedMode(false);
                    }
                    return (setShowDialog(null))
                }
            },
            {
                label: "Cancel",
                onClick: async function onClick() {
                    return (setShowDialog(null))
                },
            },
        ];

        return (<StyledDialog
            open={showDialog != null}
            actions={showDialog.actions || actions}
            onClose={function onClose() {
                return (setShowDialog(null));
            }}
            title={showDialog ? showDialog.title : ""}
            sx={{
            }}
        >
            {showDialog ? showDialog.toBeRendered ? showDialog.toBeRendered : showDialog.text : ""}
        </StyledDialog>
        )
    }

    async function handleEditorsUpdated(data:Person[]) : Promise<void> {
        console.log("handleEditorsUpdated() editor=",data);
        if (currentNotebook && updateEnabled) {
            scriptMgr.saveDocument({id: currentNotebook.id, editors: data}, "editors");
        }
    }

    async function handleAddMember(email: string, create: boolean = false): Promise<void> {
        console.log(`handleAddMember(${email}, ${create})`);
        if (!email) {
            setShowEditorsDialog({title:"Error adding editor.", text: `Missing email address.`});
            return;
        }
        setShowSpinner("Getting emails...");
        const docMgr = DocMgr.getInstance();
        const person = await docMgr.getUserProfile(email);
        setShowSpinner("");
        console.log("person=",person);
        let editor: Person = {name:email.split("@")[0], id: "", roles: [], department:"", email:(email.indexOf("@")>-1 ? email : ""), title:"", employeeNumber:""};
        if (!person || person.error || person.length === 0) {
            if (!create) {
                setShowEditorsDialog({title:"Error adding editor.", text: `The editor's email address "${email}" was not found.  Do you want to add them anyway?`, email:email});
                return;
            }
        }
        else if (person.length > 1) {
            let emails = [];
            for (var i=0; i<person.length; i++) {
                let em:string = person[i].user.email;
                emails.push(<tr key={i}><td>{person[i].user.name}</td><td>{em}</td><td><Button onClick={() => {handleAddMember(em); setShowEditorsDialog(null);}}>Add</Button> </td></tr>);
            }
            setShowEditorsDialog({
                title:"Multiple Emails Were Found", 
                text: (<>
                    <div>
                    <table><thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>{emails}</tbody></table>
                    </div>
                    <div style={{marginTop:"10px"}}>Select one to Add or Close to cancel.</div></>
                ),
            });
            return;
        }
        else {
            editor.id = person[0].user.id || "";
            editor.roles = person[0].user.roles || [];
            editor.email = person[0].user.email;
            editor.name = person[0].user.name || person[0].user.email;
            editor.department = person[0].user.department || "";
            editor.title = person[0].user.title || "";
            editor.employeeNumber = person[0].user.employeeNumber || "";
        }
        let data = [...notebookEditors];
        data.push(editor);
        console.log("new editor list=",data)
        await setNotebookEditors(data);
        await handleEditorsUpdated(data);
    }

    const renderEditorsAlert = () => {
        console.log("renderEditorsAlert=",showEditorsDialog);
        if (!showEditorsDialog) {
            return;
        }
        let actions=[
            {
                label: "Close",
                onClick: async function onClick() {
                    return(setShowEditorsDialog(null))
                },
            },
        ];
        if (showEditorsDialog.email) {
            actions.push({
                label: "Yes",
                onClick: async function onClick() {
                    await handleAddMember(showEditorsDialog.email, true);
                    return(setShowEditorsDialog(null))
                }
            });
        }

        return (<SimpleDialog
            open={showEditorsDialog != null}
            actions={actions}
            onClose={function onClose() {
                return(setShowEditorsDialog(null));
            }}
            title={showEditorsDialog ? showEditorsDialog.title : ""}
            >
            {showEditorsDialog ? showEditorsDialog.text : ""}
            </SimpleDialog>
        )
    }

    let _importData:any = null;

    async function exportNotebook() : Promise<void> {
        console.log("exportNotebook()");
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        const exportData = {
            public: false,
            name: notebookName, //currentNotebook.name,
            description: notebookDescription, // currentNotebook.description,
            tag: notebookTag, // currentNotebook.tag,
            script: JSON.stringify(notebook),  //currentNotebook.script,
            timeout: notebookTimeout, //currentNotebook.timeout,
        };
        setShowDialog({
            title: "Export Notebook",
            text: <div>
                <div>
                Copy notebook data below and save it:
                </div>
                <textarea
                    style={{width:"500px", height:"300px"}}
                    readOnly={true}
                    value={JSON.stringify(exportData, null, 4)}
                />
                </div>,
            actions: [
                {
                    label: "Close",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    }
                },
            ]
        })
    }

    async function replaceNotebook() : Promise<void> {
        if (!updateEnabled) { return }
        console.log("replaceNotebook()");
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        setShowDialog({
            title: "Replace Notebook",
            text: <div>
                <div>
                Paste notebook data below and click "Replace":
                </div>
                <textarea
                    style={{width:"500px", height:"300px"}}
                    onBlur={(event => { _importData = event.target.value })}
                />
                </div>,
            actions: [
                {
                    label: "Replace",
                    onClick: async function onClick() {
                        if (!_importData) {
                            console.log("No data specified");
                            throw new Error("No data specified");
                        }
                        const importData = JSON.parse(_importData)
                        if (!importData.name || !importData.script) {
                            console.log("Invalid notebook data");
                            throw new Error("Invalid notebook data");
                        }
                        try {
                            notebook.cells = JSON.parse(importData.script).cells;
                        } catch (e) {
                            throw new Error("Error parsing notebook data");
                        }
                        notebookUpdated = true;
                        updateNotebook();
                        return (setShowDialog(null))
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
        })
    }

    /**
     * Delete the notebook
     * 
     * @returns 
     */
    async function deleteNotebook() : Promise<void> {
        if (!updateEnabled) { return }
        console.log("deleteNotebook()");
        setShowDialog({
            title:"Delete Notebook", 
            queryId: scriptId || "",
            text: <div>
                Do you want to delete notebook:
                <div className='spacer'>"{notebookName}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        const q = await scriptMgr.deleteDocument(scriptId);
                        window.open("/notebooks", "_self");
                        return
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
            
        })
    }

    /**
     * Reads the file as text and returns an object with name and content properties
     * 
     * @param file File to read
     * @returns 
     */
    const getNotebookFile = async (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (!evt?.target?.result) {
                    reject("No result from file read");
                    return;
                }
                const { result } = evt.target;
                try {
                    const content = JSON.parse(result as string);
                    if (!content.name || !content.script) {
                        console.log("Invalid import data");
                        return reject(`Invalid notebook file: ${file.name}.  Ensure it is a valid notebook file.`);
                    }
                    resolve({name: file.name, content: content});
                } catch (error) {
                    console.log("Error parsing notebook content:", error);
                    return reject(`Invalid notebook file: ${file.name}.  Ensure it is a valid JSON file.`);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    /**
     * Reads the selected files and extracts notebook data from them
     * 
     * @param event Event from file input change
     * @returns 
     */
    const handleFileSelect = async (event: any) => {
        if (!event.target.files || event.target.files.length === 0) {
            console.log("No file selected");
            return;
        }
        const files: File[] = Array.from(event.target.files);
        for (const file of files) {
            try {
                const nbFile = await getNotebookFile(file);
                if (nbFile) {
                    importNotebooks.push(nbFile);
                }
            } catch (e:any) {
                await context.setShowDialog({title: "Import Error", text: ""+e});
            }
        }

        const el = document.getElementById("importFileNamesDiv");
        if (el) {
            const r = [];
            if (importNotebooks.length == 0) {
                r.push("<div>No notebooks selected</div>");
            }
            else {
                r.push(`<div>Notebooks selected:</div>`);
                r.push(`<ul/>`)
                for (var i=0; i<importNotebooks.length; i++) {
                    const nb = importNotebooks[i];
                    r.push(`<li>${nb.name}</li>`)
                }
                r.push(`</ul>`)
            }
            console.log("importFileList=", r);
            el.innerHTML = r.join("");
        }
    };


    // /**
    //  * Select notebook
    //  * 
    //  * @param notebookId The notebook id
    //  */
    // async function selectNotebook (notebookId: string) {
    //     console.log(`selectScript(${notebookId})`);
    //     for (const q of notebooks) {
    //         if (q.id == notebookId) {
    //             setCurrentNotebook(q);
    //         }
    //     }
    // }

    // // If new notebook id was selected, then set current notebook
    // useEffect(() => {
    //     console.log("selectedId changed: ", selectedId)
    //     if (selectedId) {
    //         if (prevSelectedNotebookId && selectedId != prevSelectedNotebookId) {
    //             console.log(">>  clearing result: selectedId=", selectedId, " prevSelectedScriptId=", prevSelectedNotebookId);
    //             // cellResults = {};
    //         }
    //         prevSelectedNotebookId = selectedId;
    //         selectNotebook(selectedId);
    //         // setInitComplete(true);
    //         initComplete = true;
    //     }
    // }, [selectedId])
    

    // If current notebook changed
    useEffect(() => {
        console.log(`currentNotebook changed =`, currentNotebook);
        if (currentNotebook) {
            let _updateEnabled = false;
            setNotebookName(currentNotebook.name);
            const json:Notebook = JSON.parse(currentNotebook.script);
            console.log(" -- notebook=", json);
            for (var i=0; i<json.cells.length; i++) {
                // Init parameters if not already set
                if (!json.cells[i].parameters) { //} || (typeof json.cells[i].parameters != "object")) {
                    json.cells[i].parameters = {};
                }
                if (typeof json.cells[i].view == "string") {
                    json.cells[i].view = [(json.cells[i] as any).view];
                }
                (json.cells[i] as any).ref = React.createRef()
            }
            setNotebook(json);
            // setParameters(currentNotebook.parameters);
            setNotebookDescription(currentNotebook.description);
            setNotebookPublic(currentNotebook.public);
            setNotebookTag(currentNotebook.tag);
            setNotebookTimeout(currentNotebook.timeout);
             setNotebookEditors(currentNotebook.editors || []);

             setDaysSelected((currentNotebook as any).runAt?.dayOfWeek || []);
             setWeeklyTimeSelected((currentNotebook as any).runAt?.weeklyTime || []);
             setMonthlyDaysSelected((currentNotebook as any).runAt?.dayOfMonth || []);
             setMonthlyTimeSelected((currentNotebook as any).runAt?.monthlyTime || "0");
             setSnapshotText((currentNotebook as any).runAt?.snapshot || "");
             setEnabled((currentNotebook as any).runAt?.enabled || false);
             setSaveNotebookRunCells((currentNotebook as any).runAt?.cells || []);
             

            //  setDaysSelected((currentNotebook as any).runAt?.dayOfWeek || []);

             // missing runAt details from API

            if (context.isAdministrator) {
                _updateEnabled = true;
            }
            else if (currentNotebook.owner.email === context.user.email) {
                _updateEnabled = true;
            }
            else if (currentNotebook.editors?.some(((user:Person) => user.email === context.user.email))) {
                _updateEnabled = true;
            }
            setUpdateEnabled(_updateEnabled);
            context.editMode = _updateEnabled; // for attachments

            getSnapshotNames();
        }
    }, [currentNotebook]);

    useEffect(() => {
        if (notebook) {
            const _cellIds = [];
            const _cellNames:any = {};
            for (var i=0; i<notebook.cells.length; i++) {
                _cellIds.push(notebook.cells[i].id);
                if (notebook.cells[i].name) {
                    _cellNames[notebook.cells[i].name || ""+i] = notebook.cells[i].id;
                }
            }
            setCellIds(_cellIds);
            setCellNames(_cellNames);
        }
    }, [notebook])

    // useEffect(() => {
    //     console.log(`notebook name changed = ${notebookName}`);
    // }, [notebookName]);


    // Used for autoselect
    const GroupHeader = styled('div')(({ theme }) => ({
        position: 'sticky',
        top: '-8px',
        padding: '4px 10px',
        color: "var(--on-secondary-100)",
        backgroundColor: "var(--secondary-100)",
        fontWeight: "bold",
        fontSize: "1em",
      }));
      
      const GroupItems = styled('ul')({
        padding: 0,
        marginLeft: 20,
      });


    /**
     * Run all cells
     */
    const runAllCells = async () => {
        if (!updateEnabled) { return }
        for (var i=0; i<notebook.cells.length; i++) {
            const run = notebook.cells[i].run;
            if (run) {
                // Method defined in NotebookEditorCell, but running in this scope, so need to pass cellIds to run()
                // But not sure why other methods work
                await run(cellIds);
            }
        }
    }

    /**
     * The cell has changed
     * 
     * @param index 
     */
    const cellChanged = (index: number, refresh=false) => {
        if (!updateEnabled) { return }
        // notebook.cells[index] = cell;
        if (refresh) {
            setNotebook({...notebook})
        }
        // setNotebookUpdated(true);
        notebookUpdated = true;
    }

    const updateNotebook = async () => {
        // if (!notebookUpdated) { 
        //     console.log("Notebook not changed, so no need to save it")
        //     return 
        // }
        console.log("Notebook changed, so saving it");
        // setNotebookUpdated(false);
        notebookUpdated = false;
        setNotebook({...notebook})
        const script = JSON.stringify(notebook)

        console.log("Updating notebook ", notebookName);
        const r = await scriptMgr.saveDocument({
            id: currentNotebook?.id,
            type: type,
            name: notebookName, 
            script: script, 
            // parameters: parameters,
            public: true,
            description: notebookDescription, 
            tag: notebookTag,
            timeout: notebookTimeout,
        });
    }

    /**
     * Render all cells in the notebook
     * 
     * @returns 
     */
    const renderNotebook = () => {
        const r = [];
        if (currentNotebook) {
            for (var i=0; i<notebook.cells.length; i++) {
                r.push(<div id={"cell"+i}/>);
                if (notebook.cells[i].name) r.push(<div id={notebook.cells[i].name}/>);
                r.push(<div className="notebookCell" >
                <NotebookEditorCell 
                    key={"cell-"+i+"-"+notebook.cells[i].id}
                    context={context}
                    setShowSpinner={setShowSpinner}
                    isCancelPressed={isCancelPressed}
                    setIsCancelPressed={setIsCancelPressed}
                    notebookId={currentNotebook.id} 
                    notebookName={currentNotebook.name}
                    notebook={notebook}
                    cellChanged={cellChanged}
                    cellIds={cellIds}
                    cellNames={cellNames}
                    cell={notebook.cells[i]} 
                    index={i}
                    insertCell={insertCell}
                    moveCell={moveCell}
                    deleteCell={deleteCell}
                    presentationMode={presentationMode}
                    updateEnabled={updateEnabled}
                    updateNotebook={updateNotebook}
                    timeout={notebookTimeout}
                />
                </div>)
                if (i < notebook.cells.length-1) {
                    r.push(<div className="spacer">
                    </div>)
                }
            }
            navigateToHash();
        }
        return r;
    }

    const renderQuickLinks = () => {
        const ql = [];
        if (currentNotebook) {
            ql.push(<a href="#top">Top</a>)
            for (var i=0; i<notebook.cells.length; i++) {
                const h = "#cell"+i;
                // eslint-disable-next-line no-loop-func, jsx-a11y/anchor-is-valid
                ql.push(<a onClick={()=> {
                    noScrollToHash = false;
                    window.location.hash = h;
                }}>{i}</a>);

                const name = notebook.cells[i].name;
                if (name) {
                    // eslint-disable-next-line no-loop-func, jsx-a11y/anchor-is-valid
                    ql.push(<a onClick={()=> {
                        noScrollToHash = false;
                        window.location.hash = "#" + name;
                    }}>{name}</a>);
                }
            }
            ql.push(<a href="#bottom">Bottom</a>)
            return(<div className='fixed-bottom-right' style={{display:"flex", "gap":10, "flexWrap": "wrap"}}>Jump to cell: {ql} </div>);
        }
    }

    /**
     * Insert cell above or below another cell
     * 
     * @param position 0=above, 1=below
     * @param index The index of cell
     */
    const insertCell = (position: number, index: number) => {
        if (!updateEnabled) { return }
        const insertAtIndex = index+position;
        const _notebook:Notebook = {cells: []};
        for (var i=0; i<notebook.cells.length; i++) {
            if (i === insertAtIndex) {
                _notebook.cells.push({type:"code", data:"// Add your code here\nsetResult('');", id:uuidv4(), name: "", view:["raw"], viewEditor: ""})
            }
            _notebook.cells.push(notebook.cells[i]);
        }
        if (insertAtIndex === notebook.cells.length) {
            _notebook.cells.push({type:"code", data:"// Add your code here\nsetResult('');", id:uuidv4(), name: "", view:["raw"], viewEditor: ""})
        }
        setNotebook(_notebook);
    }

    const moveCell = (direction: number, index: number) => {
        if (index+direction < 0 || index+direction > notebook.cells.length) {
            console.log("Can't move cell")
            return;
        }
        const elm = notebook.cells.splice(index, 1)[0];
        notebook.cells.splice(index+direction, 0, elm);
        setNotebook({...notebook});
    }

    /**
     * Delete cell
     * 
     * @param index The cell index
     */
    const doDeleteCell = async (index: number) => {
        if (!updateEnabled) { return }
        console.log(`doDeleteCell(${index})`);
        await deleteResults(index);
        const _notebook:Notebook = {cells: []};
        for (var i=0; i<notebook.cells.length; i++) {
            if (i !== index) {
                _notebook.cells.push(notebook.cells[i]);
            }
        }
        setNotebook(_notebook);
    }

    /**
     * Delete the cell
     * 
     * @param index The cell index
     */
    const deleteCell = async (index: number) => {
        if (!updateEnabled) { return }
        console.log(`deleteCell(${index})`);
        setShowDialog({
            title:"Delete Cell", 
            text: <div>
                Do you want to delete cell:
                <div className='spacer'>"{index}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        console.log("Deleting cell ", index)
                        doDeleteCell(index);
                        return (setShowDialog(null))
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
        })        
    }

    /**
     * Delete cell results and variable on server
     * 
     * @param index The cell index
     */
    const deleteResults = async (index: number) => {
        if (!updateEnabled) { return }
        console.log(`deleteResults(${index})`);
        const cellId = notebook.cells[index].id;
        const notebookId = currentNotebook?.id;

        try {
            const r = await notebookMgr.processDelete(`deleteNotebookvar/${notebookId}/cellResult_${cellId}`)
            console.log("cell Results =", r);
            delete cellResults[cellId];
            setCellResults({...cellResults});
        }
        catch (e) {
            setShowSpinner("")
            throw(e);
        }
    }

    const getSnapshotNames = async () => {
        console.log("getSnapshotNames()");
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        try {
            const r = await notebookMgr.process(`getNotebookvarSnapshotNames/${currentNotebook.id}`)
            console.log("snapshot names =", r);
            setSnapshots(r);
        }
        catch (e) {
            throw(e);
        }
    }

    const saveSnapshot = async(snapshotType="") => {
        if (!updateEnabled) { return }
        console.log(`saveSnapshot(${snapshotType})`);
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        try {
            const snapshotName = Date.now().toString();
            const r = await notebookMgr.processPost(`saveNotebookVarsSnapshot/${currentNotebook.id}/${snapshotName}`, {
                description: saveSnapshotDescription,
                // notebook: JSON.stringify(currentNotebook),
                snapshotType: snapshotType,
            })
            console.log("save snapshot =", r);
            await getSnapshotNames();
        }
        catch (e) {
            throw(e);
        }
    }
    
    const restoreSnapshot = async(restoreType="") => {
        if (!updateEnabled) { return }
        console.log(`restoreSnapshot(${restoreType})`);
        if (!currentNotebook || !currentNotebook.id || !selectedSnapshot) {
            console.log("No current notebook or snapshot selected");
            return;
        }
        try {
            const restoreTypeString = restoreType ? `?restoreType=${restoreType}` : "";
            const r = await notebookMgr.process(`restoreNotebookVarsSnapshot/${currentNotebook.id}/${selectedSnapshot}${restoreTypeString}`)
            console.log("restore snapshot =", r);
            loadNotebook(currentNotebook.id);
        }
        catch (e) {
            throw(e);
        }
    }

    const deleteSnapshot = async() => {
        if (!updateEnabled) { return }
        console.log("deleteSnapshot()");
        if (!currentNotebook || !currentNotebook.id || !selectedSnapshot) {
            console.log("No current notebook or snapshot selected");
            return;
        }
        let name = "";
        for (const snapshot of snapshots) {
            if (snapshot.name === selectedSnapshot) {
                name = snapshot.description;
            }
        }

        setShowDialog({
            title:"Delete Snapshot", 
            text: <div>
                Do you want to delete snapshot:
                <div className='spacer'>"{name}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        try {
                            const r = await notebookMgr.processDelete(`deleteNotebookVarsSnapshot/${currentNotebook.id}/${selectedSnapshot}`)
                            console.log("delete snapshot =", r);
                            await getSnapshotNames();
                        }
                        catch (e) {
                            throw(e);
                        }
                        return (setShowDialog(null))
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
        })
    }

    if (!initComplete) {
        return (<></>)
    }

    // Render page
    if (embedMode) {
        return (
        <div>
            {renderAlert()}
            {renderEditorsAlert()}

            <div id="top" className="editorDiv">

                <div className="detailDiv">
                <div style={{display:"flex", gap:"20px", width:"100%"}}>

                    <div className="leftDiv">

                        {!currentNotebook && <div className="spacer">
                            <h5>Notebook not specified.</h5>
                        </div>}

                        {currentNotebook && <>

                        <div style={{
                            marginTop:"16px", 
                            }}>
                        {renderNotebook()}
                        </div>

                        <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                            <div>
                                <Button
                                    startIcon={<ReplayOutlinedIcon/>}
                                    disabled={!updateEnabled} 
                                    onClick={async () => { 
                                        runAllCells();
                                    }}
                                >Run All Cells</Button>
                            </div>
                            <div>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveNotebook("save")}>Save As New Notebook</Button>
                            </div>

                        </div>
                        </>}

                    </div>


                    <Drawer key={`key_${key++}`} anchor='right'
                        hideBackdrop={false}
                        variant="persistent"
                        open={showHelp} onClose={() => setShowHelp(false)}
                    >
                        <div key={`key_${key++}`} style={{width:"35vw", paddingTop:"10px", border:"2px solid gray"}}>
                            <div style={{marginLeft: "10px"}}>
                                <a className="hideScriptHelp" onClick={(event) => {setShowHelp(false)}}>Hide Script Help</a>
                                <Help context={context} topic={type + "ServerScript"} />
                            </div>
                        </div>
                    </Drawer>

                    </div>


                </div>

                <div className="spacer detailDiv"/>
                <div className="spacer detailDiv"/>
            </div> 
        </div>

        )
    }


    return (
        <div>
            {renderAlert()}
            {renderEditorsAlert()}

            <Navbar context={context} />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                open={(showSpinner.length > 0)}
            >
                <div className="spinnerDiv">
                    <p>{showSpinner}</p>
                    <CircularProgress color="info" />
                    <br />
                    <Button onClick={() => {setIsCancelPressed(true)}} disabled={isCancelPressed}>Cancel</Button>
                </div>
            </Backdrop>
            {renderQuickLinks()}

            <div className="content1" style={{ marginTop: "0px" }}>
                <TopMenu user={context.user} isAdmin={context.isAdministrator} />
                <div className="content">

                <div className="editorDiv">

                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <h1>Notebook Editor for {notebookName}</h1>
                        <div>
                            <Checkbox checked={presentationMode} onChange={(event) => {setPresentationMode(event.target.checked)}}/>
                            <span style={{cursor:"pointer"}} onClick={() => {setPresentationMode(!presentationMode)}}>Presentation Mode</span>
                        </div>
                    </div>

                    <div style={{display:"flex", justifyContent:"space-between"}}>
                        <div>
                            Create and run server-side Javascript notebooks.  This allows you to build and document complex queries that run completely on the server, with only the result returned to the browser.
                            <br /><br/>
                            <i>(Note: All changes to your notebook are automatically saved when any cell is run.)</i>
                        </div>

                        {!presentationMode && <div style={{display:"flex", paddingLeft:"40px", gap:"20px"}}>
                            <Button startIcon={<HelpOutlineOutlinedIcon/>} onClick={(event) => {setShowHelp(true)}}>Notebook Help</Button>
                        </div>}
                    </div>

                    <div className="detailDiv">
                        <div style={{display:"flex", gap:"20px", width:"100%"}}>

                            <div className="leftDiv">
                                {notebookDescription && <div className="spacer">
                                    <b>Description: </b>
                                    {notebookDescription}
                                </div>}
                                <div className="spacer">
                                    <b>Owner: </b>
                                    {currentNotebook?.owner.name} ({currentNotebook?.owner.email})
                                </div>

                                {notebookTag && <div className="spacer">
                                    <b>Tag: </b>
                                    {notebookTag}
                                </div>}

                                {notebookTimeout && <div className="spacer">
                                    <b>Timeout: </b>
                                    {notebookTimeout} seconds
                                </div>}

                                <div style={{
                                    marginTop:"16px", 
                                    }}>
                                    {renderNotebook()}
                                </div>

                                <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                                    <div>
                                        <Button
                                            startIcon={<ReplayOutlinedIcon/>}
                                            disabled={!updateEnabled} 
                                            onClick={async () => { 
                                                runAllCells();
                                            }}
                                        >Run All Cells</Button>
                                        {/* <Button style={{marginLeft:"20px"}} onClick={async () => { await docMgr.stopScript() }}>Stop</Button> */}
                                    </div>
                                    <div>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveNotebook("save")}>Save As New Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>saveNotebook("update")} disabled={!updateEnabled}>Save Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>exportNotebook()} disabled={!updateEnabled}>Export Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>replaceNotebook()} disabled={!updateEnabled}>Replace Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<RemoveCircleOutlineOutlinedIcon/>} onClick={()=>deleteNotebook()} disabled={!updateEnabled}>Delete Notebook</Button>
                                    </div>

                                </div>

                                <div style={{paddingTop:"100px"}}>
                                    <h5>Snapshots</h5>
                                    Snapshots save the current values of all variables in the notebook.  You can restore a snapshot to return all variables to the values they had when the snapshot was taken.
                                </div>
                                <div className="spacer" style={{display:"flex", justifyContent:"space-between", paddingTop:"20px"}}>
                                    <div>
                                        <div style={{display:"flex", alignItems:"center", gap:"20px"}}>
                                        
                                            <div>Enter Snapshot Description: </div>
                                            <TextField
                                                className='zeroTopMargin'
                                                style={{minWidth:"300px"}}
                                                defaultValue={saveSnapshotDescription} 
                                                onChange={(event) => setSaveSnapshotDescription(event.target.value)}
                                                sx={{
                                                    "&.MuiFormControl-root": { marginTop: "0px !important" }
                                                }}
                                            />
                                        </div>

                                        <div className='spacer'>
                                            <Button style={{}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveSnapshot()}>Save Snapshot</Button>
                                            <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveSnapshot("code")}>Save Code Only</Button>
                                        </div>
                                    </div>

                                    <div>
                                        <div>
                                            Select Snapshot: 
                                            <Select 
                                                style={{minWidth:"300px", marginLeft:"20px"}}
                                                value={selectedSnapshot} 
                                                onChange={(event) => { if (updateEnabled) { 
                                                    const name = event.target.value;
                                                    setSelectedSnapshot(name);
                                                    setRestoreSnapshotEnabled(
                                                        snapshots.filter((v:any) => {
                                                            console.log("looking at snapshot=", v);
                                                            return (v.name === name && v.type === "code")
                                                        }).length === 0
                                                    )
                                                }
                                                }}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {snapshots.map((snapshot) => (
                                                    <MenuItem key={snapshot.name} value={snapshot.name}>{snapshot.name!="0" ? (formatDateTime(parseInt(snapshot.name))+" - ") : ""}{snapshot.description}</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className='spacer'>
                                            <Button style={{}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} disabled={!restoreSnapshotEnabled || !selectedSnapshot} onClick={()=>restoreSnapshot()}>Restore Data</Button>
                                            <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} disabled={!selectedSnapshot} onClick={()=>restoreSnapshot("code")}>Restore Code</Button>
                                            <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} disabled={!restoreSnapshotEnabled || !selectedSnapshot} onClick={()=>restoreSnapshot("vars,code")}>Restore Data & Code</Button>
                                            <Button style={{marginLeft:"40px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} disabled={!selectedSnapshot} onClick={()=>deleteSnapshot()}>Delete Snapshot</Button>
                                        </div>
                                    </div>

                                </div>

                            </div>


                            <Drawer key={`key_${key++}`} anchor='right'
                                hideBackdrop={false}
                                variant="persistent"
                                open={showHelp} onClose={() => setShowHelp(false)}
                            >
                                <div key={`key_${key++}`} style={{width:"35vw", paddingTop:"10px", border:"2px solid gray"}}>
                                    <div style={{marginLeft: "10px"}}>
                                        <a className="hideScriptHelp" onClick={(event) => {setShowHelp(false)}}>Hide Notebook Help</a>
                                        <Help context={context} topic={type + "ServerScript"} />
                                    </div>
                                </div>
                            </Drawer>

                            </div>


                        </div>

                        <div className="spacer detailDiv"/>

                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <div>
                                    <h4>Editors: Users that can edit this notebook</h4>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="content">
                                    <MembersTable 
                                        members={notebookEditors} 
                                        setMembers={setNotebookEditors} 
                                        noMembersLabel="No editors"
                                        updated={handleEditorsUpdated} 
                                        disabled={!updateEnabled}
                                    />
                                    <div>&nbsp;</div>
                                    <AddPerson 
                                        label="Email of new user to add to Editors list" 
                                        style={{width:"400px"}}
                                        handleAdd={(value) => {
                                            console.log("Add Editor: ", value);
                                            handleAddMember(value);
                                        }} 
                                        disabled={!updateEnabled}
                                     />

                                </div>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                            >
                                <div>
                                    <h4>Attachments: Documents created by this notebook</h4>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <div className="content">
                                    <Attachments
                                        context={context}
                                        document={currentNotebook}
                                        setDocument={setCurrentNotebook}
                                        docMgr={scriptMgr}
                                        showUpload={true}
                                    />
                                </div>
                            </AccordionDetails>
                        </Accordion>

                        <div id="bottom" className="spacer detailDiv" style={{paddingBottom:"40px"}}/>
                    </div> 
                </div>
            </div>
        </div>
    )
}

export default NotebookEditor;
