/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Drawer, Tooltip, Backdrop, CircularProgress } from '@mui/material'
import { Checkbox } from '@mui/material';

import { AppContext } from './common';
import StyledDialog from './components/StyledDialog';

import { ScriptMgr } from './managers/ScriptMgr';
import Help from './Help';

import { v4 as uuidv4 } from "uuid";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

import { ScriptInfo } from './common';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

import SbomDataGrid from './components/SbomDataGrid';
import JsonDataGrid from './components/JsonDataGrid';
import MostUsedDataGrid from './components/MostUsedDataGrid';
import LibrariesDataGrid from './components/LibrariesDataGrid';
import VersionsDataGrid from './components/VersionsDataGrid';
import './Notebooks/NotebookEditorCell.css';

import StringToReactComponent from 'string-to-react-component';
import { CellErrorBoundary } from './components/CellErrorBoundary';
import { setErrorHandler } from './App';

// Used for Jsx
import { AgGridReact } from 'ag-grid-react';
import * as d3 from 'd3';
import * as recharts from 'recharts';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';
import { getMgrModels } from './managers';
const mui = require("@mui/material");

let key = 1;

// Try to handle infinite loops in user jsx code
let numOfRenders = 0;
// Clear every 5 sec
setInterval(function() {
    numOfRenders = 0;
}, 5000)

// Flag if editor code has changed (can't use state var since it causes refresh of DynamicJsxComponent)
let editorCodeChanged = "";
let savePageDescription = "";
let savePageName = "";
let savePagePublic = false;
let savePageTag = "";


export interface JsxProps {
    context: AppContext;
    reset: any;
    jsx: string;
    data: any;
    runAsEmployee: boolean;
    maxRenders?: number;
}

export const DynamicJsxComponent: React.FC<JsxProps> = ({ context, reset, jsx, data, runAsEmployee=true, maxRenders=100 }) => {
    console.log(`>>> DynamicJsxComponent runAsEmployee=${runAsEmployee} numOfRenders=${numOfRenders} <<<`)
    if (numOfRenders > maxRenders) {
        return <>Error: Too many rerenders in user React JS code.</>
    }
    numOfRenders++;
    const mgr = getMgrModels(runAsEmployee);
    console.log("mgr=", mgr);
    return (
        <CellErrorBoundary key={reset}>
            <StringToReactComponent babelOptions={{ presets: ['react', ['typescript', { allExtensions: true, isTSX: true }]] }} data={{
                ...data, context, runAsEmployee, 
                useState, useEffect, useRef,
                mui, mgr,
                SbomDataGrid, JsonDataGrid, MostUsedDataGrid, LibrariesDataGrid, VersionsDataGrid, AgGridReact,
                d3, recharts, 
            }}>
                {jsx}
            </StringToReactComponent>
        </CellErrorBoundary>
    );
}


export interface Page {
    cells: PageCell[];
}

export interface PageCell {
    id: string;
    type: string;           // "page"
    data: string;
    view: string[];         // "editor" | ""
    columns?: string;
    parameters?: any;
}

interface Props {
    context: AppContext;
}

let initComplete = false;

