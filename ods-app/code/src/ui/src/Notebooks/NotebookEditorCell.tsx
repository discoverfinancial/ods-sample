/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Select,
    styled,
    TextField,
    Tooltip
} from '@mui/material'

import { AppContext } from "../common";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { markdown } from "@codemirror/lang-markdown"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ScriptMgr } from '../managers/ScriptMgr';
import { NotebookMgr } from '../managers/NotebookMgr';
import { JSONTree } from 'react-json-tree';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import VerticalAlignBottomOutlinedIcon from '@mui/icons-material/VerticalAlignBottomOutlined';
import VerticalAlignTopOutlinedIcon from '@mui/icons-material/VerticalAlignTopOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import SimCardDownloadOutlinedIcon from '@mui/icons-material/SimCardDownloadOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import SbomDataGrid from '../components/SbomDataGrid';
import JsonDataGrid from '../components/JsonDataGrid';
import { Notebook, NotebookCell } from './NotebookEditor';
import MostUsedDataGrid from '../components/MostUsedDataGrid';
import LibrariesDataGrid from '../components/LibrariesDataGrid';
import VersionsDataGrid from '../components/VersionsDataGrid';
import './NotebookEditorCell.css';

import { setErrorHandler } from '../App';
import { DynamicJsxComponent } from '../PagesEditor';

const theme = {
    scheme: 'bright',
    author: 'chris kempson (http://chriskempson.com)',
    base00: '#000000',
    base01: '#303030',
    base02: '#505050',
    base03: '#b0b0b0',
    base04: '#d0d0d0',
    base05: '#e0e0e0',
    base06: '#f5f5f5',
    base07: '#ffffff',
    base08: '#fb0120',
    base09: '#fc6d24',
    base0A: '#fda331',
    base0B: '#a1c659',
    base0C: '#76c7b7',
    base0D: '#6fb3d2',
    base0E: '#d381c3',
    base0F: '#be643c'
}
/*
(#282a36) base00 - Default Background
(#34353e) base01 - Lighter Background (Used for status bars)
(#43454f) base02 - Selection Background
(#78787e) base03 - Comments, Invisibles, Line Highlighting
(#a5a5a9) base04 - Dark Foreground (Used for status bars)
(#e2e4e5) base05 - Default Foreground, Caret, Delimiters, Operators
(#effeb) base06 - Light Foreground (Not often used)
(#f1f1f0) base07 - Light Background (Not often used)
(#ff5c57) base08 - Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
(#ff9F43) base09 - Integers, Boolean, Constants, XML Attributes, Markup Link Url
(#f3f99d) base0A - Classes, Markup Bold, Search Text Background
(#5af78e) base0B - Strings, Inherited Class, Markup Code, Diff Inserted
(#9aedfe) base0C - Support, Regular Expressions, Escape Characters,
*/

const StyledFormControlLabel = styled(FormControlLabel)({
    ".MuiFormControlLabel-label": {
        fontSize:"1em"
    }
});

let editorCodeChanged = false;
let nameChanged = false;
let timeOutId:any;

interface Props {
    context: AppContext;
    setShowSpinner?: any;
    notebookId: string;
    notebook: Notebook;
    cellChanged(index: number, refresh?: boolean): any;
    cellIds: string[];
    cellNames: any;
    cell: NotebookCell;
    index: number;
    insertCell(position: number, index: number): any;
    moveCell(position: number, index: number): any;
    deleteCell(index: number): any;
    presentationMode?: boolean;
    updateEnabled: boolean;
    updateNotebook: any;
}

let cellAlreadyRun = false;

