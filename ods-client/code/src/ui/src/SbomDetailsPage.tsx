/**
 * Copyright (c) 2025 Capital One
*/


import React, { useState, useEffect } from 'react';
import { Backdrop, CircularProgress } from '@mui/material'
import { SbomDocumentInfo } from './common/common';
import { AppContext } from './common/ui';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TopMenu from './components/TopMenu';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';
import { SbomMgr } from './models/SbomMgr';
import { JsonView, allExpanded, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import './react-json-view-lite.css';

interface Props {
    context: AppContext;
}

const SbomDetailsPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Sbom Details";
    const sbomMgr = SbomMgr.getInstance();

    const [document, setDocument] = useState<SbomDocumentInfo>();

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("");

    context.setShowDialog = setShowDialog;
    context.setShowSpinner = setShowSpinner;

    // Url query parms
    let { id } = useParams();
    let { search } = useLocation();
    const query = new URLSearchParams(search);
    const print = query.get("print");

    const documentId = id || "";
    console.log(`SbomDetailsPage: Param id = ${documentId} print = ${print}`);

    useEffect(() => {
        console.log("Init page load")

        const init = async () => {
            const res = await sbomMgr.getDocument(documentId);
            if (res != null) {
                setDocument(res);
                setInitComplete(true);
            }
            else {
                console.log("Document not found");
                setInitComplete(true);
            }
        }
        init();

        function clear() {
            console.log("Clean up page");
            setInitComplete(false);
        }
        return () => {
            clear();
        };
    }, []);

    useEffect(() => {
        if (document) {
        }
    }, [initComplete])

    useEffect(() => {
        console.log(`Document changed`);
        if (document) {
        }
    }, [document])

    const renderAlert = () => {
        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: "Close",
                onClick: async function onClick() {
                    return (setShowDialog(null))
                },
            },
        ];
        if (showDialog.email) {
            actions.push({
                label: "Yes",
                onClick: async function onClick() {
                    if (showDialog.callback) {
                        await showDialog.callback(showDialog.email, true);
                    }
                    return (setShowDialog(null))
                }
            });
        }

        return (<StyledDialog
            open={showDialog != null}
            // closeable={true}
            // actions={actions}
            onClose={function onClose() {
                return (setShowDialog(null));
            }}
            title={showDialog ? showDialog.title : ""}
        >
            {showDialog ? showDialog.text : ""}
        </StyledDialog>
        )
    }

    if (document && initComplete) {

        context.writeGroups = document.curStateWrite || [];
        context.readGroups = document.curStateRead || [];

        console.log("context=", context);

        if (context.isAdministrator) {
            console.log(`   -- admin so can edit document`)
            context.editMode = true;
        }
        if (print) {
            context.editMode = false;
        }
        console.log(`editMode=${context.editMode}`)

        return (
            <>
                <Navbar context={context} />
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                    open={(showSpinner.length > 0)}
                    // onClick={() => setShowSpinner("")}
                >
                    <div className="spinnerDiv">
                        <p>{showSpinner}</p>
                        <CircularProgress color="info" />
                    </div>
                </Backdrop>
                <div className="content1" style={{ marginTop: "0px" }}>
                    <TopMenu user={context.user} isAdmin={context.isAdministrator} />
                    <div className="content">
                        {renderAlert()}
                        <div style={{ paddingTop: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", paddingLeft: "40px" }}>
                            <h4>Sbom document "{document.metadata?.component?.name}"</h4>
                        </div>

                        <div className="content" style={{ paddingRight: "20px", marginRight: "0px" }}>
                            <div style={{fontSize:"1.0em" }}>

                                <JsonView 
                                    data={document} 
                                    shouldExpandNode={allExpanded} 
                                    style={{
                                        ...defaultStyles, 
                                        basicChildStyle: "jsonChildStyle",
                                        container: "jsonContainerStyle",
                                        stringValue: "jsonStringStyle",
                                    }} 
                                    clickToExpandNode={true}
                                />

                                <div className="spacer" />

                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }
    else if (initComplete) {
        return (
            <>
                <Navbar context={context} />
                <div style={{ marginTop: "100px", marginBottom: "100px", textAlign: "center" }}>
                    <h1>Document request not found or you don't have access.</h1>
                </div>
            </>
        )
    }
    else {
        return (
            <>
                <Navbar context={context} />
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                    open={(showSpinner.length > 0)}
                    // onClick={() => setShowSpinner("")}
                >
                    <div className="spinnerDiv">
                        <p>{showSpinner}</p>
                        <CircularProgress color="info" />
                    </div>
                </Backdrop>
            </>
        )
    }
}

export default SbomDetailsPage;

