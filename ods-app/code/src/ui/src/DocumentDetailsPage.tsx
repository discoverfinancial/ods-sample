/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState, useEffect } from 'react';
import { Button, Select, MenuItem, SelectProps, Link, Tooltip } from '@mui/material'
import { Backdrop, CircularProgress, Tabs, Tab } from '@mui/material'
import { SbomMgr } from './managers/SbomMgr';
import { SbomDocumentInfo, formatDateTime, MostUsed } from './common';
import { sbomStates } from './common';
import { AppContext } from './common';
import { useParams, useLocation } from 'react-router-dom';
import TopMenu from './components/TopMenu';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';
import { Bom } from './common';
import ComponentsDataGrid from './components/ComponentsDataGrid';
import AssembliesDataGrid from './components/AssembliesDataGrid';
import VulnerabilityDescription from './components/VulnerabilityDescription';
import { DepsDevMgr } from './managers/DepsDevMgr';
import OssAnalysisDataGrid from './components/OssAnalysisDataGrid';
import { DocMgr } from './managers/DocMgr';

const AGGREGATE_LABELS = {
    complete: "Complete",
    incomplete: "Incomplete",
    incomplete_first_party_only: "Incomplete First Party Only",
    incomplete_first_party_opensource_only: "Incomplete First Party Open Source Only",
    incomplete_first_party_proprietary_only: "Incomplete First Party Proprietary Only",
    incomplete_third_party_only: "Incomplete Third Party Only",
    incomplete_third_party_proprietary_only: "Incomplete Third Party Proprietary Only",
    incomplete_third_party_opensource_only: "Incomplete Third Party Opensource Only",
    unknown: "Unknown",
    not_specified: "Not Specified",
}

interface Props {
    context: AppContext;
}

