/**
 * Copyright (c) 2025 Capital One
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip, Radio, FormControlLabel, MenuItem } from "@mui/material";
import { SbomDocumentSummary } from '../common'
import { ActionPopup } from './ActionPopup';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ColDef,
    ColumnResizedEvent,
    FilterChangedEvent,
    GridReadyEvent,
  } from 'ag-grid-community';
import "./DataGrid.css";
import SystemUpdateAltOutlinedIcon from '@mui/icons-material/SystemUpdateAltOutlined';
import { compareVersions, createBomRef } from '../common';


interface DisplayRadioProps {
    value: string;
    setValue(value: string): void;
    isAdmin: boolean;
}

const DisplayRadio: React.FC<DisplayRadioProps> = ({value, setValue, isAdmin}) => {

    async function handleChange(event: any): Promise<void> {
        setValue(event.target.value);
    }

    const style = {
        ".MuiTypography-root": {
            font: "var(--body)"
        }
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                Display columns: &nbsp;&nbsp;
                <FormControlLabel sx={style} id="displayColumnChangeRadio1" onChange={handleChange} value="default" checked={value != "all"} control={<Radio />} label="Default" />
                <FormControlLabel sx={style} id="displayColumnChangeRadio2" onChange={handleChange} value="all" checked={value == "all"} control={<Radio />} label="All" />
            </div>
        </>
    )
}

interface Props {
    title: string;
    states?: string[];
    requests: SbomDocumentSummary[];
    handleViewRow?(event: any): Promise<any>;
    handleShowSbomVersions?(event: any): Promise<any>;
    handleDeleteRow?(event: any): Promise<any>;
    handleShowRefs?(event: any): Promise<any>;
    isAdmin: boolean;
    settings?: any;
    setSettings?(event: any): Promise<any>;
    displayColumns?: string;
    setDisplayColumns?(event: any): Promise<any>;
    style?: any;
    sort?: any;
    uses?: any;
    guidance?: any;
}

const LibrariesDataGrid: React.FC<Props> = ({ title, requests, states, handleViewRow, handleShowSbomVersions, handleShowRefs, handleDeleteRow,
    isAdmin, settings, setSettings, displayColumns, setDisplayColumns, style, sort, uses, guidance }) => {

    const gridRef = useRef<AgGridReact>(null);
    const numRowsRef = useRef<HTMLDivElement>(null);

    const radioButtonSelected = displayColumns || "default";

    const extraColumns = [
        "reviewers",
    ]

    function onRowClicked (event:any) {
        if (handleViewRow) {
            handleViewRow(event.data.library)
        }
    }

    const defaultColDef: ColDef = {
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        resizable: true,
        suppressMenu: true,
        sortable: true,
        wrapHeaderText: true,
        autoHeaderHeight: true,
    }

    const [additionalColumns, setAdditionalColumns] = useState<ColDef[]>([]);

    const initColumnDefs: ColDef[] =
        [

            {
                field: "library.name",
                headerName: "Library Name",
                headerTooltip: "Software name",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                pinned: "left",
                cellRenderer: function (params: any) {
                    let name = params?.value;
                    if (!name) {
                        name = params.data.id;
                    }
                    if (name) {
                        let found = null;
                        const _guidance = name;
                        return (
                            <Tooltip title={_guidance} placement="bottom-start" enterDelay={500}>
                                <span className={found ? "guidanceAvailable" : ""} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{name}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "library.group",
                headerName: "Group",
                headerTooltip: "Grouping name or namespace.  Often refers to the company, organization or project that published the software.",
                cellClass: "center-text",
                pinned: "left",
            },

            {
                field: "library.version",
                headerName: "Version",
                headerTooltip: "Software version",
                pinned: "left",
                comparator: function(v1, v2) {
                    return compareVersions(v1, v2);
                },
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    if (params && params.value) {
                        return (
                            <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "purl",
                headerName: "PURL",
                headerTooltip: "Package URL.  Used to identify and locate software packages",
                minWidth: 200,
                cellClass: "text-overflow-cell",
                hide: displayColumns == "all" ? false : true,
                cellRenderer: function (params: any) {
                    let purl = params.value;
                    if (purl) {
                        return (
                            <Tooltip title={purl} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{purl}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "compliant",
                headerName: "In Guidance",
                headerTooltip: "Indicates whether given version of software is recommended for use. This is relevant for libraries.",
                width: 125,
                cellClass: "center-text",
                pinned: "left",
            },

            {
                field: "guidance",
                headerName: "Guidance",
                headerTooltip: "Summary of available guidance for a Library. Recommended version.",
                autoHeight: true,
                wrapText: true,
                hide: displayColumns == "all" ? false : true,
                cellRenderer: function (params: any) {
                    if (params && params.value && params.value.length > 0) {
                        const g = params.value[0];

                        let value = [];
                        if (g.pci && g.pci.preferredVersion && g.pci.preferredVersion.minimum) {
                            value.push("PCI preferred version = "+g.pci.preferredVersion.minimum);
                        }
                        if (g.nonPci && g.nonPci.preferredVersion && g.nonPci.preferredVersion.minimum) {
                            value.push("Non-PCI preferred version = "+g.nonPci.preferredVersion.minimum);
                        }

                        let key = 0;
                        const _guidance = <div>
                            {value.map((item: string) => {
                                return (
                                    <div key={""+(key++)}>{item}</div>
                                )
                            })}
                        </div>
                        const _guidance1 = <div style={{lineHeight:"1.2em", padding:"4px"}}>
                            {value.map((item: string) => {
                                return (
                                    <div key={""+(key++)}>{item}</div>
                                )
                            })}
                        </div>
                        return (
                            <Tooltip title={_guidance} placement="bottom-start" enterDelay={500}>
                                {_guidance1}
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "depsdev.project.scorecard.overallScore",
                headerName: "Overall Score",
                headerTooltip: "Deps.dev overall score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    if (params.data?.depsdev?.length > 0 && params.data.depsdev[0].project?.scorecard?.checks) {
                        return params.data.depsdev[0].project?.scorecard?.overallScore;
                    }
                    return null;
                },

            },


            {
                field: "depsdev.project.scorecard.Maintained",
                headerName: "Maintained Score",
                headerTooltip: "Deps.dev maintained score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    if (params.data?.depsdev?.length > 0 && params.data.depsdev[0].project?.scorecard?.checks) {
                        for (const check of params.data.depsdev[0].project?.scorecard?.checks) {
                            if (check.name == "Maintained") {
                                return check.score; 
                            }
                        }
                    }
                    return null;
                },
            },

            {
                field: "depsdev.scorecard.Vulnerabilities",
                headerName: "Vulnerabilities Score",
                headerTooltip: "Deps.dev vulnerabilities score from scorecard (0=lowest - 10=best)",
                filter: "agNumberColumnFilter",
                hide: displayColumns == "all" ? false : true,
                cellClass: "center-text",
                valueGetter: function (params: any) { 
                    if (params.data?.depsdev?.length > 0 && params.data.depsdev[0].project?.scorecard?.checks) {
                        for (const check of params.data.depsdev[0].project?.scorecard?.checks) {
                            if (check.name == "Vulnerabilities") {
                                return check.score; 
                            }
                        }
                    }
                    return null;
                },
            },


            {
                field: "usedby.metadata.component.bom-ref.name",
                headerName: "Used by Software Name",
                headerTooltip: "Software name",
                minWidth: 200,
                flex: 1,
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    let name = params?.value;
                    if (!name) {
                        name = params.data.id;
                    }
                    if (name) {
                        let found = null;
                        const _guidance = name;
                        return (
                            <Tooltip title={_guidance} placement="bottom-start" enterDelay={500}>
                                <span className={found ? "guidanceAvailable" : ""} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{name}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "usedby.metadata.component.bom-ref.group",
                headerName: "Used by Group",
                headerTooltip: "Grouping name or namespace.  Often refers to the company, organization or project that published the software.",
                cellClass: "center-text",
                hide: displayColumns == "all" ? false : true,
            },

            {
                field: "usedby.metadata.component.bom-ref.version",
                headerName: "Used by Version",
                headerTooltip: "Software version",
                hide: displayColumns == "all" ? false : true,
                comparator: function(v1, v2) {
                    return compareVersions(v1, v2);
                },
                cellClass: "text-overflow-cell",
                cellRenderer: function (params: any) {
                    //console.log("params=",params);
                    if (params && params.value) {
                        return (
                            <Tooltip title={params.value} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{params.value}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                },
            },

            {
                field: "usedby.metadata.component.type",
                headerName: "Used by Software Type",
                headerTooltip: "The type of software.  This value will be one of Product, Application, ITComponent, Interface, UserGroup, BusinessCapability, framework or library.",
                width: 200,
                cellClass: "center-text",
                valueGetter: function (params: any) {
                    const value = ""+params.data.usedby?.metadata.component.type;
                    const types:any = {
                        "application": "Application",
                        "framework": "Framework",
                        "library": "Library",
                        "operating-system": "Operating System",
                        "device": "Device",
                        "file": "File",
                        "container": "Container",
                        "firmware": "Firmware",
                        "device-driver": "Device Driver",
                        "platform": "Platform",
                        "machine-learning-model": "Machine Learning Model",
                        "data": "Data",
                        "cryptographic-asset": "Cryptographic Asset",

                        "usergroup": "User Group",
                    }
                    if (value.length > 0) {
                        const r = types[value];
                        if (r) {
                            return r;
                        }
                        return value;
                    }
                },
            },


            // {
            //     field: "_uses",
            //     headerName: "Uses",
            //     headerTooltip: "Indicates which specific version of the software being reviewed is being used by a given component.",
            //     width: 200,
            //     hide: uses ? false : true,
            //     comparator: function(v1a, v2a) {
            //         const v1 = v1a[0].version;
            //         const v2 = v2a[0].version;
            //         if (!v1 || !v2) {
            //             return 0;
            //         }
            //         const v1at = v1.indexOf("@");
            //         const v2at = v2.indexOf("@");
            //         const _v1 = (v1at > -1) ? v1.substring(v1at+1) : v1;
            //         const _v2 = (v2at > -1) ? v2.substring(v2at+1) : v2;
            //         return compareVersions(_v1, _v2);
            //     },
            //     cellClass: "center-text",
            //     cellRenderer: function (params: any) {
            //         if (params && params.value) {
            //             var key=1;
            //             var s1;
            //             var s2;
            //             const value = params.value;
            //             if (value && value.length > 1) {
            //                 s1 = <div style={{padding:"10px"}}>
            //                     This software uses {value.length} versions:
            //                 <ol>
            //                     {value && value.map((v:any) => <li key={"k"+(key++)}>{v.name + (v.version ? "@" + v.version : "") + (v.purl ? " " + v.purl : "")}</li>)}
            //                 </ol>
            //                 </div>

            //                 const r = [];
            //                 for (const v of value) {
            //                     r.push(v.name + (v.version ? "@" + v.version : ""))
            //                 }
            //                 s2 = r;
            //             }
            //             else {
            //                 const v = value[0];
            //                 s1 = v.name + (v.version ? "@" + v.version : "") + (v.purl ? " " + v.purl : "")                            
            //                 s2 = v.name + (v.version ? "@" + v.version : "");
            //             }
            //             return (
            //                 <Tooltip title={s1} placement="bottom-start" enterDelay={500}>
            //                     <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{s2}</span>
            //                 </Tooltip>
            //             )
            //         }
            //     },
            // },

            {
                field: "usedby.id",
                headerName: "Used by Id",
                headerTooltip: "id of ODS SBOM document containing software information",
                minWidth: 250,
                cellClass: "center-text",
                hide: displayColumns == "all" ? false : true,
            },

            // {
            //     field: "dateCreated",
            //     type: "dateColumn",
            //     headerName: "Date Created",
            //     headerTooltip: "Date that the ODS SBOM document was created",
            //     width: 175,
            //     cellClass: "center-text",
            //     cellRenderer: function (params: any) { return formatDate(params.data.dateCreated) },
            //     hide: displayColumns == "all" ? false : true,
            // },
            // {
            //     field: "dateUpdated",
            //     type: "dateColumn",
            //     headerName: "Date Updated",
            //     headerTooltip: "Date that the ODS SBOM document was last updated",
            //     width: 175,
            //     cellClass: "center-text",
            //     cellRenderer: function (params: any) { return formatDate(params.data.dateUpdated) },
            //     hide: displayColumns == "all" ? false : true,
            // },
            {
                headerName: "Actions",
                headerTooltip: "Menu of actions that can be performed relevant to the selected software",
                width: 125,
                pinned: "right",
                cellClass: "action-container center-text",
                floatingFilter: false,
                suppressMenu: true,
                sortable: false,
                cellRenderer: function (i: any) {
                    if (i && i.data && i.data.usedby?.metadata) {
                        let bomRef = i.data.usedby?.metadata.component["bom-ref"];
                        if (!bomRef) {
                            const md = i.data.usedby?.metadata.component;
                            bomRef = createBomRef(md, i.data.usedby?.id);
                        }
                        return (
                        <ActionPopup>
                            {handleViewRow && <MenuItem onClick={() => {
                                    handleViewRow(i.data.library)
                            }} >
                                View Library Details
                            </MenuItem>}
                            {handleViewRow && <MenuItem onClick={() => handleViewRow(i.data.usedby?.id)} >
                                View Used By Software details
                            </MenuItem>}
                        </ActionPopup>
                        )                  
                    }
                    return(<></>)
                },
            }

        ]

    const [columnDefs, setColumnDefs] = useState<ColDef[]>(initColumnDefs);

    const columnTypes = {
        nonEditableColumn: { editable: false },
        dateColumn: {
            type: "number",
            filter: 'agDateColumnFilter',
            filterParams: {
                defaultOption: "greaterThan", //equals, notEqual, lessThanOrEqual, greaterThan, greaterThanOrEqual, inRange
            },
            suppressMenu: true,
        }
    };

    useEffect(() => {
        if (additionalColumns) {
            console.log("additionalColumns changed: ", additionalColumns);
            for (const col of additionalColumns) {
                col.cellRenderer = function (params: any) {
                    let v = params.value
                    let t = v;
                    if (v) {
                        if (typeof v == "object") {
                            v = JSON.stringify(v,null,4)
                            t = <pre>{v}</pre>
                        }
                        return (
                            <Tooltip title={t} placement="bottom-start" enterDelay={500}>
                                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{v}</span>
                            </Tooltip>
                        )
                    }
                    return(<></>)
                }

                if (col.field && col.headerName) {
                    // Check if the column already exists
                    const existingCol = columnDefs.find(c => c.field === col.field);
                    if (!existingCol) {
                        columnDefs.push(col);
                    } else {
                        // Update existing column properties
                        Object.assign(existingCol, col);
                    }
                }
            }
            setColumnDefs([...columnDefs]);
        }
    }, [additionalColumns]);

    const [gridReady, setGridReady] = useState<boolean>(false);

    async function onGridReady(params: GridReadyEvent) {
        console.log("Grid ready");
        if (settings) {
            gridRef.current!.api.setFilterModel(settings);
        }
        console.log("SORT=", sort)
        if (sort) {
            Object.keys(sort).map((colId: string) => {
                params.api.applyColumnState({
                    state: [{ colId: colId, sort: sort[colId] }],
                    defaultState: { sort: null },
                })
            })
        }
        if (requests) {
            gridRef.current!.api.setGridOption('rowData', requests);
        }
        setGridReady(true);
    }

    useEffect(() => {
        if (gridReady && gridRef.current!) {
            if (settings) {
                gridRef.current!.api.setFilterModel(settings);
            }
            else {
                gridRef.current!.api.setFilterModel({});
            }
        }
    }, [settings, gridReady])

    const onColumnResized = useCallback((params: ColumnResizedEvent) => {
    }, []);

    function setNumRows(numRowsMessage: string) {
        const numRowsField = numRowsRef.current;
        if (!numRowsField) return;
        numRowsField.textContent = numRowsMessage;
    }

    async function onFilterChanged(params: FilterChangedEvent) {
        setNumRows("Number of rows: " + gridRef.current!.api.getDisplayedRowCount());
        if (setSettings) {
            const model = gridRef.current!.api.getFilterModel();
            setSettings(model);
        }
    }

    async function doExport() {
        if (gridRef.current && gridRef.current.api) {
            let columnsToBeExported = gridRef.current.api.getAllGridColumns().filter((col) => col.getColDef().headerName !== "Actions");
            gridRef.current!.api.exportDataAsCsv({
                columnKeys: columnsToBeExported,
                fileName: "sbom.csv",
              })
        }
    }

    useEffect(() => {
        console.log("LibrariesDataGrid data changed");

        if (requests && requests.length > 0) {
            console.log("LibrariesDataGrid - looking for additional columns");
            const colDefs: ColDef[] = [];
            for (const key of Object.keys(requests[0])) {
                if (key.startsWith("$") || key.startsWith("#")) {
                    const colDef:any = {
                        field: key,
                        hide: false,
                        headerName: key.replace("$", "").replace("#", "").replaceAll("_", " "),
                        cellRenderer: function(params: any) {
                            let v = "";
                            let t = <></>
                            if (typeof params.value == "string") {
                                v = params.value;
                                t = <div>{v}</div>
                            }
                            else {
                                v = JSON.stringify(params.value,null,4)
                                t = <pre>{v}</pre>
                            }
                            return (
                                <Tooltip title={t} placement="bottom-start" enterDelay={500}>
                                    <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: 'ellipsis' }}>{v}</span>
                                </Tooltip>
                            )
                        }
                    }
                    colDefs.push(colDef);
                }
            }
            setAdditionalColumns(colDefs);
        }

    }, [requests]);

    useEffect(() => {
        console.log("LibrariesDataGrid data changed: ", requests ? requests.length : requests);
        if (gridRef.current && gridRef.current.api) {
            const el = document.activeElement?.querySelector('input[data-ref="eInput"]')
            gridRef.current!.api.setGridOption('rowData', requests);
            if (el) {
                (el as any).focus();
            }
            setNumRows("Number of rows: " + gridRef.current!.api.getDisplayedRowCount());
        }
    }, [gridReady, requests])

    useEffect(() => {
        if (!gridRef || !gridRef.current || !gridRef.current.api) {console.log('return'); return;}
        if (displayColumns == "all") {
            gridRef.current!.api.setColumnsVisible(extraColumns, true);
        }
        else if (displayColumns == "default") {
            gridRef.current!.api.setColumnsVisible(extraColumns, false);
        }
    }, [displayColumns]);

    async function handleRadioChange(value: string): Promise<void> {
        if (setDisplayColumns) setDisplayColumns(value);
    }
    
    var r:boolean = true;
    if (typeof states !== "undefined") {
        r = false;
    }
    if (requests && requests?.length > 0) {
        if (!requests[0].hasOwnProperty("id")) {
            r = false;
        }
    }

    function getStyle() {
        let height = style.height;
        if (style.height && style.height.indexOf("{gridTop}")) {
            height = style.height.replace("{gridTop}", (divRef.current as any)?.offsetTop)
        }
        return { ...style, height: height };
    }
    const divRef = useRef(null);

    return (
        <div className="detailDiv">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ alignItems: "center" }}>
                    <DisplayRadio value={radioButtonSelected} setValue={handleRadioChange} isAdmin={isAdmin} />
                </div>
                <div>
                    <div ref={numRowsRef}></div>
                </div>
                <div style={{ alignItems: "center", cursor: "pointer" }} onClick={doExport}>
                    <Tooltip title="Export table to CSV file" placement="top" enterDelay={500}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div >
                                <SystemUpdateAltOutlinedIcon style={{ width: "24px", color: "#656565", paddingTop: "4px" }} />
                            </div>
                            <div style={{ font: "var(--body)" }}>&nbsp; Export Table</div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div className="ag-theme-alpine"
                ref={divRef}
                style={{
                    width: "100%",
                    height: "400px",
                    ...getStyle()
                }}>
                <AgGridReact
                    ref={gridRef}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    columnTypes={columnTypes}
                    suppressCellFocus={true}
                    onGridReady={onGridReady}
                    onColumnResized={onColumnResized}
                    onRowDoubleClicked={onRowClicked}
                    onFilterChanged={onFilterChanged}
                    domLayout='normal'
                    enableCellTextSelection={true}
                />
            </div>
        </div>
    );
}

export default LibrariesDataGrid;
