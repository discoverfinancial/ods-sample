/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, TextField, CircularProgress, Card, CardContent, Checkbox } from '@mui/material'

import { formatDateTime } from '../common';
import { AppContext } from "../common";
import StyledDialog from '../components/StyledDialog';
import { Backdrop } from '@mui/material';
import Navbar from '../navbar';
import TopMenu from '../components/TopMenu';
import { ScriptMgr } from '../managers/ScriptMgr';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { Notebook } from './NotebookEditor';
import { v4 as uuidv4 } from "uuid";
import { useLocation } from 'react-router-dom';

let key=1;
let importNotebooks: any[] = [];

interface NotebookOptions {
    id: string;
    name: string;
    author: string;
    dateUpdated: number;
    isChecked: boolean;
}

interface Props {
    context: AppContext;
}

const NotebooksListPage: React.FC<Props> = ({ context }) => {
    console.log("path=", useLocation().pathname);
    let { search } = useLocation();
    const query = new URLSearchParams(search);
    let idParam = query.get("id")
    console.log("id=", idParam);

    const type = "notebook";
    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();
    window.document.title = "Notebooks";

    // Requests listed in table
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const [scriptNotebooks, setScriptNotebooks] = useState<any>();
    const [scriptNotebookList, setScriptNotebookList] = useState<any[]>([]);
    const [content, setContent] = useState<any>();

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    // Variables for save form
    const [saveNotebookName, setSaveNotebookName] = useState<any>();
    const [saveNotebookPublic, setSaveNotebookPublic] = useState<any>();
    const [saveNotebookTag, setSaveNotebookTag] = useState<any>();
    const [saveNotebookDescription, setSaveNotebookDescription] = useState<any>();

    let _searchText = window.localStorage.getItem("listNotebooksSearchText") || ""
    const [searchText, setSearchText] = useState<string>( _searchText);
    let _fullTextSearch = window.localStorage.getItem("listNotebooksFullTextSearch") == "true" ? true : false;
    const [fullTextSearch, setFullTextSearch] = useState<boolean>(_fullTextSearch);

    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            if (!idParam) {
               await loadScriptNotebooks();
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


    useEffect(() => {
        setShowSpinner("");
    }, [initComplete])  // eslint-disable-line react-hooks/exhaustive-deps

    const loadScriptNotebooks = async() => {
        const q:any = { type: type };
        if (searchText && searchText.length > 0) {
            q["$or"] = [
                {name: { $regex: searchText, $options: "i" }},
                {description: { $regex: searchText, $options: "i" }},
                {"owner.name": { $regex: searchText, $options: "i" }},
                {tag: { $regex: searchText, $options: "i" }}, 
            ]
            if (fullTextSearch) {
                q["$or"].push({script: { $regex: searchText, $options: "i" }});
            }
        }
        const _scriptNotebooks = await scriptMgr.getDocuments({params: { match: q, options: {projection: {script:0}, sort:{tag:1, name:1}}}}) as any[];
        console.log("_scriptPages=", _scriptNotebooks);
        setScriptNotebookList(_scriptNotebooks);

        const groups:any = {};
        function addToGroup(group: string, script: any) {
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(script);
        }

        for (const _doc of _scriptNotebooks) {
            if (_doc.owner?.email == user.email) {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(" My Notebooks: " + (_doc.tag), _doc);
                    }
                }
                else {
                    addToGroup(" My Notebooks", _doc);
                }
            }
            else {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Notebooks: " + _doc.tag) : ("Other: " + (_doc.tag)), _doc);
                    }
                }
                else {
                    addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Notebooks") : ("Other Notebooks"), _doc);
                }
            }
        } 
        setScriptNotebooks(groups);
    }

    async function handleSearchButton(event: any) {
        console.log("Search pressed: search value =", searchText);
        window.localStorage.setItem("listNotebooksSearchText", searchText);
        window.localStorage.setItem("listNotebooksFullTextSearch", fullTextSearch ? "true" : "false");
        await loadScriptNotebooks();        
    }


    const saveNotebook = async (update: string) => {
        setSaveNotebookName("");
        setSaveNotebookDescription("");
        setSaveNotebookPublic(false);
        setSaveNotebookTag("");

        setShowDialog({
            title: "Create New Notebook",
            yesLabel: "Create",
            update: update,
            text: (<div>
                <div className="spacer">
                    <b>Name: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSaveNotebookName(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Description: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSaveNotebookDescription(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Public: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <Checkbox
                        defaultChecked={false}
                        onChange={(event, value) => {
                            setSaveNotebookPublic(value)
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Tag: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSaveNotebookTag(event.target.value)}
                        fullWidth
                        sx={{
                            width: "400px",
                        }}
                    />
                </div>

            </div>),
        });
    }

    /**
     * Render save dialog
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
                    if (!saveNotebookName) {
                        throw new Error("Notebook name is required.")
                    }
                    const _newNotebook:Notebook = {
                        cells: [
                            {name: "", type:"code", data:`// Add your first code block here
const r = getSboms({params: {match: {"metadata.component.name": {$regex: "^spring-boot$"}}}});
setResult(r);`, id:uuidv4(), view:["sbom"], parameters:{}},
                            {name: "", type:"text", data:"// Add your first text block here", id:uuidv4(), view:["editor","preview"], parameters:{}},
                            {name: "", type:"code", data:"// Add your second code block here\nsetResult('Hello World');", id:uuidv4(), view:["raw"], parameters:{}},
                        ]
                    }
                    // console.log("_newNotebook=", _notebook)
                    const script = JSON.stringify(_newNotebook)
                    // console.log("script=", script);
                    const r = await scriptMgr.createDocument({
                        type: type,
                        public: saveNotebookPublic,
                        name: saveNotebookName,
                        script: script,
                        // parameters: parameters,
                        description: saveNotebookDescription,
                        tag: saveNotebookTag,
                    })


                    if (r) {
                        window.open("/notebook/" + r.id);
                    }
                    setShowDialog(null)
                    await loadScriptNotebooks();
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


    useEffect(() => {
        if (scriptNotebooks) {
            console.log("scriptNotebooks changed")
            const r = [];
            for (const group of Object.keys(scriptNotebooks).sort()) {
                r.push(
                    <h3 key={`r_${(key++)}`}>{group}</h3>
                )
                const p = [];
                for (const notebook of scriptNotebooks[group]) {
                    p.push(
                        <Card key={`r_${(key++)}`} style={{width:"400px", cursor:"pointer"}} onClick={(event) => {
                            console.log("Clicked on card: ", notebook.id);
                            window.open("/notebook/" + notebook.id + "?presentation=true");
                        }} sx={{".MuiCardContent-root": {
                            height: "100%",
                            padding: "8px",
                        }}}>
                            <CardContent>
                                <div style={{display:"flex", flexDirection:"column", justifyContent: "space-between", height:"100%"}}>
                                    <h4 style={{cursor:"pointer", paddingTop:"0px", marginTop:"0px", marginBottom:"0px"}}>{notebook.name}</h4>
                                    <div className="spacer" style={{flexGrow:1}}>{notebook.description}</div>
                                    <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                                        <div>Author: {notebook.owner.name}</div>
                                        <div>{formatDateTime(notebook.dateUpdated)}</div>
                                    </div>
                                    <div className="spacer" style={{display: "flex", justifyContent: "space-between", alignItems:"center"}}>
                                        <div></div>
                                        <Button size="small" variant="outlined" onClick={(event) => {
                                            console.log("Edit card: ", notebook.id);
                                            window.open("/notebook/" + notebook.id);
                                            event.stopPropagation();
                                        }}>Edit</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }
                r.push(<div key={`r_${(key++)}`} style={{display: "flex", gap:"20px", flexWrap: "wrap"}}>{p}</div>)
            }
            setContent(<div className="pages" key={`r_${(key++)}`}>{r}</div>)
        }
    }, [scriptNotebooks])

    let _importData:any = null;

    async function importNotebook() : Promise<void> {
        console.log("importNotebook()");
        setShowDialog({
            title: "Import Notebook",
            text: <div>
                <div>
                Paste notebook data below and click "Import":
                </div>
                <textarea
                    style={{width:"500px", height:"300px"}}
                    onBlur={(event => { _importData = event.target.value })}
                />
                </div>,
            actions: [
                {
                    label: "Import",
                    onClick: async function onClick() {
                        if (!_importData) {
                            console.log("No import data specified");
                            return;
                        }
                        const importData = JSON.parse(_importData)
                        if (!importData.name || !importData.script) {
                            console.log("Invalid import data");
                            return;
                        }
                        const q = await scriptMgr.createDocument({type: type, ...importData});
                        await loadScriptNotebooks();
                        console.log("Imported notebook: ", q);
                        if (q) {
                            window.open("/notebook/" + q.id);
                        }
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
     * Reads the file as text and returns an object with name and content properties
     * 
     * @param file File to read
     * @returns 
     */
    const getNotebookFile = async (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (!evt?.target?.result) {
                    reject("No result from file read");
                    return;
                }
                const { result } = evt.target;
                try {
                    const content = JSON.parse(result as string);
                    if (!content.name || !content.script) {
                        console.log("Invalid import data");
                        return reject(`Invalid notebook file: ${file.name}.  Ensure it is a valid notebook file.`);
                    }
                    resolve({name: file.name, content: content});
                } catch (error) {
                    console.log("Error parsing notebook content:", error);
                    return reject(`Invalid notebook file: ${file.name}.  Ensure it is a valid JSON file.`);
                }
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    /**
     * Reads the selected files and extracts notebook data from them
     * 
     * @param event Event from file input change
     * @returns 
     */
    const handleFileSelect = async (event: any) => {
        if (!event.target.files || event.target.files.length === 0) {
            console.log("No file selected");
            return;
        }
        const files: File[] = Array.from(event.target.files);
        for (const file of files) {
            try {
                const nbFile = await getNotebookFile(file);
                if (nbFile) {
                    importNotebooks.push(nbFile);
                }
            } catch (e:any) {
                await context.setShowDialog({title: "Import Error", text: ""+e});
            }
        }

        const el = document.getElementById("importFileNamesDiv");
        if (el) {
            const r = [];
            if (importNotebooks.length == 0) {
                r.push("<div>No notebooks selected</div>");
            }
            else {
                r.push(`<div>Notebooks selected:</div>`);
                r.push(`<ul/>`)
                for (var i=0; i<importNotebooks.length; i++) {
                    const nb = importNotebooks[i];
                    r.push(`<li>${nb.name}</li>`)
                }
                r.push(`</ul>`)
            }
            console.log("importFileList=", r);
            el.innerHTML = r.join("");
        }
    };

    /**
     * Handles the import button click event from the Import dialog.
     * 
     * @returns 
     */
    async function handleImportButton() {
        if (!importNotebooks || importNotebooks.length == 0) {
            console.log("No import data specified");
            return;
        }
        let firstImported = null;
        for (const notebook of importNotebooks) {
            console.log("Importing notebook: ", notebook.name);
            const q = await scriptMgr.createDocument({type: type, ...notebook.content});
            if (!firstImported) {
                firstImported = q;
            }
        }
        await loadScriptNotebooks();
        if (firstImported) {
            window.open("/notebook/" + firstImported.id);
        }
        importNotebooks = [];
        setShowDialog(null);
    }

    /**
     * Display import dialog to select notebook files to import.
     */
    async function handleImportNotebooks() {
        importNotebooks = [];
        setShowDialog({
            title: "Import Notebooks",
            text: 
                <div style={{width: "500px"}}>
                    <div style={{paddingLeft:"40px", paddingRight:"40px"}}>
                    <Button component="label" variant="outlined" style={{width: "100%"}}>
                        <span style={{whiteSpace: "nowrap"}}>Select Notebook files...</span>
                        <input type="file" multiple accept=".json" hidden onChange={handleFileSelect} value=""/>
                    </Button>
                    </div>
                    <div id="importFileNamesDiv" className="detailDiv spacer">
                        <div>No notebooks selected</div>
                    </div>
                </div>,
            actions: [
                {
                    label: "Import",
                    onClick: async function onClick() {
                        await handleImportButton();
                        return (setShowDialog(null));
                    }
                },
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        importNotebooks = [];
                        return (setShowDialog(null));
                    },
                },
            ]
        })
    }

    /**
     * Display export dialog to select notebooks to export
     */
    async function handleExportNotebooks() : Promise<void> {
        const notebookList = (scriptNotebookList.map((notebook: any) => ({id: notebook.id, name: notebook.name, author: notebook.owner.name, dateUpdated: notebook.dateUpdated, isChecked: false})));
        setShowDialog({
            title:"Select Notebooks to Export",
            text: <div className="notebookTable" style={{maxHeight: "50vh", maxWidth:"75vw", overflow: "auto"}}>
                <table style={{width:"100%"}}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Notebook Name</th>
                            <th>Author</th>
                            <th>Date Updated</th>
                        </tr>
                    </thead>
                <tbody>
                <tr>
                    <td>
                    <input
                        style={{width:"1.5em", height:"1.5em"}}
                        type="checkbox"
                        defaultChecked={false}
                        onChange={(event) => {
                            for (const notebookOption of notebookList) {
                                notebookOption.isChecked = event.target.checked;
                                const el = document.getElementById(notebookOption.id);
                                if (el) {
                                    (el as HTMLInputElement).checked = event.target.checked;
                                }
                            }
                        }}
                    />
                    </td>
                    <td colSpan={3}>Select All</td>
                </tr>

                {notebookList.map((notebookOption: any) => (
                    <tr>
                        <td>
                        <input
                            style={{width:"1.5em", height:"1.5em"}}
                            type="checkbox"
                            id={notebookOption.id}
                            defaultChecked={false}
                            onChange={(event) => {
                                notebookOption.isChecked = event.target.checked;
                            }}
                        />
                        </td>
                        <td>{notebookOption.name}</td>
                        <td>{notebookOption.author}</td>
                        <td>{formatDateTime(notebookOption.dateUpdated)}</td>
                   </tr>
                ))}
                </tbody>
                </table>
            </div>,
            actions: [
                {
                    label: "Export",
                    onClick: async function onClick() {
                        const selectedNotebooks: NotebookOptions[] = notebookList.filter(
                            (notebookOption: any) => notebookOption.isChecked
                        );
                        const selectedIds = selectedNotebooks.map((notebook) => notebook.id);
                        for (const id of selectedIds) {
                            if (id.startsWith("_")) {
                                console.log("Can't export default notebooks or dividers");
                                return;
                            }
                            const notebook = await scriptMgr.getDocument(id);
                            if (notebook) {
                                const exportData = {
                                    public: false,
                                    name: notebook.name,
                                    description: notebook.description,
                                    tag: notebook.tag,
                                    script: notebook.script,
                                };
                                downloadNotebook(exportData);
                            }
                        }
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
     * Downloads a notebook file
     * 
     * @param data Data to download as a notebook file
     */
    function downloadNotebook(data: any) {
        const jsonString = JSON.stringify(data, null, 4);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const filename = data.name + ".json";
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Deletes the notebooks selected by dropdown
     *
     * @returns
     */
    async function handleDeleteNotebooks() : Promise<void> {
        const notebookList = (scriptNotebookList.map((notebook: any) => ({id: notebook.id, name: notebook.name, author: notebook.owner.name, dateUpdated: notebook.dateUpdated, isChecked: false})));
        setShowDialog({
            title:"Select Notebooks to Delete",
            text: <div className="notebookTable" style={{maxHeight: "50vh", maxWidth:"75vw", overflow: "auto"}}>
                <table style={{width:"100%"}}>
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Notebook Name</th>
                            <th>Author</th>
                            <th>Date Updated</th>
                        </tr>
                    </thead>
                <tbody>
                <tr>
                    <td>
                    <input
                        style={{width:"1.5em", height:"1.5em"}}
                        type="checkbox"
                        defaultChecked={false}
                        onChange={(event) => {
                            for (const notebookOption of notebookList) {
                                notebookOption.isChecked = event.target.checked;
                                const el = document.getElementById(notebookOption.id);
                                if (el) {
                                    (el as HTMLInputElement).checked = event.target.checked;
                                }
                            }
                        }}
                    />
                    </td>
                    <td colSpan={3}>Select All</td>
                </tr>

                {notebookList.map((notebookOption: any) => (
                    <tr>
                        <td>
                        <input
                            style={{width:"1.5em", height:"1.5em"}}
                            type="checkbox"
                            id={notebookOption.id}
                            defaultChecked={false}
                            onChange={(event) => {
                                notebookOption.isChecked = event.target.checked;
                            }}
                        />
                        </td>
                        <td>{notebookOption.name}</td>
                        <td>{notebookOption.author}</td>
                        <td>{formatDateTime(notebookOption.dateUpdated)}</td>
                   </tr>
                ))}
                </tbody>
                </table>
            </div>,
            actions: [
                {
                    label: "Delete",
                    onClick: async function onClick() {
                        const selectedNotebooks: NotebookOptions[] = notebookList.filter(
                            (notebookOption: any) => notebookOption.isChecked
                        );
                        const selectedIds = selectedNotebooks.map((notebook) => notebook.id);
                        for (const id of selectedIds) {
                            if (id.startsWith("_")) {
                                console.log("Can't delete default notebooks or dividers");
                                return;
                            }
                            console.log("Deleting notebook: ", id)
                            const q = await scriptMgr.deleteDocument(id);
                        }
                        await loadScriptNotebooks();
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
     * Gives option to import, export, or delete multiple notebooks
     *
     * @returns
     */
    async function manageNotebooks() : Promise<void> {
        setShowDialog({
            title:"Manage Notebooks",
            // queryId: currentNotebook?.id || "",
            text: <div style={{width: "500px"}}>
                Select option to Manage Notebooks:
                {<div className="spacer" style={{display:"flex", flex:1, gap:"20px", alignItems:"center", padding:"40px", flexDirection:"column"}}>
                    <Button style={{width:"100%"}} variant="outlined" onClick={importNotebook}>Import Notebook from Text</Button>
                    <Button style={{width:"100%"}} variant="outlined" onClick={handleImportNotebooks}>Import Notebooks</Button>
                    <Button style={{width:"100%"}} variant="outlined" onClick={handleExportNotebooks}>Export Notebooks</Button>
                    <Button style={{width:"100%"}} variant="outlined" onClick={handleDeleteNotebooks}>Delete Notebooks</Button>
                </div>}
            </div>,
            actions: [
                {
                    label: "Cancel",
                    onClick: async function onClick() {
                        return (setShowDialog(null))
                    },
                },
            ]
        })
    }

    if (idParam) {
        console.log("Redirecting to notebook editor for id=", idParam);
        window.location.href = "/notebook/" + idParam;
        return <></>; // Return empty component while redirecting
    }

    return (
    <>
        {renderAlert()}
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
                        <h1>Notebooks</h1>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", width: "100%", gap: "12px"}}>
                        <div style={{"flex": "1 1 0", minWidth: 0, whiteSpace: "normal", overflowWrap: "break-word"}}>
                        Users can create and run server-side Javascript notebooks.  This allows you to build and document complex queries that run completely on the server, with only the result returned to the browser.
                        </div>
                        <div style={{display:"flex", gap:"10px"}}>
                        <Button
                            startIcon={<NoteAddOutlinedIcon/>}
                            variant="outlined"
                            onClick={async () => { saveNotebook("new") }}
                        >Create new notebook</Button>
                        <Button
                            startIcon={<NoteAddOutlinedIcon/>}
                            variant="outlined"
                            onClick={async () => { manageNotebooks() }}
                        >Manage Notebooks</Button>
                        </div>
                    </div>

                    <div className="spacer"/>

                    <div className="detailDiv">
                        <div style={{display:"flex", gap:"20px", alignItems:"center"}}>
                            <div style={{marginTop:"8px"}}>Search for Notebooks:</div>
                            <TextField
                                id={"sbom_search"}
                                value={searchText}
                                onChange={(event) => { setSearchText(event.target.value)}}
                                onKeyDown={(e) => (
                                    e.keyCode === 13 ? handleSearchButton("") : null
                                )}
                                sx={{
                                    maxWidth: "500px",
                                    minWidth: "400px",
                                    ".MuiInputBase-multiline": {
                                            padding: "0px",
                                    },
                                }}
                            />
                            <div style={{marginRight:"20px"}}>
                                <Checkbox
                                    checked={fullTextSearch}
                                    onChange={(event, value) => {
                                        setFullTextSearch(value);
                                    }}
                                    style={{marginRight:"0px"}}
                                />
                                <span>Full Text Search</span>
                            </div>

                            <div>
                                <Button
                                    onClick={handleSearchButton}
                                >SEARCH</Button>
                            </div>

                        </div>
                        {content}
                    </div>

                </div>

                <div className="spacer detailDiv"/>
                <div className="spacer detailDiv"/>
            </div>
        </div>
    </>
    )
}

export default NotebooksListPage;
