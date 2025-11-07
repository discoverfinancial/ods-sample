/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Grid, Modal, Box } from '@mui/material'
import { GuidanceReference } from './common';
import { guidanceStates, Role } from './common';
import { useParams } from 'react-router-dom';
import { DocMgr } from './managers/DocMgr';
import { Tabs, Tab, Backdrop } from '@mui/material';
import Navbar from './navbar';
import VersionsDataGrid from './components/VersionsDataGrid';
import { GuidanceMgr } from './managers/GuidanceMgr';
import GuidanceEditor from './GuidanceEditor';
import { AppContext, compareVersions } from './common';
import { DepsDevMgr } from './managers/DepsDevMgr';
import TopMenu from './components/TopMenu';
const TAB_DETAILS = "details";
const TAB_GUIDANCE = "guidance";

const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "10px"
};


interface Props {
    context: AppContext;
    tab?: string;
}

const VersionsListPage: React.FC<Props> = ({ context, tab }) => {
    window.document.title = "Version Details";

    const docMgr = DocMgr.getInstance();
    const guidanceMgr = GuidanceMgr.getInstance();
    const depsDevMgr = DepsDevMgr.getInstance();

    let { id } = useParams();
    const documentId: GuidanceReference = id ? JSON.parse(id) : { name: "", group: "", basePurl: "" };
    console.log(`VersionsListPage: Param id = ${JSON.stringify(documentId)}`);

    // Requests listed in table
    const [documents, setDocuments] = useState<any>([]);
    const [sortedDocuments, setSortedDocuments] = useState<any>([]);
    const [guidance, setGuidance] = useState<any>();
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<string>(tab || TAB_DETAILS);
    const [componentCount, setComponentCount] = useState<number>(0);
    const [defaultVersion, setDefaultVersion] = useState<string>("");
    const [depsdevVersions, setDepsdevVersions] = useState<any>();
    const [mostPopularVersion, setMostPopularVersion] = useState<string>("");

    const [showSpinner, setShowSpinner] = useState<string>("Loading data...");
    const [showModal, setShowModal] = useState<boolean>(false);

    useEffect(() => {
        console.log("Init page load")

        const init = async () => {
            const _versionDocs = await docMgr.getVersions(documentId.basePurl);

            let _guidance = null;
            try {
                if (documentId.id) {
                    _guidance = await guidanceMgr.getDocument(documentId.id);
                }
                else {
                    _guidance = await guidanceMgr.getDocumentForItem(documentId.basePurl);
                }
            } catch (e: any) {
                if (e.status == 404) {
                    console.log("Guidance not found")
                }
                else {
                    console.log("Error getting guidance: ", e);
                }
            }
            console.log("guidance=", _guidance);
            console.log("versionDocs=", _versionDocs);
            if (_versionDocs != null && _versionDocs.length > 0) {
                setMostPopularVersion(_versionDocs[0].version);
                setDocuments(_versionDocs);
                setSortedDocuments(_versionDocs?.sort((a, b) => (compareVersions(a.version, b.version))));

                let count = 0;
                for (const doc of _versionDocs) {
                    count += doc.count || 1;
                }
                setComponentCount(count)

                // res should hold an array of versions of the
                //  documentId package.  Try to determine which
                //  version is the latest version.
                try {
                    const r = await findDefaultVersion(_versionDocs);
                    const _defaultVersion = r.defaultVersion;
                    const _depsdevVersions = r.versions;
                    setDefaultVersion(_defaultVersion);
                    console.log("_depsdevVersions=", _depsdevVersions);
                    if (_depsdevVersions) {
                        setDepsdevVersions(_depsdevVersions);
                    }
                } catch (e) {
                    console.log("Error getting default version")
                }
                setGuidance(_guidance);
                setInitComplete(true);
            }
            else {
                console.log("Document not found");
                setInitComplete(true);
            }
            setShowSpinner("");
        }
        init();

        function clear() {
            console.log("Clean up page");
            setInitComplete(false);
        }
        return () => {
            clear();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function setError(name: string, text: string) {
    }
    context.setError = setError;

    async function handleUsesVersionsClicked(id: any): Promise<any> {
        console.log(`handleUsesVersionsClicked(${id})`);
        if (id) {
            console.log("id=", id);
            window.open("/list?uses=" + encodeURIComponent(JSON.stringify({ name: id.name, version: id.version, purl: id.purl })), "_blank")?.focus();
        }
    }

    async function handleShowVersions(id: any): Promise<any> {
        console.log(`handleShowVersions(${id})`);
        if (id) {
            console.log("id=", id);
            window.open("/list?search=" + encodeURIComponent(JSON.stringify({ name: id.name, version: id.version, purl: id.purl })), "_blank")?.focus();
        }
    }

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    }

    async function onCreateGuidance(event: any): Promise<any> {
        const _guidance = await guidanceMgr.createDocument({
            item: { name: documentId.name, basePurl: documentId.basePurl },
            tier: "1",
            title: "Guidance for " + documentId.basePurl,
        })
        console.log("guidance=", _guidance);
        if (_guidance) {
            setGuidance(_guidance);
        }
    }

    async function onRetireGuidance(event: any): Promise<any> {
        const _guidance = { ...guidance }
        _guidance.state = "cancelled";
        await guidanceMgr.saveDocument(_guidance, "state");
        console.log("guidance=", _guidance);
        if (_guidance) {
            setGuidance(_guidance);
        }
        window.location.reload();
    }

    async function handleShowGuidanceHistory(): Promise<any> {
        console.log("show guidance history: ", guidance.name);
        window.open("/guidance/history/" + encodeURIComponent(JSON.stringify(documentId)), "_self")?.focus();
    }

    if (guidance && initComplete) {

        const docState = guidanceStates[guidance.state];
        console.log("docState=", docState)
        console.log(`docState.write=${docState?.write}`);
        context.writeGroups = guidance.curStateWrite || [];
        context.readGroups = guidance.curStateRead || [];

        console.log("context=", context);

        if (context.writeGroups.includes(Role.Editor) && context.isEditor) {
            console.log(`  -- editor so can edit document`)
            context.editMode = true;
        }
        else if (context.isAdministrator) {
            console.log(`   -- admin so can edit document`)
            context.editMode = true;
        }
        if (guidance.state != "active" && guidance.state != "created") {
            context.editMode = false;
        }
        console.log(`editMode=${context.editMode}`)
    }

    /**
     * Using deps.dev APIs, figure out which version of the
     * component being displayed in this page is the default version.
     * In deps.dev, the default version of a package is designated as
     * the version of the package that is installed when no specific
     * version is requested.
     *
     * @param versionDocuments Array of version documents for a component
     * @returns object {defaultVersion, versions} defaultVersion identified by deps.dev as being the default version, 
     *                                            versions is a list of the most recent versions including default version
     */
    async function findDefaultVersion(versionDocuments: any[]): Promise<any> {
        if (!versionDocuments.length || versionDocuments.length === 0) return "";
        // versionDocuments should hold an array of versions of the
        //  package.  Assuming all versionDocuments are for the
        //  same component just different versions, grab the first
        //  document of the array, generalize the purl (remove any
        //  version-specific information) and try to determine through
        //  deps.dev which version is the default.
        const firstDoc = versionDocuments[0];
        if (!firstDoc) return "";
        const firstDocPurl = decodeURI(firstDoc.basePurl);
        let defaultVersion = "";
        let foundPackage = false;
        let packageInfo;
        if (firstDocPurl) {
            try {
                packageInfo = await depsDevMgr.getPackageFromBasePurl(firstDocPurl);
                if (packageInfo) {
                    foundPackage = true;
                }
            } catch (e: any) {
                if (e.status == 404) {
                    console.log("Package not found in depsdev")
                }
                else {
                    throw e;
                }
            }
        }

        if (foundPackage) {
            if (packageInfo && packageInfo.package && packageInfo.package.versions && packageInfo.package.versions.length > 0) {
                for (const version of packageInfo.package.versions) {
                    if (version.isDefault) {
                        if (version.versionKey.version) {
                            defaultVersion = version.versionKey.version;
                            break;
                        }
                    }
                }

                if (defaultVersion) {
                    // If defaultVersion has major, then only return major & minor
                    // If defaultVersion has minor, then return minor & sub
                    const defaultVersionParts = defaultVersion.split(".")
                    const index = parseInt(defaultVersionParts[0]) > 0 ? 0 : 1
                    const _versions2: any = {};
                    const _versions3: any = {};
                    for (const version of packageInfo.package.versions) {
                        const parts = version.versionKey.version.split(".")
                        parts[0] = parseInt("0" + parts[0]);
                        parts[1] = parseInt("0" + parts[1]);
                        parts[2] = parseInt("0" + parts[2]);
                        const _version = parts[index] + "." + parts[index + 1];
                        _versions2[(index > 0) ? "0." + _version : _version] = version;
                        _versions3[parts.join(".")] = version;
                    }

                    // _versions2 will hold map of major.minor keys
                    //  with a value being the version object that
                    //  holds the most recent version that starts
                    //  with that major.minor.  For example:
                    //    3.0 {..., version: 3.0.9}
                    //    3.1 {..., version: 3.1.7}
                    // _version3 will hold a map of the full version
                    //  number as the key and the version object that
                    //  holds that version as the value.
                    //    3.0.9 {..., version: 3.0.9}
                    //    3.1.7 {..., version: 3.1.7}
                    const lenVersions2 = Object.keys(_versions2).length;
                    const allVersions = Object.keys((lenVersions2 > 5) ? _versions2 : _versions3).sort(function (v1, v2) {
                        return compareVersions(v1, v2);
                    },)

                    // Return 5 recent versions from default version
                    const versions: any = [];
                    for (var i = 0; i < allVersions.length; i++) {
                        const version = allVersions[i];
                        if (compareVersions(version, defaultVersion) == 0) {
                            for (var j = 0; j < 5; j++) {
                                if (i - j > 0) {
                                    versions.push(allVersions[i - j]);
                                }
                            }
                            break;
                        }
                    }

                    return { defaultVersion, versions }
                }
                console.debug("no default version found");
            }
        }

        return { defaultVersion: "", versions: [] };
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

            <Modal open={showModal} onClose={() => setShowModal(false)}>
                <Box sx={modalStyle}>
                    <div className='modal-content'>
                        <h2>CONFIRM RETIRE</h2>
                        <h4>{guidance?.title || "Guidance for " + documentId.basePurl}</h4>
                        <div className='spacer-bottom-3'>
                            Are you sure you want to retire this guidance? <br /> This cannot be undone.
                        </div>
                        <br />
                        <Grid container spacing={3}>
                            <Grid item xs={8}>
                                <Button sx={{ padding: "12px" }} onClick={onRetireGuidance}>Confirm Retire Guidance</Button>
                            </Grid>
                            <Grid item md={3}>
                                <Button sx={{ padding: "12px" }} variant='text' onClick={() => setShowModal(false)}>Cancel</Button>
                            </Grid>
                        </Grid>
                    </div>
                </Box>
            </Modal>

            <div className="content1" style={{ marginTop: "0px" }}>
                <TopMenu user={context.user} isAdmin={context.isAdministrator} />

                <div className="content detailDiv" style={{}}>
                    <h1>Software Versions & Guidance</h1>
                    <div className="versionsHeader">
                        <h4>{documentId ? documentId.basePurl : ""}</h4>
                        {defaultVersion && <div className="versionMetric versionMetricExternal">Latest version <em>v{defaultVersion}</em></div>}
                    </div>
                    <div className="versionsMetricsContainer">
                        {/* Don't display the header for this section if there's no data to display */}
                        {documents.length || sortedDocuments[0]?.version || sortedDocuments[sortedDocuments?.length - 1]?.version || componentCount ?
                            <h4>Summary</h4>
                            : ""
                        }
                        {/* Don't display version info if not available */}
                        {documents.length ? <div className="versionMetric">Most popular version <em>v{mostPopularVersion}</em></div> : ""}
                        {sortedDocuments[0]?.version ? <div className="versionMetric">Lowest version used <em>v{sortedDocuments[0]?.version}</em></div> : ""}
                        {sortedDocuments[sortedDocuments?.length - 1]?.version ? <div className="versionMetric">Highest version used <em>v{sortedDocuments[sortedDocuments?.length - 1]?.version}</em></div> : ""}
                        {documents.length ? <div className="versionMetric"><em>{documents.length}</em>different versions found</div> : ""}
                        {componentCount ? <div className="versionMetric">Used in <em>{componentCount}</em> products</div> : ""}
                    </div>
                    <div id="topMostUsedDataGrid"></div>

                    <Tabs
                        onChange={tabChanged}
                        value={selectedTab}
                        className="white"
                    >
                        <Tab value={TAB_DETAILS} label="DETAILS" />
                        <Tab value={TAB_GUIDANCE} label="GUIDANCE" />
                    </Tabs>

                    {selectedTab == TAB_GUIDANCE && <div>

                        {(!guidance) && <>
                            <div className="spacer detailDiv">
                                <div style={{ alignContent: "center" }}>No guidance created for {documentId.basePurl}.</div>
                                <br />
                                {(context.isAdministrator || context.isEditor) && <Button
                                    onClick={onCreateGuidance}
                                    disabled={document ? false : true}
                                >Create Guidance</Button>}
                            </div>
                            <div className='spacer'>
                                <hr />
                                <br />
                            </div>
                        </>}

                        {guidance &&
                            <>
                                <GuidanceEditor
                                    context={context}
                                    guidance={guidance}
                                    setGuidance={setGuidance}
                                    documentId={documentId}
                                    defaultVersion={defaultVersion}
                                    versions={depsdevVersions}
                                />
                            </>}

                    </div>}

                    {selectedTab == TAB_DETAILS && <>
                        <div className="spacer" style={{ display: "flex", gap: "20px", margin: "20px" }}>
                            <Button onClick={async () => {
                                if (documentId) {
                                    window.open(`/list?uses=${encodeURIComponent(JSON.stringify({ name: documentId.name }))}`, "_blank");
                                }
                            }}>Show Software that use all versions</Button>
                            <Button onClick={async () => {
                                if (documentId) {
                                    window.open(`/list?uses=${encodeURIComponent(JSON.stringify({ name: documentId.name }))}&nonCompliance=true`, "_blank");
                                }
                            }}
                                variant="outlined"
                            >Show Software that uses out-of-guidance versions</Button>

                        </div>
                        <div className="detailDiv spacer">
                            {documents && <>
                                <VersionsDataGrid
                                    title=""
                                    data={documents}
                                    handleViewClicked={handleShowVersions}
                                    handleUsedByClicked={handleUsesVersionsClicked}
                                    isAdmin={context.isAdministrator}
                                    style={{ height: `calc(100vh - ${document.getElementById("topMostUsedDataGrid")?.offsetTop}px - 250px)`, minHeight: "600px", paddingBottom: "20px" }}
                                    basePurl={documentId.basePurl}
                                    guidance={guidance}
                                />
                            </>}
                        </div>
                    </>
                    }

                </div>
            </div>
        </>
    )
}

export default VersionsListPage;
