/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Backdrop, CircularProgress } from '@mui/material'
import { AppContext } from './common';
import TopMenu from './components/TopMenu';
import Navbar from './navbar';
import { LogMgr } from './managers/LogMgr';
import LogsDataGrid, { DataGridSettings } from './components/LogsDataGrid';

interface Props {
    context: AppContext;
}

const EtlLogsPage: React.FC<Props> = ({ context }) => {
    window.document.title = "ETL Logs";
    const etlEnabled = context.info?.etlEnabled == "true"

    const logMgr = LogMgr.getInstance();

    const [documents, setDocuments] = useState<any>();

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [gridSettings, setGridSettings] = useState<DataGridSettings>({ "displayColumns": "default", "filter": {} });

    context.setShowSpinner = setShowSpinner;

    const loadDocuments = async () => {

        let numberOfChunks = 0;
        await logMgr.getDocumentsStream(function (data: any[], done: boolean) {
            if (done) {
                console.log("Number of documents =", data.length);
                setDocuments([...data]);
                setShowSpinner("")
                setInitComplete(true);
            }
            if ((numberOfChunks == 0 && data.length >= 50) ||
                (data.length < 10000 && (data.length % 1000) == 0) ||
                (data.length % 5000 == 0)
            ) {
                console.log(">>>>data length =", data.length);
                setDocuments([...data]);
                numberOfChunks++;
                setShowSpinner("")
                setInitComplete(true);
            }
        },
            { params: { match: { key: "etl-log" } } }
        );

    }

    useEffect(() => {
        console.log("Init page load")

        loadDocuments();

        function clear() {
            console.log("Clean up page");
            setInitComplete(false);
        }
        return () => {
            clear();
        };
    }, []);

    useEffect(() => {
    }, [initComplete])

    useEffect(() => {
        console.log(`Document changed`);
        if (documents) {
        }
    }, [documents])

    async function handleDelete(item: any) {
        console.log("Delete log: ", item);
        await logMgr.deleteDocument(item.id);
        await loadDocuments();
    }

    async function handleDeleteOlder(item: any) {
        console.log("Delete older logs: ", item);
        const date = item.dateCreated;
        const r = await logMgr.deleteMany({key:"etl-log", dateCreated: {$lt: date}});
        console.log("deleteMany=", r);
        await loadDocuments();
    }

    if (!context.isAdministrator && !context.isEditor) {
        return (
            <>
                <Navbar context={context} />
                <div className="content1" style={{ marginTop: "0px" }}>
                    <TopMenu user={context.user} isAdmin={context.isAdministrator} />
                    <div className="content spacer" style={{}}>
                        <div className="detailDiv">
                            <h1>ETL Logs</h1>
                            <h2>Access Denied</h2>
                        </div>
                    </div>
                </div>
            </>
        )
    }


    if (!etlEnabled) {
        return (
            <>
                <Navbar context={context} />
                <div className="content1" style={{ marginTop: "0px" }}>
                    <TopMenu user={context.user} isAdmin={context.isAdministrator} />
                    <div className="content spacer" style={{}}>
                        <div className="detailDiv">
                            <h1>ETL Logs</h1>
                            <h2>ETL not enabled</h2>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Navbar context={context} />
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme: any) => theme.zIndex.drawer + 1 }}
                open={(showSpinner.length > 0)}
                onClick={() => setShowSpinner("")}>
                <div className="spinnerDiv">
                    <p>{showSpinner}</p>
                    <CircularProgress color="info" />
                </div>
            </Backdrop>
            <div className="content1" style={{ marginTop: "0px" }}>

                <TopMenu user={context.user} isAdmin={context.isAdministrator} />

                <div className="content">
                    <div className="detailDiv">
                        <h1>ETL Logs</h1>

                        {documents && <LogsDataGrid
                            logs={documents}
                            handleDelete={handleDelete}
                            handleDeleteOlder={handleDeleteOlder}
                            settings={gridSettings}
                            setSettings={setGridSettings}
                            style={{
                                height: `calc(100vh - {gridTop}px - 20px)`,
                                minHeight: "600px",
                                paddingBottom: "20px"
                            }}
                        />}

                    </div>
                </div>
            </div>
        </>
    );
}

export default EtlLogsPage;
