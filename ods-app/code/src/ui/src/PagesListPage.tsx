/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, TextField, CircularProgress, Card, CardContent, Checkbox } from '@mui/material'

import { formatDateTime } from './common';
import { AppContext } from './common';
import StyledDialog from './components/StyledDialog';
import { Backdrop } from '@mui/material';
import Navbar from './navbar';
import TopMenu from './components/TopMenu';
import { ScriptMgr } from './managers/ScriptMgr';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import { Page } from './PagesEditor';
import { v4 as uuidv4 } from "uuid";

let key=1;

interface Props {
    context: AppContext;
}

const PagesListPage: React.FC<Props> = ({ context }) => {
    const type = "page";
    const user = context.user;
    const scriptMgr = ScriptMgr.getInstance();
    window.document.title = "Page";

    // Requests listed in table
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const [scriptPages, setScriptPages] = useState<any>();
    const [content, setContent] = useState<any>();

    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");

    // Variables for save form
    const [savePageName, setSavePageName] = useState<any>();
    const [savePagePublic, setSavePagePublic] = useState<any>();
    const [savePageTag, setSavePageTag] = useState<any>();
    const [savePageDescription, setSavePageDescription] = useState<any>();


    useEffect(() => {
        console.log(`showSpinner="${showSpinner}"`)
    }, [showSpinner]);

    useEffect(() => {
        async function init() {
            await loadScriptPages();
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

    const loadScriptPages = async() => {
        const _scriptPages = await scriptMgr.getDocuments({params: { match: { type: type}, options: {projection: {script:0}, sort:{tag:1, name:1}}}}) as any[];
        console.log("_scriptPages=", _scriptPages);

        const groups:any = {};
        function addToGroup(group: string, script: any) {
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(script);
        }

        for (const _doc of _scriptPages) {
            if (_doc.owner?.email == user.email) {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(" My Pages: " + (_doc.tag), _doc);
                    }
                }
                else {
                    addToGroup(" My Pages", _doc);
                }
            }
            else {
                if (_doc.tag) {
                    if (_doc.tag.startsWith(":")) {
                        addToGroup(_doc.tag.substring(1), _doc);
                    }
                    else {
                        addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Pages: " + _doc.tag) : ("Other: " + (_doc.tag)), _doc);
                    }
                }
                else {
                    addToGroup(_doc.owner?.name ? ( _doc.owner?.name + " Pages") : ("Other Pages"), _doc);
                }
            }
        } 
        setScriptPages(groups);
    }

    const savePage = async (update: string) => {
        setSavePageName("");
        setSavePageDescription("");
        setSavePagePublic(false);
        setSavePageTag("");

        setShowDialog({
            title: "Create New Page",
            yesLabel: "Create",
            update: update,
            text: (<div>
                <div className="spacer">
                    <b>Name: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSavePageName(event.target.value)}
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
                        onChange={(event) => setSavePageDescription(event.target.value)}
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
                            setSavePagePublic(value)
                        }}
                    />
                </div>

                <div className="spacer">
                    <b>Tag: </b>
                </div>
                <div style={{ paddingLeft: "16px" }}>
                    <TextField
                        defaultValue={""}
                        onChange={(event) => setSavePageTag(event.target.value)}
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
                    if (!savePageName) {
                        throw new Error("Page name is required.")
                    }
                    const _newPage: Page = {
                        cells: [
                            {
                                type: "jsx", data: `// Add your JSX code here
return (<div>
<h2>Hello World</h2>
</div>)
`,
                                id: uuidv4(), view: ["editor"], parameters: {}
                            },
                        ]
                    }
                    const script = JSON.stringify(_newPage)
                    const r = await scriptMgr.createDocument({
                        type: type,
                        public: savePagePublic,
                        name: savePageName,
                        script: script,
                        description: savePageDescription,
                        tag: savePageTag,
                    })
                    if (r) {
                        window.open("/pageedit/" + r.id);
                    }
                    setShowDialog(null)
                    await loadScriptPages();
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
        if (scriptPages) {
            console.log("scriptPages changed")
            const r = [];
            for (const group of Object.keys(scriptPages).sort()) {
                r.push(
                    <h3 key={`r_${(key++)}`}>{group}</h3>
                )
                const p = [];
                for (const page of scriptPages[group]) {
                    p.push(
                        <Card key={`r_${(key++)}`} style={{width:"400px", cursor:"pointer"}} onClick={(event) => {
                            console.log("Clicked on card: ", page.id);
                            window.open("/page/" + page.id);
                        }} sx={{".MuiCardContent-root": {
                            height: "100%",
                            padding: "8px",
                        }}}>
                            <CardContent>
                                <div style={{display:"flex", flexDirection:"column", justifyContent: "space-between", height:"100%"}}>
                                    <h4 style={{cursor:"pointer", paddingTop:"0px", marginTop:"0px", marginBottom:"0px"}}>{page.name}</h4>
                                    <div className="spacer" style={{flexGrow:1}}>{page.description}</div>
                                    <div className="spacer" style={{display:"flex", justifyContent:"space-between"}}>
                                        <div>Author: {page.owner.name}</div>
                                        <div>{formatDateTime(page.dateUpdated)}</div>
                                    </div>
                                    <div className="spacer" style={{display: "flex", justifyContent: "space-between", alignItems:"center"}}>
                                        <div></div>
                                        <Button size="small" variant="outlined" onClick={(event) => {
                                            console.log("Edit card: ", page.id);
                                            window.open("/pageedit/" + page.id);
                                            event.stopPropagation();
                                        }}>Edit</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }
                r.push(<div key={`r_${(key++)}`} style={{display: "flex", gap:"20px"}}>{p}</div>)
            }
            setContent(<div className="pages" key={`r_${(key++)}`}>{r}</div>)
        }
    }, [scriptPages])


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
                        <h1>Pages</h1>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                            Users can create and run their own ReactJS pages.  Click on card to view the page, or click on the <b>EDIT</b> button to edit the page.
                        </div>
                        <Button 
                            startIcon={<NoteAddOutlinedIcon/>}
                            variant="outlined"
                            onClick={async () => { savePage("new") }}
                        >Create new page</Button>
                    </div>

                    <div className="spacer"/>

                    <div className="detailDiv">
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

export default PagesListPage;
