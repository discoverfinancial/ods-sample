/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material'
import { AppContext } from './common';
import { EtlMgr } from './managers/EtlMgr';
import { SurveyorMgr } from './managers/SurveyorMgr';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';

let timer:any = null;

interface Props {
    context: AppContext;
    embed?: boolean;
}

const EtlPage: React.FC<Props> = ({ context, embed=false }) => {
    window.document.title = "ETL Manager";
    const etlEnabled = context.info?.etlEnabled == "true"

    const etlMgr = EtlMgr.getInstance();
    const surveyorMgr = SurveyorMgr.getInstance();

    // Status of server (pending operations)
    const [status, setStatus] = useState<any>("");
    const [statusCommand, setStatusCommand] = useState<any>("");
    const [statusComment, setStatusComment] = useState<any>("");

    // Load request on startup
    useEffect(() => {
        console.log("useEffect[]")
        if (etlEnabled) {
            getStatus();
        }
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
        try {
        const r = await etlMgr.getStatus();
        console.log("Status: server=", r);
        if (r.status !== status) {
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
        if (r.status == "" || r.status == "Idle" || (r.comment?.toLowerCase().indexOf("done") > -1) ) {
            stopInterval();
        }
    } catch (e) {
        console.log(e);
        stopInterval();
    }
    }

    useEffect(() => {
        renderStatus();
    }, [status, statusComment, statusCommand])

    const [statusContent, setStatusContent] = useState<any>();
    function renderStatus() {
        console.log("renderStatus(): status=", status)
        if (status) {
            setStatusContent (
                <div>
                    <div><b>Command:</b> {statusCommand}</div>
                    <div><b>Status:</b> {status}</div>
                    <div><b>Operation:</b> {statusComment}</div>
                </div>
            )
        }
        else {
            setStatusContent (<>Status: Idle</>)
        }
    }

    return (
        <>
        <Navbar context={context} />
        
        <div className="content1" style={{ marginTop: "0px" }}>
            <TopMenu user={context.user} isAdmin={context.isAdministrator} />
            <div className="content">
                <div className="detailDiv">
                <h1>ETL Manager</h1>
                    <div style={{ padding: "0px" }}>
                        You can view or manage the ETL process.<br />
                    </div>

                <div className="detailDiv">

                    {(etlEnabled && (
                        context.isAdministrator
                        ))
                        && <div>
                            <h2>Operations</h2>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("refreshCachedCdxgen")).itemStatus);
                                        startInterval()
                                    }}
                                >Update Cached Cdxgen</Button>
                                Create or update Cdxgen collection and save in ODS DB.
                            </div>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("updateCdxgenSboms")).itemStatus);
                                        startInterval()
                                    }}
                                >Update Cdxgen SBOMs</Button>
                                Create or update Cdxgen SBOMS.
                            </div>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("refreshCachedDepsdev")).itemStatus);
                                        startInterval()
                                    }}
                                >Update Cached DepsDev</Button>
                                Create or update DepsDev collection for all open-source libraries in Surveyor DB.
                            </div>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("updateGuidance")).itemStatus);
                                        startInterval()
                                    }}
                                >Update Guidance</Button>
                            </div>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("refreshCachedEndoflife")).itemStatus);
                                        startInterval()
                                    }}
                                >Update Cached Endoflife</Button>

                                <Button
                                    onClick={async () => {
                                        setStatusComment("");
                                        setStatus((await etlMgr.process("deleteEndoflife")).itemStatus);
                                        startInterval()
                                    }}
                                >Delete Endoflife</Button>
                                Create or update Endoflife collection and save in Surveyor DB.
                            </div>

                            <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                <Button onClick={async () => {
                                    setStatusComment("");
                                    setStatus((await etlMgr.process("stop")).itemStatus)
                                }}>Stop</Button>
                                Stop any running operation.
                            </div>

                            <hr style={{marginTop: "20px"}}/>

                            <div style={{display: "flex", gap: "20px"}}>
                                <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                    <Button onClick={async () => {
                                        startInterval()
                                    }}>Start Status</Button>
                                    Start monitoring status.
                                </div>
                                <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                    <Button onClick={async () => {
                                        stopInterval()
                                    }}>Stop Status</Button>
                                    Stop monitoring status.
                                </div>
                            </div>

                            <hr style={{marginTop: "20px"}}/>

                            <div style={{display: "flex", gap: "20px"}}>

                                <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                    <Button
                                        onClick={async () => {
                                            const r = await etlMgr.process("testCdxgen");
                                            const el = document.getElementById("testDiv");
                                            if (el) {
                                                el.innerHTML = JSON.stringify(r, null, 4);
                                            }
                                        }}
                                    >Test Cdxgen</Button>
                                </div>
                                <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                    <Button
                                        onClick={async () => {
                                            const r = await etlMgr.process("testDepsdev");
                                            const el = document.getElementById("testDiv");
                                            if (el) {
                                                el.innerHTML = JSON.stringify(r, null, 4);
                                            }
                                        }}
                                    >Test Deps.dev</Button>
                                </div>

                                <div className="spacer" style={{display: "flex", gap: "20px", alignItems: "center"}}>
                                    <Button
                                        onClick={async () => {
                                            const r = await etlMgr.process("testScript");
                                            const el = document.getElementById("testDiv");
                                            if (el) {
                                                el.innerHTML = JSON.stringify(r, null, 4);
                                            }
                                        }}
                                    >Test sandboxed script</Button>
                                </div>
                            </div>

                            <hr style={{marginTop: "20px"}}/>

                            <div className="spacer" style={{height: "100px"}}>
                                {statusContent}
                            </div>
                            <div className="detailDiv">
                            <pre id="testDiv">

                            </pre>
                            </div>
                            <div className="spacer"/>

                        </div>}

                    {(!etlEnabled && (
                        context.isAdministrator
                    )) && <div>
                        <h2>ETL not enabled</h2>
                    </div>}

                    {!context.isAdministrator
                        && <div>
                            <h2>Access Denied</h2>
                        </div>}
                </div>

                    <div className="spacer detailDiv"/>
                    <div className="spacer detailDiv"/>
                </div>
            </div>
        </div>
        </>
    )
}

export default EtlPage;
