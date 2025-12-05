/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import {Button, CircularProgress, Checkbox, FormControlLabel, TextField} from '@mui/material'
import { Backdrop } from '@mui/material'
import { AppContext } from './common';
import { DocMgr } from './managers/DocMgr';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';

interface Props {
    context: AppContext;
}

let initComplete = false;
let timer:any = null;

const ImportPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Surveyor Import";

    const docMgr = DocMgr.getInstance();

    const [surveyorUrl, setSurveyorUrl] = useState<string>(window.localStorage.getItem("import-surveyorUrl") || "");
    const [user, setUser] = useState<string>(window.localStorage.getItem("import-user") || "");
    const [pass, setPass] = useState<string>("");
    const [deleteCollection, setDeleteCollection] = useState<boolean>(false);
    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
    const [showSpinner, setShowSpinner] = useState<string>("");
    const [error, setError] = useState<string>("");

    const [status, setStatus] = useState<any>("");
    const [statusContent, setStatusContent] = useState<any>();
    const [statusCommand, setStatusCommand] = useState<any>("");
    const [statusComment, setStatusComment] = useState<any>("");

    useEffect(() => {
        window.localStorage.setItem("import-user", user)
    }, [user])

    useEffect(() => {
        console.log("Init page load")
        const init = async () => {
            console.log(" -- init page done")
            await refreshCollections();
            initComplete = true;
        }
        init();

        function clear() {
            console.log("Clean up page");
            initComplete = false;
        }
        return () => {
            clear();
        };
    }, []);

    function startInterval() {
        if (!timer) {
            console.log("startInterval()")
            const t = setInterval(async () => {
                await getStatus();
            }, 1000);
            timer = t;
        }
    }

    function stopInterval() {
        if (timer) {
            console.log("stopInterval()")
            clearInterval(timer);
            timer = null;
        }
    }


    async function getStatus() {
        const r = await docMgr.getStatus();
        if (r.status?.startsWith("Done")) {
            setStatus(r.status);
        }
        else if (r.status != status) {
            setStatus(r.status);
            if (!r.status) {
                setStatusComment(r.comment || "No status")
            }
        }
        if (r.comment != statusComment) {
            setStatusComment(r.comment);
        }
        if (r.command != statusCommand) {
            setStatusCommand(r.command);
        }

    }

    useEffect(() => {
        renderStatus();
    }, [status, statusComment, statusCommand])

    function renderStatus() {
        if (status) {
            setStatusContent (
                <div>
                    <div><b>Collections:</b> {statusCommand}</div>
                    <div><b>Status:</b> {status}</div>
                    <div><b>Comment:</b> {statusComment}</div>
                </div>
            )
            if (status.startsWith("Done")) {
                stopInterval();
            }
        }
        else {
            setStatusContent (<>Status: Idle</>)
            stopInterval();
        }
    }

    async function refreshCollections() {
        try {
            let _surveyorUrl = surveyorUrl;
            if (surveyorUrl.endsWith("/")) {
                _surveyorUrl = surveyorUrl.substring(0, surveyorUrl.length-1);
            }
            window.localStorage.setItem("import-surveyorUrl", _surveyorUrl)
            const _col = await docMgr.getRemoteCollectionNames(_surveyorUrl, user, pass);
            // because the surveyorUrl is user input and possibly malformed,
            //  check to make sure that the content came back as we expect it
            if(!_col || !Array.isArray(_col)){
                throw new Error("Unexpected results received from: "+_surveyorUrl);
            }
            if (_col.length === 0) {
                throw new Error("0 Collections");
            }
            setError("");
            setCollections(_col);
        } catch (e) {
            setError((e as any).message ? (e as any).message : "");
            setCollections([]);
        }
    }

    async function handleCollectionSelected(event:any): Promise<void> {
        console.log("handleCollectionSelected: ", event.target);
        if(event.target.checked){
            setSelectedCollections([...selectedCollections, event.target.value]);
        }else{
            setSelectedCollections(selectedCollections.filter((name) => name !== event.target.value));
        }
    }

    async function handleDeleteCollection(event:any): Promise<void> {
        console.log("handleDeleteCollection: ", event.target);
        setDeleteCollection(event.target.checked)
    }

    async function handleSelectAll(event:any): Promise<void> {
        setSelectedCollections(collections)
    }

    async function handleUnselectAll(event:any): Promise<void> {
        setSelectedCollections([])
    }

    async function handleImport(event:any): Promise<void> {
        console.log("handleImport: ", event);
        startInterval();
        const names = selectedCollections.toString();
        console.log(names);
        await docMgr.importDataFromTarget(names, surveyorUrl, user, pass, deleteCollection);
    }

    return (
        <>
        <Navbar context={context} />
        <div className="content1" style={{ marginTop: "0px" }}>
        <TopMenu user={context.user} isAdmin={context.isAdministrator} />
        <div className="content">

            <div className="detailDiv">
                <h2>Select Source to Import From</h2>
                <div>
                Surveyor URL:
                <TextField 
                    value={surveyorUrl}
                    fullWidth={true}
                    onChange={(event) => { setSurveyorUrl(event.target.value)} }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            refreshCollections();
                        }
                    }}
                    onBlur={(event) => {
                        refreshCollections();
                    }}
                />
                <div style={{display:"flex", alignItems:"center", gap:"20px", paddingTop:"20px", paddingBottom:"20px"}}>
                <div>User ID:</div>
                <TextField 
                    value={user}
                    style={{
                        width: "300px"
                    }}
                    onChange={(event) => { setUser(event.target.value)} }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            refreshCollections();
                        }
                    }}
                    onBlur={(event) => {
                        refreshCollections();
                    }}
                />
                <div>Pass word:</div>
                <TextField 
                    type="password"
                    value={pass}
                    style={{
                        width: "300px"
                    }}
                    onChange={(event) => { setPass(event.target.value)} }
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            refreshCollections();
                        }
                    }}
                    onBlur={(event) => {
                        refreshCollections();
                    }}
                />
                </div>
                </div>
                {!error && <div className="detailDiv">
                <div>
                    <h3>Select Collections to Import 
                        <Button variant='outlined' style={{marginLeft:"40px"}} onClick={handleSelectAll}>Select All</Button>
                        <Button variant='outlined' style={{marginLeft:"40px"}} onClick={handleUnselectAll}>Unselect All</Button>
                    </h3>
                    {collections?.map(name => (
                        <FormControlLabel key={name}
                        control={
                            <Checkbox value={name} checked={selectedCollections.includes(name)} onChange={handleCollectionSelected}
                            />
                        }
                        label={name}
                        />
                    ))}
                </div>
                <br />

                <FormControlLabel key="deleteCollection"
                        control={
                            <Checkbox value={deleteCollection} checked={deleteCollection} onChange={handleDeleteCollection}
                            />
                        }
                        label="Delete collections before importing"
                        />

                <br />
                <Button onClick={handleImport}>Import Data</Button>
                <div className="spacer" style={{height:"100px"}}>
                  {statusContent}
                </div>
                </div>}
                {error && <div className="detailDiv" style={{color: "var(--danger)", fontWeight:"bold"}}>{error}</div>}
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={(showSpinner.length > 0)}
                onClick={() => setShowSpinner("")}>
                <div className="spinnerDiv">
                    <p>{showSpinner}</p>
                    <CircularProgress color="inherit" />
                </div>
            </Backdrop>

        </div>
        </div>
        </>
    )
}

export default ImportPage;
