/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, TextField, Drawer, Backdrop, CircularProgress, Select, MenuItem } from '@mui/material'
import { Checkbox } from '@mui/material';

import { AppContext } from "../common";
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
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

let key = 1;
let notebookUpdated = false;

export interface Notebook {
    cells: NotebookCell[];
}

export interface NotebookCell {
    id: string;
    name: string;
    type: string;           // "code" | "text";
    data: string;
    view: string[];         // "tree" | "raw" | "sbom" | "json" | editor, preview;
    columns?: string;
    parameters?: any;
    run?: any;              // run script method set by NotebookEditorCell so all cells can be run
}

interface Props {
    context: AppContext;
}

interface NotebookOptions {
    id: string;
    name: string;
    isChecked: boolean;
}

let importNotebooks: any[] = [];

const NotebookEditor: React.FC<Props> = ({ context }) => {
    const type = "notebook";
    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();
    const notebookMgr = NotebookMgr.getInstance();

    let { id } = useParams();
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
    const [notebookDescription, setNotebookDescription] = useState<string>("");

    const [snapshots, setSnapshots] = useState<any[]>([]);
    const [selectedSnapshot, setSelectedSnapshot] = useState<string>("");
    const [saveSnapshotDescription, setSaveSnapshotDescription] = useState<string>("");

    // Variables for save form
    const [saveNotebookName, setSaveNotebookName] = useState<any>();
    const [saveNotebookPublic, setSaveNotebookPublic] = useState<any>();
    const [saveNotebookTag, setSaveNotebookTag] = useState<any>();
    const [saveNotebookDescription, setSaveNotebookDescription] = useState<any>();

    const [cellResults, setCellResults] = useState<any>({})
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [updateEnabled, setUpdateEnabled] = useState<boolean>(false);

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [error, setError] = useState<any>();

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
    }, [])

    useEffect(() => {
        console.log("initComplete changed to ", initComplete);
    }, [initComplete]);

    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])

    useEffect(() => {
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

        window.history.replaceState({}, document.title, `/notebook/${id}${params}` );
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
        if (update == "update") {
            label = "update";
        }
        else if (update == "save") {
            label = "Save"
        }

        let title = "Save Notebook";
        if (update == "update") {
            title = "Save Existing Notebook";
        }
        else if (update == "save") {
            title = "Save as New Notebook";
        }

        setSaveNotebookName(notebookName);
        setSaveNotebookDescription(notebookDescription);
        setSaveNotebookPublic(notebookPublic);
        setSaveNotebookTag(notebookTag);

        setShowDialog({
            title: title, 
            yesLabel: label,
            update: update,
            scriptId: currentNotebook?.id || "",
            text: (<div>
                <div className="spacer">
                    <b>Name: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                    <TextField
                        defaultValue={notebookName} 
                        onChange={(event) => setSaveNotebookName(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Description: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                    <TextField
                        defaultValue={notebookDescription} 
                        onChange={(event) => setSaveNotebookDescription(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Public: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <Checkbox
                    defaultChecked={notebookPublic} 
                    onChange={(event, value) => {
                        setSaveNotebookPublic(value)
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Tag: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                    <TextField
                        defaultValue={notebookTag} 
                        onChange={(event) => setSaveNotebookTag(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

            </div>),
        });
    }

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
                        });
                        console.log("updated notebook=", r);
                        setNotebookName(saveNotebookName);
                        setNotebookPublic(saveNotebookPublic);
                        setNotebookDescription(saveNotebookDescription);
                        setNotebookTag(saveNotebookTag);
                    }
                    else if (showDialog.update == "save") {
                        console.log("Creating notebook ", notebookName);
                        const r = await scriptMgr.createDocument({
                            type: type,
                            public: saveNotebookPublic,
                            name: saveNotebookName,
                            script: script,
                            description: saveNotebookDescription,
                            tag: saveNotebookTag,
                        })
                        if (r) {
                            // Copy variables from current notebook to new one & create initial snapshot
                            try {
                                const c = await notebookMgr.process(`copyNotebookvars/${id}/${r.id}`)
                                const snapshotName = "0";
                                const r1 = await notebookMgr.processPost(`saveNotebookVarsSnapshot/${r.id}/${snapshotName}`, {
                                    description: "Original data",})
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
            {showDialog ? showDialog.text : ""}
        </StyledDialog>
        )
    }

    let _importData:any = null;

    async function exportNotebook() : Promise<void> {
        if (!updateEnabled) { return }
        console.log("exportNotebook()");
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        const exportData = {
            public: false,
            name: currentNotebook.name,
            description: currentNotebook.description,
            tag: currentNotebook.tag,
            script: currentNotebook.script,
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
                if (!json.cells[i].parameters) {
                    json.cells[i].parameters = {};
                }
                if (typeof json.cells[i].view == "string") {
                    json.cells[i].view = [(json.cells[i] as any).view];
                }
            }
            setNotebook(json);
            setNotebookDescription(currentNotebook.description);
            setNotebookPublic(currentNotebook.public);
            setNotebookTag(currentNotebook.tag);

            if (context.isAdministrator) {
                _updateEnabled = true;
            }
            else if (currentNotebook.owner.email == context.user.email) {
                _updateEnabled = true;
            }
            setUpdateEnabled(_updateEnabled);

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
        if (refresh) {
            setNotebook({...notebook})
        }
        notebookUpdated = true;
    }

    const updateNotebook = async () => {
        if (!notebookUpdated) { 
            console.log("Notebook not changed, so no need to save it")
            return 
        }
        console.log("Notebook changed, so saving it");
        notebookUpdated = false;
        setNotebook({...notebook})
        const script = JSON.stringify(notebook)

        console.log("Updating notebook ", notebookName);
        const r = await scriptMgr.saveDocument({
            id: currentNotebook?.id,
            type: type,
            name: notebookName, 
            script: script,
            public: true,
            description: notebookDescription, 
            tag: notebookTag 
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
                r.push(<div className="notebookCell" >
                <NotebookEditorCell 
                    key={"cell-"+i+"-"+notebook.cells[i].id}
                    context={context}
                    setShowSpinner={setShowSpinner}
                    notebookId={currentNotebook.id} 
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
                />
                </div>)
                if (i < notebook.cells.length-1) {
                    r.push(<div className="spacer">
                    </div>)
                }
            }
        }
        return r;
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
            if (i == insertAtIndex) {
                _notebook.cells.push({type:"code", data:"// Add your code here\nsetResult('');", id:uuidv4(), name: "", view:["raw"]})
            }
            _notebook.cells.push(notebook.cells[i]);
        }
        if (insertAtIndex == notebook.cells.length) {
            _notebook.cells.push({type:"code", data:"// Add your code here\nsetResult('');", id:uuidv4(), name: "", view:["raw"]})
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
            if (i != index) {
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

    const saveSnapshot = async() => {
        if (!updateEnabled) { return }
        console.log("saveSnapshot()");
        if (!currentNotebook || !currentNotebook.id) {
            console.log("No current notebook selected");
            return;
        }
        try {
            const snapshotName = Date.now().toString();
            const r = await notebookMgr.processPost(`saveNotebookVarsSnapshot/${currentNotebook.id}/${snapshotName}`, {
                description: saveSnapshotDescription,})
            console.log("save snapshot =", r);
            await getSnapshotNames();
        }
        catch (e) {
            throw(e);
        }
    }
    
    const restoreSnapshot = async() => {
        if (!updateEnabled) { return }
        console.log("restoreSnapshot()");
        if (!currentNotebook || !currentNotebook.id || !selectedSnapshot) {
            console.log("No current notebook or snapshot selected");
            return;
        }
        try {
            const r = await notebookMgr.process(`restoreNotebookVarsSnapshot/${currentNotebook.id}/${selectedSnapshot}`)
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
            if (snapshot.name == selectedSnapshot) {
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

            <div className="editorDiv">

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
            <Navbar context={context} />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                open={(showSpinner.length > 0)}
            >
                <div className="spinnerDiv">
                    <p>{showSpinner}</p>
                    <CircularProgress color="info" />
                </div>
            </Backdrop>
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

                                {notebookTag && <div className="spacer">
                                    <b>Tag: </b>
                                    {notebookTag}
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
                                    </div>
                                    <div>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveNotebook("save")}>Save As New Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>saveNotebook("update")} disabled={!notebookName || !currentNotebook || (currentNotebook?.name != notebookName) || !updateEnabled}>Save Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>exportNotebook()} disabled={!notebookName || !currentNotebook || (currentNotebook?.name != notebookName) || !updateEnabled}>Export Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>replaceNotebook()} disabled={!notebookName || !currentNotebook || (currentNotebook?.name != notebookName) || !updateEnabled}>Replace Notebook</Button>
                                        <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<RemoveCircleOutlineOutlinedIcon/>} onClick={()=>deleteNotebook()} disabled={!notebookName || !currentNotebook || (currentNotebook?.name != notebookName) || !updateEnabled}>Delete Notebook</Button>
                                    </div>

                                </div>

                                <div style={{paddingTop:"100px"}}>
                                    <h5>Snapshots</h5>
                                    Snapshots save the current values of all variables in the notebook.  You can restore a snapshot to return all variables to the values they had when the snapshot was taken.
                                </div>
                                <div className="spacer" style={{display:"flex", justifyContent:"space-between", paddingTop:"20px"}}>
                                    <div style={{display:"flex", alignItems:"center"}}>
                                        <div>Enter Snapshot Description: </div>
                                        <TextField
                                            className='zeroTopMargin'
                                            style={{minWidth:"300px", paddingLeft:"20px", paddingRight:"20px"}}
                                            defaultValue={saveSnapshotDescription} 
                                            onChange={(event) => setSaveSnapshotDescription(event.target.value)}
                                            sx={{
                                                "&.MuiFormControl-root": { marginTop: "0px !important" }
                                            }}
                                        />
                                        <div>
                                        <Button style={{}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveSnapshot()}>Save Snapshot</Button>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            Select Snapshot: 
                                            <Select 
                                                style={{minWidth:"300px", marginLeft:"20px"}} 
                                                value={selectedSnapshot} 
                                                onChange={(event) => { if (updateEnabled) { setSelectedSnapshot(event.target.value) } }}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {snapshots.map((snapshot) => (
                                                    <MenuItem key={snapshot.name} value={snapshot.name}>{snapshot.name!="0" ? (formatDateTime(parseInt(snapshot.name))+" - ") : ""}{snapshot.description}</MenuItem>
                                                ))}
                                            </Select>
                                        </div>
                                        <div className='spacer'>
                                            <Button style={{}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>restoreSnapshot()}>Restore Snapshot</Button>
                                            <Button style={{marginLeft:"40px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>deleteSnapshot()}>Delete Snapshot</Button>
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
                        <div className="spacer detailDiv"/>
                    </div> 
                </div>
            </div>
        </div>
    )
}

export default NotebookEditor;