const PagesEditor: React.FC<Props> = ({ context }) => {
    const type = "page";
    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();

    let { id } = useParams();
    const scriptId = id || "";

    let presentationParam: any = null;
    let embedParam: any = null;
    let renderParam: any = null;
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        presentationParam = query.get("presentation");
        embedParam = query.get("embed");
        renderParam = query.get("render");
    }

    // Requests listed in table
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const [presentationMode, setPresentationMode] = useState<boolean>(false);
    const [embedMode, setEmbedMode] = useState<boolean>(false)
    const [runAsEmployee, setRunAsEmployee] = useState<boolean>(true);

    // Current selected page object
    const [currentScriptPage, setCurrentScriptPage] = useState<ScriptInfo>();

    // Current page object
    const [page, setPage] = useState<Page>({ cells: [] });
    const [pageName, setPageName] = useState<string>("");
    const [pagePublic, setPatePublic] = useState<boolean>(true);
    const [pageTag, setPageTag] = useState<string>("");
    const [pageDescription, setPageDescription] = useState<string>("");

    // Editor code
    const [editorCode, setEditorCode] = useState<string>();

    // Needed to recover from boundary error when code is updated to fix JSX error
    const [reset, setReset] = useState<number>(1);

    // JSX code to run
    const [jsx, setJsx] = useState<string>();

    // Variables for save form
    function setSavePageName(s: string) {
        savePageName = s;
    }
    function setSavePagePublic(b: boolean) {
        savePagePublic = b;
    }
    function setSavePageTag(s: string) {
        savePageTag = s;
    }
    function setSavePageDescription(s:string) {
        savePageDescription = s;
    }

    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [updateEnabled, setUpdateEnabled] = useState<boolean>(false);

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [error, setError] = useState<any>();

    useEffect(() => {
        async function init() {
            if (scriptId) {
                await loadPage(scriptId);
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

    async function loadPage(id: string) {
        const scriptMgr = ScriptMgr.getInstance();
        try {
            const _currentPage = await scriptMgr.getDocument(id);
            console.log("loadPage=", _currentPage);
            let _runAsEmployee = true;
            if (_currentPage) {
                setCurrentScriptPage(_currentPage);
                setPageName(_currentPage.name);
                const json: Page = JSON.parse(_currentPage.script);
                console.log(" -- page=", json);
                // If user is admin, then page can be run as admin if owner of script was also an admin
                if (_currentPage.owner.roles.includes("Admin") && context.isAdministrator) {
                    _runAsEmployee = false;
                }
                setPage(json);
                window.document.title = _currentPage.name;
            }
            setRunAsEmployee(_runAsEmployee);
        } catch (e: any) {
            setError("Error: " + e.message);
        }
    }

    /**
     * Save current page or create a new one
     * 
     * @param update save=save existing page as new one, new=create new blank page, update=update existing page
     */
    const savePage = async (update: string) => {
        let label = "";
        if (update == "update") {
            label = "update";
        }
        else if (update == "save") {
            label = "Save"
        }
        else if (update == "new") {
            label = "Create"
        }
        let title = "Save Page";
        if (update == "update") {
            title = "Save Existing Page";
        }
        else if (update == "save") {
            title = "Save as New Page";
        }
        else if (update == "new") {
            title = "Create New Page";
        }

        setSavePageName(pageName);
        setSavePageDescription(pageDescription);
        setSavePagePublic(pagePublic);
        setSavePageTag(pageTag);

        setShowDialog({
            title: title,
            yesLabel: label,
            update: update,
            text: (<div>
                <div className="spacer">
                    <b>Name: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={pageName}
                        onChange={(event) => setSavePageName(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Description: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={pageDescription}
                        onChange={(event) => setSavePageDescription(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Public: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <Checkbox
                        defaultChecked={pagePublic}
                        onChange={(event, value) => {
                            setSavePagePublic(value)
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Tag: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={pageTag}
                        onChange={(event) => setSavePageTag(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

            </div>),
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
                    console.log("SAVE PAGE WITH NAME: ", pageName);
                    const _page: Page = { cells: [] };
                    for (const cell of page.cells) {
                        const _cell = {
                            type: cell.type,
                            data: cell.data,
                            id: cell.id,
                            view: cell.view,
                            parameters: cell.parameters,
                            columns: cell.columns,
                        }
                        console.log("_cell =", _cell);

                        // When creating new page, cell uuids need to be changed
                        if (!showDialog.update) {
                            _cell.id = uuidv4();
                        }
                        _page.cells.push(_cell);
                    }
                    console.log("_page=", _page)
                    const script = JSON.stringify(_page)
                    if (showDialog.update == "update") {
                        if (!updateEnabled) {
                            throw new Error("Only the owner can update this page")
                        }
                        console.log("Updating page ", pageName);
                        const r = await scriptMgr.saveDocument({
                            id: scriptId,
                            type: type,
                            public: savePagePublic,
                            name: savePageName,
                            script: script,
                            description: savePageDescription,
                            tag: savePageTag,
                        });
                        console.log("updated page=", r);
                        if (r) {
                            setCurrentScriptPage(r);
                        }
                    }
                    else if (showDialog.update == "save") {
                        console.log("Creating page ", pageName);
                        const r = await scriptMgr.createDocument({
                            type: type,
                            public: savePagePublic,
                            name: savePageName,
                            script: script,
                            description: savePageDescription,
                            tag: savePageTag,
                        })
                        if (r) {
                            window.open("/pageedit/" + r.id, "_self");
                        }
                    }

                    else if (showDialog.update == "new") {
                        console.log("Creating new page ", pageName);
                        const _newPage: Page = {
                            cells: [
                                {
                                    type: "jsx", data: `// Add your JSX code here
return (<div>
  <h2>Hello World</h2>
</div>)
`,
                                    id: uuidv4(), view: ["editor"], parameters: {}
                                },
                            ]
                        }
                        const script = JSON.stringify(_newPage)
                        const r = await scriptMgr.createDocument({
                            type: type,
                            public: savePagePublic,
                            name: savePageName,
                            script: script,
                            description: savePageDescription,
                            tag: savePageTag,
                        })
                        if (r) {
                            window.open("/pageedit/" + r.id, "_self");
                        }
                    }
                    setSavePagePublic(false);
                    setSavePageName("");
                    setSavePageDescription("");
                    setSavePageTag("");
                    editorCodeChanged = "";
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

    /**
     * Delete the page
     * 
     * @returns 
     */
    async function deleteScriptPage(): Promise<void> {
        if (!updateEnabled) { return }
        console.log("deletePage()");
        console.log("Delete page ", currentScriptPage);
        if (currentScriptPage?.id?.startsWith("_")) {
            console.log("Can't delete default pages or dividers");
            return;
        }
        if (!pageName || (currentScriptPage?.name != pageName)) {
            console.log("Current page doesn't match page name or is not set");
            console.log("pageName=", pageName);
            console.log("currentPage name=", currentScriptPage?.name);
            return;
        }
        const _name = pageName;
        setShowDialog({
            title: "Delete Page",
            text: <div>
                Do you want to delete page:
                <div className='spacer'>"{_name}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        const q = await scriptMgr.deleteDocument(scriptId);
                        window.open("/page", "_self");
                        return;
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

    // If current page changed
    useEffect(() => {
        console.log(`currentPage changed =`, currentScriptPage);
        if (currentScriptPage) {
            let _updateEnabled = false;
            setPageName(currentScriptPage.name);
            const json: Page = JSON.parse(currentScriptPage.script);
            console.log(" -- page=", json);
            for (var i = 0; i < json.cells.length; i++) {
                if (typeof json.cells[i].view == "string") {
                    json.cells[i].view = [(json.cells[i] as any).view];
                }
            }
            setPage(json);
            setPageDescription(currentScriptPage.description);
            setPatePublic(currentScriptPage.public);
            setPageTag(currentScriptPage.tag);

            if (context.isAdministrator) {
                _updateEnabled = true;
            }
            else if (currentScriptPage.owner.email == context.user.email) {
                _updateEnabled = true;
            }
            setUpdateEnabled(_updateEnabled);
            setErrorHandler(jsxErrorHandler);
            setEditorCode(json.cells[0].data);
            _setJsx(json.cells[0].data);

        }
    }, [currentScriptPage]);

    const updatePage = async () => {
        console.log("Page changed, so saving it");
        editorCodeChanged = "";
        numOfRenders = 0;
        const script = JSON.stringify(page)

        console.log("Updating page ", pageName);
        const r = await scriptMgr.saveDocument({
            id: currentScriptPage?.id,
            type: type,
            name: pageName,
            script: script,
            public: true,
            description: pageDescription,
            tag: pageTag
        });
    }

    // Convert editor code to jsx code
    const _setJsx = (data: string) => {
        console.log("$$$$ _setJsx()")
        setReset(reset + 1);
        try {
            setJsx(
                `(props) => {
                    const { 
                    context, runAsEmployee, 
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

    // Handle JSX errors
    const jsxErrorHandler = (err: any) => {
        console.log("@@@ jsxErrorHandler()")
        let msg = err.message;
        const i = msg.toLowerCase().indexOf("error:");
        if (i > -1) {
            msg = msg.substring(i + 6).trim();
        }
        return msg;
    }

    /**
     * Run cell
     * 
     * @param index The cell index
     */
    const renderJsx = async () => {
        console.log(`renderJsx()`);
        if (!updateEnabled) { return }
        if (editorCodeChanged) {
            page.cells[0].data = editorCodeChanged; // || "";
            await updatePage();
            _setJsx(page.cells[0].data)
        }
    }

    useEffect(() => {
        console.log("jsx CHANGED")
        numOfRenders = 0;
    }, [jsx])

    // Render page
    if (embedMode) {
        return (
            <div>
                <div className="editorDiv">
                    <div className="detailDiv">
                        <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                            <div className="leftDiv">
                                {!currentScriptPage && <div className="spacer">
                                    <h5>Page not specified.</h5>
                                </div>}
                                {currentScriptPage && jsx && <>
                                    <div style={{
                                        marginTop: "16px",
                                    }}>
                                        <DynamicJsxComponent context={context} reset={reset} jsx={jsx} data={{}} runAsEmployee={runAsEmployee} maxRenders={10}/>
                                    </div>
                                    <div className="spacer" style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                        </div>
                                        <div>
                                            <Button style={{ marginLeft: "20px" }} variant="outlined" startIcon={<SaveOutlinedIcon />} onClick={() => savePage("save")}>Save As New Page</Button>
                                        </div>
                                    </div>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const iconClassName = updateEnabled ? "" : "notebookEditorIconDisabled"
    let style: any = {
        border: "1px solid gray",
        borderRadius: "4px",
        padding: "8px",
    };

    if (error) {
    return (
        <div>
            <Navbar context={context} />
            <div style={{ marginTop: "0px" }}>
                <TopMenu user={context.user} isAdmin={context.isAdministrator} />
                <div className="content">
                    <div className="editorDiv">
                        <h1>Page Editor</h1>
                        <div className="detailDiv" style={{textAlign:"center"}}>
                            <h2>{error}</h2>
                        </div>
                    </div>
                </div>
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

                        <h1>Page Editor for {pageName}</h1>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                Create and run ReactJS pages.
                                <br /><br />
                                <i>(Note: Changes to your page are automatically saved when render code icon is clicked.)</i>
                            </div>

                            {!presentationMode && <div style={{ display: "flex", paddingLeft: "40px", gap: "20px" }}>
                                <Button startIcon={<HelpOutlineOutlinedIcon />} onClick={(event) => { setShowHelp(true) }}>Pages Help</Button>
                            </div>}
                        </div>

                        <div className="detailDiv">
                            <div style={{ display: "flex", gap: "20px", width: "100%" }}>

                                <div className="leftDiv">
                                    {pageDescription && <div className="spacer">
                                        <b>Description: </b>
                                        {pageDescription}
                                    </div>}

                                    {pageTag && <div className="spacer">
                                        <b>Tag: </b>
                                        {pageTag}
                                    </div>}

                                    <div style={{
                                        marginTop: "16px",
                                    }}>

                                        <div className="spacer" style={{ paddingLeft: "16px" }}>

                                            <div style={{ display: "flex", paddingBottom: "8px", alignItems: "center" }}>
                                                {!presentationMode && <>

                                                    <div>ReactJS Code:</div>
                                                    <Tooltip title={"Save and Render Code"} placement="bottom-start" enterDelay={500}>
                                                        <span className="notebookEditorTooltip" style={{ paddingLeft: "20px" }}>
                                                            <ReplayOutlinedIcon className={iconClassName} onClick={() => { renderJsx() }} style={{ cursor: "pointer" }} /> </span>
                                                    </Tooltip>
                                                    <span onClick={() => { renderJsx() }} style={{ cursor: "pointer" }}>Save and render code</span>
                                                </>}

                                            </div>

                                            {!presentationMode && <CodeMirror
                                                value={editorCode}
                                                style={{ border: "1px solid gray", borderRadius: "4px", maxHeight: "50vh", overflow: "auto" }}
                                                extensions={[javascript({ jsx: true })]}
                                                onChange={(data) => {
                                                    editorCodeChanged = data;
                                                }}
                                            />}

                                            {!presentationMode && <div className="spacer" style={{ display: "flex", gap: "20px" }}>
                                                <div>Render:</div>
                                            </div>}

                                            <div id="jsxroot" style={{ ...style, backgroundColor: "white" }}>
                                                {jsx && <DynamicJsxComponent context={context} reset={reset} jsx={jsx} data={{}} runAsEmployee={runAsEmployee} maxRenders={10}/>}
                                            </div>

                                        </div>


                                    </div>

                                    <div className="spacer" style={{ display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <Button style={{ marginLeft: "20px" }} variant="outlined" startIcon={<PreviewOutlinedIcon />} onClick={() => window.open("/page/" + scriptId)}>View Page</Button>
                                        </div>
                                        <div>
                                            <Button style={{ marginLeft: "20px" }} variant="outlined" startIcon={<SaveOutlinedIcon />} onClick={() => savePage("save")}>Save As New Page</Button>
                                            <Button style={{ marginLeft: "20px" }} variant="outlined" startIcon={<UploadFileOutlinedIcon />} onClick={() => savePage("update")} disabled={!pageName || !currentScriptPage || (currentScriptPage?.name != pageName) || !updateEnabled}>Save Page</Button>
                                            <Button style={{ marginLeft: "20px" }} variant="outlined" startIcon={<RemoveCircleOutlineOutlinedIcon />} onClick={() => deleteScriptPage()} disabled={!pageName || !currentScriptPage || (currentScriptPage?.name != pageName) || !updateEnabled}>Delete Page</Button>
                                        </div>

                                    </div>

                                </div>


                                <Drawer key={`key_${key++}`} anchor='right'
                                    hideBackdrop={false}
                                    variant="persistent"
                                    open={showHelp} onClose={() => setShowHelp(false)}
                                >
                                    <div key={`key_${key++}`} style={{ width: "35vw", paddingTop: "10px", border: "2px solid gray" }}>
                                        <div style={{ marginLeft: "10px" }}>
                                            <a className="hideScriptHelp" onClick={(event) => { setShowHelp(false) }}>Hide Pages Help</a>
                                            <Help context={context} topic={"pages"} />
                                        </div>
                                    </div>
                                </Drawer>

                            </div>


                        </div>

                        <div className="spacer detailDiv" />
                        <div className="spacer detailDiv" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PagesEditor;