const NotebookEditorCell: React.FC<Props> = ({ context, setShowSpinner, 
    notebookId, 
    notebook,
    cellChanged,
    cellIds,
    cellNames,
    cell, index,
    insertCell,
    moveCell,
    deleteCell,
    presentationMode,
    updateEnabled,
    updateNotebook,
 }) => {
    const scriptMgr = ScriptMgr.getInstance();
    const notebookMgr = NotebookMgr.getInstance();

    const [cellResults, setCellResults] = useState<any>();
    const [cellData, setCellData] = useState<string>(); // used only for jsx cell type

    const [initComplete, setInitComplete] = useState<boolean>(false);

    const _setCellData = (data: string, runCell=false) => {
        console.log("$$$$ _setCellData()")
        try {
            cellAlreadyRun = false;
            setCellData(
                `(props) => {
                    const {setVar, getVar, getCellResult, runNotebookCell: runCell, 
                    useEffect, useState, useRef,
                    mui, mgr,
                    SbomDataGrid, JsonDataGrid, MostUsedDataGrid, LibrariesDataGrid, VersionsDataGrid, AgGridReact,
                    d3, recharts,
                    } = props;
                    ${data}
                }`
            );
        } catch (e) {
            console.log("Error: ", e);
        }
    }

    useEffect(() => {
        if (cell.type == "jsx") {
            if (cellResults) {
            }
        }
    }, [cellResults])

    const jsxErrorHandler = (err: any) => {
        console.log("@@@ jsxErrorHandler()")
        let msg = err.message;
        const i = msg.toLowerCase().indexOf("error:");
        if (i > -1) {
            msg = msg.substring(i+6).trim();
        }
        return msg;
    }

    async function setVar(name: string, value: any) {
        console.log(`### setVar(${name}, ${value})`)
        console.log("type=", (typeof value))
        if (typeof value == "string") {
            value = {_string: value}; // Must be JSON
        }
        else if (typeof value == "number") {
            value = {_num: value}; // Must be JSON
        }
        try {
            await notebookMgr.processPost(`setNotebookvar/${notebookId}/${name}`, value);
        } catch (e) {
            console.log("Error in setVar: ", e);
        }
    }

    async function getVar(name: string) {
        console.log(`### getVar(${name})`)
        try {
            const r = await notebookMgr.process(`getNotebookvar/${notebookId}/${name}`);
            if (r) {
                if (r["_string"]) {
                    return r["_string"];
                }
                if (r["_num"]) {
                    return r["_num"];
                }
                return r;
            }
        } catch (e) {
            console.log("Error in getVar: ", e);
        }
    }

    async function getCellResult(index: number) {
        const id = cellIds[index];
        return await getVar("cellResult_"+id);
    }

    async function runNotebookCell(index: number) {
        setTimeout(async function() {
        if (!updateEnabled) { return }
        if (index < notebook.cells.length) {
            const run = notebook.cells[index].run;
            if (run) {
                await run(cellIds);
            }
        }
    }, 100);
    }

    /**
     * Run cell
     * 
     * @param index The cell index
     */
    const runCell = async (cellIds: string[]) => {
        console.log(`runCell(${index})`);
        if (!updateEnabled) { return }
        await updateNotebook();
        if (cell.type == "code" || cell.type == "searchSoftware") {

            if (cell.type == "searchSoftware") {
                let searchType = [];
                if (cell.parameters.searchProducts) searchType.push("Product");
                if (cell.parameters.searchSystems) searchType.push("Application");
                if (cell.parameters.searchComponents) searchType.push("ITComponent");
                if (cell.parameters.searchInterfaces) searchType.push("Interface");
                if (cell.parameters.searchLibraries) searchType.push("library"); //sbom returned lower case
                if (cell.parameters.searchUsergroups) searchType.push("UserGroup");
                if (cell.parameters.searchBusinessCapabilities) searchType.push("BusinessCapability");

                cell.data =
`
const r = searchSboms("${cell.parameters.searchText}", "", ${JSON.stringify(searchType)});
setResult(r);
`
            }

            console.log("Running cell");
            console.log("notebookId =", notebookId);
            setShowSpinner(`Running cell ${index}...`)
            try {
                const r = await scriptMgr.runScript({
                    script:
                        `
function getVars(name, value) {
    return getNotebookVars("${notebookId}");
}
function getVar(name) {
    const r = getNotebookVar("${notebookId}", name);
    if (r) {
        if (r["_string"]) {
            return r["_string"];
        }
        else if (r["_num"]) {
            return r["_num"];
        }
    }
    return r;
}
function setVar(name, value) {
    if (typeof value == "string") {
        value = {_string: value};
    }
    else if (typeof value == "number") {
        value = {_num: value};
    }
    setNotebookVar("${notebookId}", name, value);
}
function deleteVar(name) {
    deleteNotebookVar("${notebookId}", name);
}
function _setResult(data) {
    setNotebookVar("${notebookId}", "cellResult_${cell.id}", data);
    setResult({value: data});
}
function getCellResult(index) {
    let id = ${JSON.stringify(cellIds)}[index];
    if (!id) {
        id = ${JSON.stringify(cellNames)}[index];
    }
    if (id) {
        return getNotebookVar("${notebookId}", "cellResult_"+id);
    }
}

async function run() {
${cell.data.replaceAll("setResult(", "_setResult(")}
}
const r = await run();
if (r) {
    _setResult(r);
}

`, parameters: {}
                }, "user");
                console.log("r=", r);
                if (r && r.error) {
                    await notebookMgr.processPost(`setNotebookvar/${notebookId}/cellResult_${cell.id}`, r);
                }
                setCellResults(r);
                setShowSpinner("")
            }
            catch (e) {
                setShowSpinner("")
                throw (e);
            }
        }
        else if (cell.type == "jsx") {
            _setCellData(cell.data);
        }

        if (cell.type == "text") {

            console.log("Running cell");
            console.log("notebookId =", notebookId);
            setShowSpinner(`Running cell ${index}...`)
            try {
                const r = await scriptMgr.runScript({
                    script:
                        `
function getVars(name, value) {
    return getNotebookVars("${notebookId}");
}
function getVar(name) {
    const r = getNotebookVar("${notebookId}", name);
    if (r) {
        if (r["_string"]) {
            return r["_string"];
        }
        else if (r["_num"]) {
            return r["_num"];
        }
    }
    return r;
}
function setVar(name, value) {
    if (typeof value == "string") {
        value = {_string: value};
    }
    else if (typeof value == "number") {
        value = {_num: value};
    }
    setNotebookVar("${notebookId}", name, value);
}
function deleteVar(name) {
    deleteNotebookVar("${notebookId}", name);
}
function _setResult(data) {
    setNotebookVar("${notebookId}", "cellResult_${cell.id}", data);
    setResult({value: data});
}
function getCellResult(index) {
    let id = ${JSON.stringify(cellIds)}[index];
    if (!id) {
        id = ${JSON.stringify(cellNames)}[index];
    }
    if (id) {
        return getNotebookVar("${notebookId}", "cellResult_"+id);
    }
}

function renderMarkdown(mdText){
    const i = mdText.matchAll(/{{([\\s\\S]*?)}}/g);
    const matches = [];
    for (const m of i) {
        // console.log("m=", m.index, m.groups, Object.keys(m));
        const end = mdText.indexOf("}}", m.index) + 2;
        matches.push([...m, m.index, end]);
    }
    // const matches = Array.from(i);
    // console.log("matches=", matches, "length=", matches.length);
    let result = "";
    for (let j=0; j<matches.length; j++) {
        const match = matches[j];
        // console.log("Looking at match=", match);
        let value = null;
        try {
            value = eval(match[0]);
        } catch (e) {
            console.log("Error evaluating ", match[0], e);
            value = "Error evaluating "+match[0]+" : "+e.message;
        }
        let s = (typeof value === "object") ? JSON.stringify(value) : value;
        if (s?.length > 10000) {
            s = s.substring(0,10000) + "... (truncated, length=" + s.length + ")";
        }
        //mdText = mdText.substring(0,match[2]) + s + mdText.substring(match[3]);
        result += mdText.substring( (j==0) ? 0 : matches[j-1][3], match[2]) + s;
    }
    return result;
}

function renderTable(data, columns) {

    if (typeof data === "string") {
        return data;
    }
    
    if (Array.isArray(data)) {
        let table = [];
        if (!columns || columns.length == 0) {
            const firstRow = data[0];
            columns = Object.keys(firstRow);
        }
        let header = "|";
        let separator = "|";
        for (const col of columns) {
            header += col+"|";
            separator += "---|";
        }
        table.push(header);
        table.push(separator);
        for (const row of data) {
            let s = "|";
            for (const col of columns) {
                let v = row[col];
                if (typeof v === "object") {
                    v = JSON.stringify(v);
                }
                s += v + "|";
            }
            table.push(s);
        }
        return "\\r\\n\\r\\n"+table.join("\\r\\n")+"\\r\\n\\r\\n";
    }

    {
        let table = [];
        if (!columns || columns.length == 0) {
            columns = Object.keys(data);
            console.log("columns=", columns);
        }
        let header = "|||";
        let separator = "|---|---|";
        table.push(header);
        table.push(separator);
        for (const key of columns) {
            let v = data[key];
            if (typeof v === "object") {
                v = JSON.stringify(v);
            }
            s = "|"+key+"|"+v+"|";
            table.push(s.replaceAll("|", "\\|"));
        }
        return "\\r\\n\\r\\n"+table.join("\\r\\n")+"\\r\\n\\r\\n";
    }
}

async function run() {
    const mdText = \`${cell.data}\`;
    const r = renderMarkdown(mdText);
    _setResult(r);
}
const r = await run();
if (r) {
    _setResult(r);
}

`, parameters: {}
                }, "user");
                console.log("r=", r);
                if (r && r.error) {
                    await notebookMgr.processPost(`setNotebookvar/${notebookId}/cellResult_${cell.id}`, r);
                }
                setCellResults(r);
                setShowSpinner("")
            }
            catch (e) {
                setShowSpinner("")
                throw (e);
            }
        }


        else {
            console.log("Not a code cell, so not running")
        }
    }

    /**
     * Get results for this cell
     * 
     * @param notebookId 
     */
    const getCellResults = async () => {
        console.log(`getCellResults()`);
        setShowSpinner("Loading data...")
        try {
            const data = await notebookMgr.process(`getNotebookvar/${notebookId}/cellResult_${cell.id}`);
            console.log("cell Results =", data);
            setCellResults(data);
            setShowSpinner("");
        }
        catch (e) {
            setShowSpinner("")
            throw (e);
        }
    }

    // Reload cell results when cell changes
    useEffect(() => {
        if (cell) {
            cell.run = runCell;
            getCellResults();
            console.log(">>VIEW=", cell.view);
            if (cell.type == "searchSoftware") {
            }
            else if (cell.type == "jsx") {
                setErrorHandler(jsxErrorHandler);
                _setCellData(cell.data);
            }
            else {
                cell.parameters = {};
            }
        }
    }, [cell])

    /**
     * Set format to show results in
     * 
     * @param index 
     * @param view 
     */
    const setShow = (event: any) => {
        const view = event.target.value;
        if (view) {
            console.log(`setShow(${view})`);
            cell.view = [view];
            cellChanged(index, true);
        }
    }

    /**
     * Set format to show results in
     * 
     * @param index 
     * @param view 
     */
    const setType = (event: any) => {
        if (!updateEnabled) {
            throw new Error("Only the owner can edit this notebook")
        }
        const type = event.target.value;
        if (type) {
            console.log(`setType(${type})`);
            cell.type = type;
            switch (type) {
                case "text":
                    cell.view = ["editor", "preview"]
                    break;
                case "code":
                    cell.view = ["raw"]
                    break;
                case "searchSoftware":
                    cell.view = ["sbom"]
                    break;
                case "jsx":
                    cell.view = ["editor"]
                    break;
                case "input":
                    cell.view = ["raw"]
                    break;
            }
            cellChanged(index, true);
        }
    }

    /**
     * Toggle view for cell
     * 
     * @param index 
     * @param view 
     */
    const toggleShow = (view: string) => {
        if (!updateEnabled) { return }
        console.log(`toggleShow(${index}, ${view})`);
        const parts = cell.view;
        const i = parts.indexOf(view);
        if (i > -1) {
            parts.splice(i,1);
        }
        else {
            parts.push(view);
        }
        cell.view = parts;
        cellChanged(index, true);
    }

    /**
     * Delete cell results and variable on server
     * 
     * @param index The cell index
     */
    const deleteResults = async () => {
        if (!updateEnabled) {
            throw new Error("Only the owner can edit this notebook")
        }
        console.log(`deleteResults(${index})`);
        const cellId = cell.id;
        try {
            const r = await notebookMgr.processDelete(`deleteNotebookvar/${notebookId}/cellResult_${cellId}`)
            console.log("cell Results =", r);
            setCellResults(undefined);
        }
        catch (e) {
            setShowSpinner("")
            throw (e);
        }
    }

    /**
     * Delete markdown cell results and variable on server
     * 
     * @param index The cell index
     */
    const deleteMarkdownResults = async () => {
        if (!updateEnabled) {
            throw new Error("Only the owner can edit this notebook")
        }
        console.log(`deleteMarkdownResults(${index})`);
        const cellId = cell.id;
        try {
            const r = await notebookMgr.processDelete(`deleteNotebookvar/${notebookId}/cellResult_${cellId}`)
            console.log("cell Results =", r);
            setCellResults(undefined);
        }
        catch (e) {
            setShowSpinner("")
            throw (e);
        }
    }


    /**
     * Render the cell
     */
    if (cell) {
        const hasResults = !!cellResults
        const error = (cellResults && cellResults.error) ? cellResults.error : null;
        const iconClassName = updateEnabled ? "" : "notebookEditorIconDisabled"
        return (<div className="spacer" style={{ paddingLeft: "16px" }}>

            <div style={{ display: "flex", gap: "20px", paddingBottom: "8px", alignItems:"center" }}>
                {!presentationMode && <>
                <h5>Cell {index}:</h5>
                <div></div>
                <div><b>Name:</b></div>
                <TextField 
                    defaultValue={cell.name || index} 
                    // onChange={(event) => { if (updateEnabled) { setCellName(event)}}}
                    onChange={(event) => {
                        nameChanged = true;
                        cell.name = event.target.value;
                    }} 
                    onBlur={() => {
                        if (nameChanged) {
                            nameChanged = false;
                            cellChanged(index, true);
                        }
                    }}
                    style={{ top: "-4px", width: "120px"}}
                />
                <div><b>Type:</b></div>
                <Select
                    value={cell.type}
                    onChange={(event) => { if (updateEnabled) { setType(event)}}}
                >
                    <MenuItem value={"code"}>Javascript</MenuItem>
                    <MenuItem value={"text"}>Markdown</MenuItem>
                    <MenuItem value={"searchSoftware"}>Search Software</MenuItem>
                    <MenuItem value={"jsx"}>React Code</MenuItem>
                    <MenuItem value={"input"}>Input</MenuItem>
                </Select>
                <div></div>
                <div></div>
                {cell.type != "text" && !hasResults &&
                    <Tooltip title={"Run Code Cell"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                            <PlayCircleFilledWhiteOutlinedIcon className={iconClassName} onClick={() => { runCell(cellIds) }}/></span>
                    </Tooltip>
                }
                {cell.type != "text" && hasResults &&
                    <Tooltip title={"Rerun Code"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                        <ReplayOutlinedIcon className={iconClassName} onClick={() => { runCell(cellIds) }} /></span>
                    </Tooltip>
                }

                {cell.type == "text" && !hasResults &&
                    <Tooltip title={"Save Text & All Other Notebook Changes"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                        {/* <SaveOutlinedIcon className={iconClassName} onClick={() => { updateNotebook() }} /></span> */}
                        <PlayCircleFilledWhiteOutlinedIcon className={iconClassName} onClick={() => { runCell(cellIds) }}/></span>
                    </Tooltip>
                }
                {cell.type == "text" && hasResults &&
                    <Tooltip title={"Rerun Code"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                        <ReplayOutlinedIcon className={iconClassName} onClick={() => { runCell(cellIds) }} /></span>
                    </Tooltip>
                }

                {(cell.type == "text" || cell.type == "jsx") &&
                    <Tooltip title={"Show/Hide Editor"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                        <EditNoteOutlinedIcon className={iconClassName} onClick={() => { toggleShow( "editor") }} /></span>
                    </Tooltip>
                }
                {cell.type == "text" &&
                    <Tooltip title={"Show/Hide Preview"} placement="bottom-start" enterDelay={500}>
                        <span className="notebookEditorTooltip">
                        <PreviewOutlinedIcon className={iconClassName} onClick={() => { toggleShow( "preview") }} /></span>
                    </Tooltip>
                }

                <Tooltip title={"Move Cell Up"} placement="bottom-start" enterDelay={500}>
                <span className="notebookEditorTooltip">
                <UploadFileOutlinedIcon className={iconClassName} onClick={() => { moveCell(-1, index) }} /></span>
                </Tooltip>
                <Tooltip title={"Move Cell Down"} placement="bottom-start" enterDelay={500}>
                <span className="notebookEditorTooltip">
                <SimCardDownloadOutlinedIcon className={iconClassName} onClick={() => { moveCell(1, index) }} /></span>
                </Tooltip>

                <Tooltip title={"Insert Cell Above This Cell"} placement="bottom-start" enterDelay={500}>
                <span className="notebookEditorTooltip">
                <VerticalAlignTopOutlinedIcon className={iconClassName} onClick={() => { insertCell(0, index) }} /></span>
                </Tooltip>
                <Tooltip title={"Insert Cell Below This Cell"} placement="bottom-start" enterDelay={500}>
                <span className="notebookEditorTooltip">
                <VerticalAlignBottomOutlinedIcon className={iconClassName} onClick={() => { insertCell(1, index) }} /></span>
                </Tooltip>


                <div></div>
                <Tooltip title={"Delete Cell"} placement="bottom-start" enterDelay={500}>
                <span className="notebookEditorTooltip">
                <DeleteForeverOutlinedIcon className={iconClassName} onClick={() => { deleteCell(index) }} /></span>
                </Tooltip>
                </>}

            </div>

            {(cell.type == "code" || cell.type == "searchSoftware") && <>

                {!presentationMode && <>
                {(cell.type == "code") && <CodeMirror
                    value={cell.data}
                    style={{ border: "1px solid gray", borderRadius: "4px", maxHeight: "50vh", overflow:"auto" }}
                    extensions={[javascript({ jsx: true })]}
                    onChange={(data) => {
                        editorCodeChanged = true;
                        cell.data = data;
                    }} 
                    onBlur={() => {
                        if (editorCodeChanged) {
                            editorCodeChanged = false;
                            cellChanged(index);
                        }                        
                    }}
                />}

                {(cell.type == "searchSoftware") && <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                    <div  style={{}}>Search for Software<br/>(use * for partial match)</div>
                    <TextField
                        value={cell.parameters.searchText}
                        style={{ border: "1px solid gray", borderRadius: "4px", backgroundColor:"white", flex:"1" }}
                        onChange={(event) => {
                            cell.parameters.searchText = event.target.value;
                            cellChanged(index, true);
                        }} 
                        onKeyDown={(e) => (
                            e.keyCode === 13 ? runCell(cellIds) : null
                        )}
                    />
                    <div>
                        <FormGroup style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchProducts} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchProducts = v;
                                cellChanged(index, true);                                
                            }}/>} label="Products" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchSystems} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchSystems = v;
                                cellChanged(index, true);                                
                            }}/>} label="Applications" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchComponents} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchComponents = v;
                                cellChanged(index, true);                                
                            }}/>} label="Components" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchInterfaces} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchInterfaces = v;
                                cellChanged(index, true);                                
                            }}/>} label="Interfaces" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchUsergroups} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchUsergroups = v;
                                cellChanged(index, true);                                
                            }}/>} label="User Groups" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchLibraries} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchLibraries = v;
                                cellChanged(index, true);                                
                            }}/>} label="Libraries" />
                            <StyledFormControlLabel control={<Checkbox checked={cell.parameters.searchBusinessCapabilities} onChange={(event) => {
                                const v = event.target.checked;
                                cell.parameters.searchBusinessCapabilities = v;
                                cellChanged(index, true);                                
                            }}/>} label="Business Capabilities" />
                        </FormGroup>
                    </div>

                </div>}

                <div className="spacer"/>

                <div style={{ display: "flex", gap: "20px", alignItems:"center", paddingBottom:"8px"  }}>
                    <div>Results:</div>
                    <div style={{ display: "flex", gap: "20px", alignItems:"center"}}>
                        <Select
                            value={cell.view}
                            onChange={setShow}
                        >
                            <MenuItem value={"raw"}>Raw View</MenuItem>
                            <MenuItem value={"tree"}>Json Tree View</MenuItem>
                            <MenuItem value={"json"}>Json Table</MenuItem>
                            <MenuItem value={"sbom"}>Sbom Table</MenuItem>
                            <MenuItem value={"mostused"}>Top-Level Dependencies Table</MenuItem>
                            <MenuItem value={"libraries"}>Libraries Table</MenuItem>
                            <MenuItem value={"versions"}>Versions Table</MenuItem>
                        </Select>
                        {updateEnabled && <a onClick={() => deleteResults()} style={{ paddingLeft: "20px", paddingRight: "20px" }}>Delete Results</a>}
                    </div>
                </div>

                {error && <div style={{
                    border: "1px solid gray",
                    borderRadius: "4px",
                    padding: "8px",
                    maxHeight: "500px",
                    overflow: "auto",
                    display: "grid",
                }}>
                    {JSON.stringify(error)}
                </div>}

                {!hasResults && <div style={{
                    border: "1px solid gray",
                    borderRadius: "4px",
                    padding: "8px",
                    maxHeight: "500px",
                    overflow: "auto",
                    display: "grid",
                }}>
                    None
                </div>}
                </>}

                    {hasResults && !error && <div style={{}}>
                        {Array.isArray(cellResults) && (cell.view?.includes("sbom")) && <SbomDataGrid
                            title="Documents"
                            requests={cellResults}
                            handleEditRow={async (event) => {
                                console.log("edit document: ", event);
                                const i = event;
                                window.open("/details/" + encodeURIComponent(i), "_blank")?.focus();
                            }}
                            handleShowSbomVersions={async (data) => {
                                if (typeof data == "string") {
                                    window.open("/versions/" + encodeURIComponent(data), "_blank")?.focus();
                                }
                                else {
                                    window.open("/versions/" + encodeURIComponent(JSON.stringify(data)), "_blank")?.focus();
                                }
                            }}
			    
                            isAdmin={context.isAdministrator}
                            displayColumns={cell.columns}
                            setDisplayColumns={async (data) => {
                                console.log("Changing display columns to ", data);
                                cell.columns = data;
                                cellChanged(index, true);
                            }}
                            style={{
                                height: `calc(100vh - {gridTop}px - 20px)`,
                                minHeight: "600px",
                                paddingBottom: "20px"
                            }}
                        />}

                        {Array.isArray(cellResults) && (cell.view?.includes("mostused")) && <MostUsedDataGrid 
                            title="Libraries"
                            data={cellResults}
                            handleRowClicked={async (data) => {
                                const args = {name: data.name, group: data.group, basePurl: data.basePurl}
                                window.open("/versions/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
                    
                            }} 
                            handleGuidanceClicked={async (data) => {
                                if (data) {
                                    console.log("data=",data);
                                    const args = {name: data.name, group: data.group, basePurl: data.basePurl}
                                    window.open("/guidance/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
                                }
                            }}
                            isAdmin={context.isAdministrator}
                            style={{ 
                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                minHeight: "600px", 
                                paddingBottom: "20px" }}
                        />}

                        {Array.isArray(cellResults) && (cell.view?.includes("libraries")) && <LibrariesDataGrid 
                            title="Documents" 
                            requests={cellResults}
                            isAdmin={context.isAdministrator}
                            style={{ 
                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                minHeight: "600px", 
                                paddingBottom: "20px" 
                            }}
                        />}

                        {Array.isArray(cellResults) && (cell.view?.includes("versions")) && <VersionsDataGrid
                            title=""
                            data={cellResults}
                            handleViewClicked={async (event) => {}}
                            handleUsedByClicked={async (event) => {}}
                            isAdmin={context.isAdministrator}
                            style={{ height: `calc(100vh - ${document.getElementById("topMostUsedDataGrid")?.offsetTop}px - 250px)`, minHeight: "600px", paddingBottom: "20px" }}
                            basePurl={cellResults[0]?.basePurl}
                        />}


                        {Array.isArray(cellResults) && (cell.view?.includes("json")) && <JsonDataGrid
                            data={cellResults}
                            style={{
                                height: `calc(100vh - {gridTop}px - 20px)`,
                                minHeight: "600px",
                                paddingBottom: "20px"
                            }}
                            handleViewClicked={async function (event: any): Promise<any> {
                                console.log('JsonDataGrid clicked on - data =', JSON.stringify(event.data));
                                return null;
                            }}
                        />}

                        {(cell.view?.includes("tree") || cell.view?.includes("raw") || !cell.view) && <div style={{
                            border: "1px solid gray",
                            borderRadius: "4px",
                            padding: "8px",
                            maxHeight: "500px",
                            overflow: "auto",
                            display: "grid",
                            backgroundColor: "white",
                        }}>

                            {(cell.view?.includes("tree")) && <JSONTree
                                data={cellResults}
                                theme={theme}
                                invertTheme={true}
                                hideRoot={true}
                                collectionLimit={10}
                                shouldExpandNodeInitially={(keypath, data, level) => {
                                    return true
                                }}
                            />}

                            <pre id="testDiv" style={{ display: ((cell.view?.includes("raw") || !cell.view) ? "block" : "none"), backgroundColor:"white" }}>
                                {JSON.stringify(cellResults, null, 4)}
                            </pre>
                        </div>}
                    </div>}
                
            </>}

            {(cell.type == "jsx") && <>
                {!presentationMode && (cell.view?.indexOf("editor") > -1) && <CodeMirror
                    value={cell.data}
                    style={{ border: "1px solid gray", borderRadius: "4px", maxHeight: "50vh", overflow:"auto" }}
                    extensions={[javascript({ jsx: true })]}
                    onChange={(data) => {
                        editorCodeChanged = true;
                        cell.data = data;
                    }} 
                    onBlur={() => {
                        if (editorCodeChanged) {
                            editorCodeChanged = false;
                            cellChanged(index);
                        }
                    }}
                />}

                {!presentationMode && <div className="spacer" style={{ display: "flex", gap: "20px" }}>
                    <div>Render:</div>
                </div>}

                <div
                    className=""
                    style={{
                        border: "1px solid gray",
                        borderRadius: "4px",
                        padding: "8px",
                        maxHeight: "500px",
                        overflow: "auto",
                        display: "grid",
                    }}>
                    <div id="jsxroot" style={{backgroundColor: "white"}}>
                        <DynamicJsxComponent context={context} reset={1} jsx={cellData || ""} data={{context, setVar, getVar, runNotebookCell, getCellResult}} runAsEmployee={!context.isAdministrator}/>
                    </div>
                </div>

            </>}

            {(cell.type == "input") && <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                <div  style={{}}>Variable Name<br/></div>
                <TextField
                    value={cell.parameters.varName}
                    style={{ border: "1px solid gray", borderRadius: "4px", backgroundColor:"white", flex:"1" }}
                    onChange={(event) => {
                        cell.parameters.varName = event.target.value;
                        cellChanged(index, true);
                    }}
                    onKeyDown={(e) => (
                        e.keyCode === 13 ? runCell(cellIds) : null
                    )}
                />
                <div  style={{}}>Value<br/></div>
                <TextField
                    value={cell.parameters.varValue}
                    style={{ border: "1px solid gray", borderRadius: "4px", backgroundColor:"white", flex:"1" }}
                    onChange={(event) => {
                        cell.parameters.varValue = event.target.value;
                        cellChanged(index, true);
                    }}
                    onKeyDown={(e) => (
                        e.keyCode === 13 ? runCell(cellIds) : null
                    )}
                />
                <Button
                    onClick={async () => {
                         setVar(cell.parameters.varName, cell.parameters.varValue);
                         cellChanged(index);
                    }}
                >Submit</Button>

            </div>}



            {(cell.type == "text") && <>
                {!presentationMode && (cell.view?.indexOf("editor") > -1) && <CodeMirror
                    value={cell.data}
                    style={{ border: "1px solid gray", borderRadius: "4px", maxHeight: "50vh", overflow:"auto" }}
                    extensions={[markdown()]}
                    onChange={(data) => {
                        console.log("index=", index, "event=", data);
                        cell.data = data;
                        if (timeOutId) clearTimeout(timeOutId);
                            timeOutId = setTimeout(async () => {
                            timeOutId = null;
                            cellChanged(index, true);
                        }, 2000);
                    }}
                />}

                {(presentationMode || (cell.view?.indexOf("preview") > -1)) && <>
                    {!presentationMode && <div className="spacer" style={{ display: "flex", gap: "20px" }}>
                        <div>Preview:</div>
                        <div style={{ display: "flex", gap: "20px", alignItems:"center", paddingBottom:"8px"  }}>
                            {updateEnabled && <a onClick={() => deleteMarkdownResults()} style={{ paddingLeft: "20px", paddingRight: "20px" }}>Delete Results</a>}
                        </div>

                    </div>}

                    <div
                        className=""
                        style={{
                            border: "1px solid gray",
                            borderRadius: "4px",
                            padding: "8px",
                            maxHeight: "500px",
                            overflow: "auto",
                            display: "grid",
                        }}>
                        <div className="mdTable" style={{backgroundColor: "white"}}>
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                            >
                                {(typeof cellResults == "object") ? JSON.stringify(cellResults) : cellResults || cell.data || ""}
                            </ReactMarkdown>
                        </div>
                    </div>
                </>}
            </>}

        </div>
        )
    }
    else {
        return <></>
    }

}

export default NotebookEditorCell;
