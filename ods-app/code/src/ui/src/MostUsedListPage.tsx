/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material'

import { MostUsed } from './common';
import { AppContext } from './common';
import { DocMgr } from './managers/DocMgr';
import { Backdrop } from '@mui/material';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';
import MostUsedDataGrid from './components/MostUsedDataGrid';
import TopMenu from './components/TopMenu';

let key=1;

interface Props {
    context: AppContext;
}

const MostUsedListPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Most Used Software";

    const docMgr = DocMgr.getInstance();

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [mostUsed, setMostUsed] = useState<any>([]);

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            getMostUsedClicked();
            setInitComplete(true);
        }
        if (!initComplete) {
            init();
        }
    }, [])

    useEffect(() => {
        console.log("initComplete changed to ", initComplete);
    }, [initComplete]);

    async function getMostUsedClicked() {
        if (mostUsed && mostUsed.length > 0) {
            setShowSpinner("");
            return;
        }
        setShowSpinner("Loading data...");
        try {
            const start = Date.now();
            // let match:any = {
            //     "metadata.component.type": "library"
            // }
            // console.log("_match=",match);
            const _docs = await docMgr.getMostUsed();
            const end = Date.now();
            console.log("Time to retrieve all documents =", (end-start)/1000, "sec");
            console.log("Number of documents =", _docs?.length);
            // console.log("mostUsed=", _docs);
            setMostUsed(_docs);
        } catch (e) {
            context.showErrorDialog && context.showErrorDialog(e);
        }
        setShowSpinner("");
    }

    async function handleMostUsedClicked(data: MostUsed): Promise<any> {
        console.log(`handleMostUsedClicked(${data})`);
        if (data) {
            console.log("data=",data);
            const args = {name: data.name, group: data.group, basePurl: data.basePurl}
            window.open("/versions/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
        }
    }
    async function handleGuidanceClicked(data: MostUsed): Promise<any> {
        console.log(`handleGuidanceClicked(${data})`);
        if (data) {
            console.log("data=",data);
            const args = {name: data.name, group: data.group, basePurl: data.basePurl}
            window.open("/guidance/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
        }
    }

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
                <div className="detailDiv">
                <h1>Most Used Software</h1>

                    <div className="detailDiv">

                        <div id="topSbomDataGrid"></div>
                        <div id="topMostUsedDataGrid"></div>

                        <div className="spacer detailDiv">

                            <div>
                                View {mostUsed && <span>top {mostUsed.length}</span>} most used Software by an application or component.  This includes all dependencies, not just the top-level dependencies.
                            </div>

                        </div>
                    </div>
                    <div className="spacer"/>

                    <div className="detailDiv">
                        <MostUsedDataGrid 
                            title="Libraries"
                            data={mostUsed}
                            handleRowClicked={handleMostUsedClicked} 
                            handleGuidanceClicked={handleGuidanceClicked}
                            isAdmin={context.isAdministrator}
                            style={{ 
                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                minHeight: "600px", 
                                paddingBottom: "20px" }}
                        />
                    </div>

                </div>
        
                {/* // TODO: Need to fix Dialog to accept closeable & actions */}

                {(showAlert != null) && <StyledDialog
                    open={true}
                    // closeable={true}
                    // actions={[
                    //     {
                    //         label: "Yes",
                    //         onClick: async function onClick() {
                    //             let id = showAlert.id;
                    //             setShowAlert(null);
                    //             await doDeleteRequest(id);
                    //             return;
                    //         },
                    //     },
                    //     {
                    //     label: "No",
                    //     onClick: function onClick() {
                    //         return setShowAlert(null);
                    //     },
                    // },
                    // ]}
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
        </>
    )
}

export default MostUsedListPage;