const DocumentDetailsPage: React.FC<Props> = ({ context }) => {
    const sbomMgr = SbomMgr.getInstance();
    const docMgr = DocMgr.getInstance();

    const [aDocument, setDocument] = useState<SbomDocumentInfo>();

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>("");

    context.setShowDialog = setShowDialog;
    context.setShowSpinner = setShowSpinner;
    context.showSection = showSection;

    // Url query parms
    let { id } = useParams();
    let { search, hash } = useLocation();
    const query = new URLSearchParams(search);
    console.log("hash=", hash);
    const print = query.get("print");

    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState<string>(window.sessionStorage.getItem("sbom-details-SelectedTab") || "metadata");
    useEffect(() => {
        console.log("location changed to", location);
        if (location.hash) {
            showSection(location.hash.substring(1));
        }
    }, [location]);

    const documentId = id || "";
    console.log(`DocumentDetailsPage: Param id = ${documentId} print = ${print}`);

    useEffect(() => {
        console.log("Init page load")

        const init = async () => {
            const res = documentId.startsWith("{") ? await sbomMgr.getDocumentForBomRef(documentId) : await sbomMgr.getDocument(documentId);
            if (res != null) {
                setDocument(res);
                setInitComplete(true);
            }
            else {
                console.log("Document not found");
                setInitComplete(true);
            }
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

    useEffect(() => {
        if (aDocument) {
            console.log(`document state=${aDocument.state})`)
            const docState = sbomStates[aDocument.state];
            console.log(`docState=`, docState);
            if (!aDocument.metadata?.component?.name) {
                setSelectedTab("metadata")
            }
        }
    }, [initComplete])

    useEffect(() => {
        console.log(`Document changed`);
        if (aDocument) {
            const name = aDocument.metadata?.component?.name;
            if (name) {
                window.document.title = name;
            }
            const docState = sbomStates[aDocument.state];
            getAssemblies();
            getOssAnalysis();
        }
        else {
            window.document.title = "Details";
        }
    }, [aDocument])

    const [assemblies, setAssemblies] = useState<any>();

    const getAssemblies = async () => {
        let r: any = [];
        if (aDocument && aDocument.compositions && aDocument.compositions.length > 0 && aDocument.compositions[0].assemblies) {
            r = aDocument.compositions[0].assemblies;
        }
        setAssemblies(r);
    }

    const [ossAnalysis, setOssAnalysis] = useState<any>();

    async function getOssAnalysis() {
        if ((ossAnalysis && ossAnalysis.length > 0) || !aDocument) {
            setShowSpinner("");
            return;
        }
        try {
            const start = Date.now();
            const _docs = await docMgr.getOssAnalysis(aDocument.id);
            const end = Date.now();
            console.log("Time to retrieve oss analysis =", (end-start)/1000, "sec");
            console.log("Number of oss libraries =", _docs?.length);
            console.log("ossAnalysis=", _docs);
            setOssAnalysis(_docs);
        } catch (e) {
            context.showErrorDialog && context.showErrorDialog(e);
        }
    }

    async function handleMostUsedClicked(data: MostUsed): Promise<any> {
        console.log(`handleMostUsedClicked(${data})`);
        if (data) {
            console.log("data=",data);
            const args = {name: data.name, group: data.group, basePurl: data.basePurl}
            window.open("/versions/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
        }
    }
    async function handleGuidanceClicked(data: MostUsed): Promise<any> {
        console.log(`handleGuidanceClicked(${data})`);
        if (data) {
            console.log("data=",data);
            const args = {name: data.name, group: data.group, basePurl: data.basePurl}
            window.open("/guidance/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
        }
    }
    
    async function handleMostUsedDetailsClicked(data: MostUsed): Promise<any> {
        console.log(`handleMostUsedDetailsClicked(${data})`);
        if (data) {
            console.log("data=",data);
            const args = {name: data.name, group: data.group, basePurl: data.basePurl}
            window.open("/details/"+encodeURIComponent(JSON.stringify(args)), "_blank")?.focus();
        }
    }


    useEffect(() => {
        if (selectedTab) {
            console.log("Selected tab changed =", selectedTab);
            window.sessionStorage.setItem("sbom-details-SelectedTab", selectedTab);
        }
    }, [selectedTab])

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    }

    const scroll = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        else {
            console.log("Not found: Scroll id", id)
        }
    };

    function showSection(section: string) {
        console.log("showSection: ", section);
        switch (section) {
            case "metadata":
                setSelectedTab("metadata");
                break;
            case "components":
                setSelectedTab("components");
                break;
            case "compositions":
                setSelectedTab("compositions");
                break;
            case "services":
                setSelectedTab("services");
                break;
            case "oss":
                setSelectedTab("oss");
                break;
            /*case "vulnerabilities":
                setSelectedTab("vulnerabilities");
                break;*/
            case "declarations":
                setSelectedTab("declarations");
                break;
            case "properties":
                setSelectedTab("properties");
                break;

            default:
        }
        scroll(section);
    }

    const renderAlert = () => {
        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: "Close",
                onClick: async function onClick() {
                    return (setShowDialog(null))
                },
            },
        ];
        if (showDialog.email) {
            actions.push({
                label: "Yes",
                onClick: async function onClick() {
                    if (showDialog.callback) {
                        await showDialog.callback(showDialog.email, true);
                    }
                    return (setShowDialog(null))
                }
            });
        }

        return (<StyledDialog
            open={showDialog != null}
            onClose={function onClose() {
                return (setShowDialog(null));
            }}
            title={showDialog ? showDialog.title : ""}
        >
            {showDialog ? showDialog.text : ""}
        </StyledDialog>
        )
    }

    /**
     * Open a new tab or window displaying the metadata information for the component
     * that was clicked on
     *
     * @param event {String | Object} - The id of the document detailed on the clicked row
     * This id may be represented as an object or a string.
     */
    async function handleEditRow(event: any): Promise<any> {
        let _id = event;
        if (typeof _id !== "string") {
            _id = encodeURIComponent(JSON.stringify(event));
        }
        console.log("edit document, id: ", _id);
        setSelectedTab("metadata")
        window.open("/details/" + _id, "_blank");
    }

    async function handleDeleteRow(event: any): Promise<any> {
        console.log("delete document: ", event);
    }


    if (aDocument && initComplete) {

        const docState = sbomStates[aDocument.state];
        console.log("docState=", docState)
        console.log(`docState.write=${docState?.write}`);
        context.writeGroups = aDocument.curStateWrite || [];
        context.readGroups = aDocument.curStateRead || [];

        console.log("context=", context);

        if (context.isAdministrator) {
            console.log(`   -- admin so can edit document`)
            context.editMode = true;
        }
        if (print) {
            context.editMode = false;
        }
        console.log(`editMode=${context.editMode}`)

        const renderVulnerabilities = () => {
            let key = 1;
            if (aDocument.vulnerabilities) {
                const r: any = [];
                for (const v of aDocument.vulnerabilities) {
                    const props: any = [];
                    if (v.properties) {
                        for (const prop of v.properties) {
                            props.push(<div key={"v_" + (key++)}>
                                {prop.name} = {prop.value}
                            </div>)
                        }
                    }
                    const affects: any = [];
                    if (v.affects) {
                        for (const p of v.affects) {
                            console.log("ref=2 ", p);

                            const versions = (p.versions && p.versions.length > 0) ? JSON.stringify(p.versions) : "";
                            const ref = p.ref as any;
                            console.log("ref.name=", ref.name);
                            console.log("ref.version=", ref.version);
                            const url = "/details/" + encodeURIComponent(JSON.stringify(ref));
                            affects.push(<div key={"v_" + (key++)}>
                                <a
                                    onClick={() => {
                                        setSelectedTab("metadata")
                                        window.open(url, "_blank");
                                    }}
                                >{ref.name}{ref.version ? "@" + ref.version : ""}</a>
                            </div>)
                            // }
                        }
                    }
                    const ratings: any = [];
                    if (v.ratings) {
                        for (const p of v.ratings) {
                            ratings.push(<div key={"v_" + (key++)}>
                                {p.source && <div>Source: {p.source?.name}</div>}
                                {p.score && <div>Score: {p.score}</div>}
                                {p.severity && <div>Severity: {p.severity}</div>}
                                {p.method && <div>Method: {p.method}</div>}
                                {p.vector && <div>Vector: {p.vector}</div>}
                            </div>)
                        }
                    }
                    r.push(<div key={"v_" + (key++)} style={{ padding: "10px", margin: "10px", border: "var(--border-1) solid var(--border)", borderRadius: "4px" }}>
                        <div>ID: {v.id}</div>
                        <div>Name: {v.source?.name}</div>
                        <div>URL: {v.source?.url}</div>
                        <div>CWES: {v.cwes}</div>
                        <div><VulnerabilityDescription data={v} /></div>
                        {affects.length > 0 && <div>Affects: <div style={{ paddingLeft: "10px" }}>{affects}</div></div>}
                        {props.length > 0 && <div>Properties: <div style={{ paddingLeft: "10px" }}>{props}</div></div>}
                        {ratings.length > 0 && <div>Ratings: <div style={{ paddingLeft: "10px" }}>{ratings}</div></div>}
                    </div>)
                }
                if (r.length > 0) {
                    return <>{r}</>;
                }
            }
            return <div style={{ padding: "10px", margin: "10px", border: "var(--border-1) solid var(--border)", borderRadius: "4px" }}>No vulnerabilities</div>;
        }

        const showDepsdev = async (purl: string) => {
            const depsdevMgr = DepsDevMgr.getInstance();
            let v;
            try {
                v = await depsdevMgr.getDocuments({params: {match: {"package.purl": purl}}});
            } catch (e) {

            }
            context.setShowDialog({
                title: "DepsDev Document",
                text: v ? <div>
                    <div>Date created: {formatDateTime(v[0].dateCreated)}</div>
                    <div>Date updated: {formatDateTime(v[0].dateUpdated)}</div>
                    <pre>{JSON.stringify(v, null, 4)}</pre>
                    </div> : `Not found purl = ${purl}`,
            })
        }

        const renderPropertyValue = (name: string, value: any):any =>  {
            let v = value;
            if (v) {
                if (typeof value === "object") {
                    v = <pre>{JSON.stringify(value, null, 4)}</pre>
                }
                else {
                    if (name.toLowerCase().indexOf("date") > -1) {
                        const valueInt = parseInt(value);
                        if (valueInt) {
                            v = value + "  ("+formatDateTime(valueInt)+")";
                        }
                    }
                }
            }
            return v;
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

                    <div className="content1">
                        {renderAlert()}

                        <div className="content">
                            <h2>Details for {aDocument.metadata?.component?.name}
                                {aDocument.metadata?.component?.version && <> version {aDocument.metadata?.component?.version}</>}
                            </h2>
                        </div>

                        <div className="content" style={{ display: "flex", gap: "10px", paddingRight: "20px", marginRight: "0px" }}>
                            <div style={{ flexGrow: 1 }}>
                                <Tabs
                                    onChange={tabChanged}
                                    value={selectedTab}
                                    className="slate"
                                >
                                    <Tab value="metadata" label="Metadata" />
                                    <Tab value="compositions" label="Compositions" />
                                    <Tab value="components" label="Components" />
                                    <Tab value="oss" label="OSS Analysis" />
                                    {/* <Tab value="services" label="Services" /> */}
                                    {/*<Tab value="vulnerabilities" label="Vulnerabilities" />*/}
                                    {/* <Tab value="declarations" label="Declarations" /> */}
                                    {/* <Tab value="properties" label="Properties" />   */}
                                </Tabs>

                                {(selectedTab == "metadata") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        Metadata information about the software.
                                    </div>
                                    <div className="spacer" />
                                    <div className="detailDiv">
                                        <table className="roundedTable metadataTable">
                                            <tbody>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Type
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.type)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Name
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.name)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Version
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.version)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Group
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.group)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Description
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.description)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Lifecycle
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.lifecycles?.length ? ("" + (aDocument.metadata.lifecycles[0] as Bom.PreDefinedPhase).phase) : "")}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        PURL
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.purl)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Publisher
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.publisher)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        SWID Tag Id
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.swid?.tagId)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        SWID Name
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.swid?.name)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        SWID URL
                                                    </td>
                                                    <td>
                                                        {(aDocument.metadata?.component?.swid?.url)}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Licenses
                                                    </td>
                                                    <td>
                                                        {aDocument.metadata?.component?.licenses?.map((value: any) => {
                                                            return value.license.id;
                                                        })}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Date Created
                                                    </td>
                                                    <td>
                                                        {(aDocument.dateCreated && formatDateTime(aDocument.dateCreated))}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td className="metadataTableLabel">
                                                        Date Updated
                                                    </td>
                                                    <td>
                                                        {(aDocument.dateUpdated && formatDateTime(aDocument.dateUpdated))}
                                                    </td>
                                                </tr>

                                                {/* <tr>
                                                    <td className="metadataTableLabel">
                                                    </td>
                                                    <td>

                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="metadataTableLabel">
                                                    Properties
                                                    </td>
                                                    <td>

                                                    </td>
                                                </tr> */}

                                                {(aDocument.metadata && aDocument.metadata.properties && aDocument.metadata.properties.map((prop: any) => {
                                                    return (
                                                        <tr>
                                                            <td className="metadataTableLabel">{prop.name}</td>
                                                            <td>{renderPropertyValue(prop.name, prop.value)}</td>
                                                        </tr>
                                                    )
                                                }))}

                                                {(aDocument._depsdev && Object.keys(aDocument._depsdev).map((name: any) => {
                                                    const value = aDocument._depsdev[name];
                                                    if (name == "package") {
                                                        return (
                                                        <>
                                                            <tr>
                                                                <td className="metadataTableLabel">{"DepsDev"}</td>
                                                                <td><Tooltip title="View DepsDev document">
                                                                    <a onClick={
                                                                        () => {
                                                                            showDepsdev(value.purl);
                                                                        }
                                                                    }>View DepsDev Document</a></Tooltip></td>
                                                            </tr>
                                                            <tr>
                                                            <td className="metadataTableLabel">{"DepsDev " + name}</td>
                                                            <td>{renderPropertyValue(name, value)}</td>
                                                        </tr>
                                                        </>
                                                    )
                                                    }
                                                    return (
                                                        <tr>
                                                            <td className="metadataTableLabel">{"DepsDev " + name}</td>
                                                            <td>{renderPropertyValue(name, value)}</td>
                                                        </tr>
                                                    )
                                                }))}


                                            </tbody>
                                        </table>



                                        <div className="spacer" />

                                    </div>

                                </div>}

                                {(selectedTab == "components") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        A list of software and hardware components.
                                        <div className="spacer" />
                                        <ComponentsDataGrid
                                            title="Documents"
                                            data={aDocument.components || []}
                                            handleEditRow={handleEditRow}
                                            isAdmin={context.isAdministrator}
                                            style={{
                                                height: `calc(100vh - {gridTop}px - 20px)`,
                                                minHeight: "500px",
                                            }}
                                        />
                                    </div>
                                </div>}

                                {(selectedTab == "services") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        A list of services. This may include microservices, function-as-a-service, and other types of network or intra-process services.
                                        <div className="spacer" />
                                        TBD - Editable list of services for the item.
                                    </div>
                                </div>}

                                {(selectedTab == "compositions") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        Compositions describe constituent parts (including components, services, and dependency relationships) and their completeness.
                                        <ul>
                                            <li>compositions
                                                <ul>
                                                    <li>aggregate</li>
                                                    <li>assemblies = [id of other components that make up item]</li>
                                                </ul>
                                            </li>
                                        </ul>

                                        <div className="spacer">
                                            <span className="metadataTableLabel">Aggregate:</span>
                                            <span style={{ paddingLeft: "20px" }}>{(aDocument.compositions && aDocument.compositions.length > 0 ? (AGGREGATE_LABELS[aDocument.compositions[0].aggregate]) : "")}</span>
                                        </div>

                                        <div className="spacer" />
                                        <div className="detailQuestion">Assemblies</div>
                                        <AssembliesDataGrid
                                            title="Assemblies"
                                            requests={assemblies}
                                            isAdmin={context.isAdministrator}
                                            handleDeleteRow={handleDeleteRow}
                                            handleEditRow={handleEditRow}
                                            style={{
                                                height: `calc(100vh - {gridTop}px - 20px)`,
                                                minHeight: "500px",
                                            }}
                                        />
                                    </div>
                                </div>}

                                {(selectedTab == "oss") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        Analysis of all open-source software for top-level depdendencies.
                                        <div className="spacer"/>

                                        <OssAnalysisDataGrid 
                                            title="Libraries"
                                            data={ossAnalysis}
                                            handleDetailsClicked={handleMostUsedDetailsClicked}
                                            handleRowClicked={handleMostUsedClicked} 
                                            handleGuidanceClicked={handleGuidanceClicked}
                                            isAdmin={context.isAdministrator}
                                            pci={false}
                                            style={{ 
                                                height: `calc(100vh - {gridTop}px - 20px)`, 
                                                minHeight: "600px", 
                                                paddingBottom: "20px" }}
                                        />
                                    </div>
                                </div>}

                                {/*{(selectedTab == "vulnerabilities") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        Vulnerabilities identified in components or services.
                                        <div className="spacer"/>
                                        {renderVulnerabilities()}
                                    </div>
                                </div>}*/}

                                {(selectedTab == "declarations") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        The list of declarations which describe the conformance to standards. Each declaration may include attestations, claims, and evidence.
                                        <div className="spacer" />
                                        TBD
                                        <h3>Attestations</h3>
                                        <div className="detailDiv">

                                        </div>
                                    </div>
                                </div>}
                                {(selectedTab == "properties") && <div className="detailDiv spacer">
                                    <div className="detailDiv">
                                        Provides the ability to document properties in a name-value store. This provides flexibility to include data not officially supported in the standard without having to use additional namespaces or create extensions.
                                        <div className="spacer" />
                                        TBD - Editable list of properties.
                                    </div>
                                </div>}

                                <div className="spacer" />

                            </div>

                        </div>
                    </div>
                </div>
            </>
        )
    }
    else if (initComplete) {
        return (
            <>
                <Navbar context={context} />
                <div style={{ marginTop: "100px", marginBottom: "100px", textAlign: "center" }}>
                    <h1>Document request not found or you don't have access.</h1>
                </div>
            </>
        )
    }
    else {
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
            </>
        )
    }
}

export default DocumentDetailsPage;
