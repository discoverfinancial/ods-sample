/**
 * Copyright (c) 2025 Capital One
*/

import React, { useEffect, useState } from 'react';
import { DocError } from '../managers/Managers';
import { SbomMgr } from '../managers/SbomMgr';
import { Select, TextField, MenuItem, Button, Checkbox, Autocomplete, Drawer } from '@mui/material';
import { AppContext } from "../common";
import { jsonrepair } from 'jsonrepair';
import StyledDialog from '../components/StyledDialog';
import { QueryMgr } from '../managers/QueryMgr';
import { getManager, runScript } from './Query';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import Help from '../Help';
import { DepsDevMgr } from '../managers/DepsDevMgr';
import { styled } from '@mui/system';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

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

let key=1;
let prevSelectedQueryId = "";

const DatabaseQuery: React.FC<Props> = ({ context, queries, refreshQueries, setShowSpinner, 
        selectedQueryId, setSelectedQueryId,
        result, setResult,
     }) => {
    var docMgr:any = SbomMgr.getInstance();

    const [selectedQuery, setSelectedQuery] = useState<any>({id: "", name: ""});
    const [updateEnabled, setUpdateEnabled] = useState<boolean>(false);
    const [script, setScript] = useState<any>();
    const [projection, setProjection] = useState<string>("");
    const [doc, setDoc] = useState<string>("SBOM");
    const [maxLength, setMaxLength] = useState<number>(100);
    const [limit, setLimit] = useState<string>("");
    const [sort, setSort] = useState<string>("");
    const [tag, setTag] = useState<string>("");

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showHelp, setShowHelp] = useState<boolean>(false);

    useEffect(() => {
        console.log("doc=",doc);
        if (doc) {
            if (doc == "SBOM") {
                docMgr = SbomMgr.getInstance();
            }
            else if (doc == "DepsDev") {
                docMgr = DepsDevMgr.getInstance();
            }
            console.log("docMgr=", docMgr);
        }
    }, [doc])

    const [name, setName] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [query, setQuery] = useState<string>("")
    const [db, setDb] = useState<string>("")
    const [qprojection, setqProjection] = useState<string>("")
    const [qpublic, setqPublic] = useState<boolean>(false);
    const [qtag, setqTag] = useState<string>("");

    /**
     * Create or update a query starting with current values. 
     * Allow user to change values before saving query to database.
     * 
     * @param update t=update query, f=create new query
     */
    async function saveQuery(update=false) : Promise<void> {
        console.log(`saveQuery(${update})`);
        if (update) {
            if ((!selectedQuery) || !selectedQuery?.id || selectedQuery?.id?.startsWith("_")) {
                console.log("Update query requires selected query");
                return;
            }
        }
        const _name = (selectedQuery?.name || "");
        setName(_name);
        const _description = (selectedQuery?.description || "");
        setDescription(_description);
        setqProjection(projection);
        const _public = (selectedQuery?.public || false);
        const _tag = (selectedQuery?.tag || "");
        setqPublic(_public);
        setqTag(_tag);
        setDb(doc);
        setQuery(script);
        setShowDialog({
            title:"Save Query", 
            yesLabel: update ? "Update" : "Save",
            update: update,
            queryId: selectedQuery?.id || "",
            text: (<div style={{width:"600px", maxWidth:"unset !important"}}>

                <div className="spacer">
                    <b>Query Name: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={_name} 
                    onChange={(event) => setName(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Description: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={_description} 
                    onChange={(event) => setDescription(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>
                <div className="spacer">
                    <b>Database: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={doc} 
                    onChange={(event) => setDb(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Public: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <Checkbox
                    defaultChecked={_public} 
                    onChange={(event, value) => {
                        setqPublic(value)
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Tag: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={_tag} 
                    onChange={(event) => setqTag(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Query: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={script} 
                    onChange={(event) => setQuery(event.target.value)}
                    multiline
                    fullWidth
                    rows={6}
                    sx={{
                        "& .MuiInputBase-root-MuiOutlinedInput-root": {
                        margin: "0px",
                        padding: "0px",
                        }
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Projection: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={projection} 
                    onChange={(event) => setqProjection(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Sort: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={sort} 
                    onChange={(event) => setSort(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

                <div className="spacer">
                    <b>Limit: </b> 
                </div>
                <div style={{paddingLeft: "16px"}}>
                <TextField
                    defaultValue={limit} 
                    onChange={(event) => setLimit(event.target.value)}
                    fullWidth
                    sx={{
                    }}
                />
                </div>

            </div>),
        })
    }

    /**
     * Delete current query.
     * 
     */
    async function deleteQuery() : Promise<void> {
        console.log("deleteQuery()");
        console.log("Delete query ", selectedQuery);
        if (selectedQuery?.id?.startsWith("_")) {
            console.log("Can't delete default queries or dividers");
            return;
        }
        const _name = (selectedQuery?.name || "");
        setShowDialog({
            title:"Delete Query", 
            queryId: selectedQuery?.id || "",
            text: <div>
                Do you want to delete query:
                <div className='spacer'>"{_name}"?</div>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        const mgr = QueryMgr.getInstance();
                        setSelectedQuery(undefined)
                        const q = await mgr.deleteDocument(selectedQuery.id);
                        if (refreshQueries) { await refreshQueries();}
                        return (setShowDialog(null))
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
            
        })
    }

    /**
     * Render the query save or update dialog
     * 
     * @returns 
     */
    const renderAlert = () => {

        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: showDialog.yesLabel,
                onClick: async function onClick() {
                    let _limit = parseInt(limit);
                    if (isNaN(_limit)) {
                        _limit = 0;
                    }
                    try {
                        const mgr = QueryMgr.getInstance();
                        if (showDialog.update) {
                            const q = await mgr.saveDocument({
                                id: showDialog.queryId,
                                public: qpublic,
                                tag: qtag,
                                database: db,
                                query: query,
                                name: name,
                                description: description,
                                projection: qprojection,
                                limit: _limit,
                                sort: sort,
                            })
                            if (refreshQueries) { await refreshQueries();}
                            console.log("Updated query =", q);
                            if (q) {setTimeout(function() {setSelectedQueryId(q.id)}, 100)};
                        }
                        else {
                            const q = await mgr.createDocument({
                                public: qpublic,
                                tag: qtag,
                                database: db,
                                query: query,
                                name: name,
                                description: description,
                                projection: qprojection,
                                limit: _limit,
                                sort: sort,
                            })
                            if (refreshQueries) { await refreshQueries();}
                            console.log("Created query =", q);
                            if (q) {setTimeout(function() {setSelectedQueryId(q.id)}, 100)};
                        }
                        return (setShowDialog(null))
                    } catch (err: any) {
                        // setup error labels where the key is the object property
                        //  and the value is the UI label text associated with the
                        //  field linked to the object property
                        err.labels = {
                            database: "Database",
                            query: "Query",
                            name: "Query Name",
                            description: "Description",
                            projection: "Projection",
                            limit: "Limit",
                            sort: "Sort",
                        }
                        throw err;
                    }
                }
            },
            {
                label: "Cancel",
                onClick: async function onClick() {
                    return (setShowDialog(null))
                },
            },
        ];

        return (<StyledDialog
            open={showDialog != null}
            actions={showDialog.actions || actions}
            onClose={function onClose() {
                return (setShowDialog(null));
            }}
            title={showDialog ? showDialog.title : ""}
            sx={{
            }}
        >
            {showDialog ? showDialog.text : ""}
        </StyledDialog>
        )
    }

    /**
     * Select the query and fill in input fields with contents.
     * 
     * @param id Query id or "none"
     */
    async function selectQuery (id: string) {
        let _updateEnabled = false;
        console.log(`selectQuery(${id})`)
        if (id == "none") {
            setSelectedQuery({id: "", name: "None"});
        }
        else {
            for (const q of queries) {
                if (q.id == id) {
                    setSelectedQuery({...q});
                    console.log("query selected=", q);
                    const query = ""+q.query;
                    console.log("query=", query);
                    setScript(query);
                    setDescription(q.description);
                    setDoc(q.database);
                    setProjection(q.projection || "");
                    setLimit(q.limit || "")
                    setSort(q.sort || "")
                    setTag(q.tag || "");

                    if (!id.startsWith("_")) {
                        if (q.owner.email == context.user.email) {
                            _updateEnabled = true;
                        }
                    }
                }
            }
        }
        setUpdateEnabled(_updateEnabled);
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

    /**
     * Perform query using values from user inputs
     */
    async function doQuery() : Promise<void> {
        console.log("doQuery()");
        const _maxLength = maxLength ? maxLength : 1;

        if (!script.trim().startsWith("{")) {
            setShowSpinner("Running script...");
            try {
                const {data, docType} = await runScript(context, script, projection, limit, sort, doc);
                const r = data;
                let key=0;
                if (Array.isArray(r)) {
                    const _results = [<div key={"key"+(key++)}><b>Number of documents: {r.length}</b></div>];
                    let len = Math.min(r.length, _maxLength);
                    if (len < r.length) {
                        _results.push(<div key={"key"+(key++)} className="spacer">Displaying first {_maxLength}</div>);
                    }
                    for (var i=0; i<len; i++) {
                        _results.push(<div key={"key"+(key++)}className="spacer"><b>Document {i+1}:</b></div>);
                        _results.push(<pre key={"key"+(key++)}>{JSON.stringify(r[i],null,4)}</pre>);
                    }
                    setResult(_results);
                }
                else if (typeof r == "object") {
                    const res = [<div key={"keyb"}>&#123;</div>];
                    const rlen = Object.keys(r).length;
                    let len = Math.min(rlen, _maxLength);
                    let count = 0;
                    for (const key of Object.keys(r)) {
                        if (count > len) {
                            res.push(<div key={"keym"} style={{paddingLeft:"40px"}}>...{rlen-count} more</div>);
                            break;
                        }
                        res.push(<div key={"key"+count} style={{paddingLeft:"40px"}}>{key}: {JSON.stringify(r[key],null,4)},</div>);
                        count++;
                    }
                    res.push(<div key={"keye"}>&#125;</div>)
                    setResult(res);
                }
                else {
                    setResult(r);
                }
            } catch (e) {
                console.log("Error running script: ", e);
                setResult("Error running script: " + e);
            }
            setShowSpinner("");
            return;
        }

        try {
            const params:any = {match: {}, options: {}};
            if (script) {
                let v = script.replace(/\n/g,"");
                v = jsonrepair(v);
                v = v.replace(/:[\s]+/g,":");
                v = v.replace(/{[\s]+/g,"{");
                v = v.replace(/[\s]+}/g,"}");
                v = v.replace(/\[[\s]+/g,"[");
                v = v.replace(/[\s]+\]/g,"]");
                v = v.replace(/,[\s]+/g,",");
                v = v.replace(/[\s]+,/g,",");
                const json = JSON.parse(v);
                params["match"] = JSON.stringify(json);
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
                params.options.limit = parseInt(limit);
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

            setShowSpinner("Loading data...")
            docMgr = getManager(doc);    
            const r = await docMgr.getDocuments({ params: params});
            setShowSpinner("")

            let key=0;
            const _results = [<div key={"key"+(key++)}><b>Number of documents: {r.length}</b></div>];
            let len = Math.min(r.length, _maxLength);
            if (len < r.length) {
                _results.push(<div key={"key"+(key++)} className="spacer">Displaying first {_maxLength}</div>);
            }
            for (var i=0; i<len; i++) {
                _results.push(<div key={"key"+(key++)}className="spacer"><b>Document {i+1}:</b></div>);
                _results.push(<pre key={"key"+(key++)}>{JSON.stringify(r[i],null,4)}</pre>);
            }
            setResult(_results);
        } catch (e:any) {
            setShowSpinner("")
            console.log("Error: ", e);
            let s = e.statusText ? e.statusText : "";
            if (e.message) {
                if (s) {
                    s = s + " - ";
                }
                s = s + e.message;
            }
            if (!s) {
                s = JSON.stringify(e,null,4);
            }
            setResult("Error: " + s);
        }
    }

    const onChange = React.useCallback((val:any, viewUpdate:any) => {
        console.log('val:', val);
        setScript(val);
      }, []);

    // console.log("result=", result);
    console.log(">>> DatabaseQuery: rendering: result=",result?.length, "selectedQuery=", selectedQuery)

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
        marginLeft: 20,
      });

    return (
        <div>
            {renderAlert()}

            <div className="editorDiv">
                <div style={{display:"flex", justifyContent:"space-between"}}>
                    <div>
                        Build and run a Query on the Surveyor Database.  Your query can be saved and used by others on this tab or from the QUERIES tab.
                        Query results run on this tab are shown as JSON objects.  If your query contains JavaScript, it is run on your browser, not on the server.
                    </div>
                    <div style={{display:"flex", paddingLeft:"40px", gap:"20px", paddingRight:"40px"}}>
                        <Button startIcon={<HelpOutlineOutlinedIcon/>} onClick={(event) => {setShowHelp(true)}}>Query Help</Button>
                    </div>
                </div>
                <div style={{display:"flex", gap:"20px", width:"100%"}}>
                    <div className="leftDiv">

                        <div className="spacer" style={{display:"flex", alignItems:"center", gap:"20px"}}>
                            <div><b>Query Name: </b></div>

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
                                    width:"50%",
                                    backgroundColor: '#ffffff',
                                    "& .MuiInputBase-input": {
                                    },
                                }}
                            />

                        </div>

                        <div className="spacer">
                            <b>Select Table:</b>
                            <Select 
                                value={doc}
                                onChange={(event) => setDoc(event.target.value)}
                                style={{marginLeft:"20px", width:"200px"}}
                            >
                                <MenuItem value="SBOM">SBOM</MenuItem>
                                <MenuItem value="Guidance">Guidance</MenuItem>
                                <MenuItem value="DepsDev">DepsDev</MenuItem>
                                <MenuItem value="endoflife">End of Life</MenuItem>
                            </Select>
                        </div>

                        <div className="spacer">
                            {selectedQuery?.tag && <span style={{paddingRight:"40px"}}><b>Tag: </b>{tag}</span>}
                            <b>Description: </b> 
                            {description}
                        </div>
                        
                        <div className="spacer">
                            <b>Query or Script: </b>
                            Enter MongoDB Query or JavaScript code that runs a query on your browser.
                        </div>

                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <CodeMirror 
                                value={script} 
                                height="400px" 
                                style={{border:"1px solid gray", borderRadius:"4px"}}
                                extensions={[javascript({ jsx: true })]} 
                                onChange={onChange} />
                        </div>


                        <div className="spacer">
                            <b>Enter MongoDB Projection: </b> 
                            Empty to return summary, {`{}`} to return all fields, {`{id:1}`} to just return ids, {`{metadata.component:1}`} to return component details under metadata.
                        </div>
                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <TextField
                                value={projection} 
                                onChange={(event) => setProjection(event.target.value)}
                                fullWidth
                                sx={{
                                }}
                            />
                        </div>
                        <div className="spacer">
                            <b>Enter MongoDB Sort: </b> 
                            Empty for no sort, {`{dateUpdated:-1}`} to sort by sort desending by date updated.
                        </div>
                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <TextField
                                value={sort} 
                                onChange={(event) => setSort(event.target.value)}
                                fullWidth
                                sx={{
                                }}
                            />
                        </div>

                        <div className="spacer">
                            <b>Limit: </b>
                            Enter limit of documents to retrieve:
                        </div>
                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <TextField
                                value={limit} 
                                onChange={(event) => setLimit(event.target.value)}
                                fullWidth
                                sx={{
                                }}
                            />
                        </div>
                        <div className="spacer">
                            <b>Enter maximum number of documents to display: </b> 
                            If this number is too large, it could cause your browser to become unresponsive.
                        </div>
                        <div className="spacer" style={{paddingLeft: "16px"}}>
                            <TextField
                                value={maxLength ? ""+maxLength : ""} 
                                onChange={(event) => {
                                    if (event.target.value == "") {
                                        setMaxLength(0);
                                        return;
                                    }
                                    const v = parseInt(event.target.value);
                                    if (!isNaN(v)) {
                                        setMaxLength(v);
                                    }
                                }}
                                fullWidth
                                sx={{
                                }}
                            />
                        </div>
                        <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                            <Button startIcon={<ReplayOutlinedIcon/>} onClick={doQuery}>Run Query</Button>
                            <div>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<SaveOutlinedIcon/>} onClick={()=>saveQuery()}>Save Query</Button>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<UploadFileOutlinedIcon/>} onClick={()=>saveQuery(true)} disabled={!updateEnabled}>Update Query</Button>
                                <Button style={{marginLeft:"20px"}} variant="outlined" startIcon={<RemoveCircleOutlineOutlinedIcon/>} onClick={()=>deleteQuery()} disabled={!updateEnabled}>Delete Query</Button>
                            </div>
                        </div>
                    </div>

                    <Drawer anchor='right'
                        hideBackdrop={false}
                        variant="persistent"
                        open={showHelp} onClose={() => setShowHelp(false)}
                    >
                        <div style={{width:"35vw", paddingTop:"10px", border:"2px solid gray"}}>
                            <div style={{marginLeft: "10px"}}>
                            <a onClick={(event) => {setShowHelp(false)}}>Hide Query Help</a>
                            <Help context={context} topic={"databaseQuery"} />
                            </div>
                        </div>
                    </Drawer>



                </div>
                <div className="spacer"><b>Results:</b></div>
                <div className="commentDiv" style={{marginLeft:"10px", marginRight:"10px", marginTop:"24px"}}>
                    <pre style={{display:"block", overflow:"auto", whiteSpace:"pre-wrap", wordBreak:"break-all"}}>
                        {result || "No results"}
                    </pre>
                </div>

                <div className="spacer"/>
            </div>
        </div>
    )

}

export default DatabaseQuery;
