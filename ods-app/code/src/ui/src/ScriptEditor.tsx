/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, TextField, Drawer, Select, MenuItem, CircularProgress } from '@mui/material'
import { Checkbox } from '@mui/material';

import StyledDialog from './components/StyledDialog';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { ScriptMgr } from './managers/ScriptMgr';
import { AppContext, getAppUrl } from './common';
import { jsonrepair } from 'jsonrepair';
import Help from './Help';
import { JSONTree } from 'react-json-tree';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import SbomDataGrid from "./components/SbomDataGrid";
import MostUsedDataGrid from "./components/MostUsedDataGrid";
import LibrariesDataGrid from "./components/LibrariesDataGrid"
import VersionsDataGrid from "./components/VersionsDataGrid"
import JsonDataGrid from "./components/JsonDataGrid";
import { useParams } from 'react-router-dom';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';
import Backdrop from '@mui/material/Backdrop';
interface Props {
    context: AppContext;
    embed?: boolean;
    type?: "user" | "admin";
}

const ScriptEditor: React.FC<Props> = ({ context, embed=false, type="user" }) => {

    const docMgr = ScriptMgr.getInstance();
    const { id } = useParams();
    const scriptId = id || "";

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [currentScript, setCurrentScript] = useState<any>();

    const [script, setScript] = useState<string>("");
    const [scriptName, setScriptName] = useState<string>("");
    const [scriptPublic, setScriptPublic] = useState<boolean>(true);
    const [scriptTag, setScriptTag] = useState<string>("");
    const [scriptDescription, setScriptDescription] = useState<string>("");
    const [scriptCronJob, setScriptCronJob] = useState<string>("");
    const [scriptCronRunAt, setScriptCronRunAt] = useState<string>("");
    const [parameters, setParameters] = useState<string>("");

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showDialog, setShowDialog] = useState<any>(null);
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [updateEnabled, setUpdateEnabled] = useState<boolean>(false);

    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    
    const [json, setJson] = useState<any>(null);
    const [show, setShow] = useState<any>("tree");


    useEffect(() => {
        async function init() {
            if (scriptId) {
                await loadScript(scriptId)
            }
            setInitComplete(true);
        }
        if (!initComplete) {
            init();
        }
    }, [])
    
    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])

    async function loadScript(id: string) {
        const scriptMgr = ScriptMgr.getInstance();
        try {
            const _currentScript = await scriptMgr.getDocument(id);
            console.log("loadScript=", _currentScript);
            if (_currentScript) {
                setCurrentScript(_currentScript);
                window.document.title = _currentScript.name;
            }
        } catch (e: any) {
            console.log("Error: " + e.message);
        }
    }

    /**
     * Save current script or create a new one
     * 
     * @param update save=save existing script as new one, new=create new blank script, update=update existing script
     */
    const saveScript = async(update=false) => {

        setShowDialog({
            title:"Save Script", 
            yesLabel: update ? "Update" : "Save",
            update: update,
            text: (<div>
                <div className="spacer">
                    <b>Name: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                    <TextField
                        defaultValue={scriptName} 
                        onChange={(event) => setScriptName(event.target.value)}
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
                        defaultValue={scriptDescription} 
                        onChange={(event) => setScriptDescription(event.target.value)}
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
                    defaultChecked={scriptPublic} 
                    onChange={(event, value) => {
                        setScriptPublic(value)
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Tag: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                    <TextField
                        defaultValue={scriptTag} 
                        onChange={(event) => setScriptTag(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                {(type == "admin") && <>
                    <div className="spacer">
                        <b>Schedule script to run: </b> 
                    </div>
                    <div style={{paddingLeft: "16px"}}>
                        <Select
                            defaultValue={scriptCronJob}
                            onChange={(event) => setScriptCronJob(event.target.value)}
                            sx={{
                                width: "400px",
                            }}
                        >
                            <MenuItem value={""}>None</MenuItem>
                            <MenuItem value={"0"}>Midnight, 8am, 2pm (every 8 hours)</MenuItem>
                            <MenuItem value={"1"}>2am, 10am, 4pm (every 8 hours)</MenuItem>
                            <MenuItem value={"2"}>4am, Noon, 6pm (every 8 hours)</MenuItem>
                            <MenuItem value={"3"}>6am, 2pm, 8pm (every 8 hours)</MenuItem>
                        </Select>
                    </div>

                    <div className="spacer">
                        <b>Run before or after other scripts: </b> 
                    </div>
                    <div style={{paddingLeft: "16px"}}>
                        <Select
                            defaultValue={scriptCronRunAt}
                            onChange={(event) => setScriptCronRunAt(event.target.value)}
                            sx={{
                                width: "400px",
                            }}
                        >
                            <MenuItem value={""}>None</MenuItem>
                            <MenuItem value={"start"}>Before</MenuItem>
                            <MenuItem value={"end"}>After</MenuItem>
                        </Select>
                    </div>
                </>}

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
                    console.log("SAVE SCRIPT WITH NAME: ", scriptName);

                    if (showDialog.update) {
                        if (!updateEnabled) { 
                            throw new Error("Only the owner can update this script")
                        }
                        console.log("Updating script ", scriptName);
                        const r = await docMgr.saveDocument({
                            id: scriptId,
                            name: scriptName, 
                            script: script, 
                            parameters: parameters,
                            public: scriptPublic,
                            description: scriptDescription, 
                            tag: scriptTag,
                            cronJob: scriptCronJob,
                            cronRunAt: scriptCronRunAt,
                            view: show || "tree",
                        });
                    }
                    else {
                        console.log("Creating script ", scriptName);
                        const r = await docMgr.createDocument({
                            type: type,
                            public: scriptPublic,
                            name: scriptName, 
                            script: script,
                            parameters: parameters,
                            description: scriptDescription,
                            tag: scriptTag,
                            cronJob: scriptCronJob,
                            cronRunAt: scriptCronRunAt,
                        })
                        if (r) {
                            window.open("/serverscript/" + r.id, "_self");
                            return;
                        }
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
     * Delete the script and return to scripts list
     * @returns 
     */
    async function deleteScript() : Promise<void> {
        if (!updateEnabled) { return }
        console.log("deleteScript()");
        console.log("Delete script ", currentScript);
        if (currentScript?.id?.startsWith("_")) {
            console.log("Can't delete default scripts or dividers");
            return;
        }
        if (!scriptName || (currentScript.name != scriptName)) {
            console.log("Current script doesn't match script name or is not set");
            console.log("scriptName=", scriptName);
            console.log("currentScriptName=", currentScript.name);
            return;
        }
        const _name = scriptName;
        setShowDialog({
            title:"Delete Script", 
            text: <div>
                Do you want to delete script:
                <div className='spacer'>"{_name}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        const q = await docMgr.deleteDocument(scriptId);
                        window.open("/serverscript", "_self");
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


    useEffect(() => {
        console.log(`currentScript changed =`, currentScript);
        if (currentScript) {
            setScriptName(currentScript.name);
            setScript(currentScript.script);
            setParameters(currentScript.parameters);
            setScriptDescription(currentScript.description);
            setScriptTag(currentScript.tag);
            setScriptPublic(currentScript.public);
            setScriptCronJob(currentScript.cronJob || "");
            setScriptCronRunAt(currentScript.cronRunAt || "");
            setShow(currentScript.view || "tree");

            let _updateEnabled = false;
            if (context.isAdministrator) {
                _updateEnabled = true;
            }
            else if (currentScript.owner.email == context.user.email) {
                _updateEnabled = true;
            }
            setUpdateEnabled(_updateEnabled);
        }
    }, [currentScript]);

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

            <h1>{(type == "admin" ? "Admin " : "Server ") + "Script Editor for " + scriptName}</h1>
            <div className="editorDiv">

                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div>
                        <div>
                            Create and run server-side Javascript scripts.  This allows you to build complex queries that run completely on the server, with only the result returned to the browser.
                            Server scripts also have the advantage that they can be called using the script API without the need for a browser.
                        </div>
                        {(type == "admin") && <div className="spacer">
                            Admin scripts and Server scripts tabs are the same.  The only difference is that the script names are saved in a separate namespace that only admins and editors can see.  
                        </div>}
                    </div>

                    <div style={{display:"flex", paddingLeft:"40px", gap:"20px", paddingRight:"40px"}}>
                        <Button startIcon={<HelpOutlineOutlinedIcon/>} onClick={(event) => {setShowHelp(true)}}>Script Help</Button>
                    </div>
                </div>

                <div className="detailDiv">
                <div style={{display:"flex", gap:"20px", width:"100%"}}>

                    <div className="leftDiv">

                        {scriptDescription && <div className="spacer">
                            <b>Description: </b>
                            {scriptDescription}
                        </div>}

                        {scriptTag && <div className="spacer">
                            <b>Tag: </b>
                            {scriptTag}
                        </div>}

                        <div className="spacer">
                            <b>Script: </b>
                            Enter JavaScript code that returns a result.
                        </div>

                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <CodeMirror 
                                value={script} 
                                minHeight="400px"
                                style={{border:"1px solid gray", borderRadius:"4px"}}
                                extensions={[javascript({ jsx: true })]} 
                                onChange={setScript} />
                        </div>

                        <div className="spacer">
                            <b>Parameters: </b>
                            Enter JSON object for parameters to be passed in to script.
                        </div>

                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <CodeMirror 
                                value={parameters} 
                                minHeight="200px"
                                maxHeight="800px"
                                style={{border:"1px solid gray", borderRadius:"4px"}}
                                extensions={[javascript({ jsx: true })]} 
                                onChange={setParameters} />
                        </div>

                        <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                            <div>
                                <Button 
                                    startIcon={<ReplayOutlinedIcon/>}
                                    onClick={async () => { 
                                        setShowSpinner("Running script...")
                                        try {
                                            setJson(null);
                                            let params = {};
                                            const p = parameters ? jsonrepair(parameters) : "";
                                            params = p ? JSON.parse(p) : {};
                                            const r = await docMgr.runScript({script: script, parameters: params}, type);
                                            setJson(r);
                                            setShowSpinner("")
                                        } catch (e) {
                                            setShowSpinner("")
                                            throw(e);
                                        }
                                    }}
                                >Run script</Button>
                                <Button style={{marginLeft:"20px"}} startIcon={<StopCircleOutlinedIcon/>} onClick={async () => { await docMgr.stopScript() }}>Stop</Button>
                            </div>
                            <div>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveScript()}>Save Script</Button>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>saveScript(true)} disabled={!scriptName || !currentScript || (currentScript?.name != scriptName)}>Update Script</Button>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<RemoveCircleOutlineOutlinedIcon/>} onClick={()=>deleteScript()} disabled={!scriptName || !currentScript || (currentScript?.name != scriptName)}>Delete Script</Button>
                            </div>

                        </div>

                        {currentScript && <div className="spacer">
                            <div>Script endpoint:</div>
                            <ul>
                                <li>POST {getAppUrl() + "/api/script/run/" + scriptId}</li>
                                <li>with body = any parameters your script uses.</li></ul>
                        </div>}
                    </div>

                    <Drawer anchor='right'
                        hideBackdrop={false}
                        variant="persistent"
                        open={showHelp} onClose={() => setShowHelp(false)}
                    >
                        <div style={{width:"35vw", paddingTop:"10px", border:"2px solid gray"}}>
                            <div style={{marginLeft: "10px"}}>
                            <a className="hideScriptHelp" onClick={(event) => {setShowHelp(false)}}>Hide Script Help</a>
                            <Help context={context} topic={type + "ServerScript"} />
                            </div>
                        </div>
                    </Drawer>

                    </div>

                    <div className="detailDiv spacer">
                        <div style={{ display: "flex", gap: "20px", alignItems:"center", paddingBottom:"8px"  }}>
                            <div>Results:</div>
                            <div style={{ display: "flex", gap: "20px", alignItems:"center"}}>
                                <Select
                                    value={show}
                                    onChange={e => setShow(e.target.value)}
                                >
                                    <MenuItem value={"raw"}>Raw View</MenuItem>
                                    <MenuItem value={"tree"}>Json Tree View</MenuItem>
                                    <MenuItem value={"json"}>Json Table</MenuItem>
                                    <MenuItem value={"sbom"}>Sbom Table</MenuItem>
                                    <MenuItem value={"mostused"}>Top-Level Dependencies Table</MenuItem>
                                    <MenuItem value={"libraries"}>Libraries Table</MenuItem>
                                    <MenuItem value={"versions"}>Versions Table</MenuItem>
                                </Select>

                            </div>
                        </div>

                        {json && (show=="sbom") && <SbomDataGrid
                            title="Documents"
                            requests={json}
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
                            setDisplayColumns={async (data) => {
                                console.log("Changing display columns to ", data);
                            }}
                            style={{
                                height: `calc(100vh - {gridTop}px - 20px)`,
                                minHeight: "600px",
                                paddingBottom: "20px"
                            }}
                        />}

                        {json && (show=="mostused") && <MostUsedDataGrid
                            title="Libraries"
                            data={json}
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
                        {json && (show=="libraries") && <LibrariesDataGrid
                            title="Documents"
                            requests={json}
                            isAdmin={context.isAdministrator}
                            style={{
                                height: `calc(100vh - {gridTop}px - 20px)`,
                                minHeight: "600px",
                                paddingBottom: "20px"
                            }}
                        />}
                        {json && (show=="versions") && <VersionsDataGrid
                            title=""
                            data={json}
                            handleViewClicked={async (event) => {}}
                            handleUsedByClicked={async (event) => {}}
                            isAdmin={context.isAdministrator}
                            style={{ height: `calc(100vh - ${document.getElementById("topMostUsedDataGrid")?.offsetTop}px - 250px)`, minHeight: "600px", paddingBottom: "20px" }}
                            basePurl={json[0]?.basePurl}
                        />}
                        {json && (show=="json") && <JsonDataGrid
                            data={json}
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
                        {json && (show=="tree") && <JSONTree 
                            data={json} 
                            theme={theme}
                            invertTheme={true}
                            hideRoot={true}
                            collectionLimit={10}
                            shouldExpandNodeInitially={(keypath, data, level) => {
                                return true
                            }}
                        />}
                        <pre id="testDiv" style={{display: (show=="raw" ? "block": "none")}}>
                            {json ? JSON.stringify(json, null, 4) : "No results"}
                        </pre>
                    </div>
                    <div className="spacer"/>

                </div>

                {(showAlert != null) && <StyledDialog
                    open={true}
                    onClose={function onClose() {
                        return setShowAlert(null);
                    }}
                    title="Delete Document?"
                    >
                    Do you want to delete the document "{showAlert.title}"?
                    </StyledDialog>
                }

                <div className="spacer detailDiv"/>
                <div className="spacer detailDiv"/>
            </div> 
        </div>
        </div>
        </div>
    )
}

export default ScriptEditor;
