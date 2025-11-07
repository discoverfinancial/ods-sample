/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, Autocomplete, TextField } from '@mui/material'

import { SbomDocumentSummary } from './common';
import { AppContext } from './common';
import SbomDataGrid from './components/SbomDataGrid';
import { DocError } from './managers/Managers';
import { SbomMgr } from './managers/SbomMgr';
import { jsonrepair } from 'jsonrepair';
import JsonDataGrid from './components/JsonDataGrid';
import { runScript } from './editors/Query';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DepsDevMgr } from './managers/DepsDevMgr';
import { styled } from '@mui/system';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';

let timeOutId:any;
let key=1;
let prevSelectedQueryId = "";

interface Props {
    context: AppContext;
    queries?: any;
    refreshQueries?: () => void;
    setShowSpinner?: any;
    selectedQueryId: string;
    setSelectedQueryId: any;
    result: any;
    setResult: any;
}

const RunQuery: React.FC<Props> = ({ context, queries, refreshQueries, setShowSpinner, 
        selectedQueryId, setSelectedQueryId,
        result, setResult,
     }) => {
    window.document.title = "Surveyor Query";

    const docMgr = SbomMgr.getInstance();

    // State for settings of grids
    const localStorageGridSettingsName = "documentQueryGridSettings";
    const v = window.localStorage.getItem(localStorageGridSettingsName);
    const [gridSettings, setGridSettings] = useState<any>(v ? JSON.parse(v) : {});

    const localStorageDisplaySettingsName = "documentQueryDisplaySettings";
    const v2 = window.localStorage.getItem(localStorageDisplaySettingsName);
    const [displaySettings, setDisplaySettings] = useState<string>(v2 || "default");

    const [selectedQuery, setSelectedQuery] = useState<any>({id: "", name: ""});

    // Requests listed in table
    const [streaming, setStreaming] = useState<boolean>(false);
    const [queryDocType, setQueryDocType] = useState<"SBOM" | "Guidance" | "DepsDev" | "json" | "string" | "">("json");

    const [showAlert, setShowAlert] = useState<any>(null);

    // Set to "true" to show confirmation dialog on delete
    const confirmOnDelete = false; //true;

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

    useEffect(() => {
        console.log("selectedQueryId changed: ", selectedQueryId)
        if (selectedQueryId) {
            if (prevSelectedQueryId && selectedQueryId != prevSelectedQueryId) {
                console.log(">>  clearing result: selectedQueryId=", selectedQueryId, " prevselectedQueryId=", prevSelectedQueryId);
                setResult([]);
            }
            prevSelectedQueryId = selectedQueryId;
            selectQuery(selectedQueryId);
        }
    }, [selectedQueryId])

    async function handleSetGridSettings(event: any) {
        console.log("handleSetGridSettings changed: ", event);
        window.localStorage.setItem(localStorageGridSettingsName, JSON.stringify(event));
    }

    async function handleSetDisplaySettings(event: any) {
        console.log("handleSetDisplaySettings changed: ", event);
        window.localStorage.setItem(localStorageDisplaySettingsName, JSON.stringify(event));
        setDisplaySettings(event);
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

    async function doDeleteRequest(id: string): Promise<any> {
        console.log(`doDeletePatent(${id})`);
        await docMgr.deleteDocument(id);
        // await searchDocuments();
    }

    /**
     * Select the query and fill in input fields with contents.
     * 
     * @param id Query id or "none"
     */
    async function selectQuery (id: string) {
        console.log(`selectQuery(${id})`)
        if (id == "none") {
            setSelectedQuery({id: "", name: "None"});
        }
        else {
            for (const q of queries) {
                if (q.id == id) {
                    setSelectedQuery({...q});
                    const doc = q.database
                    if (doc) {
                        if (doc == "SBOM") {
                            setQueryDocType("SBOM")
                        }
                        else if (doc == "Guidance") {
                            setQueryDocType("Guidance")
                        }
                        else if (doc == "DepsDev") {
                            setQueryDocType("DepsDev")
                        }
                    }
                }
            }
        }
    }

    /**
     * Perform query using values from selected query
     */
    async function runQuery (event: any) {
        console.log("runQuery()");
        if (selectedQuery) {
            const projection = selectedQuery.projection;
            const limit = selectedQuery.limit;
            const sort = selectedQuery.sort;
            const value = ""+selectedQuery.query;
            const doc = selectedQuery.database;
            let docMgr;

            if (!value.trim().startsWith("{")) {
                setShowSpinner("Running script...")

                try {
                    const {data, docType} = await runScript(context, value, projection, limit, sort, doc);
                    const r = data;
                    if (docType != null) {
                        setQueryDocType(docType as any);
                    }
                    console.log("docType=", docType);
                    if (Array.isArray(r)) {
                        if (docType == "string") {
                            setResult(JSON.stringify(r,null,4));
                        }
                        else {
                            if (r && r.length > 0) {
                                const row:any = r[0];
                                if (docType == null) {
                                    if ((doc == "SBOM") && (!row.hasOwnProperty("metadata"))) {
                                        setQueryDocType("json");
                                    }
                                    else {
                                        setQueryDocType(doc);
                                    }
                                }
                            }
                            setResult(r);
                        }
                    }
                    else if (typeof r == "object") {
                        if (docType == "string") {
                            setResult(JSON.stringify(r,null,4));
                        }
                        else {
                            if (docType == null) {
                                setQueryDocType("json");
                            }
                            const ra = [];
                            for (const key of Object.keys(r)) {
                                const value = r[key];
                                if (typeof value == "string") {
                                    ra.push({property:key, value: value});
                                }
                                else {
                                  ra.push({property:key, ...r[key]});
                                }
                            }
                            setResult(ra);
                        }
                    }
                    else {
                        if (docType == "json") {
                            setResult([{result: r}])
                        }
                        else {
                            if (docType == null) {
                                setQueryDocType("string");
                            }
                            setResult(r);
                        }
                    }
                } catch (e) {
                    console.log("Error running script: ", e);
                    setResult("Error running script: " + e)
                }
                setShowSpinner("")
                return;
            }
    

        try {
            const params:any = {match: {}, options: {}};
            if (value) {
                let v = value.replace(/\n/g,"");
                v = jsonrepair(v);
                v = v.replace(/:[\s]+/g,":");
                v = v.replace(/{[\s]+/g,"{");
                v = v.replace(/[\s]+}/g,"}");
                v = v.replace(/\[[\s]+/g,"[");
                v = v.replace(/[\s]+\]/g,"]");
                v = v.replace(/,[\s]+/g,",");
                v = v.replace(/[\s]+,/g,",");
                const json = JSON.parse(v);
                params.match = JSON.stringify(json);
            }
            try {
                const _projection = projection ? jsonrepair(projection) : "";
                console.log("_projection=", _projection);
                let qProjection = _projection;
                if (qProjection) {
                    params.options.projection = JSON.parse(qProjection);
                }
            } catch (e) {
                throw new DocError({status: 500, statusText:"Query Errror", message:"Invalid JSON in projection"});
            }
            if (limit) {
                params.options.limit = limit;
            }
            try {
                const _sort = sort ? jsonrepair(sort) : "";
                console.log("_sort=", _sort);
                let qSort = _sort;
                if (qSort) {
                    params.options.sort = JSON.parse(qSort);
                }
            } catch (e) {
                throw new DocError({status: 500, statusText:"Query Errror", message:"Invalid JSON in sort"});
            }

            if (doc) {
                if (doc == "SBOM") {
                    docMgr = SbomMgr.getInstance();
                    setQueryDocType("SBOM")
                }
                else if (doc == "DepsDev") {
                    docMgr = DepsDevMgr.getInstance();
                    setQueryDocType("DepsDev")
                }
                console.log("docMgr=", docMgr);
            }
                if (docMgr) {
                console.log("docMgr=", docMgr, "params=", params);
                setShowSpinner("Loading data...")
                setStreaming(true);
                const start = Date.now();
                docMgr.getDocumentsStream(function(data:any[], done: boolean) {
                    if (done) {
                        const end = Date.now();
                        console.log("Time to retrieve all documents =", (end-start)/1000, "sec");
                        if ([...data].length > 0) {
                            const row:any = [...data][0];
                            if ((doc == "SBOM") && (!row.hasOwnProperty("metadata") || !row.hasOwnProperty("id"))) {
                                setQueryDocType("json");
                            }
                        }
                        setResult([...data]);
                        setShowSpinner("")
                        setStreaming(false);
                    }
                    if (data.length > 50) {
                        if (data.length % 1000 == 0) {
                            console.log(">>>>data length =",data.length);
                            const row:any = [...data][0];
                            if ((doc == "SBOM") && (!row.hasOwnProperty("metadata") || !row.hasOwnProperty("id"))) {
                                setQueryDocType("json");
                            }
                            setResult([...data]);
                            setShowSpinner("")
                        }
                    }
                }, { params: params});
        }
    } catch (e) {
            console.log("Error: ", e);
            setShowSpinner("")
            context.showErrorDialog && context.showErrorDialog(e);
        }
        }
    }

    console.log(">>> RunQuery: rendering: result=",result?.length, "selectedQuery=", selectedQuery, "doctype=", queryDocType)

    const GroupHeader = styled('div')(({ theme }) => ({
        position: 'sticky',
        top: '-8px',
        padding: '4px 10px',
        color: "var(--on-secondary-100)",
        backgroundColor: "var(--secondary-100)",
        fontWeight: "bold",
        fontSize: "1em",
    }));
      
    const GroupItems = styled('ul')({
        padding: 0,
        paddingLeft: 20,
    });

    return (
    <>
        <div>
            <div>
                Run saved Queries on the ODS App Database.
            </div>
            <div className="spacer">Queries created under the DATABASE QUERY tab are available to be run and displayed in a data grid below.
                To view the query result as a JSON object, run the query under the DATABASE QUERY tab.
            </div>
            <div className="spacer" style={{display:"flex", alignItems:"center", gap:"20px", paddingBottom:"10px"}}>
                <div><b>Select Query to Run: </b></div>

                <Autocomplete
                    className="attestation-product"
                    disablePortal
                    disableClearable
                    value={selectedQuery}
                    options={queries}
                    getOptionLabel={(option:any) => option.name || "None"}
                    isOptionEqualToValue={(option:any, value:any) => option.id === value.id }
                    groupBy={(option:any) => option.group}
                    renderInput={(params) => <TextField {...params}></TextField>}
                    renderGroup={(params) => (
                        <li key={params.group}>
                            <GroupHeader>{params.group}</GroupHeader>
                            <GroupItems>{params.children}</GroupItems>
                        </li>
                        )}
                    
                    onChange={(event:any, value: any) => {
                        console.log("onChange=", value);
                        setSelectedQueryId(value.id);
                        selectQuery(value);
                    }}
                    sx={{
                        minWidth:"500px",
                        backgroundColor: '#ffffff',
                    }}
                />
                        
                <Button startIcon={<ReplayOutlinedIcon/>} style={{marginLeft:"20px",  alignSelf:"center"}} onClick={runQuery}>Run</Button>
                {result && <span style={{marginLeft:"20px"}}>(Result of search: {result.length} found)</span>}
            </div>
        </div>

        <div className="detailDiv">
            <div className="detailDiv" style={{paddingTop:"0px"}}>
                {selectedQuery?.tag && <span style={{paddingRight:"20px"}}>Tag: {selectedQuery?.tag}</span>}
                Description: {selectedQuery?.description}<br/>
                Database: {selectedQuery?.database} <br/>
                Query: {selectedQuery?.query?.trim().startsWith("{") ? selectedQuery?.query : "Script"}
            </div>
            <ErrorBoundary>
                {(!selectedQuery || queryDocType == "SBOM") && <SbomDataGrid 
                    title="Documents" 
                    requests={result || []} 
                    handleEditRow={handleEditRow} 
                    handleShowSbomVersions={handleShowSbomVersions}
                    handleDeleteRow={handleDeleteRow}
                    handleShowRefs={handleShowRefs}
                    isAdmin={context.isAdministrator} 
                    settings={gridSettings} 
                    setSettings={handleSetGridSettings}
                    displayColumns={displaySettings}
                    setDisplayColumns={handleSetDisplaySettings}
                    style={{ 
                        height: result?.length ? `calc(100vh - {gridTop}px - 20px)` : "600px", 
                        minHeight: "600px", 
                        paddingBottom: "20px" 
                    }}
                />}

                {(queryDocType == "string") && result && <div className="spacer" style={{margin:"20px", border:"1px solid gray", padding:"20px"}}>
                    <div>Query result is a string:</div>
                    <pre className="spacer">
                    {(typeof result == "object") ? JSON.stringify(result,null,4) : result}
                    </pre>
                </div>}

            </ErrorBoundary>
        </div>
    </>
    )
}

export default RunQuery;
