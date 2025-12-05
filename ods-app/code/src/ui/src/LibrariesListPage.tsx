/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material'

import { SbomDocumentSummary } from './common';
import { AppContext } from './common';
import LibrariesDataGrid from './components/LibrariesDataGrid';
import { useLocation, useNavigate } from 'react-router-dom';
import { Backdrop } from '@mui/material';
import Navbar from './navbar';
import { DocMgr } from './managers/DocMgr';
import TopMenu from './components/TopMenu';

interface Props {
    context: AppContext;
}

const LibrariesListPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Libraries Dashboard";

    const docMgr = DocMgr.getInstance();

    const navigate = useNavigate();
    let searchParamString = "";
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        searchParamString = query.get("search") || "";
    }

    // State for settings of grids
    const localStorageGridSettingsName = "librariesGridSettings";
    const v = window.localStorage.getItem(localStorageGridSettingsName);
    const [gridSettings, setGridSettings] = useState<any>(v ? JSON.parse(v) : {});

    const localStorageDisplaySettingsName = "librariesDisplaySettings";
    const v2 = window.localStorage.getItem(localStorageDisplaySettingsName);
    const [displaySettings, setDisplaySettings] = useState<string>(v2 || "default");

    // Requests listed in table
    const [documents, setDocuments] = useState<SbomDocumentSummary[]>([]);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [filteredDocuments, setFilteredDocuments] = useState<SbomDocumentSummary[]>();

    let _searchText = searchParamString || window.localStorage.getItem("listLibrariesPageSearchText") || "auth*"
    const [searchText, setSearchText] = useState<string>( _searchText);

    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    async function searchTextChanged(event: any) {
        const v = event.target.value;
        setSearchText(v);
        window.localStorage.setItem("listLibrariesPageSearchText", ""+v);
    }
   
    async function searchDocuments() {
        let text = searchText;
        if (text) {
            window.history.replaceState({}, document.title, "/libraries?search=" + text );
        }
        else {
            window.history.replaceState({}, document.title, "/libraries");
        }
    
        console.log(`searchDocuments())`);
        setShowSpinner("Loading data...")
        try {
            const start = Date.now();
            setStreaming(true);
            let numberOfChunks = 0;
            docMgr.getSoftwareThatUsesLibrary(function(data:any[], done: boolean) {
                if (done) {
                    const end = Date.now();
                    console.log("Time to retrieve all documents =", (end-start)/1000, "sec");
                    console.log("Number of documents =", data.length);
                    console.log("libraries=", data?.[0]);    
                    setDocuments([...data]);
                    setShowSpinner("")
                    setStreaming(false);
                }
                if ((numberOfChunks == 0 && data.length >= 50) || 
                    (data.length < 10000 && (data.length % 1000) == 0) ||
                    (data.length % 2000 == 0)
                ) {
                    console.log(">>>>data length =",data.length);
                    if (numberOfChunks == 0) {
                        setDocuments([...data]);
                    }
                    else {
                        setFilteredDocuments([...data]);
                    }
                    numberOfChunks++;
                    setShowSpinner("")
                }
            }, {name: searchText});

        } catch (e) {
            context.showErrorDialog && context.showErrorDialog(e);
            setShowSpinner("")
        }
    }

    useEffect(() => {
        console.log("showSpinner = ", showSpinner)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            searchDocuments();
            setInitComplete(true);
        }
        if (!initComplete) {
            init();
        }
    }, [])

    useEffect(() => {
        console.log("initComplete changed to ", initComplete);
    }, [initComplete]);


    // Load requests when button changed
    useEffect(() => {
        console.log("documents have changed...  documents=",documents.length);
        if (documents.length) {
            console.log(" ---> creating filtered list")
            setFilteredDocuments(documents);
        }
        else {
            setFilteredDocuments([]);
        }
    }, [documents]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        console.log("filtered documents have changed: len=", filteredDocuments ? filteredDocuments.length : filteredDocuments)
    }, [filteredDocuments])

    useEffect(() => {
        if (initComplete) {
            console.log("gridSettings changed: ", gridSettings);
            window.localStorage.setItem(localStorageGridSettingsName, JSON.stringify(gridSettings));
        }
    }, [gridSettings]);

    async function handleSetGridSettings(event: any) {
        console.log("handleSetGridSettings changed: ", event);
        window.localStorage.setItem(localStorageGridSettingsName, JSON.stringify(event));
    }

    async function handleSetDisplaySettings(event: any) {
        console.log("handleSetDisplaySettings changed: ", event);
        window.localStorage.setItem(localStorageDisplaySettingsName, event);
        setDisplaySettings(event);
    }

    async function handleSearchButton(event: any) {
        console.log("Search pressed: search value =", searchText);    
        window.localStorage.setItem("librariesListPageSearchText", searchText)
        // Search clears grid settings
        setGridSettings({});
        setDisplaySettings("default");
        await searchDocuments();        
    }

    async function handleViewRow(event: any): Promise<any> {
        console.log("view document: ", event); 
        let i = event;
        if (typeof i != "string") {
            i = JSON.stringify(event);
        }
        window.open("/details/" + encodeURIComponent(i), "_blank")?.focus();
    }

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
            <div className="content spacer" style={{}}>
                <div className="detailDiv">
                    <h1>Library List</h1>

                    <div className="detailDiv">
                        <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                            <div style={{lineHeight:"1.5em"}}>
                                Search for Library documents:<br/>
                                <i style={{fontSize:"small"}}>(use * for partial match)</i>
                            </div>
                            <div style={{display:"flex", flexDirection:"column"}}>
                                <div>
                                    <TextField
                                        id={"sbom_search"} 
                                        value={searchText} 
                                        onChange={searchTextChanged}
                                        onKeyDown={(e) => (
                                            e.keyCode === 13 ? handleSearchButton("") : null
                                        )}
                                        sx={{
                                            width: "100%",
                                            minWidth: "400px",
                                            ".MuiInputBase-multiline": {
                                                    padding: "0px",
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                            <Button 
                                onClick={handleSearchButton}
                            >SEARCH</Button>
                            </div>
                            {filteredDocuments && !streaming && <span>(Result of search: {filteredDocuments.length} found)</span>}
                            {filteredDocuments && streaming && <span>(Searching... {filteredDocuments.length} found so far)</span>}
                        </div>
                    </div>
                    <div className="spacer"/>

                    <div className="detailDiv">
                        <LibrariesDataGrid 
                            title="Documents" 
                            requests={filteredDocuments || []} 
                            handleViewRow={handleViewRow}
                            isAdmin={context.isAdministrator} 
                            settings={gridSettings} 
                            setSettings={handleSetGridSettings}
                            displayColumns={displaySettings}
                            setDisplayColumns={handleSetDisplaySettings}
                            style={{ 
                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                minHeight: "600px", 
                                paddingBottom: "20px" 
                            }}
                        />
                    </div>
                </div>
        
                <div className="spacer detailDiv"/>
                <div className="spacer detailDiv"/>
            </div> 
        </div>
        </>
    )
}

export default LibrariesListPage;
