/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, TextField } from '@mui/material'
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';

import { SbomDocumentSummary } from './common/';
import SbomDataGrid from './components/SbomDataGrid';
import { useNavigate, useLocation } from 'react-router-dom';
import { SbomMgr } from './managers/SbomMgr';
import { Tabs, Tab, Backdrop } from '@mui/material';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';
import { AppContext, renderSoftwareName } from './common';
import { styled } from '@mui/material'
import TopMenu from './components/TopMenu';
import { EtlMgr } from './managers/EtlMgr';
import { DocMgr } from './managers/DocMgr';

let timeOutId:any;
let timeOutIdVulTab:any;
let key=1;

const TAB_VULNERABILITIES = "vulnerabilities";
const TAB_ALL = "all";

const StyledFormControlLabel = styled(FormControlLabel)({
    ".MuiFormControlLabel-label": {
        fontSize:"1em"
    }
});

interface Props {
    context: AppContext;
}

const DocumentListPage: React.FC<Props> = ({ context }) => {
    window.document.title = "Software List";

    const sbomMgr = SbomMgr.getInstance();
    const docMgr = DocMgr.getInstance();

    let create = false;
    let uses:any = null;
    let onlyVulnerabilities = false;
    let nonCompliance = false;
    let searchParam:any = null;
    let searchParamString = "";
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        create = query.get("create") ? true : false;
        uses = query.get("uses")
        if (uses) { console.log("uses=", uses); }
        if (uses?.startsWith("{") && uses?.endsWith("}")) {
            try {
                uses = JSON.parse(uses);
            } catch (e) {
                console.log("Error parsing uses: ", e);
            }
        }
        onlyVulnerabilities = query.get("onlyVulnerabilities") ? true : false;
        nonCompliance = query.get("nonCompliance") ? true : false;

        searchParam = query.get("search")
        if (searchParam?.startsWith("{") && searchParam?.endsWith("}")) {
            try {
                searchParam = JSON.parse(searchParam);
            } catch (e) {
                console.log("Error parsing searchParam: ", e);
            }
        }
        else {
            searchParamString = searchParam;
            searchParam = null;
        }
        if (searchParam) console.log("searchParam=", searchParam);
    }
    let usesOrSearch = uses || searchParam;

    // State for settings of grids
    const localStorageGridSettingsName = "documentGridSettings" + (uses ? "-uses" : "") + (onlyVulnerabilities ? "-onlyVulnerabilities" : "");
    const v = window.localStorage.getItem(localStorageGridSettingsName);
    const [gridSettings, setGridSettings] = useState<any>(v ? JSON.parse(v) : {});
    
    const localStorageDisplaySettingsName = "documentDisplaySettings" + (uses ? "-uses" : "") + (onlyVulnerabilities ? "-onlyVulnerabilities" : "");
    const v2 = window.localStorage.getItem(localStorageDisplaySettingsName);
    const [displaySettings, setDisplaySettings] = useState<string>(v2 || "default");

    const localStorageVulTabGridSettingsName = "documentVulTabGridSettings" + (uses ? "-uses" : "") + (onlyVulnerabilities ? "-onlyVulnerabilities" : "");
    const v1 = window.localStorage.getItem(localStorageVulTabGridSettingsName);
    const [gridSettingsVulTab, setGridSettingsVulTab] = useState<any>(v1 ? JSON.parse(v1) : { "displayColumns": "default", "filter": {} });

    // Requests listed in table
    const [documents, setDocuments] = useState<SbomDocumentSummary[]>([]);
    const [streaming, setStreaming] = useState<boolean>(false);
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [filteredDocuments, setFilteredDocuments] = useState<SbomDocumentSummary[]>();
    // const [selectedTab, setSelectedTab] = useState<string>(usesOrSearch ? TAB_ALL : (window.localStorage.getItem("selectedTab") || TAB_ALL));
    const [selectedTab, setSelectedTab] = useState<string>(TAB_ALL);

    let _searchText = searchParamString || window.localStorage.getItem("listPageSearchText") || "*"
    if (usesOrSearch || onlyVulnerabilities) {
        _searchText = window.localStorage.getItem("usesListPageSearchText") || "";
    }
    const [searchText, setSearchText] = useState<string>( _searchText);
    const [searchApplications, setSearchApplications] = useState<boolean>(window.localStorage.getItem("listPageSearchApplications") == "true" ? true : false);
    const [searchLibraries, setSearchLibraries] = useState<boolean>(window.localStorage.getItem("listPageSearchLibraries") == "true" ? true : false);
    const [searchAll, setSearchAll] = useState<boolean>(((window.localStorage.getItem("listPageSearchAll") || "true") == "true") ? true : false);

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    // Set to "true" to show confirmation dialog on delete
    const confirmOnDelete = false; //true;

    useEffect(() => {
        if (!searchApplications && !searchLibraries) {
            searchAllChanged({target:{checked:true}})
        }
        else {
            searchAllChanged({target:{checked:false}})
        }
    }, [searchApplications, searchLibraries]);

    async function searchAllChanged(event: any) {
        const v = event.target.checked;
        setSearchAll(v);
        if (v) {
            searchApplicationsChanged({target:{checked:false}})
            searchLibrariesChanged({target:{checked:false}})
        }
        window.localStorage.setItem("listPageSearchAll", ""+v);
    }

    async function searchApplicationsChanged(event: any) {
        const v = event.target.checked;
        setSearchApplications(v);
        window.localStorage.setItem("listPageSearchApplications", ""+v);
    }
    async function searchLibrariesChanged(event: any) {
        const v = event.target.checked;
        setSearchLibraries(v);
        window.localStorage.setItem("listPageSearchLibraries", ""+v);
    }

    async function searchDocuments() {
        const vulnerabilities = (selectedTab == TAB_VULNERABILITIES);
        let searchType = [];
        if (searchApplications) searchType.push("application");
        if (searchLibraries) searchType.push("library"); //sbom returned lower case

        const data = {
            searchText: searchText,
            searchParam: searchParam,
            searchType: searchType,
            uses: uses,
            vulnerabilities: vulnerabilities,
            usesOrSearch: usesOrSearch,
            onlyVulnerabilities: onlyVulnerabilities,
            nonCompliance: nonCompliance,
        }
        console.log(`searchDocuments())`);
        setShowSpinner("Loading data...")
        try {
            const start = Date.now();
            setStreaming(true);
            let numberOfChunks = 0;
            docMgr.searchSboms(function(data:any[], done: boolean) {
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
                    if (numberOfChunks == 0) {
                        setDocuments([...data]);
                    }
                    else {
                        setDocuments([...data]);
                        setFilteredDocuments([...data]);
                    }
                    numberOfChunks++;
                    setShowSpinner("")
                }
            }, data);
     
        } catch (e) {
            context.showErrorDialog && context.showErrorDialog(e);
            setShowSpinner("")
        }

    }

    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
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
            console.log(" -- doc[0]=", documents[0]);
        }
        else {
            setFilteredDocuments([]);
        }
    }, [documents]) 

    async function getReferencedDocuments(id: any) {
        if (typeof id == "string") {
            window.open(`/list?uses=${encodeURIComponent(id)}`, "_blank");
        }
        else {
            window.open(`/list?uses=${encodeURIComponent(JSON.stringify(id))}`, "_blank");
        }
    }

    async function getReferencedDocumentsWithVulnerabilities(id: any) {
        if (typeof id == "string") {
            window.open(`/list?uses=${encodeURIComponent(id)}&onlyVulnerabilities=true`, "_blank");
        }
        else {
            window.open(`/list?uses=${encodeURIComponent(JSON.stringify(id))}&onlyVulnerabilities=true`, "_blank");
        }
    }

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    }

    // Save selected tab 
    useEffect(() => {
        if (selectedTab && initComplete) {
            console.log("Selected tab changed =", selectedTab);
            window.localStorage.setItem("selectedTab", selectedTab);
            if (!documents || documents.length == 0) {
                searchDocuments();
            }
            else {
                setShowSpinner("")
            }
            switch (selectedTab) {
                case TAB_ALL:
                    setFilteredDocuments(documents);
                    break;
                case TAB_VULNERABILITIES:
                    const r = [];
                    for (const doc of documents) {
                        if (doc._vulnerabilities && doc._vulnerabilities > 0) {
                            r.push(doc);
                        }
                    }
                    setFilteredDocuments(r);
                    break;
            }
        }
    }, [selectedTab,
        initComplete,
        context.info
    ])  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        console.log("filtered documents have changed: len=", filteredDocuments ? filteredDocuments.length : filteredDocuments)
    }, [filteredDocuments])

    useEffect(() => {
        console.log("gridSettings changed: ", gridSettings, " initComplete=", initComplete);
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

    useEffect(() => {
        console.log("gridSettingsVulTab changed: ", gridSettingsVulTab, " initComplete=", initComplete);
        if (initComplete) {
            console.log("gridSettings changed: ", gridSettings);
            window.localStorage.setItem(localStorageGridSettingsName, JSON.stringify(gridSettings));
        }
    }, [gridSettingsVulTab]);

    async function handleSetVulTabGridSettings(event: any) {
        if (documents.length) {
            console.log("handleSetVulTabGridSettings: ", event);
            window.localStorage.setItem(localStorageVulTabGridSettingsName, JSON.stringify(event));
            // Can't set gridSettings here since data grid filter field looses focus
            // Unless we wait until user is done typing in filter field
            // So wait 2 sec after done typing to refresh
            if (event.displayColumns != gridSettingsVulTab.displayColumns) {
                if (timeOutIdVulTab) clearTimeout(timeOutIdVulTab);
                setGridSettingsVulTab(event);
            }
            else {
                if (timeOutIdVulTab) clearTimeout(timeOutIdVulTab);
                timeOutIdVulTab = setTimeout(async () => {
                    timeOutIdVulTab = null;
                    setGridSettingsVulTab(event);
                }, 2000);
            }
        }
    }

    async function handleSearchButton(event: any) {
        console.log("Search pressed: search value =", searchText);
        
        if (usesOrSearch || onlyVulnerabilities) {
            window.localStorage.setItem("usesListPageSearchText", searchText)
        }
        else {
            window.localStorage.setItem("listPageSearchText", searchText)
        }

        // Search clears grid settings
        setGridSettings({ "displayColumns": "default", "filter": {} });
        setGridSettingsVulTab({ "displayColumns": "default", "filter": {} });

        await searchDocuments();        
    }

    /**
     * Edit button for document row was clicked
     * 
     * @param e 
     */
    async function handleEditRow(event: any): Promise<any> {
        console.log("edit document: ", event); 
        const i = event;
        window.open("/details/" + encodeURIComponent(i), "_blank")?.focus();
    }

    async function handleShowSbomVersions(data: any): Promise<any> {
        console.log("show sbom versions: ", data); 
        if (typeof data == "string") {
            window.open("/versions/" + encodeURIComponent(data), "_blank")?.focus();
        }
        else {
            window.open("/versions/" + encodeURIComponent(JSON.stringify(data)), "_blank")?.focus();
        }
    }

    /**
     * Show all docs that use the specified software
     * 
     * @param data If not migrated, value will be {id, show?}
     *             If migrated, value will be {name, version?, group?}
     */
    async function handleShowRefs(data: any): Promise<any> {
        console.log("show refs for document: ", data); 
        if (data.show == "vulnerable") {
            delete data.show;
            getReferencedDocumentsWithVulnerabilities(data);
        }
        else {
            getReferencedDocuments(data);
        }
    }

    async function handleDeleteRow(event: any): Promise<any> {
         console.log("delete document: ", event); 
        const i = event.id;
        if (confirmOnDelete) {
            console.log("Show alert")
            setShowAlert(i);
        }
        else {
            await doDeleteRequest(i);
        }
    }

    async function handleProcess(cmd: string, event: any): Promise<any> {
        console.log("handleProcess document: ", event); 
        const i = event;
        const etlMgr = EtlMgr.getInstance();
        await etlMgr.processPost(cmd, {doRefresh: false, items: [i.id]})
    }

    async function doDeleteRequest(id: string): Promise<any> {
        console.log(`doDeleteRequest(${id})`);
        await sbomMgr.deleteDocument(id);
        await searchDocuments();
    }

    if (create) {
        return (<></>);
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
            <div className="content">
                <div className="detailDiv">
                <h1>Software List</h1>

                    <div className="detailDiv">
                    {uses && <div style={{display:"flex", alignItems:"center"}}>
                        <div>
                        Software that uses
                        {onlyVulnerabilities && <span> vulnerable versions of</span>}
                        {nonCompliance && <span> not-in-guidance versions of</span>}
                        <i><b> {renderSoftwareName(uses)}</b> {uses.purl && <span><br/>purl = {uses.purl}</span>}</i> 
                        </div>
                        <Button variant="outlined" onClick={() => {
                                window.location.href = "/list";
                            }}
                            style={{marginLeft: "20px"}}
                        >Clear</Button>
                        <div className="spacer"/>
                        </div>
                    }
                    {searchParam && <div style={{display:"flex", alignItems:"center"}}>
                        <div>
                        Software versions for
                        <i><b> {renderSoftwareName(searchParam)}</b> {searchParam.purl && <span><br/>purl = {searchParam.purl}</span>}</i> 
                        </div>
                        <Button variant="outlined" onClick={() => {
                                window.location.href = "/list";
                            }}
                            style={{marginLeft: "20px"}}
                        >Clear</Button>
                        <div className="spacer"/>
                        </div>
                    }
                    {/* <Tabs
                            onChange={tabChanged}
                            value={selectedTab}
                            className="white"
                        >
                            <Tab value={TAB_ALL} label="SOFTWARE" />
                            {!uses && !onlyVulnerabilities && <Tab value={TAB_VULNERABILITIES} label="VULNERABILITIES" />}
                        </Tabs> */}

                        <div id="topSbomDataGrid"></div>
                        <div id="topMostUsedDataGrid"></div>

                        <div className="spacer detailDiv">
                            {selectedTab == TAB_VULNERABILITIES && <div style={{paddingBottom:"20px"}}>
                                View Software with vulnerabilities.
                            </div>}
                            <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                                <div style={{lineHeight:"1.5em"}}>
                                    Search for Software:<br/>
                                    <i style={{fontSize:"small"}}>(use * for partial match)</i>
                                </div>
                                <div style={{display:"flex", flexDirection:"column"}}>
                                    <div>
                                        <TextField
                                            id={"sbom_search"} 
                                            value={searchText} 
                                            onChange={(event) => { setSearchText(event.target.value)}}
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
                                    {!usesOrSearch && <div>
                                        {/* The valid SBOM types are: https://cyclonedx.org/docs/1.3/json/#metadata_component_type */}
                                        <FormGroup style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
                                            <StyledFormControlLabel control={<Checkbox checked={searchAll} onChange={searchAllChanged}/>} label="All" />
                                            <StyledFormControlLabel control={<Checkbox checked={searchLibraries} onChange={searchLibrariesChanged}/>} label="Libraries" />
                                            <StyledFormControlLabel control={<Checkbox checked={searchApplications} onChange={searchApplicationsChanged}/>} label="Applications" />
                                        </FormGroup>
                                    </div>}
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
                    </div>
                    <div className="spacer"/>

                    <div className="detailDiv">
                        <SbomDataGrid 
                            title="Documents" 
                            requests={filteredDocuments || []} 
                            handleEditRow={handleEditRow} 
                            handleShowSbomVersions={handleShowSbomVersions}
                            handleDeleteRow={handleDeleteRow}
                            handleShowRefs={handleShowRefs}
                            handleProcess={handleProcess}
                            isAdmin={context.isAdministrator} 
                            settings={selectedTab == TAB_ALL ? gridSettings : gridSettingsVulTab} 
                            setSettings={selectedTab == TAB_ALL ? handleSetGridSettings : handleSetVulTabGridSettings}
                            displayColumns={displaySettings}
                            setDisplayColumns={handleSetDisplaySettings}
                            style={{ 
                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                minHeight: "600px", 
                                paddingBottom: "20px" 
                            }}
                            uses={uses}
                        />
                    </div>

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

export default DocumentListPage;
