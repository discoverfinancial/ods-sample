/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    CircularProgress,
    Card,
    CardContent,
    Checkbox,
    Select,
    MenuItem
} from '@mui/material'

import { formatDateTime } from './common';
import { AppContext } from "./common";
import StyledDialog from './components/StyledDialog';
import { Backdrop } from '@mui/material';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';
import { ScriptMgr } from './managers/ScriptMgr';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { useLocation } from 'react-router-dom';

let key=1;
let importNotebooks: any[] = [];

interface NotebookOptions {
    id: string;
    name: string;
    author: string;
    dateUpdated: number;
    isChecked: boolean;
}

interface Props {
    context: AppContext;
    type: "user" | "admin";
}

const ScriptsListPage: React.FC<Props> = ({ context, type}) => {
    console.log("path=", useLocation().pathname);
    let { search } = useLocation();
    const query = new URLSearchParams(search);
    let idParam = query.get("id")
    console.log("id=", idParam);

    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();
    window.document.title = "Scripts";

    // Requests listed in table
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const [scripts, setScripts] = useState<any>();
    const [scriptList, setScriptList] = useState<any[]>([]);
    const [content, setContent] = useState<any>();

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    // Variables for save form
    const [saveScriptName, setSaveScriptName] = useState<any>();
    const [saveScriptPublic, setSaveScriptPublic] = useState<any>();
    const [saveScriptTag, setSaveScriptTag] = useState<any>();
    const [saveScriptDescription, setSaveScriptDescription] = useState<any>();
    const [saveScriptCronJob, setScriptCronJob] = useState<any>(null);
    const [saveScriptCronRunAt, setScriptCronRunAt] = useState<any>(null);

    let _searchText = window.localStorage.getItem("listScriptsSearchText") || ""
    const [searchText, setSearchText] = useState<string>( _searchText);

    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            if (!idParam) {
               await loadScripts();
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
        console.log("type changed to ", type);
        loadScripts();
    }, [type]);

    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])  // eslint-disable-line react-hooks/exhaustive-deps

    const loadScripts = async() => {
        const q:any = { type: type };
        if (searchText && searchText.length > 0) {
            q["$or"] = [
                {name: { $regex: searchText, $options: "i" }},
                {description: { $regex: searchText, $options: "i" }},
                {"owner.name": { $regex: searchText, $options: "i" }},
                {tag: { $regex: searchText, $options: "i" }}, 
            ]
        }
        const _scripts = await scriptMgr.getDocuments({params: { match: q, options: {projection: {script:0}, sort:{tag:1, name:1}}}}) as any[];
        console.log("_scriptPages=", _scripts);
        setScriptList(_scripts);

        const groups:any = {};
        function addToGroup(group: string, script: any) {
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(script);
        }

        for (const _doc of _scripts) {
            if (_doc.owner?.email == user.email) {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(" My Scripts: " + (_doc.tag), _doc);
                    }
                }
                else {
                    addToGroup(" My Scripts", _doc);
                }
            }
            else {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Scripts: " + _doc.tag) : ("Other: " + (_doc.tag)), _doc);
                    }
                }
                else {
                    addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Scripts") : ("Other Scripts"), _doc);
                }
            }
        } 
        setScripts(groups);
    }

    async function handleSearchButton(event: any) {
        console.log("Search pressed: search value =", searchText);
        window.localStorage.setItem("listScriptsSearchText", searchText);
        await loadScripts();
    }


    const saveScript = async (update: string) => {
        setSaveScriptName("");
        setSaveScriptDescription("");
        setSaveScriptPublic(false);
        setSaveScriptTag("");
        setScriptCronJob("");
        setScriptCronRunAt("");

        setShowDialog({
            title: "Create New Script",
            yesLabel: "Create",
            update: update,
            text: (<div>
                <div className="spacer">
                    <b>Name: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSaveScriptName(event.target.value)}
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
                        defaultValue={""}
                        onChange={(event) => setSaveScriptDescription(event.target.value)}
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
                        defaultChecked={false}
                        onChange={(event, value) => {
                            setSaveScriptPublic(value)
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Tag: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSaveScriptTag(event.target.value)}
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
                            defaultValue={saveScriptCronJob}
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
                            defaultValue={saveScriptCronRunAt}
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
                    if (!saveScriptName) {
                        throw new Error("Script name is required.")
                    }

                    let scriptCode = 
`// Script must return value as "setResult({value: some_object})"
// If error, call "setResult({error: "error message"})"

const r = getSboms({params: {match: {"metadata.component.name": {$regex: "^spring-boot$"}}}});
setResult({value: r});
`;
                    ;
                    const r = await scriptMgr.createDocument({
                        type: type,
                        public: saveScriptPublic,
                        name: saveScriptName,
                        script: scriptCode,
                        description: saveScriptDescription,
                        tag: saveScriptTag,
                        cronJob: saveScriptCronJob,
                        cronRunAt: saveScriptCronRunAt,
                    })


                    if (r) {
                        window.open((type == "admin" ? "/adminscript/" : "/serverscript/") + r.id);
                    }
                    setShowDialog(null)
                    await loadScripts();
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


    useEffect(() => {
        if (scripts) {
            console.log("scripts changed")
            const r = [];
            for (const group of Object.keys(scripts).sort()) {
                r.push(
                    <h3 key={`r_${(key++)}`}>{group}</h3>
                )
                const p = [];
                for (const script of scripts[group]) {
                    p.push(
                        <Card key={`r_${(key++)}`} style={{width:"400px", cursor:"pointer"}} onClick={(event) => {
                            console.log("Clicked on card: ", script.id);
                            console.log("Opening: " + (type == "admin" ? "/adminscript/" : "/serverscript/") + script.id + "?presentation=true")
                            window.open((type == "admin" ? "/adminscript/" : "/serverscript/") + script.id + "?presentation=true");
                        }} sx={{".MuiCardContent-root": {
                            height: "100%",
                            padding: "8px",
                        }}}>
                            <CardContent>
                                <div style={{display:"flex", flexDirection:"column", justifyContent: "space-between", height:"100%"}}>
                                    <h4 style={{cursor:"pointer", paddingTop:"0px", marginTop:"0px", marginBottom:"0px"}}>{script.name}</h4>
                                    <div className="spacer" style={{flexGrow:1}}>{script.description}</div>
                                    <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                                        <div>Author: {script.owner.name}</div>
                                        <div>{formatDateTime(script.dateUpdated)}</div>
                                    </div>
                                    <div className="spacer" style={{display: "flex", justifyContent: "space-between", alignItems:"center"}}>
                                        <div></div>
                                        <Button size="small" variant="outlined" onClick={(event) => {
                                            console.log("Edit card: ", script.id);
                                            window.open((type == "admin" ? "/adminscript/" : "/serverscript/") + script.id);
                                            event.stopPropagation();
                                        }}>Edit</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }
                r.push(<div key={`r_${(key++)}`} style={{display: "flex", gap:"20px", flexWrap: "wrap"}}>{p}</div>)
            }
            setContent(<div className="pages" key={`r_${(key++)}`}>{r}</div>)
        }
    }, [scripts])

    let _importData:any = null;


    if (idParam) {
        console.log("Redirecting to script editor for id=", idParam);
        window.location.href = (type == "admin" ? "/adminscript/" : "/serverscript/") + idParam;
        return <></>; // Return empty component while redirecting
    }

    return (
    <>
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
                <div className="detailDiv">
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <h1>{type == "admin" ? "Admin" : "Server"} Scripts</h1>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", width: "100%", gap: "12px"}}>
                        <div style={{"flex": "1 1 0", minWidth: 0, whiteSpace: "normal", overflowWrap: "break-word"}}>
                        Users can create and run server-side Scripts.  This allows you to build complex queries that run completely on the server, with only the result returned to the browser.
                        </div>
                        <div style={{display:"flex", gap:"10px"}}>
                        <Button
                            startIcon={<NoteAddOutlinedIcon/>}
                            variant="outlined"
                            onClick={async () => { saveScript("new") }}
                        >Create new script</Button>
                        </div>
                    </div>

                    <div className="spacer"/>

                    <div className="detailDiv">
                        <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                            <div style={{marginTop:"8px"}}>Search for Scripts:</div>
                            <TextField
                                id={"sbom_search"}
                                value={searchText}
                                onChange={(event) => { setSearchText(event.target.value)}}
                                onKeyDown={(e) => (
                                    e.keyCode === 13 ? handleSearchButton("") : null
                                )}
                                sx={{
                                    maxWidth: "500px",
                                    minWidth: "400px",
                                    ".MuiInputBase-multiline": {
                                            padding: "0px",
                                    },
                                }}
                            />

                            <div>
                                <Button
                                    onClick={handleSearchButton}
                                >SEARCH</Button>
                            </div>

                        </div>
                        {content}
                    </div>

                </div>

                <div className="spacer detailDiv"/>
                <div className="spacer detailDiv"/>
            </div>
        </div>
    </>
    )
}

export default ScriptsListPage;
