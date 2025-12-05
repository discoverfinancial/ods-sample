/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material'
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';

import { SbomDocumentSummary } from './common/common';
import { AppContext } from './common/ui';
import SbomDataGrid from './components/SbomDataGrid';
import { useLocation, useNavigate } from 'react-router-dom';
import { Backdrop } from '@mui/material';
import Navbar from './navbar';
import { styled } from '@mui/material'
import { SbomMgr } from './models/SbomMgr';
import TopMenu from './components/TopMenu';

const StyledFormControlLabel = styled(FormControlLabel)({
    ".MuiFormControlLabel-label": {
        fontSize:"1em"
    }
});

interface Props {
    context: AppContext;
}

const SbomListPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Sbom Dashboard";

    const docMgr = SbomMgr.getInstance();

    const navigate = useNavigate();
    let searchParamString = "";
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        searchParamString = query.get("search") || "";
    }

    // State for settings of grids
    const localStorageGridSettingsName = "sbomGridSettings";
    const v = window.localStorage.getItem(localStorageGridSettingsName);
    const [gridSettings, setGridSettings] = useState<any>(v ? JSON.parse(v) : {});

    const localStorageDisplaySettingsName = "sbomDisplaySettings";
    const v2 = window.localStorage.getItem(localStorageDisplaySettingsName);
    const [displaySettings, setDisplaySettings] = useState<string>(v2 || "default");

    // Requests listed in table
    const [documents, setDocuments] = useState<SbomDocumentSummary[]>([]);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [filteredDocuments, setFilteredDocuments] = useState<SbomDocumentSummary[]>();

    let _searchText = searchParamString || window.localStorage.getItem("listSbomPageSearchText") || "*"
    const [searchText, setSearchText] = useState<string>( _searchText);
    const [searchLibraries, setSearchLibraries] = useState<boolean>(window.localStorage.getItem("listSbomPageSearchLibraries") == "true" ? true : false);
    const [searchApplications, setSearchApplications] = useState<boolean>(window.localStorage.getItem("listSbomPageSearchApplications") == "true" ? true : false);
    const [searchFrameworks, setSearchFrameworks] = useState<boolean>(window.localStorage.getItem("listSbomPageSearchFrameworks") == "true" ? true : false);
    const [searchContainers, setSearchContainers] = useState<boolean>(window.localStorage.getItem("listSbomPageSearchContainers") == "true" ? true : false);
    const [searchOperatingsystems, setSearchOperatingsystems] = useState<boolean>(window.localStorage.getItem("listSbomPageSearchOperatingsystems") == "true" ? true : false);
    const [searchAll, setSearchAll] = useState<boolean>(((window.localStorage.getItem("listSbomPageSearchAll") || "true") == "true") ? true : false);

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    async function searchAllChanged(event: any) {
        const v = event.target.checked;
        setSearchAll(v);
        if (v) {
            searchLibrariesChanged({target:{checked:false}})
            searchApplicationsChanged({target:{checked:false}})
            searchFrameworksChanged({target:{checked:false}})
            searchContainersChanged({target:{checked:false}})
            searchOperatingsystemsChanged({target:{checked:false}})
        }
        window.localStorage.setItem("listSbomPageSearchAll", ""+v);
    }
    async function searchLibrariesChanged(event: any) {
        const v = event.target.checked;
        setSearchLibraries(v);
        window.localStorage.setItem("listSbomPageSearchLibraries", ""+v);
        if (v && searchAll) {
            searchAllChanged({target:{checked:false}})
        }
    }
    async function searchApplicationsChanged(event: any) {
        const v = event.target.checked;
        setSearchApplications(v);
        window.localStorage.setItem("listSbomPageSearchApplications", ""+v);
        if (v && searchAll) {
            searchAllChanged({target:{checked:false}})
        }
    }
    async function searchFrameworksChanged(event: any) {
        const v = event.target.checked;
        setSearchFrameworks(v);
        window.localStorage.setItem("listSbomPageSearchFrameworks", ""+v);
        if (v && searchAll) {
            searchAllChanged({target:{checked:false}})
        }
    }
    async function searchContainersChanged(event: any) {
        const v = event.target.checked;
        setSearchContainers(v);
        window.localStorage.setItem("listSbomPageSearchContainers", ""+v);
        if (v && searchAll) {
            searchAllChanged({target:{checked:false}})
        }
    }

    async function searchOperatingsystemsChanged(event: any) {
        const v = event.target.checked;
        setSearchOperatingsystems(v);
        window.localStorage.setItem("listSbomPageSearchOperatingsystems", ""+v);
        if (v && searchAll) {
            searchAllChanged({target:{checked:false}})
        }
    }

    async function searchTextChanged(event: any) {
        const v = event.target.value;
        setSearchText(v);
        window.localStorage.setItem("listSbomPageSearchText", ""+v);
    }
   
    async function searchDocuments() {
        let text = searchText;
        if (text) {
            window.history.replaceState({}, document.title, "/sbom?search=" + text );
        }
        else {
            window.history.replaceState({}, document.title, "/sbom");
        }
        let regExpBegin = "^";
        if (searchText.startsWith("*")) {
            regExpBegin = ".*";
            text = text.substring(1);
        }
        let regExpEnd = "$";
        if (searchText.endsWith("*")) {
            regExpEnd = ".*";
            text = text.substring(0, text.length-1);
        }
        let searchType = [];
        if (searchLibraries) searchType.push("library");
        if (searchApplications) searchType.push("application");
        if (searchFrameworks) searchType.push("framework");
        if (searchContainers) searchType.push("container");
        if (searchOperatingsystems) searchType.push("operating-system");

        let params:any = {};
        if (searchType.length) {
            params = {
                "params": {
                    "match": {
                        "data.type": {
                            "$in": searchType
                        }        
                    }
                },
            };
        }
    
        if (searchText) {
            if (!params.params) {
                params.params = { match : {}};
            }
            params.params.match["data.name"] = { "$regex": regExpBegin + text + regExpEnd, "$options": "i" };
        }

        //@TODO: replace aggregate with match & options
        params = {
            params: {
                match: {
                    aggregate: [
                    ]
                }
            }
        }
        if (searchType.length) {
            params.params.match.aggregate.push(
                {"$match": {
                        "metadata.component.type": {
                            "$in": searchType
                        }   
                    }
                }     
            )
        }

        if (text.length) {
            params.params.match.aggregate.push(
                {"$match": 
                    {
                        "metadata.component.name": { $regex: `${regExpBegin}${text}${regExpEnd}`, $options: "i" }
                    }
                }
            )
        }
        // params.params.match.aggregate.push({
        //     "$replaceRoot": { newRoot: "$doc" } ,
        // });
        // }
    

// {aggregate: [
// {"$match": 
// {"data.name": {"$in":[/.*authentication.*/i]}}
// }
// ]
// }


// {$sort : {dateUpdated : -1}}
// {"$group": {
//     _id: "$data.id",
//     dateUpdated: { $max: "$dateUpdated" },
//     doc: {$first : "$$ROOT" },
// }},
// { "$replaceRoot": { newRoot: "$doc" } }
// ]
// }

    
        console.log(`searchDocuments())`);
        setShowSpinner("Loading data...")
        try {
            const start = Date.now();
            // let _allDocumentList = await docMgr.getDocuments(params);
            // const end = Date.now();
            // console.log("Time to retrieve all documents =", (end-start)/1000, "sec");
            // console.log("Number of documents =", _allDocumentList.length);
            // setDocuments(_allDocumentList);        
            // setShowSpinner("")

            setStreaming(true);
            let numberOfChunks = 0;
            await docMgr.getDocumentsStream(function(data:any[], done: boolean) {
                if (done) {
                    const end = Date.now();
                    console.log("Time to retrieve all documents =", (end-start)/1000, "sec");
                    console.log("Number of documents =", data.length);        
                    setDocuments([...data]);
                    setShowSpinner("")
                    setStreaming(false);
                }
                if ((numberOfChunks == 0 && data.length >= 50) || 
                    (data.length < 10000 && (data.length % 1000) == 0) ||
                    (data.length % 5000 == 0)
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
            }, params);

        } catch (e) {
            if (context.showErrorDialog) { context.showErrorDialog(e) }
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
        // if (documents && initComplete && guidanceDocs.length == 0) {
            init();
        }
    }, [])

    useEffect(() => {
        console.log("initComplete changed to ", initComplete);
    }, [initComplete]);

    // Load requests when button changed
    useEffect(() => {
        console.log("documents or guidanceDocs have changed...  documents=",documents.length);
        if (documents.length) {
            console.log(" ---> creating filtered list")
            setFilteredDocuments(documents);
            // setInitComplete(true);
        }
        else {
            setFilteredDocuments([]);
        }
    }, [documents]) 

    useEffect(() => {
        console.log("filtered documents have changed: len=", filteredDocuments ? filteredDocuments.length : filteredDocuments)
        if (filteredDocuments) {
            // console.log("Filtered document list updated=", filteredDocuments);
            // setShowSpinner("")
        }
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
        window.localStorage.setItem("sbomListPageSearchText", searchText)
        // Search clears grid settings
        setGridSettings({});
        setDisplaySettings("default");
        await searchDocuments();        
    }

    async function handleViewRow(event: any): Promise<any> {
        console.log("edit document: ", event); 
        const i = event;
        window.open("/sbom/" + encodeURIComponent(i), "_blank")?.focus();
    }

    async function handleDeleteRow(event: any): Promise<any> {
        console.log("delete document: ", event); 
        const i = event;
        await docMgr.deleteDocument(i);
        await searchDocuments();
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
            <div className="content spacer" style={{}}>
                <div className="detailDiv">
                    <h1>Sbom List</h1>
                    <div className="detailDiv">
                        <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                            <div style={{lineHeight:"1.5em"}}>
                                Search for Sbom documents:<br/>
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
                                <div>
                                    {/* The valid SBOM types are: https://cyclonedx.org/docs/1.3/json/#metadata_component_type */}
                                    <FormGroup style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                                        <StyledFormControlLabel control={<Checkbox checked={searchAll} onChange={searchAllChanged}/>} label="All" />
                                        <StyledFormControlLabel control={<Checkbox checked={searchLibraries} onChange={searchLibrariesChanged}/>} label="Libraries" />
                                        <StyledFormControlLabel control={<Checkbox checked={searchApplications} onChange={searchApplicationsChanged}/>} label="Applications" />
                                        <StyledFormControlLabel control={<Checkbox checked={searchFrameworks} onChange={searchFrameworksChanged}/>} label="Frameworks" />
                                        <StyledFormControlLabel control={<Checkbox checked={searchContainers} onChange={searchContainersChanged}/>} label="Containers" />
                                        <StyledFormControlLabel control={<Checkbox checked={searchOperatingsystems} onChange={searchOperatingsystemsChanged}/>} label="Operating Systems" />
                                    </FormGroup>
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
                        <SbomDataGrid 
                            title="Documents" 
                            requests={filteredDocuments || []} 
                            handleEditRow={handleViewRow} 
                            handleDeleteRow={handleDeleteRow} 
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

export default SbomListPage;
