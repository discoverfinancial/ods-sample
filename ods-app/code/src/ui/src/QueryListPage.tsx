/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material'

import { useLocation } from 'react-router-dom';
import { Tabs, Tab, Backdrop } from '@mui/material';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';
import DatabaseQuery from './editors/DatabaseQuery';
import RunQuery from './RunQuery';
import { AppContext } from './common';
import { QueryMgr } from './managers/QueryMgr';
import TopMenu from './components/TopMenu';

let key=1;

const TAB_QUERY = "query";
const TAB_QUERIES = "queries";

interface Props {
    context: AppContext;
}

const QueryListPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Queries";

    const user = context.user;

    let idParam:any = null;
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        idParam = query.get("id")
    }

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>(window.localStorage.getItem("selectedQueryTab") || TAB_QUERY);
    const [queries, setQueries] = useState<any>([]);

    const [selectedQueryId, setSelectedQueryId] = useState<string>("");

    const [databaseQueryResult, setDatabaseQueryResult] = useState<any>();
    const [runQueryResult, setRunQueryResult] = useState<any>();

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            await getQueries();
            if (idParam) {
                setSelectedQueryId(idParam);
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

    async function getQueries() {
        console.log("getQueries()");
        // setShowSpinner("Loading data...");
        try {
            const queryMgr = QueryMgr.getInstance();
            // Get query documents
            const _docs:any = await queryMgr.getDocuments({params: {match:{}, options: {sort:{tag:1, name:1}}}});
            console.log("queries=", _docs);

            // Add example queries
            const _default = [
            {
                id: "_example1",
                public: false,
                database: "SBOM", 
                query: `{"metadata.component.name": {"$in":[/.*axios.*/i]}}`,
                name: "Example: Query SBOM for '*axios*'",
                description: "Example query the SBOM table for products whose name includes 'axios'",
                group: "Example Queries",
            },
            {
                id: "_example2",
                public: false,
                database: "Guidance",
                query: `{"item.name": {"$regex": ".*axios.*", "$options": "i"}}`,
                name: "Example: Query Guidance for '*axios*'",
                description: "Example query the Guidance table for products whose name includes 'axios'",
                group: "Example Queries",
            },

            ]

            const otherQueries = [];
            for (const _doc of _docs) {
                if (_doc.owner?.email == user.email) {
                    if (_doc.tag) {
                        if (_doc.tag.startsWith(":")) {
                            _doc.group = _doc.tag.substring(1);
                        }
                        else {
                            _doc.group = "My Query: " + (_doc.tag)
                        }
                    }
                    else {
                        _doc.group = "My Queries"
                    }
                    otherQueries.push(_doc);
                }
                else {
                    if (_doc.tag) {
                        _doc.group = _doc.owner?.name ? ( _doc.owner?.name + " Queries: " + _doc.tag) : ("Other: " + (_doc.tag));
                    }
                    else {
                        _doc.group = _doc.owner?.name ? ( _doc.owner?.name + " Queries") : ("Other Queries");
                    }
                    otherQueries.push(_doc);
                }
            }

            setQueries([ ..._default, ...otherQueries.sort( (a:any, b:any) => {
                if (a.group < b.group) return -1;
                if (a.group > b.group) return 1;
                return 0;
            })]);
        } catch (e) {
            context.showErrorDialog && context.showErrorDialog(e);
        }
    }

    useEffect(() => {
        console.log("IDs changed: selectedQueryId: ", selectedQueryId, "selectedScriptId: ")
        let params = "";
        if (selectedQueryId && (selectedQueryId != "none")) {
            params = "?id=" + selectedQueryId;
        }
        window.history.replaceState({}, document.title, "/query" + params );
    }, [selectedQueryId])

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    }

    // Save selected tab 
    useEffect(() => {
        console.log(">>> selectedTab changed")
        if (selectedTab && initComplete) {
            console.log("Selected tab changed =", selectedTab);
            window.localStorage.setItem("selectedQueryTab", selectedTab);
                    setShowSpinner("");
        }
    }, [selectedTab,
        initComplete,
    ])  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
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
                        <h1>Queries</h1>
                    </div>

                    <div className="detailDiv">
                    <Tabs
                            onChange={tabChanged}
                            value={selectedTab}
                            className="white"
                        >
                            <Tab value={TAB_QUERIES} label="QUERIES" />
                            <Tab value={TAB_QUERY} label="DATABASE QUERY" />
                        </Tabs>

                        <div id="topSbomDataGrid"></div>
                        <div id="topMostUsedDataGrid"></div>

                    </div>
                    <div className="spacer"/>

                    {selectedTab == TAB_QUERY && <div className="detailDiv">
                        <DatabaseQuery context={context} 
                            queries={queries} 
                            refreshQueries={getQueries} 
                            setShowSpinner={setShowSpinner} 
                            selectedQueryId={selectedQueryId} 
                            setSelectedQueryId={setSelectedQueryId}
                            result={databaseQueryResult}
                            setResult={setDatabaseQueryResult}
                        />
                    </div>}
                    {selectedTab == TAB_QUERIES && <div className="detailDiv">
                        <RunQuery context={context} 
                            queries={queries} 
                            refreshQueries={getQueries} 
                            setShowSpinner={setShowSpinner} 
                            selectedQueryId={selectedQueryId} 
                            setSelectedQueryId={setSelectedQueryId}
                            result={runQueryResult}
                            setResult={setRunQueryResult}
                        />
                    </div>}
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
        </>
    )
}

export default QueryListPage;
